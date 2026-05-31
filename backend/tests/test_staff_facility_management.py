from datetime import UTC, datetime

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import create_app
from app.models import UserRole
from tests.data_builder import DataBuilder


async def login(client: AsyncClient, email: str) -> str:
    response = await client.post("/auth/login", json={"email": email, "password": "secret123"})
    return response.json()["access_token"]


@pytest.mark.anyio
async def test_super_admin_assigns_staff_and_staff_manages_only_assigned_facility():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime(2026, 5, 1, tzinfo=UTC),
    )
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    staff_id = test_data.create_user(email="staff@ipb.ac.id", role=UserRole.staff)
    other_staff_id = test_data.create_user(email="other-staff@ipb.ac.id", role=UserRole.staff)
    student_id = test_data.create_user(email="student@apps.ipb.ac.id", role=UserRole.student)
    seminar_category_id = test_data.create_facility_category(name="Seminar", slug="seminar", icon_hint="presentation")
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    test_data.add_facility_open_hour(facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
    other_facility_id = test_data.create_facility(name="Lapangan Tenis Indoor")
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await login(client, "admin@ipb.ac.id")
        staff_token = await login(client, "staff@ipb.ac.id")
        other_staff_token = await login(client, "other-staff@ipb.ac.id")
        student_token = await login(client, "student@apps.ipb.ac.id")

        assigned = await client.put(
            f"/admin/facilities/{facility_id}/staff-assignments/{staff_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        student_assignment = await client.put(
            f"/admin/facilities/{facility_id}/staff-assignments/{student_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assigned_facilities = await client.get(
            "/staff/facilities",
            headers={"Authorization": f"Bearer {staff_token}"},
        )
        updated = await client.patch(
            f"/staff/facilities/{facility_id}",
            headers={"Authorization": f"Bearer {staff_token}"},
            json={
                "name": "Auditorium AHN",
                "location": "Kampus IPB Dramaga",
                "capacity": 150,
                "description": "Auditorium untuk kegiatan mahasiswa.",
                "contact_name": "TU Auditorium",
                "contact_phone": "081200000000",
                "contact_email": "tu-auditorium@ipb.ac.id",
                "price_rupiah": 250000,
                "payment_instructions": "Transfer ke rekening resmi IPB.",
                "category_id": seminar_category_id,
                "open_hours": [
                    {"day_of_week": 0, "opens_at": "08:00", "closes_at": "16:00"},
                    {"day_of_week": 2, "opens_at": "10:00", "closes_at": "18:30"},
                ],
                "is_active": True,
            },
        )
        invalid_open_hours = await client.patch(
            f"/staff/facilities/{facility_id}",
            headers={"Authorization": f"Bearer {staff_token}"},
            json={"open_hours": [{"day_of_week": 1, "opens_at": "16:00", "closes_at": "08:00"}]},
        )
        forbidden = await client.patch(
            f"/staff/facilities/{facility_id}",
            headers={"Authorization": f"Bearer {other_staff_token}"},
            json={"name": "Nama Tidak Boleh Berubah"},
        )
        unrelated_forbidden = await client.patch(
            f"/staff/facilities/{other_facility_id}",
            headers={"Authorization": f"Bearer {staff_token}"},
            json={"name": "Lapangan Tertutup"},
        )
        created_reservation = await client.post(
            f"/facilities/{facility_id}/reservations",
            headers={"Authorization": f"Bearer {student_token}"},
            json={
                "activity_title": "Seminar Karier",
                "event_description": "Seminar persiapan karier untuk mahasiswa tingkat akhir.",
                "participant_count": 80,
                "organization_unit_id": organization_unit_id,
                "contact_phone": "08123456789",
                "starts_at": "2026-06-01T02:00:00+00:00",
                "ends_at": "2026-06-01T04:00:00+00:00",
            },
        )
        deactivated = await client.post(
            f"/staff/facilities/{facility_id}/deactivate",
            headers={"Authorization": f"Bearer {staff_token}"},
        )
        hidden_from_catalog = await client.get(f"/facilities/{facility_id}")
        student_reservations = await client.get(
            "/student/reservations",
            headers={"Authorization": f"Bearer {student_token}"},
        )
        unassigned = await client.delete(
            f"/admin/facilities/{facility_id}/staff-assignments/{staff_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assigned_after_unassign = await client.get(
            "/staff/facilities",
            headers={"Authorization": f"Bearer {staff_token}"},
        )

    assert assigned.status_code == 200
    assert assigned.json() == {"facility_id": facility_id, "staff_id": staff_id}
    assert student_assignment.status_code == 400
    assert student_assignment.json()["detail"] == "Hanya akun staff yang dapat ditugaskan ke fasilitas."
    assert assigned_facilities.status_code == 200
    assert assigned_facilities.json()[0]["id"] == facility_id
    assert updated.status_code == 200
    assert updated.json()["name"] == "Auditorium AHN"
    assert updated.json()["category_id"] == seminar_category_id
    assert updated.json()["category"] == "Seminar"
    assert updated.json()["open_hours"] == [
        {"id": updated.json()["open_hours"][0]["id"], "day_of_week": 0, "opens_at": "08:00", "closes_at": "16:00"},
        {"id": updated.json()["open_hours"][1]["id"], "day_of_week": 2, "opens_at": "10:00", "closes_at": "18:30"},
    ]
    assert updated.json()["open_hours_summary"] == "Senin 08:00-16:00; Rabu 10:00-18:30"
    assert updated.json()["price_rupiah"] == 250000
    assert updated.json()["payment_instructions"] == "Transfer ke rekening resmi IPB."
    assert invalid_open_hours.status_code == 400
    assert invalid_open_hours.json()["detail"] == "Jam tutup harus setelah jam buka."
    assert forbidden.status_code == 403
    assert unrelated_forbidden.status_code == 403
    assert created_reservation.status_code == 201
    assert deactivated.status_code == 200
    assert deactivated.json()["is_active"] is False
    assert hidden_from_catalog.status_code == 404
    assert student_reservations.json()[0]["status"] == "pending_document_upload"
    assert unassigned.status_code == 204
    assert assigned_after_unassign.json() == []


@pytest.mark.anyio
async def test_assigned_staff_manages_facility_images_open_hours_and_blackouts():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime(2026, 5, 1, tzinfo=UTC),
    )
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    staff_id = test_data.create_user(email="staff@ipb.ac.id", role=UserRole.staff)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await login(client, "admin@ipb.ac.id")
        staff_token = await login(client, "staff@ipb.ac.id")
        await client.put(
            f"/admin/facilities/{facility_id}/staff-assignments/{staff_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        image = await client.post(
            f"/staff/facilities/{facility_id}/images",
            headers={"Authorization": f"Bearer {staff_token}"},
            json={
                "url": "https://cdn.example.test/auditorium-new-cover.jpg",
                "alt_text": "Cover auditorium baru",
                "display_order": 0,
                "is_cover": True,
            },
        )
        assigned_facilities_after_image = await client.get(
            "/staff/facilities",
            headers={"Authorization": f"Bearer {staff_token}"},
        )
        open_hour = await client.post(
            f"/staff/facilities/{facility_id}/open-hours",
            headers={"Authorization": f"Bearer {staff_token}"},
            json={"day_of_week": 0, "opens_at": "08:00", "closes_at": "16:00"},
        )
        blackout = await client.post(
            f"/staff/facilities/{facility_id}/blackouts",
            headers={"Authorization": f"Bearer {staff_token}"},
            json={
                "starts_at": "2026-06-01T03:00:00+00:00",
                "ends_at": "2026-06-01T04:00:00+00:00",
                "reason": "Maintenance",
            },
        )
        detail = await client.get(f"/facilities/{facility_id}")
        availability = await client.get(
            f"/facilities/{facility_id}/availability",
            params={
                "start": "2026-06-01T03:00:00+00:00",
                "end": "2026-06-01T04:00:00+00:00",
            },
        )

    assert image.status_code == 201
    assert image.json()["is_cover"] is True
    assert assigned_facilities_after_image.status_code == 200
    assert assigned_facilities_after_image.json()[0]["images"] == [
        {
            "id": image.json()["id"],
            "url": "https://cdn.example.test/auditorium-new-cover.jpg",
            "alt_text": "Cover auditorium baru",
            "display_order": 0,
            "is_cover": True,
            "is_active": True,
        },
        {
            "id": assigned_facilities_after_image.json()[0]["images"][1]["id"],
            "url": "https://cdn.example.test/auditorium-cover.jpg",
            "alt_text": "Auditorium cover",
            "display_order": 1,
            "is_cover": False,
            "is_active": True,
        },
    ]
    assert open_hour.status_code == 201
    assert open_hour.json()["day_of_week"] == 0
    assert blackout.status_code == 201
    assert blackout.json()["reason"] == "Maintenance"
    assert [image["is_cover"] for image in detail.json()["images"]].count(True) == 1
    assert detail.json()["images"][0]["url"] == "https://cdn.example.test/auditorium-new-cover.jpg"
    assert availability.status_code == 200
    assert availability.json()["available"] is False
    assert "blackout_period" in availability.json()["reasons"]


@pytest.mark.anyio
async def test_assigned_staff_marks_existing_facility_image_as_cover():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime(2026, 5, 1, tzinfo=UTC),
    )
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    staff_id = test_data.create_user(email="staff@ipb.ac.id", role=UserRole.staff)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    test_data.add_facility_image(
        facility_id,
        url="https://cdn.example.test/auditorium-side.jpg",
        display_order=2,
    )
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await login(client, "admin@ipb.ac.id")
        staff_token = await login(client, "staff@ipb.ac.id")
        await client.put(
            f"/admin/facilities/{facility_id}/staff-assignments/{staff_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assigned_facilities = await client.get(
            "/staff/facilities",
            headers={"Authorization": f"Bearer {staff_token}"},
        )
        side_image_id = next(
            image["id"]
            for image in assigned_facilities.json()[0]["images"]
            if image["url"] == "https://cdn.example.test/auditorium-side.jpg"
        )

        chosen_cover = await client.post(
            f"/staff/facilities/{facility_id}/images/{side_image_id}/cover",
            headers={"Authorization": f"Bearer {staff_token}"},
        )
        assigned_after_cover_change = await client.get(
            "/staff/facilities",
            headers={"Authorization": f"Bearer {staff_token}"},
        )
        public_detail = await client.get(f"/facilities/{facility_id}")

    assert chosen_cover.status_code == 200
    assert chosen_cover.json()["id"] == side_image_id
    assert chosen_cover.json()["is_cover"] is True
    assert [image["is_cover"] for image in assigned_after_cover_change.json()[0]["images"]].count(True) == 1
    assert next(
        image for image in assigned_after_cover_change.json()[0]["images"] if image["url"].endswith("side.jpg")
    )["is_cover"] is True
    assert public_detail.json()["images"][0]["url"] == "https://cdn.example.test/auditorium-side.jpg"

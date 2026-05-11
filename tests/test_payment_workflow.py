from datetime import UTC, datetime

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import create_app
from app.models import UserRole
from tests.data_builder import DataBuilder


async def _register_and_login(client: AsyncClient, *, email: str, full_name: str = "Budi Santoso") -> str:
    await client.post(
        "/auth/register",
        json={
            "email": email,
            "password": "secret123",
            "full_name": full_name,
            "nim": "G64190001",
            "phone": "08123456789",
        },
    )
    login = await client.post("/auth/login", json={"email": email, "password": "secret123"})
    return login.json()["access_token"]


async def _login(client: AsyncClient, *, email: str) -> str:
    login = await client.post("/auth/login", json={"email": email, "password": "secret123"})
    return login.json()["access_token"]


async def _create_reservation(client: AsyncClient, *, token: str, facility_id: str, organization_unit_id: str) -> dict:
    created = await client.post(
        f"/facilities/{facility_id}/reservations",
        headers={"Authorization": f"Bearer {token}"},
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
    return created.json()


async def _move_paid_reservation_to_pending_payment(
    client: AsyncClient,
    *,
    admin_token: str,
    staff_token: str,
    student_token: str,
    facility_id: str,
    staff_id: str,
    organization_unit_id: str,
) -> dict:
    await client.put(
        f"/admin/facilities/{facility_id}/staff-assignments/{staff_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    reservation = await _create_reservation(
        client,
        token=student_token,
        facility_id=facility_id,
        organization_unit_id=organization_unit_id,
    )
    await client.get(
        f"/student/reservations/{reservation['id']}/approval-letter",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    await client.post(
        f"/student/reservations/{reservation['id']}/signed-approval-letter",
        headers={"Authorization": f"Bearer {student_token}"},
        files={"file": ("signed-letter.pdf", b"%PDF-1.4 signed letter", "application/pdf")},
    )
    await client.post(
        f"/staff/reservations/{reservation['id']}/document-review/approve",
        headers={"Authorization": f"Bearer {staff_token}"},
    )
    return reservation


@pytest.mark.anyio
async def test_student_sees_payment_instructions_only_after_paid_reservation_reaches_pending_payment():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime(2026, 5, 1, 3, 0, tzinfo=UTC),
    )
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    staff_id = test_data.create_user(email="staff@ipb.ac.id", role=UserRole.staff)
    facility_id = test_data.create_facility(
        name="Auditorium Andi Hakim Nasoetion",
        price_rupiah=250000,
        payment_instructions="Transfer ke BNI 123456789 a.n. IPB",
    )
    test_data.add_facility_open_hour(facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await _login(client, email="admin@ipb.ac.id")
        staff_token = await _login(client, email="staff@ipb.ac.id")
        student_token = await _register_and_login(client, email="budi@apps.ipb.ac.id")
        reservation = await _create_reservation(
            client,
            token=student_token,
            facility_id=facility_id,
            organization_unit_id=organization_unit_id,
        )

        before_document_approval = await client.get(
            f"/student/reservations/{reservation['id']}/payment",
            headers={"Authorization": f"Bearer {student_token}"},
        )
        await client.put(
            f"/admin/facilities/{facility_id}/staff-assignments/{staff_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        await client.get(
            f"/student/reservations/{reservation['id']}/approval-letter",
            headers={"Authorization": f"Bearer {student_token}"},
        )
        await client.post(
            f"/student/reservations/{reservation['id']}/signed-approval-letter",
            headers={"Authorization": f"Bearer {student_token}"},
            files={"file": ("signed-letter.pdf", b"%PDF-1.4 signed letter", "application/pdf")},
        )
        await client.post(
            f"/staff/reservations/{reservation['id']}/document-review/approve",
            headers={"Authorization": f"Bearer {staff_token}"},
        )

        payment = await client.get(
            f"/student/reservations/{reservation['id']}/payment",
            headers={"Authorization": f"Bearer {student_token}"},
        )

    assert before_document_approval.status_code == 409
    assert payment.status_code == 200
    assert payment.json() == {
        "reservation_id": reservation["id"],
        "reservation_code": reservation["reservation_code"],
        "amount_rupiah": 250000,
        "payment_instructions": "Transfer ke BNI 123456789 a.n. IPB",
    }


@pytest.mark.anyio
async def test_student_uploads_payment_receipt_for_pending_paid_reservation():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime(2026, 5, 1, 3, 0, tzinfo=UTC),
    )
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    staff_id = test_data.create_user(email="staff@ipb.ac.id", role=UserRole.staff)
    facility_id = test_data.create_facility(
        name="Auditorium Andi Hakim Nasoetion",
        price_rupiah=250000,
        payment_instructions="Transfer ke BNI 123456789 a.n. IPB",
    )
    test_data.add_facility_open_hour(facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await _login(client, email="admin@ipb.ac.id")
        staff_token = await _login(client, email="staff@ipb.ac.id")
        student_token = await _register_and_login(client, email="budi@apps.ipb.ac.id")
        reservation = await _move_paid_reservation_to_pending_payment(
            client,
            admin_token=admin_token,
            staff_token=staff_token,
            student_token=student_token,
            facility_id=facility_id,
            staff_id=staff_id,
            organization_unit_id=organization_unit_id,
        )

        upload = await client.post(
            f"/student/reservations/{reservation['id']}/payment-receipt",
            headers={"Authorization": f"Bearer {student_token}"},
            files={"file": ("receipt.jpg", b"\xff\xd8 payment receipt", "image/jpeg")},
        )
        updated = await client.get(
            f"/student/reservations/{reservation['id']}",
            headers={"Authorization": f"Bearer {student_token}"},
        )
        reservation_list = await client.get(
            "/student/reservations",
            headers={"Authorization": f"Bearer {student_token}"},
        )

    assert upload.status_code == 201
    assert upload.json() == {
        "reservation_id": reservation["id"],
        "filename": "receipt.jpg",
        "content_type": "image/jpeg",
        "size_bytes": 18,
        "uploaded_at": "2026-05-01T03:00:00Z",
    }
    assert updated.json()["status"] == "pending_payment"
    assert updated.json()["payment_verification_due_at"] == "2026-05-02T03:00:00Z"
    assert updated.json()["payment"] == {
        "required": True,
        "receipt": {
            "filename": "receipt.jpg",
            "content_type": "image/jpeg",
            "size_bytes": 18,
            "generated_at": None,
            "uploaded_at": "2026-05-01T03:00:00Z",
        },
        "review_status": "waiting_review",
        "rejection_reason": None,
    }
    assert reservation_list.json()[0]["payment"] == updated.json()["payment"]


@pytest.mark.anyio
async def test_student_payment_receipt_upload_rejects_invalid_files_without_changing_status():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime(2026, 5, 1, 3, 0, tzinfo=UTC),
    )
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    staff_id = test_data.create_user(email="staff@ipb.ac.id", role=UserRole.staff)
    facility_id = test_data.create_facility(
        name="Auditorium Andi Hakim Nasoetion",
        price_rupiah=250000,
        payment_instructions="Transfer ke BNI 123456789 a.n. IPB",
    )
    test_data.add_facility_open_hour(facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await _login(client, email="admin@ipb.ac.id")
        staff_token = await _login(client, email="staff@ipb.ac.id")
        student_token = await _register_and_login(client, email="budi@apps.ipb.ac.id")
        reservation = await _move_paid_reservation_to_pending_payment(
            client,
            admin_token=admin_token,
            staff_token=staff_token,
            student_token=student_token,
            facility_id=facility_id,
            staff_id=staff_id,
            organization_unit_id=organization_unit_id,
        )

        unsupported = await client.post(
            f"/student/reservations/{reservation['id']}/payment-receipt",
            headers={"Authorization": f"Bearer {student_token}"},
            files={"file": ("receipt.pdf", b"%PDF receipt", "application/pdf")},
        )
        oversized = await client.post(
            f"/student/reservations/{reservation['id']}/payment-receipt",
            headers={"Authorization": f"Bearer {student_token}"},
            files={"file": ("receipt.png", b"x" * (5 * 1024 * 1024 + 1), "image/png")},
        )
        updated = await client.get(
            f"/student/reservations/{reservation['id']}",
            headers={"Authorization": f"Bearer {student_token}"},
        )

    assert unsupported.status_code == 400
    assert unsupported.json()["detail"] == "Bukti pembayaran harus berupa JPG, JPEG, atau PNG."
    assert oversized.status_code == 400
    assert oversized.json()["detail"] == "Ukuran bukti pembayaran maksimal 5 MB."
    assert updated.json()["status"] == "pending_payment"


@pytest.mark.anyio
async def test_assigned_staff_downloads_and_approves_payment_receipt():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime(2026, 5, 1, 3, 0, tzinfo=UTC),
    )
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    staff_id = test_data.create_user(email="staff@ipb.ac.id", role=UserRole.staff)
    facility_id = test_data.create_facility(
        name="Auditorium Andi Hakim Nasoetion",
        price_rupiah=250000,
        payment_instructions="Transfer ke BNI 123456789 a.n. IPB",
    )
    test_data.add_facility_open_hour(facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await _login(client, email="admin@ipb.ac.id")
        staff_token = await _login(client, email="staff@ipb.ac.id")
        student_token = await _register_and_login(client, email="budi@apps.ipb.ac.id")
        reservation = await _move_paid_reservation_to_pending_payment(
            client,
            admin_token=admin_token,
            staff_token=staff_token,
            student_token=student_token,
            facility_id=facility_id,
            staff_id=staff_id,
            organization_unit_id=organization_unit_id,
        )
        await client.post(
            f"/student/reservations/{reservation['id']}/payment-receipt",
            headers={"Authorization": f"Bearer {student_token}"},
            files={"file": ("receipt.png", b"payment receipt image", "image/png")},
        )

        download = await client.get(
            f"/staff/reservations/{reservation['id']}/payment-receipt/download",
            headers={"Authorization": f"Bearer {staff_token}"},
        )
        review = await client.post(
            f"/staff/reservations/{reservation['id']}/payment-review/approve",
            headers={"Authorization": f"Bearer {staff_token}"},
        )
        updated = await client.get(
            f"/student/reservations/{reservation['id']}",
            headers={"Authorization": f"Bearer {student_token}"},
        )

    assert download.status_code == 200
    assert download.headers["content-type"] == "image/png"
    assert download.headers["content-disposition"] == 'attachment; filename="receipt.png"'
    assert download.content == b"payment receipt image"
    assert review.status_code == 200
    assert review.json() == {
        "reservation_id": reservation["id"],
        "status": "approved",
        "rejection_reason": None,
    }
    assert updated.json()["status"] == "approved"


@pytest.mark.anyio
async def test_assigned_staff_payment_rejection_requires_reason_and_rejects_reservation():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime(2026, 5, 1, 3, 0, tzinfo=UTC),
    )
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    staff_id = test_data.create_user(email="staff@ipb.ac.id", role=UserRole.staff)
    facility_id = test_data.create_facility(
        name="Auditorium Andi Hakim Nasoetion",
        price_rupiah=250000,
        payment_instructions="Transfer ke BNI 123456789 a.n. IPB",
    )
    test_data.add_facility_open_hour(facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await _login(client, email="admin@ipb.ac.id")
        staff_token = await _login(client, email="staff@ipb.ac.id")
        student_token = await _register_and_login(client, email="budi@apps.ipb.ac.id")
        reservation = await _move_paid_reservation_to_pending_payment(
            client,
            admin_token=admin_token,
            staff_token=staff_token,
            student_token=student_token,
            facility_id=facility_id,
            staff_id=staff_id,
            organization_unit_id=organization_unit_id,
        )
        await client.post(
            f"/student/reservations/{reservation['id']}/payment-receipt",
            headers={"Authorization": f"Bearer {student_token}"},
            files={"file": ("receipt.png", b"payment receipt image", "image/png")},
        )

        missing_reason = await client.post(
            f"/staff/reservations/{reservation['id']}/payment-review/reject",
            headers={"Authorization": f"Bearer {staff_token}"},
            json={"reason": "   "},
        )
        unchanged = await client.get(
            f"/student/reservations/{reservation['id']}",
            headers={"Authorization": f"Bearer {student_token}"},
        )
        rejected = await client.post(
            f"/staff/reservations/{reservation['id']}/payment-review/reject",
            headers={"Authorization": f"Bearer {staff_token}"},
            json={"reason": "Nominal transfer tidak sesuai."},
        )
        updated = await client.get(
            f"/student/reservations/{reservation['id']}",
            headers={"Authorization": f"Bearer {student_token}"},
        )

    assert missing_reason.status_code == 400
    assert missing_reason.json()["detail"] == "Alasan penolakan wajib diisi."
    assert unchanged.json()["status"] == "pending_payment"
    assert rejected.status_code == 200
    assert rejected.json() == {
        "reservation_id": reservation["id"],
        "status": "rejected",
        "rejection_reason": "Nominal transfer tidak sesuai.",
    }
    assert updated.json()["status"] == "rejected"
    assert updated.json()["payment"]["review_status"] == "rejected"
    assert updated.json()["payment"]["rejection_reason"] == "Nominal transfer tidak sesuai."
    assert updated.json()["rejection"] == {
        "source": "payment",
        "reason": "Nominal transfer tidak sesuai.",
    }


@pytest.mark.anyio
async def test_payment_workflow_blocks_free_reservations_other_students_and_unassigned_staff():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime(2026, 5, 1, 3, 0, tzinfo=UTC),
    )
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    assigned_staff_id = test_data.create_user(email="assigned-staff@ipb.ac.id", role=UserRole.staff)
    test_data.create_user(email="other-staff@ipb.ac.id", role=UserRole.staff)
    paid_facility_id = test_data.create_facility(
        name="Auditorium Andi Hakim Nasoetion",
        price_rupiah=250000,
        payment_instructions="Transfer ke BNI 123456789 a.n. IPB",
    )
    free_facility_id = test_data.create_facility(name="Ruang Rapat Gratis", price_rupiah=0)
    test_data.add_facility_open_hour(paid_facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
    test_data.add_facility_open_hour(free_facility_id, day_of_week=0, opens_at="08:00", closes_at="16:00")
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await _login(client, email="admin@ipb.ac.id")
        assigned_staff_token = await _login(client, email="assigned-staff@ipb.ac.id")
        other_staff_token = await _login(client, email="other-staff@ipb.ac.id")
        owner_token = await _register_and_login(client, email="budi@apps.ipb.ac.id")
        other_student_token = await _register_and_login(
            client,
            email="sari@apps.ipb.ac.id",
            full_name="Sari Wulandari",
        )
        paid_reservation = await _move_paid_reservation_to_pending_payment(
            client,
            admin_token=admin_token,
            staff_token=assigned_staff_token,
            student_token=owner_token,
            facility_id=paid_facility_id,
            staff_id=assigned_staff_id,
            organization_unit_id=organization_unit_id,
        )
        await client.post(
            f"/student/reservations/{paid_reservation['id']}/payment-receipt",
            headers={"Authorization": f"Bearer {owner_token}"},
            files={"file": ("receipt.png", b"payment receipt image", "image/png")},
        )
        free_reservation = await _create_reservation(
            client,
            token=owner_token,
            facility_id=free_facility_id,
            organization_unit_id=organization_unit_id,
        )

        free_payment = await client.get(
            f"/student/reservations/{free_reservation['id']}/payment",
            headers={"Authorization": f"Bearer {owner_token}"},
        )
        other_student_payment = await client.get(
            f"/student/reservations/{paid_reservation['id']}/payment",
            headers={"Authorization": f"Bearer {other_student_token}"},
        )
        other_student_upload = await client.post(
            f"/student/reservations/{paid_reservation['id']}/payment-receipt",
            headers={"Authorization": f"Bearer {other_student_token}"},
            files={"file": ("receipt.png", b"payment receipt image", "image/png")},
        )
        unassigned_download = await client.get(
            f"/staff/reservations/{paid_reservation['id']}/payment-receipt/download",
            headers={"Authorization": f"Bearer {other_staff_token}"},
        )
        unassigned_approval = await client.post(
            f"/staff/reservations/{paid_reservation['id']}/payment-review/approve",
            headers={"Authorization": f"Bearer {other_staff_token}"},
        )

    assert free_payment.status_code == 409
    assert other_student_payment.status_code == 404
    assert other_student_upload.status_code == 404
    assert unassigned_download.status_code == 403
    assert unassigned_approval.status_code == 403

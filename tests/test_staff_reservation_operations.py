from datetime import UTC, datetime

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import create_app
from app.models import ReservationStatus, UserRole
from tests.data_builder import DataBuilder


async def _login(client: AsyncClient, *, email: str) -> str:
    login = await client.post("/auth/login", json={"email": email, "password": "secret123"})
    return login.json()["access_token"]


@pytest.mark.anyio
async def test_assigned_staff_fetches_actionable_document_review_queue_items_only_for_assigned_facilities():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime(2026, 5, 1, tzinfo=UTC),
    )
    test_data = DataBuilder(app)
    admin_id = test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    staff_id = test_data.create_user(email="staff@ipb.ac.id", role=UserRole.staff)
    assigned_facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    unassigned_facility_id = test_data.create_facility(
        name="Gedung Kuliah Bersama",
        category_name="Ruang Kelas",
        category_slug="ruang-kelas",
    )
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")
    assigned_reservation_id = test_data.create_reservation(
        facility_id=assigned_facility_id,
        organization_unit_id=organization_unit_id,
        activity_title="Seminar Karier",
        starts_at="2026-06-01T02:00:00+00:00",
        ends_at="2026-06-01T04:00:00+00:00",
        status=ReservationStatus.pending_document_review,
        document_verification_due_at="2026-05-03T00:00:00+00:00",
    )
    test_data.create_reservation(
        facility_id=unassigned_facility_id,
        organization_unit_id=organization_unit_id,
        activity_title="Workshop Unassigned",
        starts_at="2026-06-02T02:00:00+00:00",
        ends_at="2026-06-02T04:00:00+00:00",
        status=ReservationStatus.pending_document_review,
        document_verification_due_at="2026-05-04T00:00:00+00:00",
    )
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await _login(client, email="admin@ipb.ac.id")
        staff_token = await _login(client, email="staff@ipb.ac.id")
        await client.put(
            f"/admin/facilities/{assigned_facility_id}/staff-assignments/{staff_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        queue = await client.get(
            "/staff/reservations/verification-queue",
            headers={"Authorization": f"Bearer {staff_token}"},
        )

    assert admin_id
    assert queue.status_code == 200
    assert queue.json() == [
        {
            "id": assigned_reservation_id,
            "reservation_code": "RSV-SEMINAR-KARIER",
            "facility": {
                "id": assigned_facility_id,
                "name": "Auditorium Andi Hakim Nasoetion",
            },
            "student": {
                "id": queue.json()[0]["student"]["id"],
                "full_name": "Student Reservasi",
                "email": "student-seminar-karier@apps.ipb.ac.id",
            },
            "organization_unit": {
                "id": organization_unit_id,
                "name": "BEM KM IPB",
            },
            "activity_title": "Seminar Karier",
            "starts_at": "2026-06-01T02:00:00Z",
            "ends_at": "2026-06-01T04:00:00Z",
            "status": "pending_document_review",
            "workflow_type": "document_review",
            "review_status": "pending_review",
            "due_at": "2026-05-03T00:00:00Z",
            "document": {
                "review_status": "pending_review",
                "due_at": "2026-05-03T00:00:00Z",
            },
            "payment": {
                "required": False,
                "review_status": "not_required",
                "due_at": None,
            },
            "cancellation": {
                "requested": False,
                "review_status": "not_requested",
            },
        }
    ]


@pytest.mark.anyio
async def test_assigned_staff_reservation_list_supports_status_facility_and_date_filters():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime(2026, 5, 1, tzinfo=UTC),
    )
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    staff_id = test_data.create_user(email="staff@ipb.ac.id", role=UserRole.staff)
    assigned_facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    other_assigned_facility_id = test_data.create_facility(
        name="Ruang Sidang Rektorat",
        category_name="Ruang Rapat",
        category_slug="ruang-rapat",
    )
    unassigned_facility_id = test_data.create_facility(
        name="Gedung Kuliah Bersama",
        category_name="Ruang Kelas",
        category_slug="ruang-kelas",
    )
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")
    matching_reservation_id = test_data.create_reservation(
        facility_id=assigned_facility_id,
        organization_unit_id=organization_unit_id,
        activity_title="Seminar Approved",
        starts_at="2026-06-10T02:00:00+00:00",
        ends_at="2026-06-10T04:00:00+00:00",
        status=ReservationStatus.approved,
    )
    test_data.create_reservation(
        facility_id=assigned_facility_id,
        organization_unit_id=organization_unit_id,
        activity_title="Waiting Document",
        starts_at="2026-06-12T02:00:00+00:00",
        ends_at="2026-06-12T04:00:00+00:00",
        status=ReservationStatus.pending_document_review,
    )
    test_data.create_reservation(
        facility_id=other_assigned_facility_id,
        organization_unit_id=organization_unit_id,
        activity_title="Other Facility Approved",
        starts_at="2026-06-11T02:00:00+00:00",
        ends_at="2026-06-11T04:00:00+00:00",
        status=ReservationStatus.approved,
    )
    test_data.create_reservation(
        facility_id=assigned_facility_id,
        organization_unit_id=organization_unit_id,
        activity_title="Outside Range Approved",
        starts_at="2026-07-10T02:00:00+00:00",
        ends_at="2026-07-10T04:00:00+00:00",
        status=ReservationStatus.approved,
    )
    test_data.create_reservation(
        facility_id=unassigned_facility_id,
        organization_unit_id=organization_unit_id,
        activity_title="Unassigned Approved",
        starts_at="2026-06-13T02:00:00+00:00",
        ends_at="2026-06-13T04:00:00+00:00",
        status=ReservationStatus.approved,
    )
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await _login(client, email="admin@ipb.ac.id")
        staff_token = await _login(client, email="staff@ipb.ac.id")
        await client.put(
            f"/admin/facilities/{assigned_facility_id}/staff-assignments/{staff_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        await client.put(
            f"/admin/facilities/{other_assigned_facility_id}/staff-assignments/{staff_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        reservations = await client.get(
            (
                "/staff/reservations"
                f"?status=approved&facility_id={assigned_facility_id}"
                "&date_from=2026-06-01&date_to=2026-06-30"
            ),
            headers={"Authorization": f"Bearer {staff_token}"},
        )

    assert reservations.status_code == 200
    assert reservations.json() == [
        {
            "id": matching_reservation_id,
            "reservation_code": "RSV-SEMINAR-APPROVED",
            "facility": {
                "id": assigned_facility_id,
                "name": "Auditorium Andi Hakim Nasoetion",
            },
            "student": {
                "id": reservations.json()[0]["student"]["id"],
                "full_name": "Student Reservasi",
                "email": "student-seminar-approved@apps.ipb.ac.id",
            },
            "organization_unit": {
                "id": organization_unit_id,
                "name": "BEM KM IPB",
            },
            "activity_title": "Seminar Approved",
            "starts_at": "2026-06-10T02:00:00Z",
            "ends_at": "2026-06-10T04:00:00Z",
            "status": "approved",
            "workflow_type": "reservation",
            "review_status": "not_actionable",
            "due_at": None,
            "document": {
                "review_status": "approved",
                "due_at": None,
            },
            "payment": {
                "required": False,
                "review_status": "not_required",
                "due_at": None,
            },
            "cancellation": {
                "requested": False,
                "review_status": "not_requested",
            },
        }
    ]


@pytest.mark.anyio
async def test_staff_verification_queue_includes_payment_review_but_not_cancellation_review_work():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime(2026, 5, 1, tzinfo=UTC),
    )
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    staff_id = test_data.create_user(email="staff@ipb.ac.id", role=UserRole.staff)
    facility_id = test_data.create_facility(
        name="Auditorium Andi Hakim Nasoetion",
        price_rupiah=500000,
        payment_instructions="Transfer ke rekening IPB.",
    )
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")
    test_data.create_reservation(
        facility_id=facility_id,
        organization_unit_id=organization_unit_id,
        activity_title="Paid Receipt",
        starts_at="2026-06-01T02:00:00+00:00",
        ends_at="2026-06-01T04:00:00+00:00",
        status=ReservationStatus.pending_payment,
        payment_verification_due_at="2026-05-05T00:00:00+00:00",
        has_payment_receipt=True,
    )
    test_data.create_reservation(
        facility_id=facility_id,
        organization_unit_id=organization_unit_id,
        activity_title="Cancel Approved Event",
        starts_at="2026-06-02T02:00:00+00:00",
        ends_at="2026-06-02T04:00:00+00:00",
        status=ReservationStatus.cancellation_requested,
    )
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await _login(client, email="admin@ipb.ac.id")
        staff_token = await _login(client, email="staff@ipb.ac.id")
        await client.put(
            f"/admin/facilities/{facility_id}/staff-assignments/{staff_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        queue = await client.get(
            "/staff/reservations/verification-queue",
            headers={"Authorization": f"Bearer {staff_token}"},
        )

    assert queue.status_code == 200
    workflows = {item["activity_title"]: item for item in queue.json()}
    assert workflows["Paid Receipt"]["workflow_type"] == "payment_review"
    assert workflows["Paid Receipt"]["payment"] == {
        "required": True,
        "review_status": "pending_review",
        "due_at": "2026-05-05T00:00:00Z",
    }
    assert "Cancel Approved Event" not in workflows


@pytest.mark.anyio
async def test_student_cannot_access_staff_reservation_queue_or_list():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await client.post(
            "/auth/register",
            json={
                "email": "student@apps.ipb.ac.id",
                "password": "secret123",
                "full_name": "Student",
                "nim": "G64190001",
                "phone": "08123456789",
            },
        )
        student_token = await _login(client, email="student@apps.ipb.ac.id")

        queue = await client.get(
            "/staff/reservations/verification-queue",
            headers={"Authorization": f"Bearer {student_token}"},
        )
        reservations = await client.get(
            "/staff/reservations",
            headers={"Authorization": f"Bearer {student_token}"},
        )

    assert queue.status_code == 403
    assert reservations.status_code == 403


@pytest.mark.anyio
async def test_assigned_staff_fetches_reservation_detail_with_null_missing_file_metadata():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime(2026, 5, 1, tzinfo=UTC),
    )
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    staff_id = test_data.create_user(email="staff@ipb.ac.id", role=UserRole.staff)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")
    reservation_id = test_data.create_reservation(
        facility_id=facility_id,
        organization_unit_id=organization_unit_id,
        activity_title="Seminar Detail",
        starts_at="2026-06-01T02:00:00+00:00",
        ends_at="2026-06-01T04:00:00+00:00",
        status=ReservationStatus.pending_document_review,
        document_upload_due_at="2026-05-02T00:00:00+00:00",
        document_verification_due_at="2026-05-03T00:00:00+00:00",
        extra_requirement_av_support=True,
        extra_requirement_notes="Butuh dua mikrofon.",
    )
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await _login(client, email="admin@ipb.ac.id")
        staff_token = await _login(client, email="staff@ipb.ac.id")
        await client.put(
            f"/admin/facilities/{facility_id}/staff-assignments/{staff_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        detail = await client.get(
            f"/staff/reservations/{reservation_id}",
            headers={"Authorization": f"Bearer {staff_token}"},
        )

    assert detail.status_code == 200
    assert detail.json() == {
        "id": reservation_id,
        "reservation_code": "RSV-SEMINAR-DETAIL",
        "facility": {
            "id": facility_id,
            "name": "Auditorium Andi Hakim Nasoetion",
        },
        "student": {
            "id": detail.json()["student"]["id"],
            "full_name": "Student Reservasi",
            "email": "student-seminar-detail@apps.ipb.ac.id",
        },
        "organization_unit": {
            "id": organization_unit_id,
            "name": "BEM KM IPB",
        },
        "activity_title": "Seminar Detail",
        "event_description": "Private event description",
        "participant_count": 0,
        "contact_phone": "",
        "starts_at": "2026-06-01T02:00:00Z",
        "ends_at": "2026-06-01T04:00:00Z",
        "status": "pending_document_review",
        "price_rupiah": 0,
        "extra_requirements": {
            "av_support": True,
            "logistics_coordination": False,
            "extra_cleaning": False,
            "security_personnel": False,
            "notes": "Butuh dua mikrofon.",
        },
        "document": {
            "approval_letter": None,
            "signed_approval_letter": None,
            "review_status": "pending_review",
            "rejection_reason": None,
            "due_at": "2026-05-03T00:00:00Z",
        },
        "payment": {
            "required": False,
            "receipt": None,
            "review_status": "not_required",
            "rejection_reason": None,
            "due_at": None,
        },
        "cancellation": {
            "requested": False,
            "review_status": "not_requested",
            "reason": None,
            "rejection_reason": None,
        },
        "review_actions": {
            "document": {
                "approve_url": f"/staff/reservations/{reservation_id}/document-review/approve",
                "reject_url": f"/staff/reservations/{reservation_id}/document-review/reject",
                "download_url": f"/staff/reservations/{reservation_id}/signed-approval-letter/download",
            },
            "payment": {
                "approve_url": f"/staff/reservations/{reservation_id}/payment-review/approve",
                "reject_url": f"/staff/reservations/{reservation_id}/payment-review/reject",
                "download_url": f"/staff/reservations/{reservation_id}/payment-receipt/download",
            },
            "cancellation": {
                "approve_url": f"/staff/reservations/{reservation_id}/cancellation-review/approve",
                "reject_url": f"/staff/reservations/{reservation_id}/cancellation-review/reject",
                "download_url": None,
            },
        },
    }


@pytest.mark.anyio
async def test_staff_reservation_detail_exposes_payment_receipt_metadata_and_scopes_access():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime(2026, 5, 1, tzinfo=UTC),
    )
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    assigned_staff_id = test_data.create_user(email="staff@ipb.ac.id", role=UserRole.staff)
    test_data.create_user(email="other-staff@ipb.ac.id", role=UserRole.staff)
    facility_id = test_data.create_facility(
        name="Auditorium Andi Hakim Nasoetion",
        price_rupiah=500000,
        payment_instructions="Transfer ke rekening IPB.",
    )
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")
    reservation_id = test_data.create_reservation(
        facility_id=facility_id,
        organization_unit_id=organization_unit_id,
        activity_title="Paid Detail",
        starts_at="2026-06-01T02:00:00+00:00",
        ends_at="2026-06-01T04:00:00+00:00",
        status=ReservationStatus.pending_payment,
        payment_verification_due_at="2026-05-05T00:00:00+00:00",
        has_payment_receipt=True,
    )
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await _login(client, email="admin@ipb.ac.id")
        staff_token = await _login(client, email="staff@ipb.ac.id")
        other_staff_token = await _login(client, email="other-staff@ipb.ac.id")
        await client.post(
            "/auth/register",
            json={
                "email": "student@apps.ipb.ac.id",
                "password": "secret123",
                "full_name": "Student",
                "nim": "G64190001",
                "phone": "08123456789",
            },
        )
        student_token = await _login(client, email="student@apps.ipb.ac.id")
        await client.put(
            f"/admin/facilities/{facility_id}/staff-assignments/{assigned_staff_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        detail = await client.get(
            f"/staff/reservations/{reservation_id}",
            headers={"Authorization": f"Bearer {staff_token}"},
        )
        unassigned_detail = await client.get(
            f"/staff/reservations/{reservation_id}",
            headers={"Authorization": f"Bearer {other_staff_token}"},
        )
        student_detail = await client.get(
            f"/staff/reservations/{reservation_id}",
            headers={"Authorization": f"Bearer {student_token}"},
        )

    assert detail.status_code == 200
    assert detail.json()["payment"] == {
        "required": True,
        "receipt": {
            "filename": "receipt.png",
            "content_type": "image/png",
            "size_bytes": 10,
            "generated_at": None,
            "uploaded_at": "2026-06-01T00:00:00Z",
        },
        "review_status": "pending_review",
        "rejection_reason": None,
        "due_at": "2026-05-05T00:00:00Z",
    }
    assert unassigned_detail.status_code == 404
    assert student_detail.status_code == 403


@pytest.mark.anyio
async def test_assigned_staff_fetches_private_facility_schedule_without_changing_public_calendar_shape():
    app = create_app(
        database_url="sqlite+pysqlite:///:memory:",
        clock=lambda: datetime(2026, 5, 1, tzinfo=UTC),
    )
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    staff_id = test_data.create_user(email="staff@ipb.ac.id", role=UserRole.staff)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB")
    reservation_id = test_data.create_reservation(
        facility_id=facility_id,
        organization_unit_id=organization_unit_id,
        activity_title="Seminar Schedule",
        starts_at="2026-06-10T02:00:00+00:00",
        ends_at="2026-06-10T04:00:00+00:00",
        status=ReservationStatus.pending_document_review,
        document_verification_due_at="2026-05-03T00:00:00+00:00",
    )
    test_data.create_reservation(
        facility_id=facility_id,
        organization_unit_id=organization_unit_id,
        activity_title="Outside Schedule Range",
        starts_at="2026-07-10T02:00:00+00:00",
        ends_at="2026-07-10T04:00:00+00:00",
        status=ReservationStatus.approved,
    )
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await _login(client, email="admin@ipb.ac.id")
        staff_token = await _login(client, email="staff@ipb.ac.id")
        await client.put(
            f"/admin/facilities/{facility_id}/staff-assignments/{staff_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        schedule = await client.get(
            f"/staff/facilities/{facility_id}/schedule",
            params={
                "start": "2026-06-01T00:00:00+00:00",
                "end": "2026-06-30T23:59:59+00:00",
            },
            headers={"Authorization": f"Bearer {staff_token}"},
        )
        public_calendar = await client.get(
            f"/facilities/{facility_id}/calendar",
            params={
                "start": "2026-06-01T00:00:00+00:00",
                "end": "2026-06-30T23:59:59+00:00",
            },
        )

    assert schedule.status_code == 200
    assert schedule.json() == [
        {
            "reservation_id": reservation_id,
            "reservation_code": "RSV-SEMINAR-SCHEDULE",
            "activity_title": "Seminar Schedule",
            "organization_unit": {
                "id": organization_unit_id,
                "name": "BEM KM IPB",
            },
            "starts_at": "2026-06-10T02:00:00Z",
            "ends_at": "2026-06-10T04:00:00Z",
            "status": "pending_document_review",
            "workflow_type": "document_review",
            "review_status": "pending_review",
            "detail_url": f"/staff/reservations/{reservation_id}",
        }
    ]
    assert public_calendar.status_code == 200
    assert public_calendar.json() == [
        {
            "starts_at": "2026-06-10T02:00:00Z",
            "ends_at": "2026-06-10T04:00:00Z",
            "status": "reserved",
        }
    ]
    assert "reservation_id" not in public_calendar.json()[0]
    assert "workflow_type" not in public_calendar.json()[0]
    assert "activity_title" not in public_calendar.json()[0]
    assert "organization_unit" not in public_calendar.json()[0]


@pytest.mark.anyio
async def test_staff_private_facility_schedule_denies_unassigned_and_non_staff_users():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    test_data = DataBuilder(app)
    test_data.create_user(email="other-staff@ipb.ac.id", role=UserRole.staff)
    facility_id = test_data.create_facility(name="Auditorium Andi Hakim Nasoetion")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        other_staff_token = await _login(client, email="other-staff@ipb.ac.id")
        await client.post(
            "/auth/register",
            json={
                "email": "student@apps.ipb.ac.id",
                "password": "secret123",
                "full_name": "Student",
                "nim": "G64190001",
                "phone": "08123456789",
            },
        )
        student_token = await _login(client, email="student@apps.ipb.ac.id")

        unassigned_schedule = await client.get(
            f"/staff/facilities/{facility_id}/schedule",
            params={
                "start": "2026-06-01T00:00:00+00:00",
                "end": "2026-06-30T23:59:59+00:00",
            },
            headers={"Authorization": f"Bearer {other_staff_token}"},
        )
        student_schedule = await client.get(
            f"/staff/facilities/{facility_id}/schedule",
            params={
                "start": "2026-06-01T00:00:00+00:00",
                "end": "2026-06-30T23:59:59+00:00",
            },
            headers={"Authorization": f"Bearer {student_token}"},
        )

    assert unassigned_schedule.status_code == 404
    assert student_schedule.status_code == 403

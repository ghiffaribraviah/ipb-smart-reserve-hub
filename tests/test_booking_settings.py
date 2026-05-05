import pytest
from httpx import ASGITransport, AsyncClient

from app.booking_setting_schemas import BookingSettingsResponse, BookingSettingsUpdateRequest
from app.booking_settings import BookingSettings
from app.main import create_app
from app.models import SystemSetting, UserRole
from tests.data_builder import DataBuilder


@pytest.mark.anyio
async def test_super_admin_views_default_booking_settings():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    DataBuilder(app).create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_login = await client.post(
            "/auth/login",
            json={"email": "admin@ipb.ac.id", "password": "secret123"},
        )
        admin_token = admin_login.json()["access_token"]

        response = await client.get("/admin/settings", headers={"Authorization": f"Bearer {admin_token}"})

    assert response.status_code == 200
    assert response.json() == {
        "min_booking_lead_hours": 336,
        "max_booking_advance_hours": 1440,
        "document_upload_due_hours": 72,
        "document_verification_due_hours": 48,
        "payment_upload_due_hours": 24,
        "payment_verification_due_hours": 24,
        "final_approval_cutoff_hours": 168,
        "overdue_final_approval_cutoff_hours": 96,
        "allowed_student_email_domains": ["apps.ipb.ac.id"],
    }


@pytest.mark.anyio
async def test_super_admin_updates_booking_settings_used_by_student_registration():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    DataBuilder(app).create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_login = await client.post(
            "/auth/login",
            json={"email": "admin@ipb.ac.id", "password": "secret123"},
        )
        admin_token = admin_login.json()["access_token"]

        updated = await client.patch(
            "/admin/settings",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "min_booking_lead_hours": 48,
                "max_booking_advance_hours": 720,
                "document_upload_due_hours": 24,
                "document_verification_due_hours": 12,
                "payment_upload_due_hours": 6,
                "payment_verification_due_hours": 6,
                "final_approval_cutoff_hours": 72,
                "overdue_final_approval_cutoff_hours": 48,
                "allowed_student_email_domains": [" STUDENT.IPB.AC.ID "],
            },
        )
        rejected_old_domain = await client.post(
            "/auth/register",
            json={
                "email": "budi@apps.ipb.ac.id",
                "password": "secret123",
                "full_name": "Budi Santoso",
                "nim": "G64190001",
                "phone": "08123456789",
            },
        )
        accepted_new_domain = await client.post(
            "/auth/register",
            json={
                "email": "siti@student.ipb.ac.id",
                "password": "secret123",
                "full_name": "Siti Aminah",
                "nim": "G64190002",
                "phone": "08123456780",
            },
        )

    assert updated.status_code == 200
    assert updated.json()["min_booking_lead_hours"] == 48
    assert updated.json()["allowed_student_email_domains"] == ["student.ipb.ac.id"]
    assert rejected_old_domain.status_code == 400
    assert accepted_new_domain.status_code == 201


@pytest.mark.anyio
async def test_invalid_booking_settings_update_returns_stable_error_without_partial_changes():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    DataBuilder(app).create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_login = await client.post(
            "/auth/login",
            json={"email": "admin@ipb.ac.id", "password": "secret123"},
        )
        admin_token = admin_login.json()["access_token"]

        invalid_update = await client.patch(
            "/admin/settings",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "min_booking_lead_hours": 0,
                "max_booking_advance_hours": 720,
                "document_upload_due_hours": 24,
                "document_verification_due_hours": 12,
                "payment_upload_due_hours": 6,
                "payment_verification_due_hours": 6,
                "final_approval_cutoff_hours": 72,
                "overdue_final_approval_cutoff_hours": 48,
                "allowed_student_email_domains": [],
            },
        )
        current_settings = await client.get(
            "/admin/settings",
            headers={"Authorization": f"Bearer {admin_token}"},
        )

    assert invalid_update.status_code == 400
    assert invalid_update.json() == {
        "detail": [
            "min_booking_lead_hours must be greater than 0",
            "allowed_student_email_domains must contain at least one domain",
        ]
    }
    assert current_settings.json()["min_booking_lead_hours"] == 336
    assert current_settings.json()["allowed_student_email_domains"] == ["apps.ipb.ac.id"]


def test_booking_settings_schema_converts_to_and_from_domain_settings():
    payload = BookingSettingsUpdateRequest(
        min_booking_lead_hours=48,
        max_booking_advance_hours=720,
        document_upload_due_hours=24,
        document_verification_due_hours=12,
        payment_upload_due_hours=6,
        payment_verification_due_hours=6,
        final_approval_cutoff_hours=72,
        overdue_final_approval_cutoff_hours=48,
        allowed_student_email_domains=[" STUDENT.IPB.AC.ID "],
    )

    booking_settings = payload.to_booking_settings()
    response = BookingSettingsResponse.from_booking_settings(booking_settings)

    assert booking_settings == BookingSettings(
        min_booking_lead_hours=48,
        max_booking_advance_hours=720,
        document_upload_due_hours=24,
        document_verification_due_hours=12,
        payment_upload_due_hours=6,
        payment_verification_due_hours=6,
        final_approval_cutoff_hours=72,
        overdue_final_approval_cutoff_hours=48,
        allowed_student_email_domains=("student.ipb.ac.id",),
    )
    assert response.model_dump() == {
        "min_booking_lead_hours": 48,
        "max_booking_advance_hours": 720,
        "document_upload_due_hours": 24,
        "document_verification_due_hours": 12,
        "payment_upload_due_hours": 6,
        "payment_verification_due_hours": 6,
        "final_approval_cutoff_hours": 72,
        "overdue_final_approval_cutoff_hours": 48,
        "allowed_student_email_domains": ["student.ipb.ac.id"],
    }


@pytest.mark.anyio
async def test_booking_settings_ignore_unrelated_system_setting_rows():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    DataBuilder(app).create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    with app.state.session_factory() as session:
        session.add(SystemSetting(key="maintenance_banner", value='"Jaringan kampus dalam pemeliharaan"'))
        session.commit()
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_login = await client.post(
            "/auth/login",
            json={"email": "admin@ipb.ac.id", "password": "secret123"},
        )
        admin_token = admin_login.json()["access_token"]

        response = await client.get("/admin/settings", headers={"Authorization": f"Bearer {admin_token}"})

    assert response.status_code == 200
    assert "maintenance_banner" not in response.json()
    assert response.json()["min_booking_lead_hours"] == 336

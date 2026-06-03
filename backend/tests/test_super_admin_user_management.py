import pytest
from httpx import ASGITransport, AsyncClient

from app.main import create_app
from app.models import UserRole
from tests.data_builder import DataBuilder


async def _login(client: AsyncClient, *, email: str) -> str:
    login = await client.post("/auth/login", json={"email": email, "password": "secret123"})
    return login.json()["access_token"]


@pytest.mark.anyio
async def test_super_admin_lists_users_with_pagination_and_identity_filters():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    test_data.create_user(email="tu-auditorium@ipb.ac.id", role=UserRole.staff)
    test_data.create_user(email="inactive-tu@ipb.ac.id", role=UserRole.staff, is_active=False)
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await client.post(
            "/auth/register",
            json={
                "email": "student@apps.ipb.ac.id",
                "password": "secret123",
                "full_name": "Student Aktif",
                "nim": "G64190001",
                "phone": "08123456789",
            },
        )
        admin_token = await _login(client, email="admin@ipb.ac.id")

        response = await client.get(
            "/admin/users",
            params={"role": "staff", "is_active": "true", "search": "auditorium", "page": "1", "page_size": "10"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        student_response = await client.get(
            "/admin/users",
            params={"role": "student", "search": "student", "page": "1", "page_size": "10"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )

    assert response.status_code == 200
    assert response.json() == {
        "items": [
            {
                "id": response.json()["items"][0]["id"],
                "email": "tu-auditorium@ipb.ac.id",
                "full_name": "Seed User",
                "role": "staff",
                "is_active": True,
                "nim": None,
                "phone": None,
                "academic_profile": None,
            }
        ],
        "total": 1,
        "page": 1,
        "page_size": 10,
    }
    assert student_response.status_code == 200
    assert student_response.json()["items"][0]["nim"] == "G64190001"
    assert student_response.json()["items"][0]["phone"] == "08123456789"
    assert student_response.json()["items"][0]["academic_profile"] is not None


@pytest.mark.anyio
async def test_super_admin_deactivates_and_reactivates_user_accounts_and_sessions_follow_active_status():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    staff_id = test_data.create_user(email="staff@ipb.ac.id", role=UserRole.staff)
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await _login(client, email="admin@ipb.ac.id")
        staff_token = await _login(client, email="staff@ipb.ac.id")

        deactivated = await client.post(
            f"/admin/users/{staff_id}/deactivate",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        login_while_inactive = await client.post(
            "/auth/login",
            json={"email": "staff@ipb.ac.id", "password": "secret123"},
        )
        refresh_while_inactive = await client.post(
            "/auth/refresh",
            headers={"Authorization": f"Bearer {staff_token}"},
        )
        current_user_while_inactive = await client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {staff_token}"},
        )
        reactivated = await client.post(
            f"/admin/users/{staff_id}/activate",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        login_after_reactivation = await client.post(
            "/auth/login",
            json={"email": "staff@ipb.ac.id", "password": "secret123"},
        )

    assert deactivated.status_code == 200
    assert deactivated.json()["is_active"] is False
    assert login_while_inactive.status_code == 401
    assert refresh_while_inactive.status_code == 401
    assert current_user_while_inactive.status_code == 401
    assert reactivated.status_code == 200
    assert reactivated.json()["is_active"] is True
    assert login_after_reactivation.status_code == 200


@pytest.mark.anyio
async def test_super_admin_creates_student_user_with_required_identity_fields():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await _login(client, email="admin@ipb.ac.id")

        created = await client.post(
            "/admin/users",
            json={
                "email": "student.created@apps.ipb.ac.id",
                "password": "secret123",
                "full_name": "Student Created",
                "role": "student",
                "nim": "G64190002",
                "phone": "08123456780",
                "is_active": True,
            },
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        login = await client.post(
            "/auth/login",
            json={"email": "student.created@apps.ipb.ac.id", "password": "secret123"},
        )

    assert created.status_code == 201
    assert created.json()["role"] == "student"
    assert created.json()["nim"] == "G64190002"
    assert created.json()["phone"] == "08123456780"
    assert created.json()["academic_profile"] is not None
    assert login.status_code == 200


@pytest.mark.anyio
async def test_student_and_staff_cannot_access_super_admin_user_management_endpoints():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    test_data = DataBuilder(app)
    staff_id = test_data.create_user(email="staff@ipb.ac.id", role=UserRole.staff)
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
        staff_token = await _login(client, email="staff@ipb.ac.id")
        student_token = await _login(client, email="student@apps.ipb.ac.id")

        staff_list = await client.get("/admin/users", headers={"Authorization": f"Bearer {staff_token}"})
        student_list = await client.get("/admin/users", headers={"Authorization": f"Bearer {student_token}"})
        staff_deactivate = await client.post(
            f"/admin/users/{staff_id}/deactivate",
            headers={"Authorization": f"Bearer {staff_token}"},
        )

    assert staff_list.status_code == 403
    assert student_list.status_code == 403
    assert staff_deactivate.status_code == 403


@pytest.mark.anyio
async def test_super_admin_updates_basic_user_profile_and_resets_password():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    staff_id = test_data.create_user(email="staff@ipb.ac.id", role=UserRole.staff)
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await _login(client, email="admin@ipb.ac.id")

        updated = await client.patch(
            f"/admin/users/{staff_id}",
            json={"email": "staff.baru@ipb.ac.id", "full_name": "Staff Baru"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        reset = await client.post(
            f"/admin/users/{staff_id}/reset-password",
            json={"password": "newsecret123"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        old_login = await client.post(
            "/auth/login",
            json={"email": "staff.baru@ipb.ac.id", "password": "secret123"},
        )
        new_login = await client.post(
            "/auth/login",
            json={"email": "staff.baru@ipb.ac.id", "password": "newsecret123"},
        )

    assert updated.status_code == 200
    assert updated.json()["email"] == "staff.baru@ipb.ac.id"
    assert updated.json()["full_name"] == "Staff Baru"
    assert reset.status_code == 200
    assert reset.json()["email"] == "staff.baru@ipb.ac.id"
    assert old_login.status_code == 401
    assert new_login.status_code == 200


@pytest.mark.anyio
async def test_super_admin_cannot_update_user_to_duplicate_email():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    target_user_id = test_data.create_user(email="staff-1@ipb.ac.id", role=UserRole.staff)
    test_data.create_user(email="staff-2@ipb.ac.id", role=UserRole.staff)
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await _login(client, email="admin@ipb.ac.id")

        duplicate = await client.patch(
            f"/admin/users/{target_user_id}",
            json={"email": "staff-2@ipb.ac.id", "full_name": "Staff Satu"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )

    assert duplicate.status_code == 409
    assert duplicate.json()["detail"] == "Email sudah terdaftar."


@pytest.mark.anyio
async def test_super_admin_deletes_unreferenced_user_but_rejects_referenced_user():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    deletable_staff_id = test_data.create_user(email="staff-hapus@ipb.ac.id", role=UserRole.staff)
    referenced_staff_id = test_data.create_user(email="staff-terpakai@ipb.ac.id", role=UserRole.staff)
    facility_id = test_data.create_facility(name="Auditorium Hapus")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_token = await _login(client, email="admin@ipb.ac.id")
        assigned = await client.put(
            f"/admin/facilities/{facility_id}/staff-assignments/{referenced_staff_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        deleted = await client.delete(
            f"/admin/users/{deletable_staff_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        missing_login = await client.post(
            "/auth/login",
            json={"email": "staff-hapus@ipb.ac.id", "password": "secret123"},
        )
        conflict = await client.delete(
            f"/admin/users/{referenced_staff_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )

    assert assigned.status_code == 200
    assert deleted.status_code == 204
    assert missing_login.status_code == 401
    assert conflict.status_code == 409
    assert conflict.json()["detail"] == "Pengguna masih dipakai data lain dan tidak dapat dihapus."

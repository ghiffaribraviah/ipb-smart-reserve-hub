import pytest
from httpx import ASGITransport, AsyncClient

from app.services.accounts import (
    AccountSession,
    AccountSessionCodec,
    AllowedStudentEmailDomains,
    LoginCredentials,
    PasswordHasher,
    StudentRegistration,
    UserAccountModule,
)
from app.main import create_app
from app.models import User, UserRole
from app.core.security import create_access_token
from tests.data_builder import DataBuilder


class StubUserRepository:
    def __init__(self) -> None:
        self.added_user: User | None = None

    def add(self, user: User) -> User:
        user.id = "user-1"
        user.is_active = True
        self.added_user = user
        return user

    def find_by_email(self, email: str) -> User | None:
        if self.added_user is not None and self.added_user.email == email:
            return self.added_user
        return None

    def get_by_id(self, user_id: str) -> User | None:
        return None


class SpyPasswordHasher(PasswordHasher):
    def hash(self, password: str) -> str:
        return f"hashed:{password}"

    def verify(self, password: str, password_hash: str) -> bool:
        return password_hash == f"hashed:{password}"


class StubAccountSessionCodec(AccountSessionCodec):
    def issue(self, user_id: str) -> str:
        return f"session-for:{user_id}"

    def resolve_user_id(self, access_token: str) -> str:
        return access_token.removeprefix("session-for:")


def test_user_account_module_uses_named_institutional_email_policy():
    policy = AllowedStudentEmailDomains((" apps.ipb.ac.id ", "IPB.AC.ID"))

    assert policy.allows("budi@apps.ipb.ac.id")
    assert policy.allows("siti@ipb.ac.id")
    assert not policy.allows("student@gmail.com")


def test_user_account_module_returns_public_user_account_not_persistence_record():
    user_repository = StubUserRepository()
    user_accounts = UserAccountModule(
        user_repository=user_repository,
        secret_key="test-secret",
        student_email_policy=AllowedStudentEmailDomains(("apps.ipb.ac.id",)),
        password_hasher=SpyPasswordHasher(),
        account_session_codec=StubAccountSessionCodec(),
    )

    user_account = user_accounts.register_student(
        StudentRegistration(
            email="BUDI@apps.ipb.ac.id",
            password="secret123",
            full_name="Budi Santoso",
            nim="G64190001",
            phone="08123456789",
        )
    )

    assert user_account.id == "user-1"
    assert user_account.email == "budi@apps.ipb.ac.id"
    assert user_repository.added_user is not None
    assert user_repository.added_user.password_hash == "hashed:secret123"
    assert not hasattr(user_account, "password_hash")


def test_user_account_module_issues_sessions_through_session_codec():
    user_repository = StubUserRepository()
    user_accounts = UserAccountModule(
        user_repository=user_repository,
        secret_key="test-secret",
        student_email_policy=AllowedStudentEmailDomains(("apps.ipb.ac.id",)),
        password_hasher=SpyPasswordHasher(),
        account_session_codec=StubAccountSessionCodec(),
    )
    user_accounts.register_student(
        StudentRegistration(
            email="budi@apps.ipb.ac.id",
            password="secret123",
            full_name="Budi Santoso",
            nim="G64190001",
            phone="08123456789",
        )
    )

    account_session = user_accounts.login(LoginCredentials(email="budi@apps.ipb.ac.id", password="secret123"))

    assert account_session == AccountSession(access_token="session-for:user-1")


@pytest.mark.anyio
async def test_student_registers_with_allowed_email_and_reaches_student_shell():
    transport = ASGITransport(app=create_app(database_url="sqlite+pysqlite:///:memory:"))

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        rejected = await client.post(
            "/auth/register",
            json={
                "email": "student@gmail.com",
                "password": "secret123",
                "full_name": "Budi Santoso",
                "nim": "G64190001",
                "phone": "08123456789",
            },
        )

        assert rejected.status_code == 400
        assert rejected.json()["detail"] == "Email harus menggunakan domain institusi yang diizinkan."

        registered = await client.post(
            "/auth/register",
            json={
                "email": "budi@apps.ipb.ac.id",
                "password": "secret123",
                "full_name": "Budi Santoso",
                "nim": "G64190001",
                "phone": "08123456789",
            },
        )

        assert registered.status_code == 201
        assert registered.json()["role"] == "student"

        logged_in = await client.post(
            "/auth/login",
            json={"email": "budi@apps.ipb.ac.id", "password": "secret123"},
        )

        assert logged_in.status_code == 200
        token = logged_in.json()["access_token"]

        shell = await client.get("/student/shell", headers={"Authorization": f"Bearer {token}"})

        assert shell.status_code == 200
        assert shell.json() == {"shell": "student", "email": "budi@apps.ipb.ac.id"}


@pytest.mark.anyio
async def test_active_authenticated_user_can_get_current_user_identity():
    transport = ASGITransport(app=create_app(database_url="sqlite+pysqlite:///:memory:"))

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        registered = await client.post(
            "/auth/register",
            json={
                "email": "budi@apps.ipb.ac.id",
                "password": "secret123",
                "full_name": "Budi Santoso",
                "nim": "G64190001",
                "phone": "08123456789",
            },
        )
        logged_in = await client.post(
            "/auth/login",
            json={"email": "budi@apps.ipb.ac.id", "password": "secret123"},
        )

        response = await client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {logged_in.json()['access_token']}"},
        )

        assert response.status_code == 200
        assert response.json() == {
            "id": registered.json()["id"],
            "email": "budi@apps.ipb.ac.id",
            "full_name": "Budi Santoso",
            "role": "student",
            "is_active": True,
            "nim": "G64190001",
            "phone": "08123456789",
            "academic_profile": {
                "program_studi": "Ilmu Komputer",
                "faculty": "Fakultas Matematika dan Ilmu Pengetahuan Alam",
                "entry_year": 2019,
                "degree": "Sarjana",
            },
        }


@pytest.mark.anyio
async def test_current_user_identity_requires_bearer_credentials():
    transport = ASGITransport(app=create_app(database_url="sqlite+pysqlite:///:memory:"))

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/auth/me")

        assert response.status_code == 401
        assert response.json()["detail"] == "Autentikasi diperlukan."


@pytest.mark.anyio
async def test_current_user_identity_rejects_invalid_tokens():
    transport = ASGITransport(app=create_app(database_url="sqlite+pysqlite:///:memory:"))

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/auth/me", headers={"Authorization": "Bearer not-a-valid-token"})

        assert response.status_code == 401
        assert response.json()["detail"] == "Token tidak valid."


@pytest.mark.anyio
async def test_current_user_identity_rejects_inactive_user_tokens():
    app = create_app(database_url="sqlite+pysqlite:///:memory:", secret_key="test-secret")
    inactive_user_id = DataBuilder(app).create_user(
        email="inactive@apps.ipb.ac.id", role=UserRole.student, is_active=False
    )
    inactive_token = create_access_token(inactive_user_id, "test-secret")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/auth/me", headers={"Authorization": f"Bearer {inactive_token}"})

        assert response.status_code == 401
        assert response.json()["detail"] == "Akun tidak aktif."


@pytest.mark.anyio
async def test_unknown_nim_keeps_auth_flows_available_with_null_academic_profile():
    transport = ASGITransport(app=create_app(database_url="sqlite+pysqlite:///:memory:"))

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        registered = await client.post(
            "/auth/register",
            json={
                "email": "budi@apps.ipb.ac.id",
                "password": "secret123",
                "full_name": "Budi Santoso",
                "nim": "UNKNOWN-NIM",
                "phone": "08123456789",
            },
        )
        logged_in = await client.post(
            "/auth/login",
            json={"email": "budi@apps.ipb.ac.id", "password": "secret123"},
        )
        refreshed = await client.post(
            "/auth/refresh",
            headers={"Authorization": f"Bearer {logged_in.json()['access_token']}"},
        )

        response = await client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {refreshed.json()['access_token']}"},
        )

        assert registered.status_code == 201
        assert logged_in.status_code == 200
        assert refreshed.status_code == 200
        assert response.status_code == 200
        assert response.json()["nim"] == "UNKNOWN-NIM"
        assert response.json()["phone"] == "08123456789"
        assert response.json()["academic_profile"] == {
            "program_studi": None,
            "faculty": None,
            "entry_year": None,
            "degree": None,
        }


@pytest.mark.anyio
async def test_super_admin_creates_staff_and_role_shells_are_guarded():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    DataBuilder(app).create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_login = await client.post(
            "/auth/login",
            json={"email": "admin@ipb.ac.id", "password": "secret123"},
        )
        admin_token = admin_login.json()["access_token"]

        created_staff = await client.post(
            "/admin/users",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "email": "staff@ipb.ac.id",
                "password": "secret123",
                "full_name": "TU Fasilitas",
                "role": "staff",
            },
        )

        assert created_staff.status_code == 201
        assert created_staff.json()["role"] == "staff"

        staff_login = await client.post(
            "/auth/login",
            json={"email": "staff@ipb.ac.id", "password": "secret123"},
        )
        staff_token = staff_login.json()["access_token"]

        staff_shell = await client.get("/staff/shell", headers={"Authorization": f"Bearer {staff_token}"})
        admin_shell = await client.get("/admin/shell", headers={"Authorization": f"Bearer {admin_token}"})
        staff_identity = await client.get("/auth/me", headers={"Authorization": f"Bearer {staff_token}"})
        forbidden_student_shell = await client.get(
            "/student/shell",
            headers={"Authorization": f"Bearer {staff_token}"},
        )

        assert staff_shell.status_code == 200
        assert staff_shell.json() == {"shell": "staff", "email": "staff@ipb.ac.id"}
        assert admin_shell.status_code == 200
        assert admin_shell.json() == {"shell": "admin", "email": "admin@ipb.ac.id"}
        assert staff_identity.status_code == 200
        assert staff_identity.json()["nim"] is None
        assert staff_identity.json()["phone"] is None
        assert staff_identity.json()["academic_profile"] is None
        assert forbidden_student_shell.status_code == 403


@pytest.mark.anyio
async def test_inactive_users_cannot_login_or_refresh_sessions():
    app = create_app(database_url="sqlite+pysqlite:///:memory:", secret_key="test-secret")
    inactive_user_id = DataBuilder(app).create_user(
        email="inactive@apps.ipb.ac.id", role=UserRole.student, is_active=False
    )
    inactive_token = create_access_token(inactive_user_id, "test-secret")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        login = await client.post(
            "/auth/login",
            json={"email": "inactive@apps.ipb.ac.id", "password": "secret123"},
        )
        refresh = await client.post(
            "/auth/refresh",
            headers={"Authorization": f"Bearer {inactive_token}"},
        )

        assert login.status_code == 401
        assert login.json()["detail"] == "Akun tidak aktif."
        assert refresh.status_code == 401
        assert refresh.json()["detail"] == "Akun tidak aktif."

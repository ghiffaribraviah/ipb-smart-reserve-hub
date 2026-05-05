import pytest
from httpx import ASGITransport, AsyncClient

from app.main import create_app
from app.models import OrganizationUnit, UserRole
from app.repositories.organization_unit_repository import DuplicateOrganizationUnitName
from app.services.organization_units import OrganizationUnitCreation, OrganizationUnitManagementModule
from app.services.organization_units import OrganizationUnitNameAlreadyExists
from tests.data_builder import DataBuilder


class StubOrganizationUnitRepository:
    def __init__(self, *, duplicate_name: bool = False) -> None:
        self._duplicate_name = duplicate_name

    def add(self, organization_unit: OrganizationUnit) -> OrganizationUnit:
        if self._duplicate_name:
            raise DuplicateOrganizationUnitName
        organization_unit.id = "organization-unit-1"
        return organization_unit

    def get_by_id(self, organization_unit_id: str) -> OrganizationUnit | None:
        return None

    def list_active(self) -> list[OrganizationUnit]:
        return []


def test_organization_unit_management_returns_public_profile_not_persistence_record():
    organization_unit_management = OrganizationUnitManagementModule(
        organization_unit_repository=StubOrganizationUnitRepository()
    )

    profile = organization_unit_management.create_organization_unit(
        OrganizationUnitCreation(name="BEM KM IPB", type="student_organization", code="BEM-KM")
    )

    assert profile.id == "organization-unit-1"
    assert profile.name == "BEM KM IPB"
    assert not isinstance(profile, OrganizationUnit)


def test_organization_unit_management_translates_duplicate_names():
    organization_unit_management = OrganizationUnitManagementModule(
        organization_unit_repository=StubOrganizationUnitRepository(duplicate_name=True)
    )

    with pytest.raises(OrganizationUnitNameAlreadyExists):
        organization_unit_management.create_organization_unit(
            OrganizationUnitCreation(name="BEM KM IPB", type="student_organization", code="BEM-KM")
        )


@pytest.mark.anyio
async def test_super_admin_creates_organization_unit():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    DataBuilder(app).create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_login = await client.post(
            "/auth/login",
            json={"email": "admin@ipb.ac.id", "password": "secret123"},
        )
        admin_token = admin_login.json()["access_token"]

        response = await client.post(
            "/admin/organization-units",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "name": "BEM KM IPB",
                "type": "student_organization",
                "code": "BEM-KM",
            },
        )

    assert response.status_code == 201
    assert response.json()["name"] == "BEM KM IPB"
    assert response.json()["type"] == "student_organization"
    assert response.json()["code"] == "BEM-KM"
    assert response.json()["is_active"] is True


@pytest.mark.anyio
async def test_super_admin_cannot_create_duplicate_organization_unit_name():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    test_data.create_organization_unit(name="BEM KM IPB")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_login = await client.post(
            "/auth/login",
            json={"email": "admin@ipb.ac.id", "password": "secret123"},
        )
        admin_token = admin_login.json()["access_token"]

        response = await client.post(
            "/admin/organization-units",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "name": "BEM KM IPB",
                "type": "student_organization",
                "code": "BEM-KM",
            },
        )

    assert response.status_code == 409
    assert response.json()["detail"] == "Nama unit organisasi sudah digunakan."


@pytest.mark.anyio
async def test_super_admin_updates_organization_unit_profile_fields():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    organization_unit_id = test_data.create_organization_unit(name="BEM KM IPB", unit_type="student_organization")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_login = await client.post(
            "/auth/login",
            json={"email": "admin@ipb.ac.id", "password": "secret123"},
        )
        admin_token = admin_login.json()["access_token"]

        response = await client.patch(
            f"/admin/organization-units/{organization_unit_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "name": "BEM Fakultas Ekonomi dan Manajemen",
                "type": "student_organization",
                "code": "BEM-FEM",
            },
        )

    assert response.status_code == 200
    assert response.json()["id"] == organization_unit_id
    assert response.json()["name"] == "BEM Fakultas Ekonomi dan Manajemen"
    assert response.json()["type"] == "student_organization"
    assert response.json()["code"] == "BEM-FEM"
    assert response.json()["is_active"] is True


@pytest.mark.anyio
async def test_super_admin_deactivates_and_reactivates_organization_unit():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    test_data = DataBuilder(app)
    test_data.create_user(email="admin@ipb.ac.id", role=UserRole.super_admin)
    organization_unit_id = test_data.create_organization_unit(name="Himpunan Mahasiswa Ilmu Komputer")
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        admin_login = await client.post(
            "/auth/login",
            json={"email": "admin@ipb.ac.id", "password": "secret123"},
        )
        admin_token = admin_login.json()["access_token"]

        deactivated = await client.post(
            f"/admin/organization-units/{organization_unit_id}/deactivate",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        reactivated = await client.post(
            f"/admin/organization-units/{organization_unit_id}/activate",
            headers={"Authorization": f"Bearer {admin_token}"},
        )

    assert deactivated.status_code == 200
    assert deactivated.json()["is_active"] is False
    assert reactivated.status_code == 200
    assert reactivated.json()["is_active"] is True


@pytest.mark.anyio
async def test_students_list_only_active_organization_units_for_selection():
    app = create_app(database_url="sqlite+pysqlite:///:memory:")
    test_data = DataBuilder(app)
    active_id = test_data.create_organization_unit(name="BEM KM IPB")
    test_data.create_organization_unit(name="Unit Tidak Aktif", is_active=False)
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/organization-units")

    assert response.status_code == 200
    assert response.json() == [
        {
            "id": active_id,
            "name": "BEM KM IPB",
            "type": "student_organization",
            "code": None,
            "is_active": True,
        }
    ]

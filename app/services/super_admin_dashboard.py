from dataclasses import dataclass

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Facility, Reservation, UserRole
from app.repositories.audit_log_repository import AuditLogFilters
from app.services.accounts import UserAccountModule
from app.services.audit_logs import AuditLogEntry, AuditLogModule
from app.services.facility_management import FacilityGovernance, FacilityManagementModule
from app.services.system_status import SystemStatus


@dataclass(frozen=True)
class SuperAdminDashboardKpis:
    total_users: int
    active_facilities: int
    total_reservations: int
    system_health: str


@dataclass(frozen=True)
class SuperAdminDashboardAdministrator:
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool


@dataclass(frozen=True)
class SuperAdminDashboard:
    kpis: SuperAdminDashboardKpis
    system_status: SystemStatus
    administrators: list[SuperAdminDashboardAdministrator]
    facility_governance: list[FacilityGovernance]
    recent_activity: list[AuditLogEntry]


class SuperAdminDashboardModule:
    def __init__(
        self,
        *,
        session: Session,
        user_accounts: UserAccountModule,
        facility_management: FacilityManagementModule,
        audit_logs: AuditLogModule,
        system_status: SystemStatus,
    ) -> None:
        self._session = session
        self._user_accounts = user_accounts
        self._facility_management = facility_management
        self._audit_logs = audit_logs
        self._system_status = system_status

    def get_dashboard(self) -> SuperAdminDashboard:
        users = self._user_accounts.list_user_accounts(page=1, page_size=1)
        administrators = self._user_accounts.list_user_accounts(role=UserRole.super_admin, page=1, page_size=100)
        facility_governance = self._facility_management.list_facility_governance()
        recent_activity = self._audit_logs.list_logs(AuditLogFilters())[:10]
        return SuperAdminDashboard(
            kpis=SuperAdminDashboardKpis(
                total_users=users.total,
                active_facilities=self._active_facility_count(),
                total_reservations=self._reservation_count(),
                system_health=self._system_health(),
            ),
            system_status=self._system_status,
            administrators=[
                SuperAdminDashboardAdministrator(
                    id=administrator.id,
                    email=administrator.email,
                    full_name=administrator.full_name,
                    role=administrator.role.value,
                    is_active=administrator.is_active,
                )
                for administrator in administrators.items
            ],
            facility_governance=facility_governance,
            recent_activity=recent_activity,
        )

    def _active_facility_count(self) -> int:
        return self._session.scalar(select(func.count()).select_from(Facility).where(Facility.is_active.is_(True))) or 0

    def _reservation_count(self) -> int:
        return self._session.scalar(select(func.count()).select_from(Reservation)) or 0

    def _system_health(self) -> str:
        checks = [
            self._system_status.backend.status,
            self._system_status.database.status,
        ]
        return "ok" if all(check == "ok" for check in checks) else "degraded"

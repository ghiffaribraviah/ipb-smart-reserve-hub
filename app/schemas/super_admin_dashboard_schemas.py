from pydantic import BaseModel

from app.schemas.audit_log_schemas import AuditLogResponse
from app.schemas.facility_management_schemas import FacilityGovernanceResponse
from app.schemas.system_status_schemas import SystemStatusResponse


class SuperAdminDashboardKpisResponse(BaseModel):
    total_users: int
    active_facilities: int
    total_reservations: int
    system_health: str


class SuperAdminDashboardAdministratorResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool


class SuperAdminDashboardResponse(BaseModel):
    kpis: SuperAdminDashboardKpisResponse
    system_status: SystemStatusResponse
    administrators: list[SuperAdminDashboardAdministratorResponse]
    facility_governance: list[FacilityGovernanceResponse]
    recent_activity: list[AuditLogResponse]

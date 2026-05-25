from collections.abc import Callable
from datetime import datetime

from fastapi import Depends, FastAPI

from app.core.access_policy import AccessPolicyAction
from app.repositories.audit_log_repository import AuditLogFilters
from app.schemas.audit_log_schemas import AuditLogResponse
from app.services.accounts import UserAccount
from app.services.audit_logs import AuditLogModule


def register_audit_log_routes(
    app: FastAPI,
    *,
    get_audit_logs: Callable,
    require_access: Callable[[AccessPolicyAction], Callable],
) -> None:
    @app.get("/admin/audit-logs", response_model=list[AuditLogResponse])
    async def list_admin_audit_logs(
        actor_id: str | None = None,
        action_type: str | None = None,
        target_type: str | None = None,
        facility_id: str | None = None,
        student_id: str | None = None,
        reservation_id: str | None = None,
        created_from: datetime | None = None,
        created_to: datetime | None = None,
        limit: int | None = None,
        audit_logs: AuditLogModule = Depends(get_audit_logs),
        _: UserAccount = Depends(require_access(AccessPolicyAction.view_audit_logs)),
    ):
        return audit_logs.list_logs(
            AuditLogFilters(
                actor_id=actor_id,
                action_type=action_type,
                target_type=target_type,
                facility_id=facility_id,
                student_id=student_id,
                reservation_id=reservation_id,
                created_from=created_from,
                created_to=created_to,
                limit=limit,
            )
        )

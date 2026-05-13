from collections.abc import Callable
from datetime import datetime

from fastapi import Depends, FastAPI

from app.core.access_policy import AccessPolicyAction
from app.schemas.super_admin_report_schemas import SuperAdminReportAggregateResponse
from app.services.accounts import UserAccount
from app.services.super_admin_reports import SuperAdminReportModule


def register_super_admin_report_routes(
    app: FastAPI,
    *,
    get_super_admin_reports: Callable,
    require_access: Callable[[AccessPolicyAction], Callable],
) -> None:
    @app.get("/admin/reports/aggregate", response_model=SuperAdminReportAggregateResponse)
    async def get_super_admin_report_aggregate(
        start: datetime,
        end: datetime,
        reports: SuperAdminReportModule = Depends(get_super_admin_reports),
        _: UserAccount = Depends(require_access(AccessPolicyAction.enter_admin_shell)),
    ):
        return reports.get_aggregate(starts_at=start, ends_at=end)

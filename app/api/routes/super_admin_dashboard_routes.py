from collections.abc import Callable

from fastapi import Depends, FastAPI

from app.core.access_policy import AccessPolicyAction
from app.schemas.super_admin_dashboard_schemas import SuperAdminDashboardResponse
from app.services.accounts import UserAccount
from app.services.super_admin_dashboard import SuperAdminDashboardModule


def register_super_admin_dashboard_routes(
    app: FastAPI,
    *,
    get_super_admin_dashboard: Callable,
    require_access: Callable[[AccessPolicyAction], Callable],
) -> None:
    @app.get("/admin/dashboard", response_model=SuperAdminDashboardResponse)
    async def get_super_admin_dashboard(
        dashboard: SuperAdminDashboardModule = Depends(get_super_admin_dashboard),
        _: UserAccount = Depends(require_access(AccessPolicyAction.enter_admin_shell)),
    ):
        return dashboard.get_dashboard()

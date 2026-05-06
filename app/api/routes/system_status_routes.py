from collections.abc import Callable

from fastapi import Depends, FastAPI

from app.core.access_policy import AccessPolicyAction
from app.schemas.system_status_schemas import SystemStatusResponse
from app.services.accounts import UserAccount
from app.services.system_status import SystemStatusModule


def register_system_status_routes(
    app: FastAPI,
    *,
    get_system_status: Callable,
    require_access: Callable[[AccessPolicyAction], Callable],
) -> None:
    @app.get("/admin/system-status", response_model=SystemStatusResponse)
    async def get_admin_system_status(
        system_status: SystemStatusModule = Depends(get_system_status),
        _: UserAccount = Depends(require_access(AccessPolicyAction.view_system_status)),
    ):
        return system_status.get_system_status()

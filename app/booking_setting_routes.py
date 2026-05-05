from collections.abc import Callable

from fastapi import Depends, FastAPI, HTTPException, status

from app.access_policy import AccessPolicyAction
from app.accounts import UserAccount
from app.booking_setting_schemas import BookingSettingsResponse, BookingSettingsUpdateRequest
from app.booking_settings import BookingSettingsModule, InvalidBookingSettings


def register_booking_setting_routes(
    app: FastAPI,
    *,
    get_booking_settings: Callable,
    require_access: Callable[[AccessPolicyAction], Callable],
) -> None:
    @app.get("/admin/settings", response_model=BookingSettingsResponse)
    async def view_booking_settings(
        booking_settings: BookingSettingsModule = Depends(get_booking_settings),
        _: UserAccount = Depends(require_access(AccessPolicyAction.manage_booking_settings)),
    ) -> BookingSettingsResponse:
        return BookingSettingsResponse.from_booking_settings(booking_settings.get_booking_settings())

    @app.patch("/admin/settings", response_model=BookingSettingsResponse)
    async def update_booking_settings(
        payload: BookingSettingsUpdateRequest,
        booking_settings: BookingSettingsModule = Depends(get_booking_settings),
        _: UserAccount = Depends(require_access(AccessPolicyAction.manage_booking_settings)),
    ) -> BookingSettingsResponse:
        try:
            updated_settings = booking_settings.update_booking_settings(payload.to_booking_settings())
        except InvalidBookingSettings as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=exc.errors) from exc
        return BookingSettingsResponse.from_booking_settings(updated_settings)

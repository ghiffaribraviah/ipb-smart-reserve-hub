from collections.abc import Callable

from fastapi import Depends, FastAPI

from app.access_policy import AccessPolicyAction
from app.accounts import UserAccount
from app.booking_setting_schemas import BookingSettingsResponse, BookingSettingsUpdateRequest
from app.booking_settings import BookingSettingsModule
from app.settings import BookingSettings


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
        return _booking_settings_response(booking_settings.get_booking_settings())

    @app.patch("/admin/settings", response_model=BookingSettingsResponse)
    async def update_booking_settings(
        payload: BookingSettingsUpdateRequest,
        booking_settings: BookingSettingsModule = Depends(get_booking_settings),
        _: UserAccount = Depends(require_access(AccessPolicyAction.manage_booking_settings)),
    ) -> BookingSettingsResponse:
        updated_settings = booking_settings.update_booking_settings(
            BookingSettings(
                min_booking_lead_hours=payload.min_booking_lead_hours,
                max_booking_advance_hours=payload.max_booking_advance_hours,
                document_upload_due_hours=payload.document_upload_due_hours,
                document_verification_due_hours=payload.document_verification_due_hours,
                payment_upload_due_hours=payload.payment_upload_due_hours,
                payment_verification_due_hours=payload.payment_verification_due_hours,
                final_approval_cutoff_hours=payload.final_approval_cutoff_hours,
                overdue_final_approval_cutoff_hours=payload.overdue_final_approval_cutoff_hours,
                allowed_student_email_domains=tuple(payload.allowed_student_email_domains),
            )
        )
        return _booking_settings_response(updated_settings)


def _booking_settings_response(booking_settings: BookingSettings) -> BookingSettingsResponse:
    return BookingSettingsResponse(
        min_booking_lead_hours=booking_settings.min_booking_lead_hours,
        max_booking_advance_hours=booking_settings.max_booking_advance_hours,
        document_upload_due_hours=booking_settings.document_upload_due_hours,
        document_verification_due_hours=booking_settings.document_verification_due_hours,
        payment_upload_due_hours=booking_settings.payment_upload_due_hours,
        payment_verification_due_hours=booking_settings.payment_verification_due_hours,
        final_approval_cutoff_hours=booking_settings.final_approval_cutoff_hours,
        overdue_final_approval_cutoff_hours=booking_settings.overdue_final_approval_cutoff_hours,
        allowed_student_email_domains=list(booking_settings.allowed_student_email_domains),
    )

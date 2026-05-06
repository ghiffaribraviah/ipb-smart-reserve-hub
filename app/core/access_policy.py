import enum

from app.services.accounts import UserAccount
from app.models import UserRole


class AccessPolicyAction(str, enum.Enum):
    enter_student_shell = "enter_student_shell"
    enter_staff_shell = "enter_staff_shell"
    enter_admin_shell = "enter_admin_shell"
    manage_user_accounts = "manage_user_accounts"
    manage_organization_units = "manage_organization_units"
    manage_booking_settings = "manage_booking_settings"
    manage_facility_staff_assignments = "manage_facility_staff_assignments"
    manage_assigned_facilities = "manage_assigned_facilities"


class AccessPolicyError(Exception):
    pass


class AccessDenied(AccessPolicyError):
    pass


class AccessPolicyModule:
    _allowed_roles_by_action = {
        AccessPolicyAction.enter_student_shell: UserRole.student,
        AccessPolicyAction.enter_staff_shell: UserRole.staff,
        AccessPolicyAction.enter_admin_shell: UserRole.super_admin,
        AccessPolicyAction.manage_user_accounts: UserRole.super_admin,
        AccessPolicyAction.manage_organization_units: UserRole.super_admin,
        AccessPolicyAction.manage_booking_settings: UserRole.super_admin,
        AccessPolicyAction.manage_facility_staff_assignments: UserRole.super_admin,
        AccessPolicyAction.manage_assigned_facilities: UserRole.staff,
    }

    def require_action(self, user_account: UserAccount, action: AccessPolicyAction) -> UserAccount:
        if user_account.role != self._allowed_roles_by_action[action]:
            raise AccessDenied
        return user_account

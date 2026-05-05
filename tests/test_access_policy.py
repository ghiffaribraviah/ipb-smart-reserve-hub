import pytest

from app.access_policy import AccessDenied, AccessPolicyAction, AccessPolicyModule
from app.accounts import UserAccount
from app.models import UserRole


def user_with_role(role: UserRole) -> UserAccount:
    return UserAccount(
        id=f"{role.value}-1",
        email=f"{role.value}@ipb.ac.id",
        full_name="Test User",
        role=role,
        is_active=True,
    )


def test_access_policy_allows_named_shell_actions_only():
    policy = AccessPolicyModule()

    assert (
        policy.require_action(user_with_role(UserRole.student), AccessPolicyAction.enter_student_shell).role
        == UserRole.student
    )

    with pytest.raises(AccessDenied):
        policy.require_action(user_with_role(UserRole.staff), AccessPolicyAction.enter_student_shell)


def test_access_policy_allows_named_admin_management_actions_only():
    policy = AccessPolicyModule()

    assert (
        policy.require_action(user_with_role(UserRole.super_admin), AccessPolicyAction.manage_organization_units).role
        == UserRole.super_admin
    )

    with pytest.raises(AccessDenied):
        policy.require_action(user_with_role(UserRole.staff), AccessPolicyAction.manage_organization_units)

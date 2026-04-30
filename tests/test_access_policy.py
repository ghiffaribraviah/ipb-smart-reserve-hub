import pytest

from app.access_policy import AccessDenied, AccessPolicyModule
from app.models import User, UserRole


def user_with_role(role: UserRole) -> User:
    return User(email=f"{role.value}@ipb.ac.id", password_hash="hash", full_name="Test User", role=role)


def test_access_policy_allows_exact_role_shell_access_only():
    policy = AccessPolicyModule()

    assert policy.require_role(user_with_role(UserRole.student), UserRole.student).role == UserRole.student

    with pytest.raises(AccessDenied):
        policy.require_role(user_with_role(UserRole.staff), UserRole.student)

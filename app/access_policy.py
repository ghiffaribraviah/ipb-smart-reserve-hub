from app.models import User, UserRole


class AccessPolicyError(Exception):
    pass


class AccessDenied(AccessPolicyError):
    pass


class AccessPolicyModule:
    def require_role(self, user: User, required_role: UserRole) -> User:
        if user.role != required_role:
            raise AccessDenied
        return user

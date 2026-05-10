# Student Registration

- Route: `/register`
- Role/access: unauthenticated student self-registration.
- Backend APIs: `POST /auth/register`, then either `POST /auth/login` or manual login redirect.
- Core data: email, password, full name, NIM, phone.
- Mutations/actions: create student account.
- Design references: none selected yet.
- Design documentation:
  - Primary user goal:
  - Layout decisions:
  - State decisions:
  - Responsive decisions:
  - Visual test scenarios:
- Open questions / backend gaps: decide whether successful registration should auto-login or redirect to login.

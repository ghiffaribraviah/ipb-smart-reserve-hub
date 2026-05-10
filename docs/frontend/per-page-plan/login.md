# Login

- Route: `/login`
- Role/access: unauthenticated; redirect authenticated users to their role shell.
- Backend APIs: `POST /auth/login`, `GET /auth/me`, optional role shell endpoint after login.
- Core data: access token, current user identity, role.
- Mutations/actions: submit credentials.
- Design references: `00 Log in Page.png`
- Design documentation:
  - Primary user goal:
  - Layout decisions:
  - State decisions:
  - Responsive decisions:
  - Visual test scenarios:
- Open questions / backend gaps: none known.

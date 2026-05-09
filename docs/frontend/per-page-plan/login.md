# Login

- Route: `/login`
- Role/access: unauthenticated; redirect authenticated users to their role shell.
- Backend APIs: `POST /auth/login`, `GET /auth/me`, optional role shell endpoint after login.
- Core data: access token, current user identity, role.
- Mutations/actions: submit credentials.
- Design references: `00 Log in Page.png`
- Design documentation:
  - Primary user goal: sign in with campus credentials and land in the correct role area without extra decisions.
  - Layout decisions: desktop uses a full-height split composition with a real HTML/CSS login form on the left and a right-side campus-photo panel placeholder until the final image asset is supplied. The `IPB SRH` mark is styled text, not an image asset, until a canonical logo exists. The forgot-password affordance is hidden until a recovery workflow/API exists.
  - State decisions: submit calls `POST /auth/login`, stores the returned access token, then calls `GET /auth/me` to choose the role destination. Existing stored tokens are verified with `GET /auth/me`; valid tokens redirect by role, while invalid tokens are cleared and the login form is shown. Client validation stays minimal: email required and email-shaped, password required. Backend `detail` messages are shown directly. The form is disabled while submitting and the button label changes to `Signing in...`.
  - Responsive decisions: mobile collapses to a single form-first layout. The visual/photo panel is hidden for now so credential entry stays primary and text does not overlap.
  - Visual test scenarios: desktop `/login` shows split form/visual composition; mobile `/login` shows a single-column form with readable brand, fields, submit button, and footer links; submitting state keeps values visible and disables repeat submission; invalid credentials show a compact error without shifting the page excessively.
- Open questions / backend gaps: none known.

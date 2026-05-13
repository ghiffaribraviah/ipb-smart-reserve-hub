# Missing Frontend Design Ledger

HTML references and screenshots are mandatory source of truth for visual implementation. This file tracks missing page, state, and component references that future design work should add or clarify.

Current open missing references: none. Resolved entries are retained below so future agents can see which references closed the prior gaps.

Severity:

- `blocking`: implementation should not proceed without design input.
- `non-blocking`: implementation may extrapolate from existing references, but the assumption must be recorded in the relevant brief.
- `future`: not needed for the current MVP implementation slice.

## Resolved Page References

### MD-SUPER-PAGE-01: Super Admin Pengguna Page

- Severity: `non-blocking`
- Type: `page`
- Affected pages/components: Super Admin nav entry `Pengguna`, user creation, role/status management.
- Needed reference: Desktop and mobile HTML/screenshots for the user management destination.
- Current fallback: Only `Super - 00 - Dashboard.html` exists.
- Status: `resolved`
- Owner action: None; reference now exists.
- Reference added: `docs/frontend/html-reference/Super - 01 - Pengguna.html`.

### MD-SUPER-PAGE-02: Super Admin Fasilitas Page

- Severity: `non-blocking`
- Type: `page`
- Affected pages/components: Super Admin nav entry `Fasilitas`, facility/staff assignment oversight.
- Needed reference: Desktop and mobile HTML/screenshots for the facility governance destination.
- Current fallback: Super Admin dashboard governance table plus staff facility references.
- Status: `resolved`
- Owner action: None; reference now exists.
- Reference added: `docs/frontend/html-reference/Super - 02 - Fasilitas.html`.

### MD-SUPER-PAGE-03: Super Admin Laporan Page

- Severity: `non-blocking`
- Type: `page`
- Affected pages/components: Super Admin nav entry `Laporan`, audit logs, review moderation, exports.
- Needed reference: Desktop and mobile HTML/screenshots for reporting and moderation destination.
- Current fallback: Super Admin dashboard activity log.
- Status: `resolved`
- Owner action: None; reference now exists.
- Reference added: `docs/frontend/html-reference/Super - 03 - Laporan.html`.

### MD-SUPER-PAGE-04: Super Admin Sistem Page

- Severity: `non-blocking`
- Type: `page`
- Affected pages/components: Super Admin nav entry `Sistem`, booking settings, system status.
- Needed reference: Desktop and mobile HTML/screenshots for system settings and health destination.
- Current fallback: Super Admin dashboard KPI card and activity log.
- Status: `resolved`
- Owner action: None; reference now exists.
- Reference added: `docs/frontend/html-reference/Super - 04 - Sistem.html`.

### MD-STAFF-PAGE-01: Staff Review Decision Screens

- Severity: `non-blocking`
- Type: `page`
- Affected pages/components: Document review, payment review, cancellation review decision flows.
- Needed reference: Modal or page references for approve/reject forms and rejection reason handling.
- Current fallback: Staff reservation detail reference and existing form/control patterns.
- Status: `resolved`
- Owner action: None; reference now exists.
- Reference added: `docs/frontend/html-reference/Admin - 12 - Review Decision Dialogs.html`.

### MD-STUDENT-PAGE-01: Student Cancellation Request

- Severity: `non-blocking`
- Type: `page`
- Affected pages/components: `Ajukan Pembatalan` from approved reservation detail.
- Needed reference: Reason-entry form, refund warning, confirmation action hierarchy, and mobile layout.
- Current fallback: Accepted reservation detail card and form patterns.
- Status: `resolved`
- Owner action: None; reference now exists.
- Reference added: `docs/frontend/html-reference/Student - 13 - Cancellation Request.html`.

### MD-NOTIFICATION-PAGE-01: Notification Inbox Or Popover

- Severity: `non-blocking`
- Type: `page`
- Affected pages/components: Student, staff, and super-admin shell notification actions.
- Needed reference: Notification dropdown/inbox states.
- Current fallback: Header notification icon only.
- Status: `resolved`
- Owner action: None; reference now exists.
- Reference added: `docs/frontend/html-reference/Shared - 01 - Notifications.html`.

## Resolved State References

### MD-STATE-01: Loading, Empty, And API Error States

- Severity: `non-blocking`
- Type: `state`
- Affected pages/components: All data-driven pages.
- Needed reference: Common loading skeleton/spinner, empty state, retry/error panel.
- Current fallback: Extrapolate from card/table/form surfaces in existing references.
- Status: `resolved`
- Owner action: None; reference now exists.
- Reference added: `docs/frontend/html-reference/Shared - 02 - Data And Auth States.html`.

### MD-STATE-02: Auth Denied And Redirect Recovery

- Severity: `non-blocking`
- Type: `state`
- Affected pages/components: Protected student, staff, and super-admin routes.
- Needed reference: Expired session, unauthorized role, and redirect query messaging.
- Current fallback: Login page error/message area.
- Status: `resolved`
- Owner action: None; reference now exists.
- Reference added: `docs/frontend/html-reference/Shared - 02 - Data And Auth States.html`.

### MD-STATE-03: Cancellation Pending And Cancellation Rejected

- Severity: `non-blocking`
- Type: `state`
- Affected pages/components: `student-10-reservation-list.md`, `student-11-reservation-details-accepted.md`, staff reservation review pages.
- Needed reference: `cancellation_requested` and rejected-cancellation states.
- Current fallback: Existing status badge and reservation detail card patterns.
- Status: `resolved`
- Owner action: None; reference now exists.
- Reference added: `docs/frontend/html-reference/Student - 13 - Cancellation Request.html`.

### MD-STATE-04: Overdue Verification And Expired Reservations

- Severity: `non-blocking`
- Type: `state`
- Affected pages/components: Student reservation list/detail, staff queues.
- Needed reference: `overdue_verification` and `expired` visual handling.
- Current fallback: Existing waiting/declined status surfaces.
- Status: `resolved`
- Owner action: None; reference now exists.
- Reference added: `docs/frontend/html-reference/Shared - 02 - Data And Auth States.html`.

### MD-STATE-05: Upload Progress And File Validation Errors

- Severity: `non-blocking`
- Type: `state`
- Affected pages/components: Approval letter and payment upload pages.
- Needed reference: Upload progress, invalid type, max-size error, retry.
- Current fallback: File upload panel plus form error styling from references.
- Status: `resolved`
- Owner action: None; reference now exists.
- Reference added: `docs/frontend/html-reference/Shared - 03 - Upload And Calendar States.html`.

## Resolved Component References

### MD-COMPONENT-01: Shared Confirmation Dialog

- Severity: `non-blocking`
- Type: `component`
- Affected pages/components: Cancellation, logout, destructive moderation, staff reject decisions.
- Needed reference: Desktop/mobile dialog and action hierarchy.
- Current fallback: Card/button patterns in existing references.
- Status: `resolved`
- Owner action: None; reference now exists.
- Reference added: `docs/frontend/html-reference/Admin - 12 - Review Decision Dialogs.html`.

### MD-COMPONENT-02: Calendar Interaction Details

- Severity: `non-blocking`
- Type: `component`
- Affected pages/components: Facility detail, reservation time form, staff facility schedule.
- Needed reference: Selected, unavailable, hover/focus, and conflict states.
- Current fallback: Static calendar/time-slot references.
- Status: `resolved`
- Owner action: None; reference now exists.
- Reference added: `docs/frontend/html-reference/Shared - 03 - Upload And Calendar States.html`.

### MD-COMPONENT-03: Mobile Navigation Drawer

- Severity: `non-blocking`
- Type: `component`
- Affected pages/components: Student, staff, and super-admin shell hamburger actions.
- Needed reference: Open drawer, active nav, notification/profile shortcuts, and mobile overlay behavior.
- Current fallback: Mobile header hamburger icon only.
- Status: `resolved`
- Owner action: None; reference now exists.
- Reference added: `docs/frontend/html-reference/Shared - 04 - Mobile Navigation Drawer.html`.

## Covered Reference Inventory

See `docs/frontend/screenshots/README.md` for the current HTML-to-screenshot inventory.

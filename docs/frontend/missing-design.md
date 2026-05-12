# Missing Frontend Design Ledger

HTML references and screenshots are mandatory source of truth for visual implementation. This file tracks missing page, state, and component references that future design work should add or clarify.

Severity:

- `blocking`: implementation should not proceed without design input.
- `non-blocking`: implementation may extrapolate from existing references, but the assumption must be recorded in the relevant brief.
- `future`: not needed for the current MVP implementation slice.

## Missing Page References

### MD-SUPER-PAGE-01: Super Admin Management Pages

- Severity: `future`
- Type: `page`
- Affected pages/components: Super Admin nav entries `Pengguna`, `Fasilitas`, `Laporan`, and `Sistem`.
- Needed reference: Desktop and mobile HTML/screenshots for each destination.
- Current fallback: Only `Super - 00 - Dashboard.html` exists.
- Owner action: Add references before implementing those routes beyond nav placeholders.

### MD-STAFF-PAGE-01: Staff Review Decision Screens

- Severity: `non-blocking`
- Type: `page`
- Affected pages/components: Document review, payment review, cancellation review decision flows.
- Needed reference: Modal or page references for approve/reject forms and rejection reason handling.
- Current fallback: Staff reservation detail reference and existing form/control patterns.
- Owner action: Add references if decision UI becomes more than inline actions.

### MD-NOTIFICATION-PAGE-01: Notification Inbox Or Popover

- Severity: `non-blocking`
- Type: `page`
- Affected pages/components: Student, staff, and super-admin shell notification actions.
- Needed reference: Notification dropdown/inbox states.
- Current fallback: Header notification icon only.
- Owner action: Add reference before building a rich notification surface.

## Missing State References

### MD-STATE-01: Loading, Empty, And API Error States

- Severity: `non-blocking`
- Type: `state`
- Affected pages/components: All data-driven pages.
- Needed reference: Common loading skeleton/spinner, empty state, retry/error panel.
- Current fallback: Extrapolate from card/table/form surfaces in existing references.
- Owner action: Define shared state component reference before broad integration work.

### MD-STATE-02: Auth Denied And Redirect Recovery

- Severity: `non-blocking`
- Type: `state`
- Affected pages/components: Protected student, staff, and super-admin routes.
- Needed reference: Expired session, unauthorized role, and redirect query messaging.
- Current fallback: Login page error/message area.
- Owner action: Add reference if product wants visible auth recovery messaging.

### MD-STATE-03: Cancellation Pending And Cancellation Rejected

- Severity: `non-blocking`
- Type: `state`
- Affected pages/components: `student-10-reservation-list.md`, `student-11-reservation-details-accepted.md`, staff reservation review pages.
- Needed reference: `cancellation_requested` and rejected-cancellation states.
- Current fallback: Existing status badge and reservation detail card patterns.
- Owner action: Add references before implementing detailed cancellation review UX.

### MD-STATE-04: Overdue Verification And Expired Reservations

- Severity: `non-blocking`
- Type: `state`
- Affected pages/components: Student reservation list/detail, staff queues.
- Needed reference: `overdue_verification` and `expired` visual handling.
- Current fallback: Existing waiting/declined status surfaces.
- Owner action: Add references if these states must be prominent in MVP UI.

### MD-STATE-05: Upload Progress And File Validation Errors

- Severity: `non-blocking`
- Type: `state`
- Affected pages/components: Approval letter and payment upload pages.
- Needed reference: Upload progress, invalid type, max-size error, retry.
- Current fallback: File upload panel plus form error styling from references.
- Owner action: Add detailed upload-state reference before polished file UX.

## Missing Component References

### MD-COMPONENT-01: Shared Confirmation Dialog

- Severity: `non-blocking`
- Type: `component`
- Affected pages/components: Cancellation, logout, destructive moderation, staff reject decisions.
- Needed reference: Desktop/mobile dialog and action hierarchy.
- Current fallback: Card/button patterns in existing references.
- Owner action: Add component reference if destructive confirmations are implemented.

### MD-COMPONENT-02: Calendar Interaction Details

- Severity: `non-blocking`
- Type: `component`
- Affected pages/components: Facility detail, reservation time form, staff facility schedule.
- Needed reference: Selected, unavailable, hover/focus, and conflict states.
- Current fallback: Static calendar/time-slot references.
- Owner action: Add stateful calendar references before complex interactions.

## Covered Reference Inventory

See `docs/frontend/screenshots/README.md` for the current HTML-to-screenshot inventory.

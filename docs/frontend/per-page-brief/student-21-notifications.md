# Student 21 Notifications

## Reference

- HTML: `docs/frontend/html-reference/Shared - 01 - Notifications.html`
- Desktop screenshot: `docs/frontend/screenshots/shared-01-notifications-desktop.png`
- Mobile screenshot: `docs/frontend/screenshots/shared-01-notifications-mobile.png`
- Reference label: `Shared - 01 - Notifications`

## Route Contract

- Proposed routes:
  - `/student/notifications`
  - `/staff/notifications`
  - `/super-admin/notifications`
- Auth/role:
  - `student` for `/student/notifications`
  - `staff` for `/staff/notifications`
  - `super_admin` for `/super-admin/notifications`
- Unauthorized behavior: redirect to login.
- Redirect behavior: notification rows route to the relevant reservation/detail page based on `target.route`.

## Purpose

- User job: review notification history beyond the 20-item header popover and continue to the relevant reservation flow.
- Entry points: `Lihat semua notifikasi` link from the header popover.
- Exit points: reservation detail/workflow pages, staff review pages, super admin admin surfaces.

## Design Contract

- Layout: role shell chrome with a centered notification board, unread summary, bulk action, dated groups, and list rows.
- Desktop behavior: full-width board grouped by date with row click opening the target page.
- Mobile behavior: rows stack message and timestamp cleanly without horizontal overflow.
- Required copy/status labels: `Semua Notifikasi`, `Belum dibaca`, `Sudah dibaca`, `Tandai dibaca semua`, `Muat lebih banyak`.
- Source-of-truth notes: the full page extrapolates from `Shared - 01 - Notifications.html` because only the popover reference exists today.

## UX Behavior

- Primary actions: open the notification target by clicking the row.
- Secondary actions: mark a single unread notification read; bulk mark all unread notifications read.
- Loading state: stable loading text inside the board.
- Empty state: empty notification state with bell icon and explanatory copy.
- Error state: retry notification page query.
- Pagination behavior: page loads the newest 20 items first and reveals older items through `Muat lebih banyak`.

## Accessibility

- Date separators are textual headings, not color-only dividers.
- Each row remains keyboard-focusable through the notification link.
- Unread state is visible through text labels and background tone.
- Bulk action remains reachable on mobile.

## Data And Fixture Contract

- Deterministic fixture requirements: unread and read examples across multiple dates.
- Real entities: notification inbox items with target route descriptors.
- Fixture media: none.

## Backend Integration And Gaps

- Endpoints consumed:
  - `GET /notifications?limit=&offset=`
  - `GET /notifications/unread-count`
  - `POST /notifications/{notification_id}/read`
  - `POST /notifications/read-all`
- Page-needed fields: `id`, `title`, `message`, `category`, `target`, `created_at`, `read_at`.
- Auth/session assumptions: only the current authenticated user's notification inbox is returned.
- Source files: `backend/app/api/routes/notification_routes.py`, `backend/app/services/notifications.py`.

### BG-SHARED-NOTIFICATIONS-02: Paginated Notification Listing

- Status: `resolved`
- Domain area: Shared Shell
- Affected UI: header `Lihat semua notifikasi` route and the full notification history page.
- Contract needed: notification listing supports `limit` and `offset` while keeping the default header inbox capped to the newest 20 items.
- Evidence: `GET /notifications` accepts `limit` and `offset`; service defaults to 20, unread count remains full, and `POST /notifications/read-all` only touches unread items.
- Source issue/PRD: none.

## Shared Components

- `docs/frontend/per-component-brief/notification-surface.md`

## Acceptance Checks

- Full notification page preserves shell spacing on desktop and mobile.
- Date separators appear between different calendar dates.
- `Tandai dibaca semua` remains available when unread items exist.
- Older notifications can be loaded without losing unread count sync.

## Open Questions

- None.

# Notification Surface

## Component Type

- Type: feedback/navigation component

## Used By

- Student shell notification action.
- Staff shell notification action.
- Super Admin shell notification action.

## Reference Evidence

- HTML references: `Shared - 01 - Notifications.html`, `Shared - 05 - Layout Shells.html`.
- Screenshots: `shared-01-notifications-*`, shell screenshots, and role page headers.

## Purpose

Display recent system/reservation notifications from the header notification action and expose an unread counter without opening the popover.

## Anatomy

- Notification trigger icon.
- Notification list or popover.
- Unread state.
- Notification icon/category.
- Title, supporting text, and timestamp.
- Optional status badge or action link.

## Variants

- Unread/read notification.
- Reservation workflow notification.
- Staff review/queue notification.
- Super Admin system activity notification.

## Behavior

- Opens from the header bell action.
- Shows an unread badge on the bell trigger before opening the popover.
- Supports marking notifications read when opened or through an explicit action.
- Supports marking all unread notifications read from the popover header.
- Exposes a `Lihat semua notifikasi` route into the full notification history page.
- Links route to the relevant reservation, facility, or admin surface.

## Accessibility

- Bell action has an accessible name.
- Notification items expose title, time, and unread state.
- Popover/drawer focus behavior follows the shell context.

## Data Contract

- Props/data fields: id, title, body/message, timestamp/created_at, read/unread/read_at, category, target descriptor, unread count badge, optional badge.
- Events: open, mark read, select notification.

## Backend Gaps

### BG-SHARED-NOTIFICATIONS-01: Notification Category And Target Contract

- Status: resolved
- Contract evidence: `GET /notifications`, `GET /notifications/unread-count`, `POST /notifications/{notification_id}/read`, and `POST /notifications/read-all` return or mutate notification state with `category`, `target`, `read_at`, `unread_count`, and existing message fields.
- Target shape: `target.type`, `target.reservation_id`, and `target.route` provide a stable descriptor for role shell routing without parsing notification title or message text.
- Ownership behavior: authenticated users only list their own notifications, and marking another user's notification read returns not found.

## Design Rules

- Use simple Lucide-style line icons and semantic one-color accents.
- Keep item rows compact but readable; timestamps must not collide with text on mobile.
- Empty state follows `Shared - 02 - Data And Auth States.html`.

## Implementation Notes

- Notification API/read-state contract is tracked as shared shell gap `BG-SHARED-NOTIFICATIONS-01`.

## Acceptance Checks

- Popover/list does not overflow mobile width.
- Unread state is visible without relying only on color.

## Open Questions

- None.

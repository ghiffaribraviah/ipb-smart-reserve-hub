# Activity Log Item

## Component Type

- Type: data display/status component

## Used By

- `super-00-dashboard.md`

## Reference Evidence

- HTML reference: Super 00.
- Screenshots: super dashboard desktop/mobile.

## Purpose

Display recent system/admin activity in a compact list.

## Anatomy

- Activity label.
- Actor/target summary.
- Timestamp.
- Optional icon/tone.

## Variants

- User/admin activity.
- Facility/reservation activity.
- System activity.

## Behavior

- Read-only for dashboard.

## Accessibility

- Timestamp and summary are text.
- Icons decorative unless labelled.

## Data Contract

- Props/data fields: action type, actor, target, timestamp, tone.

## Design Rules

- Desktop: compact list in dashboard panel.
- Mobile: stacked list items.
- Use Indonesian relative/time text in UI.

## Implementation Notes

- Can map from `AuditLogResponse` when enough data is available.

## Acceptance Checks

- Long action text wraps cleanly.

## Open Questions

- Exact action-to-copy mapping needs product copy review.

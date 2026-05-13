# Reservation Summary Card

## Component Type

- Type: domain workflow/data display

## Used By

- Reservation workflow, status, payment, review, and detail pages.

## Reference Evidence

- HTML references: Student 03-08, Student 11-13, `Shared - 07 - Reservation Workflow Components.html`.
- Screenshots: matching screenshots, `shared-07-reservation-workflow-components-*`.

## Purpose

Summarize facility, organization, schedule, price, and reservation metadata.

## Anatomy

- Title/facility.
- Label/value rows.
- Optional status badge.
- Optional media thumbnail.

## Variants

- Workflow sidebar.
- Centered status summary.
- Review summary.

## Behavior

- Read-only.

## Accessibility

- Label/value rows are readable and ordered.
- Long values wrap.

## Data Contract

- Props/data fields: facility, organization, activity title, starts/ends, price, status, code.

## Design Rules

- Desktop: compact card/sidebar using shared `summary-row`, `label`, `value`, and badge anatomy.
- Mobile: full-width stacked rows; values wrap and remain right-aligned where space allows.
- Overflow: filenames and long titles wrap.

## Implementation Notes

- Use Indonesian date/time formatting and 24-hour time.

## Acceptance Checks

- Summary rows remain readable on mobile.

## Open Questions

- None.

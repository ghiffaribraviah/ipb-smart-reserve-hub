# Document Status Panel

## Component Type

- Type: domain workflow component

## Used By

- Student letter/verification/detail pages.
- Staff reservation detail.

## Reference Evidence

- HTML references: Student 05, Student 06 variants, Student 11 variants, Admin 11, `Shared - 07 - Reservation Workflow Components.html`.
- Screenshots: matching screenshots, `shared-07-reservation-workflow-components-*`.

## Purpose

Display approval letter, signed letter, receipt, verification status, and available file actions.

## Anatomy

- Status badge/heading.
- Shared `doc-list` / `doc-row` rows with file/type marker, metadata, separated status/action side area.
- Metadata.
- Download/view actions.
- Rejection reason when relevant.

## Variants

- Upload needed.
- Waiting review.
- Verified.
- Declined.
- Missing optional file.

## Behavior

- Hide unavailable file actions when metadata is null.
- Open/download files through authorized endpoints.

## Accessibility

- File action names identify file type.
- Rejection reason is text-visible.
- Rows wrap on mobile.

## Data Contract

- Props/data fields: document/payment metadata, review status, rejection reason, download hrefs.

## Design Rules

- Document rows use neutral card/row surfaces with a visually separated right-side status/action area on desktop.
- Long filenames wrap; on mobile, status/action stacks below metadata with a top divider and no collision.
- Status color never stands alone; badges keep Indonesian labels such as `Terverifikasi`, `Menunggu`, and `Ditolak`.

## Implementation Notes

- Backend gap status comes from consuming page briefs, not this component.

## Acceptance Checks

- Missing metadata does not produce fake filenames.

## Open Questions

- None.

# File Upload Panel

## Component Type

- Type: form/input component

## Used By

- `student-05-reservation-letter.md`
- `student-07-payment.md`
- `staff-03-edit-facility-details.md`

## Reference Evidence

- HTML references: Student 05, Student 07, Admin 03.
- Screenshots: matching desktop/mobile screenshots.

## Purpose

Collect and display uploaded files for documents, receipts, and facility media.

## Anatomy

- Instruction text.
- File picker/drop area.
- Selected file metadata.
- Validation/error text.
- Submit/replace action.

## Variants

- Approval letter upload.
- Payment receipt upload.
- Facility image upload/add.

## Behavior

- Validate accepted type and size before submit when known.
- Preserve selected file display during upload.

## Accessibility

- File input has label.
- Error text is associated.
- Drop zone also supports keyboard file picker.

## Data Contract

- Props/data fields: accepted types, max size, selected file metadata, status.
- Events: select, remove, submit.

## Design Rules

- Mobile: full-width, stable height, long filenames wrap.
- Color: neutral card with green primary submit.

## Implementation Notes

- Upload progress and detailed file errors are missing-design states.

## Acceptance Checks

- Long filenames do not overflow.

## Open Questions

- None.


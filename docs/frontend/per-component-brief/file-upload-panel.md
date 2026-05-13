# File Upload Panel

## Component Type

- Type: form/input component

## Used By

- `student-05-reservation-letter.md`
- `student-07-payment.md`
- `staff-03-edit-facility-details.md`

## Reference Evidence

- HTML references: Student 05, Student 07, Admin 03, `Shared - 03 - Upload And Calendar States.html`, `Shared - 07 - Reservation Workflow Components.html`.
- Screenshots: matching desktop/mobile screenshots, `shared-03-upload-and-calendar-states-*`, `shared-07-reservation-workflow-components-*`.

## Purpose

Collect and display uploaded files for documents, receipts, and facility media.

## Anatomy

- Instruction text and clear file constraints.
- File picker/drop area.
- Selected file metadata.
- Validation/error text.
- Button row with `Pilih File` plus upload/replace action where applicable.

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

- Mobile: full-width, stable height, long filenames wrap, and upload buttons stack with visible gap.
- Color: neutral/dashed upload surface with green primary submit and quiet secondary file picker.

## Implementation Notes

- Upload progress and detailed file errors are referenced in `Shared - 03 - Upload And Calendar States.html`.

## Acceptance Checks

- Long filenames do not overflow.

## Open Questions

- None.

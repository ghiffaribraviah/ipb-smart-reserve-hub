# Staff 03 Edit Facility Details

## Reference

- HTML: `docs/frontend/html-reference/Admin - 03 - Edit Facility Details.html`
- Desktop screenshot: `docs/frontend/screenshots/admin-03-edit-facility-details-desktop.png`
- Mobile screenshot: `docs/frontend/screenshots/admin-03-edit-facility-details-mobile.png`
- Reference label: `Admin - 03 - Edit Facility Details`

## Route Contract

- Proposed route: `/staff/facilities/:facilityId/edit`
- Auth/role: `staff`
- Unauthorized behavior: deny unassigned facility access.
- Redirect behavior: save returns to facility list or keeps user on edit page with success state.

## Purpose

- User job: update assigned facility profile and operational media/hours/blackouts.
- Entry points: facility list.
- Exit points: facility list, schedule.

## Design Contract

- Layout: staff shell with media column and profile form.
- Desktop behavior: sticky media column plus form sections.
- Mobile behavior: stacked media/form panels with full-width controls.
- Required copy/status labels: preserve facility-edit form labels and save actions.
- Source-of-truth notes: do not nest cards inside cards.

## UX Behavior

- Primary actions: save facility profile, including category and structured open-hour rows.
- Secondary actions: add image/blackout if implemented in the page.
- Loading state: disable save while pending.
- Empty state: missing images/hours have quiet add states; open hours use an add-row control instead of editable summary text.
- Error state: field and form-level API errors.
- Disabled state: controls disabled while saving.

## Accessibility

- Form fields require labels/errors.
- Sticky media column must not trap keyboard.
- Image alt text fields need clear labels.

## Data And Fixture Contract

- Deterministic fixture requirements: editable facility with category options, structured hours, images, and blackouts.
- Real entities: FacilityManagementProfile, FacilityCategory, image/open-hour/blackout requests.
- Fixture media: local facility image placeholders.
- Contract normalization: amenities and last-change-by metadata are not supported as editable backend truth in this slice. If they return later, track them as separate backend gaps instead of fixture-only fields.

## Backend Integration And Gaps

- Endpoints consumed: `GET /staff/facilities`, `GET /facility-categories`, `PATCH /staff/facilities/:facilityId`, image/blackout create endpoints.
- Page-needed fields: profile fields in `FacilityManagementProfileResponse`, including `category_id`, category label, `open_hours_summary`, and structured `open_hours`; active category option fields from `FacilityCategoryResponse`; patch fields in `FacilityProfileUpdateRequest`, including `category_id` and full structured `open_hours` replacement.
- Auth/session assumptions: staff assigned facility access only.
- Source files: `app/api/routes/facility_management_routes.py`, `app/schemas/facility_management_schemas.py`.

### BG-STAFF-03-01: Staff Facility Profile Editing

- Status: `resolved`
- Domain area: Staff Operations
- Affected UI: staff facility edit form.
- Contract needed: read/update assigned facility profile, expose active category options, replace structured open-hour rows, keep derived `open_hours_summary`, and add operational child records.
- Evidence: staff facility patch, deactivate, images, open-hours, and blackouts routes exist in `app/api/routes/facility_management_routes.py`; `FacilityManagementProfileResponse` exposes `category_id` and structured `open_hours`; `FacilityProfileUpdateRequest` accepts `category_id` and `open_hours`; `GET /facility-categories` exists in `app/api/routes/facility_routes.py`.
- Source issue/PRD: `docs/issues/ISSUE-0016-staff-facility-management-and-assignment-scope.md`, `docs/issues/ISSUE-0091-staff-facility-structured-category-and-open-hours-management.md`.

## Shared Components

- `docs/frontend/per-component-brief/layout-staff-shell.md`
- `docs/frontend/per-component-brief/ui-form-controls.md`
- `docs/frontend/per-component-brief/file-upload-panel.md`

## Acceptance Checks

- Desktop and mobile screenshots match references.
- Integration checks: unauthorized assigned-facility access maps to not-found/forbidden state.
- Structured category and open-hour edits are covered by integration tests and desktop/mobile Playwright snapshots.

## Open Questions

- Exact success toast/banner design is not separately referenced.

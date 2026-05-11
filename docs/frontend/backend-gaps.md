# Frontend-Discovered Backend Gaps

This file records backend gaps discovered while planning frontend pages and shared components. The frontend integration backend slices have landed, so resolved entries below now act as a closure index instead of an implementation backlog.

## Stable Contract Documentation

- `README.md` is the stable API reference for endpoint names, query parameters, request fields, response projections, private file downloads, and reservation status notes.
- `CONTEXT.md` is the stable domain glossary for Facility Categories, Facility Catalog behavior, Reservation Extra Requirements, Student Reservation Workflow Projections, Student-owned Private File Downloads, terminal rejection source, and Student Academic Profile derivation.

Severity labels:

- Blocking for integration: design can proceed with fixtures, but real API integration cannot satisfy the planned MVP behavior yet.
- Workaround: the frontend can ship a constrained MVP, but backend support should improve later.
- Nice-to-have: not required for MVP behavior, but improves UX or maintainability.

## Auth

- Nice-to-have: `POST /auth/register` returns a user response but no access token. Registration will show success and link to login instead of auto-login.
- Nice-to-have: auth token responses do not expose expiry metadata needed for proactive refresh UX.

## Student Home

- Resolved: student home can request featured/explorable facilities with `GET /facilities?featured=true&limit=8`, receiving the standard paginated envelope ranked by active cover image, visible review count, visible rating average, and name.
- Resolved: `GET /facility-categories` provides active public Facility Categories with stable slugs, optional icon hints, and active facility counts for home shortcuts.

## Facility Catalog

- Resolved: `GET /facilities` returns a paginated envelope with `items`, `page`, `page_size`, `total_items`, and `total_pages`, and supports `q`, `category`, `min_capacity`, `sort`, `page`, `page_size`, `featured`, and featured `limit`.
- Resolved: public Facility Category data exposes stored slugs through `GET /facility-categories` for URL filters.

## Reservation Detail Form

- Resolved: reservation submission accepts optional structured `extra_requirements` for AV support, logistics coordination, extra cleaning, security personnel, and notes. Student reservation create/list/detail responses return the persisted nested object, with omitted requirements defaulting to false flags and null notes.

## Reservation Payment States

- Resolved: student reservation create/list/detail responses include a `payment` projection with `required`, receipt metadata when uploaded, `review_status`, and payment rejection reason when relevant.
- Resolved: payment review rejection persists `rejection_source=payment`, and terminal rejected student reservation responses include `rejection.source=payment` with the rejection reason.

## Reservation Document States

- Resolved: student reservation create/list/detail responses include a `document` projection with generated approval letter metadata, signed approval letter metadata when uploaded, `review_status`, and document rejection reason when relevant.
- Resolved: document review rejection persists `rejection_source=document`, and terminal rejected student reservation responses include `rejection.source=document` with the rejection reason.
- Resolved: legacy rejected reservations without a persisted rejection source are exposed as `rejection.source=unknown`.

## Reservation Details

- Resolved: student reservation detail responses expose signed approval letter metadata through `document.signed_approval_letter`.
- Resolved: student reservation detail responses expose payment receipt metadata through `payment.receipt`.
- Resolved: students can reopen uploaded signed approval letters with `GET /student/reservations/{reservation_id}/signed-approval-letter/download` when `document.signed_approval_letter` metadata is non-null.
- Resolved: students can reopen uploaded payment receipts with `GET /student/reservations/{reservation_id}/payment-receipt/download` when `payment.receipt` metadata is non-null.

## Student Profile

- Resolved: `GET /auth/me` returns student `nim`, `phone`, and an `academic_profile` object with `program_studi`, `faculty`, `entry_year`, and `degree`.
- Resolved: backend-owned academic profile derivation maps known NIM prefixes and entry-year information best-effort. Unknown or unparsable NIM values keep auth flows available and expose null academic fields.

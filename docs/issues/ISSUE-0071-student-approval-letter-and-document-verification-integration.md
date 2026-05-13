---
id: ISSUE-0071
type: issue
title: Student approval letter and document verification integration
status: done
category: enhancement
agent_mode: AFK
area:
  - frontend
prd: PRD-0005
blocked_by:
  - ISSUE-0061
  - ISSUE-0063
  - ISSUE-0070
created: 2026-05-13
updated: 2026-05-13
---

# ISSUE-0071: Student approval letter and document verification integration

## Parent

PRD-0005

## What to build

Wire approval-letter generation/download, signed-letter upload, and document waiting/declined pages to backend Reservation projections.

## Acceptance criteria

- [x] Letter page loads Reservation detail and generated approval-letter metadata.
- [x] Generate/download action uses the approval-letter endpoints and binary download helper.
- [x] Signed approval letter upload accepts backend-supported file types and max size.
- [x] Successful upload routes to the document waiting page.
- [x] Waiting and declined pages validate loaded Reservation state and redirect to canonical route when stale.
- [x] Declined state displays document rejection reason from the backend projection.
- [x] Vitest/RTL tests cover metadata rendering, download behavior, upload validation, successful upload, upload errors, waiting state, declined state, and canonical redirect.
- [x] Document workflow screenshots remain green or are updated only for intentional normalization.

## Blocked By

- ISSUE-0061
- ISSUE-0063
- ISSUE-0070

## Implementation Notes

- Use the shared upload/download helpers.
- Use the shared Reservation projection mapper for canonical routing.

## Contract Mapping

| Backend field / endpoint | Frontend view model | Mapping rule | Omitted/deferred fields |
| --- | --- | --- | --- |
| `document.approval_letter` | generated letter row | Show only when non-null or trigger generation | Fake template metadata |
| `POST signed-approval-letter` | upload result | Route to waiting after success | Revision flow |
| `document.rejection_reason` | declined reason | Display for document rejection | Payment rejection on document page |

## Agent Brief

**Category:** enhancement
**Summary:** Wire the student approval-letter, signed-letter upload, document waiting, and document declined pages to backend Reservation and approval-letter APIs.

**Current behavior:**
`frontend/src/pages/student/StudentDocumentWorkflowPages.tsx` renders fixture document workflow data. The approval-letter page shows static template metadata and a fake selected file row, upload buttons do not submit multipart data, download does not call the binary helper, waiting/declined pages do not load Reservation state, and declined copy uses fixture rejection text.

**Desired behavior:**
Use `reservationId` from the route, load the current `StudentReservationResponse`, fetch/generated approval-letter metadata from the backend, download the generated letter through `apiDownload`, upload the signed approval letter with `FormData`, and route to `/student/reservations/:reservationId/verification/waiting` after successful upload. Waiting and declined pages should load the Reservation projection, use the shared Student Reservation Workflow mapper from `ISSUE-0070` to verify their canonical route, and redirect when the loaded projection belongs somewhere else.

**Key interfaces:**
- `GET /student/reservations/{reservation_id}` returns `StudentReservationResponse`.
- `GET /student/reservations/{reservation_id}/approval-letter` returns `StudentApprovalLetterResponse` and creates/returns the generated approval letter metadata.
- `GET /student/reservations/{reservation_id}/approval-letter/download` returns a binary attachment for `apiDownload`.
- `POST /student/reservations/{reservation_id}/signed-approval-letter` accepts multipart `file` and returns `StudentSignedApprovalLetterResponse`.
- Backend accepts signed approval letters with PDF, JPG, JPEG, or PNG content type and rejects files above 5 MB.
- Document waiting projection is `document.review_status=waiting_review`.
- Document declined projection is `status=rejected`, `rejection.source=document`, and `document.rejection_reason` or `rejection.reason` provides the reason.

**Acceptance criteria:**
- [ ] Letter page loads Reservation detail and generated approval-letter metadata.
- [ ] Generate/download action uses the approval-letter endpoints and binary download helper.
- [ ] Signed approval letter upload accepts backend-supported file types and max size.
- [ ] Successful upload routes to the document waiting page.
- [ ] Waiting and declined pages validate loaded Reservation state and redirect to canonical route when stale.
- [ ] Declined state displays document rejection reason from the backend projection.
- [ ] Vitest/RTL tests cover metadata rendering, download behavior, upload validation, successful upload, upload errors, waiting state, declined state, and canonical redirect.
- [ ] Document workflow screenshots remain green or are updated only for intentional normalization.

**Out of scope:**
- Staff document review actions.
- Payment workflow integration.
- Resubmission after a terminal document rejection.
- Browser-native save dialog handling beyond invoking `apiDownload` and exposing filename/metadata in the UI.

## Update Log

- 2026-05-13: Triaged to `ready-for-agent`. Verified contracts in `app/api/routes/approval_letter_routes.py`, `app/api/routes/reservation_routes.py`, `app/schemas/reservation_schemas.py`, and `frontend/src/api/http.ts`; current document workflow page remains fixture-only.
- 2026-05-13: Implemented and closed. `frontend/src/pages/student/StudentDocumentWorkflowPages.tsx` now loads Reservation projections and approval-letter metadata, downloads via `apiDownload`, validates/sends multipart signed-letter uploads, routes successful uploads to waiting verification, and enforces canonical waiting/declined routes with the shared mapper. Added `frontend/src/pages/student/StudentDocumentWorkflowPages.test.tsx` and updated `frontend/tests/e2e/student-document-status.spec.ts` plus intentional document workflow screenshots. Verified with `npm test -- --run src/pages/student/StudentDocumentWorkflowPages.test.tsx src/pages/student/StudentReservationListPage.test.tsx src/reservations/studentReservationWorkflow.test.ts`, `npm run typecheck`, `npx playwright test tests/e2e/student-document-status.spec.ts --update-snapshots`, and `npx playwright test tests/e2e/student-document-status.spec.ts`.

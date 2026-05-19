---
id: ISSUE-0088
type: issue
title: Student reservation workflow UI cleanup
status: done
category: enhancement
agent_mode: AFK
area:
  - frontend
  - docs
blocked_by:
  - ISSUE-0085
created: 2026-05-19
updated: 2026-05-19
---

# ISSUE-0088: Student reservation workflow UI cleanup

## Parent

None - derived from `docs/user-review/review-051926.md`.

## What to build

Apply the reviewed student reservation UI fixes across document upload, payment, reservation creation, list/detail, completed review, and profile surfaces without changing backend domain behavior.

## Acceptance criteria

- [ ] Approval-letter page uses reviewed copy: `Unduh`, `Unggah`, and `Kirim` or `Kirimkan`; uploaded-file `valid` badge is removed where redundant.
- [ ] Payment page uses reviewed copy: document upload button `Unggah`, submit button `Kirim` or `Kirimkan`, declined retry `Unggah Ulang`, and no redundant `valid` badge.
- [ ] Payment transfer destination/instructions are placed above the price/amount summary.
- [ ] Reservation create detail page moves the `Lanjutkan` action to the right-side policy/summary area as reviewed.
- [ ] Reservation list action labels are normalized to `Lihat Detail`, including history rows, and fixtures include an example history state.
- [ ] Accepted/completed reservation detail pages move bottom actions to the lower content area.
- [ ] Completed reservation detail owns the review form inline at the bottom when no review exists; existing review is shown in place when present.
- [ ] The separate student review route is deprecated or redirects to the completed reservation detail anchor/state.
- [ ] Student profile displays email when the backend/session identity provides it.
- [ ] Affected page briefs and component briefs are updated.
- [ ] Relevant Vitest tests cover routing/action labels/form visibility, and student reservation Playwright snapshots are updated.

## Blocked By

- ISSUE-0085

## Implementation Notes

- `StudentDocumentWorkflowPages` keeps reviewed document/payment copy, removes redundant selected-file `valid` badges, shows selected filenames only when a file is chosen, and places payment transfer destination/instructions before amount context.
- `StudentReservationCreatePages` moves `Lanjutkan` into the right summary/policy action column while preserving the existing submit API.
- `studentReservationWorkflow` normalizes completed/history/declined/cancellation-request primary list actions to `Lihat Detail`; completed reservations now open detail for inline review.
- `StudentReservationDetailReadOnlyPage` moves eligible bottom actions into the lower content area and owns the completed-reservation review form inline at the bottom. Existing review state is shown in place.
- `StudentReviewPage` is deprecated as a standalone form and redirects to the completed detail `#review` section.
- `StudentProfilePage` now displays session email in the identity card and academic information rows.
- Updated affected page/component briefs and focused Vitest/Playwright coverage. API behavior is unchanged; automatic cancellation remains in ISSUE-0089.

## Triage Notes

- 2026-05-19: ISSUE-0085 is done, so this frontend-only cleanup is unblocked. Scope is student workflow UI/routing/docs; backend cancellation lifecycle remains deferred to ISSUE-0089.

## Agent Brief

- Remove redundant `valid` upload badges from student document/payment upload surfaces while keeping selected filename feedback.
- Keep reviewed button copy: `Unduh`, `Unggah`, `Kirim`, `Unggah Ulang`, `Lihat Detail`.
- Put payment transfer instructions before amount/summary context.
- Move reservation-detail submit action into the right policy/summary column.
- Route completed reservations to the detail page, render the review form inline at the bottom when no visible review exists, and make the old review route redirect to detail.
- Keep API behavior unchanged and update focused tests, snapshots, and frontend briefs.

## Update Log

- 2026-05-19: Implemented and verified.

## Verification

- `npm test -- StudentDocumentWorkflowPages StudentReservationDetailPage StudentReservationListPage StudentReservationDetailReadOnlyPage StudentReviewCancellationProfilePages studentReservationWorkflow`
- `npm test -- StudentReviewCancellationProfilePages`
- `npm run typecheck`
- `npx playwright test student-document-status.spec.ts student-payment-status.spec.ts student-reservation-create.spec.ts student-reservation-detail.spec.ts student-reservation-list.spec.ts student-review-cancellation-profile.spec.ts --update-snapshots`
- `npx playwright test student-payment-status.spec.ts --update-snapshots`
- `npx playwright test student-document-status.spec.ts student-payment-status.spec.ts student-reservation-create.spec.ts student-reservation-detail.spec.ts student-reservation-list.spec.ts student-review-cancellation-profile.spec.ts`
- `npm run build`

---
id: ISSUE-0049
type: issue
title: Student approval letter and document status pages
status: done
category: enhancement
agent_mode: AFK
area:
  - frontend
prd: PRD-0004
blocked_by:
  - ISSUE-0041
  - ISSUE-0042
  - ISSUE-0043
created: 2026-05-13
updated: 2026-05-13
---

# ISSUE-0049: Student approval letter and document status pages

## Parent

PRD-0004

## What to build

Implement approval letter upload, document waiting, and document declined student pages.

## Acceptance criteria

- [x] Approval letter page matches `Student - 05 - Reservation Letter`.
- [x] Verification waiting page matches `Student - 06 - Reservation Verification (WAITING)`.
- [x] Verification declined page matches `Student - 06 - Reservation Verification (DECLINED)`.
- [x] Upload panel, document status rows, summary card, rejection reason, and status actions match references.
- [x] No backend API calls are introduced.
- [x] Playwright screenshots verify all pages at `1440 x 900` and `390 x 844`.
- [x] Mobile `390 x 844` checks show no horizontal overflow.
- [x] File metadata, upload controls, badges, rejection copy, and action rows do not overlap incoherently.

## Blocked By

- ISSUE-0041
- ISSUE-0042
- ISSUE-0043

## Implementation Notes

- Use Student Reservation Workflow Projections and Reservation Private Files vocabulary from `CONTEXT.md`.

## Triage Notes

- 2026-05-13: Triaged as `ready-for-agent` / `AFK`. Blockers ISSUE-0041, ISSUE-0042, and ISSUE-0043 are complete, the approval-letter and document verification page briefs plus HTML/screenshot references exist, and this is deterministic frontend work with no backend API dependency.

## Agent Brief

Keep upload and review outcomes fixture-driven only.

## Update Log

- 2026-05-13: Implemented deterministic student document workflow pages with no backend API calls. Added `frontend/src/fixtures/studentDocumentWorkflow.ts`, `frontend/src/pages/student/StudentDocumentWorkflowPages.tsx`, and routes for `/student/reservations/:reservationId/letter`, `/student/reservations/:reservationId/verification/waiting`, and `/student/reservations/:reservationId/verification/declined` in `frontend/src/App.tsx`. Added Playwright coverage in `frontend/tests/e2e/student-document-status.spec.ts` with desktop and mobile snapshots for all three pages, including mobile overflow assertions. Verified with `npm run typecheck`, `npm run lint`, targeted `npx playwright test tests/e2e/student-document-status.spec.ts --update-snapshots`, and full `npx playwright test` (`40 passed`).

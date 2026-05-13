---
id: ISSUE-0050
type: issue
title: Student payment status pages
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

# ISSUE-0050: Student payment status pages

## Parent

PRD-0004

## What to build

Implement payment upload, payment waiting, payment declined, and accepted Reservation status pages.

## Acceptance criteria

- [x] Payment upload page matches `Student - 07 - Payment`.
- [x] Payment waiting page matches `Student - 07 - Payment Waiting`.
- [x] Payment declined page matches `Student - 07 - Payment Declined`.
- [x] Accepted page matches `Student - 08 - Reservation Accepted`.
- [x] Payment instructions, receipt upload, summary, status panels, rejection reason, and accepted CTA match references.
- [x] No backend API calls are introduced.
- [x] Playwright screenshots verify all pages at `1440 x 900` and `390 x 844`.
- [x] Mobile `390 x 844` checks show no horizontal overflow.
- [x] Payment text, receipt metadata, upload controls, badges, summary rows, and actions do not overlap incoherently.

## Blocked By

- ISSUE-0041
- ISSUE-0042
- ISSUE-0043

## Implementation Notes

- Keep paid Reservation behavior fixture-driven.

## Triage Notes

- 2026-05-13: Triaged as `ready-for-agent` / `AFK`. Blockers ISSUE-0041, ISSUE-0042, and ISSUE-0043 are complete; payment upload, waiting, declined, and accepted page briefs plus HTML/screenshot references exist; backend gap entries are already resolved; and this slice is deterministic frontend work with no backend API dependency.

## Agent Brief

This slice owns the payment branch visuals only.

## Update Log

- 2026-05-13: Implemented deterministic payment upload, payment waiting, payment declined, and accepted reservation pages with no backend API calls. Extended `frontend/src/fixtures/studentDocumentWorkflow.ts`, `frontend/src/pages/student/StudentDocumentWorkflowPages.tsx`, and `frontend/src/App.tsx` with payment and accepted routes. Added Playwright coverage in `frontend/tests/e2e/student-payment-status.spec.ts` with desktop and mobile snapshots plus mobile overflow assertions. Verified with `npm run typecheck`, `npm run lint`, targeted `npx playwright test tests/e2e/student-payment-status.spec.ts --update-snapshots`, and full `npx playwright test` (`48 passed`).

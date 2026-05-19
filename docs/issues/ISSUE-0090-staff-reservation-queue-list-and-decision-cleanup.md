---
id: ISSUE-0090
type: issue
title: Staff reservation queue, list, and decision cleanup
status: done
category: enhancement
agent_mode: AFK
area:
  - frontend
  - docs
blocked_by: []
created: 2026-05-19
updated: 2026-05-19
---

# ISSUE-0090: Staff reservation queue, list, and decision cleanup

## Parent

None - derived from `docs/user-review/review-051926.md`.

## What to build

Refine staff reservation handling so the home page is a focused needs-action queue, the list page uses the same table language, the detail page remains available, and rejection decisions are visually simpler.

## Acceptance criteria

- [x] Staff home shows only recent reservations that need verification/payment attention or other current action after ISSUE-0089.
- [x] Staff home and staff reservation list use the same table format, status proportions, and action-cell rhythm.
- [x] Staff reservation list keeps filters/history while using the simpler reviewed table pattern.
- [x] Staff reservation detail remains available for full context, document download, and review decisions.
- [x] Review rejection dialog is simplified to reason, back, and reject actions.
- [x] Status/action labels such as `Menunggu Verifikasi Dokumen`, `Menunggu pembayaran`, and `Tinjau Pengajuan` fit proportionally on desktop and mobile.
- [x] Affected staff page/component briefs are updated.
- [x] Relevant Vitest tests cover queue filtering and decision dialog labels.
- [x] `staff-home-reservations.spec.ts` and `staff-reservation-detail-decision.spec.ts` snapshots are updated.

## Blocked By

- ISSUE-0085
- ISSUE-0089

## Implementation Notes

- The decision from review planning is to keep the dedicated staff detail page.
- Likely frontend touchpoints: `StaffReservationOperationsPages`, `StaffReservationDetailDecisionPages`, staff reservation fixtures, and e2e specs.

## Triage Notes

- 2026-05-19: ISSUE-0085 and ISSUE-0089 are done, so this frontend/docs cleanup is unblocked. Scope is concrete and can be handled AFK against existing staff page references, current API contracts, and screenshot tests.

## Agent Brief

- Make staff home a focused actionable queue after automatic cancellation: document/payment review work only.
- Align staff home and reservation list table/card language, status sizing, and action-cell rhythm.
- Keep the dedicated staff detail page and simplify rejection decision UI to reason, back, and reject actions.
- Update staff briefs/component docs and focused Vitest/Playwright coverage.

## Update Log

- 2026-05-19: Completed the staff reservation cleanup. Staff home and list now share table column language and proportions, the list no longer exposes legacy cancellation-request filtering, and the rejection dialog's `Kembali` action returns to the staff detail page.
- 2026-05-19: Updated staff reservation page/component briefs to reflect document/payment-only staff decisions after automatic student cancellation.
- 2026-05-19: Verification: `npm run typecheck`; `npm test -- StaffReservationDetailDecisionPages StaffReservationOperationsPages`; `npx playwright test staff-home-reservations.spec.ts staff-reservation-detail-decision.spec.ts --update-snapshots`; `npx playwright test staff-home-reservations.spec.ts staff-reservation-detail-decision.spec.ts`.

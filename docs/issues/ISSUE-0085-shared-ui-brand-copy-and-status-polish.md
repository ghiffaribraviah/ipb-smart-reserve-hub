---
id: ISSUE-0085
type: issue
title: Shared UI brand, copy, and status polish
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

# ISSUE-0085: Shared UI brand, copy, and status polish

## Parent

None - derived from `docs/user-review/review-051926.md`.

## What to build

Normalize shared visual language and repeated copy across the frontend so screenshots use the IPB SRH brand consistently and common states/buttons read correctly in Indonesian.

## Acceptance criteria

- [ ] Auth, student, staff, and Super Admin shells use the current IPB SRH logo treatment rather than old logo placeholders.
- [ ] Super Admin active nav, avatar, primary buttons, and links use logo-derived green instead of purple/indigo while preserving operational table/card density.
- [ ] Rating stars use green consistently in shared primitives and facility review surfaces.
- [ ] Deadline/expired reservation status badges use the reviewed warning/yellow treatment.
- [ ] Native file upload presentation is replaced or wrapped so visible upload controls read in Indonesian and avoid `Choose File / No File Chosen` text.
- [ ] Repeated button labels from the review are normalized, including `Unduh`, `Unggah`, `Kirim` or `Kirimkan`, `Unggah Ulang`, `Lihat Detail`, `Lanjutkan`, and `Kembali`.
- [ ] Deterministic local media placeholders are consistent and ready for later approved real assets.
- [ ] Affected page/component briefs are updated where they own the reviewed copy or visual contract.
- [ ] Relevant Vitest assertions and Playwright snapshots are updated for desktop `1440 x 900` and mobile `390 x 844`.

## Blocked By

None - can start immediately.

## Implementation Notes

- Source review: `docs/user-review/review-051926.md`.
- Likely frontend touchpoints: shared UI primitives, auth layout, role shells, upload/file components, status badge mapping, rating input/display, page fixtures, and screenshot specs.
- Do not introduce production photos in this issue. Keep deterministic screenshot assets.
- 2026-05-19: Implemented shared logo-green Super Admin accents, green rating stars, warning/yellow expired/deadline states, Indonesian file upload presentation, reviewed student action labels, deterministic placeholder consistency, and matching frontend contract docs.
- 2026-05-19: Updated affected React tests and Playwright desktop/mobile snapshots. Static HTML references for changed student labels were also updated to keep the visual source documents aligned.

## Triage Notes

- 2026-05-19: Triaged from `docs/user-review/review-051926.md`. The issue is actionable as frontend polish because the review names repeated visual and copy inconsistencies, the affected surfaces are existing frontend pages/components, and no backend or product decision dependency is required. Keep image work to deterministic local placeholders; approved production media sourcing remains separate.

## Agent Brief

**Category:** enhancement
**Summary:** Normalize shared IPB SRH branding, Indonesian copy, upload controls, and repeated status/rating treatments across existing frontend surfaces.

**Current behavior:**
Several frontend screenshots still show old logo placeholders, purple/indigo Super Admin accents, yellow/warning states that are not consistently applied, native English file upload chrome, and repeated button labels that differ from the Indonesian wording requested in the user review. Facility and auth/dashboard media placeholders are also inconsistent.

**Desired behavior:**
Existing auth, student, staff, and Super Admin pages/components should present a consistent IPB SRH brand treatment. Super Admin chrome and primary actions should use logo-derived green rather than purple/indigo. Shared ratings should use green stars. Deadline and expired reservation badges should use the reviewed warning/yellow treatment. Visible upload controls should avoid native English `Choose File` / `No File Chosen` strings and expose Indonesian labels. Repeated reservation/document/payment actions should use the reviewed Indonesian labels consistently. Local deterministic media placeholders should remain stable for tests and screenshots until approved real assets are sourced.

**Key interfaces:**
- Shared shell/header/sidebar components for `student`, `staff`, and `super_admin` roles.
- Shared button/link/avatar/nav styling tokens or variants used by Super Admin pages.
- Shared rating display/input primitives and facility review surfaces.
- Shared status badge/status mapping primitives used by auth states, reservations, document/payment workflows, and review surfaces.
- Shared upload/file input components used by document and payment upload flows.
- Deterministic frontend fixtures or placeholder assets used by auth, student discovery, facility cards/details, dashboards, and screenshots.
- Frontend page/component briefs that own the reviewed copy and visual contracts.

**Acceptance criteria:**
- [ ] Auth, student, staff, and Super Admin shells use the current IPB SRH logo treatment instead of old logo placeholders.
- [ ] Super Admin active nav, avatar, primary buttons, and links use logo-derived green instead of purple/indigo while preserving operational table/card density.
- [ ] Rating stars use green consistently in shared primitives and facility review surfaces.
- [ ] Deadline/expired reservation status badges use the reviewed warning/yellow treatment.
- [ ] Visible file upload controls read in Indonesian and do not expose `Choose File` / `No File Chosen`.
- [ ] Repeated labels are normalized where applicable: `Unduh`, `Unggah`, `Kirim` or `Kirimkan`, `Unggah Ulang`, `Lihat Detail`, `Lanjutkan`, and `Kembali`.
- [ ] Deterministic local media placeholders are consistent and no production photo sourcing is introduced.
- [ ] Affected page/component briefs are updated where they own the reviewed copy or visual contract.
- [ ] Relevant Vitest assertions and Playwright snapshots cover the changed desktop `1440 x 900` and mobile `390 x 844` surfaces.

**Out of scope:**
- Sourcing, licensing, or adding approved production photos.
- Structural changes split into later review issues, such as staff facility open-hours editing, Super Admin reservation governance, system statistics/template management, or moving review forms into reservation detail pages.
- Backend API or contract changes.

## Update Log

- 2026-05-19: Completed. Verification:
  - `python3 .agents/scripts/local_tracker.py validate`
  - `npm run typecheck`
  - `npm test -- StudentDocumentWorkflowPages StudentReservationDetailPage StudentReservationDetailReadOnlyPage StudentReservationListPage studentReservationWorkflow`
  - `npx playwright test auth-pages.spec.ts layout-shells.spec.ts shared-states.spec.ts ui-primitives.spec.ts workflow-data-display.spec.ts student-document-status.spec.ts student-payment-status.spec.ts student-reservation-create.spec.ts student-reservation-list.spec.ts student-home.spec.ts super-admin-dashboard-users.spec.ts super-admin-facilities-reports.spec.ts super-admin-system.spec.ts --update-snapshots`
  - `npx playwright test student-payment-status.spec.ts --update-snapshots`
  - `npx playwright test auth-pages.spec.ts layout-shells.spec.ts shared-states.spec.ts ui-primitives.spec.ts workflow-data-display.spec.ts student-document-status.spec.ts student-payment-status.spec.ts student-reservation-create.spec.ts student-reservation-list.spec.ts student-home.spec.ts super-admin-dashboard-users.spec.ts super-admin-facilities-reports.spec.ts super-admin-system.spec.ts`
  - `npm run build`
- 2026-05-19: Non-blocking verification notes:
  - `npm run lint` still fails on pre-existing unrelated lint findings in `src/auth/session.tsx`, `src/pages/student/StudentReservationTimePage.test.tsx`, and several Playwright specs using `any`; the touched `StudentDocumentWorkflowPages.tsx` unused constants found by lint were removed.
  - Plain `npm test` is not a valid all-suite command in the current frontend layout because Vitest imports `tests/e2e/*.spec.ts` and fails on Playwright `test.describe()` usage; targeted Vitest suites and Playwright tests above passed.

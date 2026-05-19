---
id: ISSUE-0092
type: issue
title: Super Admin users, facilities, and dashboard governance cleanup
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

# ISSUE-0092: Super Admin users, facilities, and dashboard governance cleanup

## Parent

None - derived from `docs/user-review/review-051926.md`.

## What to build

Clean up Super Admin dashboard, users, and facilities pages so governance tables are visually clear, controls appear in reviewed order, and deactivate/archive actions use accurate wording.

## Acceptance criteria

- [x] Super Admin dashboard clearly separates admin list/table content from activity log content.
- [x] Super Admin users page moves create-user controls above filter/search controls.
- [x] Redundant top-right `Tambah pengguna` action is removed when inline creation is already visible.
- [x] User row action is labeled `Ubah status` or otherwise clearly communicates active/inactive toggling.
- [x] Permanent user/facility deletion is not introduced; UI uses deactivate/archive wording consistent with current backend contracts.
- [x] Super Admin facilities page table/list is visually aligned with the users page governance pattern.
- [x] Facilities actions include edit detail and deactivate/archive wording; assignment controls remain available.
- [x] Affected Super Admin page briefs and component briefs are updated.
- [x] Relevant Vitest tests cover visible action labels and create/filter ordering.
- [x] `super-admin-dashboard-users.spec.ts` and `super-admin-facilities-reports.spec.ts` snapshots are updated.

## Blocked By

- ISSUE-0085

## Implementation Notes

- Planning decision: do not add permanent delete in this UI-fix track. Existing active/inactive backend behavior is the source of truth.
- Likely frontend touchpoints: `SuperAdminDashboardUsersPages`, Super Admin fixtures, and e2e specs.

## Triage Notes

- 2026-05-19: ISSUE-0085 is done, no out-of-scope marker blocks this work, and `docs/user-review/review-051926.md` gives concrete UI decisions for dashboard/users/facilities cleanup. Permanent delete remains out of scope for this UI-fix track; use active/inactive, deactivate, or archive wording consistent with current backend contracts. Ready for AFK frontend/docs implementation.

## Agent Brief

**Category:** enhancement
**Summary:** Clean up Super Admin dashboard, users, and facilities governance surfaces so table content, creation controls, filters, and status actions match the review.

**Current behavior:**
The Super Admin dashboard can read as two competing tables: admin list content and activity log content are visually too similar. The users page places create-user controls below search/filter controls and also keeps a redundant top-right `Tambah pengguna` action. User status actions do not clearly communicate active/inactive toggling. The facilities governance page is not visually aligned with the users governance table pattern, and action wording needs to avoid implying permanent deletion when the backend supports active/inactive or assignment governance.

**Desired behavior:**
Dashboard admin list/table content and activity log content should be visually distinct. On users, inline create controls should appear before search/filter controls and the redundant top-right `Tambah pengguna` should be removed. User row status action copy should clearly say `Ubah status` or an equivalent active/inactive toggle label. Facilities governance should use the same table/list rhythm as users, with visible edit detail and deactivate/archive actions plus assignment controls. Do not add permanent delete behavior in this issue.

**Likely touchpoints:**
- `frontend/src/pages/super-admin/SuperAdminDashboardUsersPages.tsx`
- Super Admin dashboard/users/facilities fixtures and tests
- `frontend/tests/e2e/super-admin-dashboard-users.spec.ts`
- `frontend/tests/e2e/super-admin-facilities-reports.spec.ts`
- Affected page/component briefs under `docs/frontend/per-page-brief/` and `docs/frontend/per-component-brief/`

**Acceptance criteria:**
- [ ] Super Admin dashboard clearly separates admin list/table content from activity log content.
- [ ] Super Admin users page moves create-user controls above filter/search controls.
- [ ] Redundant top-right `Tambah pengguna` action is removed when inline creation is already visible.
- [ ] User row action is labeled `Ubah status` or otherwise clearly communicates active/inactive toggling.
- [ ] Permanent user/facility deletion is not introduced; UI uses deactivate/archive wording consistent with current backend contracts.
- [ ] Super Admin facilities page table/list is visually aligned with the users page governance pattern.
- [ ] Facilities actions include edit detail and deactivate/archive wording; assignment controls remain available.
- [ ] Affected Super Admin page briefs and component briefs are updated.
- [ ] Relevant Vitest tests cover visible action labels and create/filter ordering.
- [ ] `super-admin-dashboard-users.spec.ts` and `super-admin-facilities-reports.spec.ts` snapshots are updated.

**Out of scope:**
- Permanent deletion for users or facilities.
- New backend endpoints unless the existing UI cannot express current active/inactive or assignment contracts.
- Super Admin reservation governance; that is tracked separately in ISSUE-0093.

## Update Log

- 2026-05-19: Implemented the Super Admin governance cleanup. Dashboard activity now uses a visually distinct panel, the users page places inline creation before filters and removes the redundant top-right add action, user row actions now say `Ubah status`, and the facilities page now follows the users governance table/card rhythm with edit-detail links, deferred archive wording, status/coverage badges, and existing assignment controls. Updated Super Admin page/component briefs and refreshed affected Playwright snapshots.
- 2026-05-19: Verification run: `npm run typecheck` passed; `npm test -- SuperAdminDashboardUsersPages` passed; `npx playwright test super-admin-dashboard-users.spec.ts super-admin-facilities-reports.spec.ts --update-snapshots` passed; `npx playwright test super-admin-dashboard-users.spec.ts super-admin-facilities-reports.spec.ts` passed.

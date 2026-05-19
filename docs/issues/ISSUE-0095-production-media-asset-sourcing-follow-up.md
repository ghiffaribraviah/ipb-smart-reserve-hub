---
id: ISSUE-0095
type: issue
title: Production media asset sourcing follow-up
status: needs-info
category: enhancement
agent_mode: HITL
area:
  - frontend
  - docs
blocked_by: []
created: 2026-05-19
updated: 2026-05-19
---

# ISSUE-0095: Production media asset sourcing follow-up

## Parent

None - derived from `docs/user-review/review-051926.md`.

## What to build

Collect and integrate approved production-ready media assets after a human provides the official IPB SRH logo files, auth/dashboard imagery, and Facility photos.

## Acceptance criteria

- [ ] Human-approved logo files are provided with usage guidance for light/dark/small contexts.
- [ ] Human-approved auth/dashboard imagery is provided or explicitly deferred.
- [ ] Human-approved Facility photos are provided with alt text and ownership/usage confirmation.
- [ ] Frontend asset locations and naming conventions are documented.
- [ ] Deterministic screenshot fixtures are updated only after assets are stable and locally available.
- [ ] Relevant page briefs and screenshots are updated for any approved real media.
- [ ] No remote placeholder or Unsplash URLs are introduced into screenshot baselines.

## Blocked By

None - can start once approved assets exist.

## Implementation Notes

- This is intentionally separate from ISSUE-0085 so UI fixes are not blocked by production asset sourcing.
- Keep this HITL because the repository cannot infer asset ownership or approval.

## Triage Notes

- 2026-05-19: Kept HITL/needs-info. The repo has deterministic fixture/fallback media and multiple docs explicitly avoid remote placeholder URLs, but official logo files, auth/dashboard imagery, and Facility photos require human approval and usage rights. Implementation should wait until assets are supplied locally with ownership/alt-text guidance.

## Agent Brief

**Category:** enhancement
**Summary:** Integrate production media only after approved local assets and usage guidance are supplied.

**Asset intake checklist:**
- Official IPB SRH logo files for light, dark, small/mobile, and favicon/app-icon contexts.
- Auth/register/dashboard imagery or an explicit decision to keep deterministic generated/local fixtures.
- Facility photos for catalog/detail/home/staff surfaces with facility mapping, alt text, and ownership/usage confirmation.
- Naming/location guidance for committed frontend assets, for example `frontend/src/assets/...` or `frontend/public/...`.
- Screenshot update scope: which pages should be refreshed once media is stable.

**Implementation direction once assets exist:**
- Add local assets under the agreed frontend asset location.
- Replace deterministic fixture labels/placeholders only where approved media is available.
- Preserve deterministic screenshot baselines; do not introduce remote image URLs.
- Update affected page/component briefs with asset source, alt-text, and fallback rules.
- Refresh affected Playwright screenshots after assets are local and stable.

**Out of scope until assets exist:**
- Generating substitute production photos without approval.
- Pulling remote stock/Unsplash URLs into screenshots.
- Replacing all deterministic fallbacks when only partial assets are supplied.

## Update Log

No updates yet.

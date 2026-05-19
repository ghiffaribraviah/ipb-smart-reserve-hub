---
id: ISSUE-0094
type: issue
title: Super Admin system statistics and letter template management
status: needs-info
category: enhancement
agent_mode: HITL
area:
  - backend
  - frontend
  - docs
blocked_by:
  - ISSUE-0085
created: 2026-05-19
updated: 2026-05-19
---

# ISSUE-0094: Super Admin system statistics and letter template management

## Parent

None - derived from `docs/user-review/review-051926.md`.

## What to build

Expand Super Admin System from status-only cards into an operational system page with app-computable counters and global approval-letter template management.

## Acceptance criteria

- [ ] Admin system status response includes practical counters the app can compute, such as user count, facility count, reservation count, recent audit log count, document counts, stored bytes when available, and overdue/worker attention counts.
- [ ] Unavailable infrastructure metrics are displayed honestly as unavailable or not configured, not faked.
- [ ] Super Admin System page shows backend, database, storage, and worker status with related statistics.
- [ ] Super Admin System page adds a global approval-letter template section with upload/replace, active template metadata, and download actions.
- [ ] Backend stores and retrieves the active approval-letter template through a public service/API contract.
- [ ] Generated approval letters use the active template where applicable or clearly fall back when no template is configured.
- [ ] Staff and student pages remain consumers of generated approval letters and do not gain template-management controls.
- [ ] Backend tests cover statistics response, template upload/download/replace, access policy, and approval-letter generation template selection.
- [ ] Frontend integration tests cover loading stats, unavailable stats, template upload/replace, and download states.
- [ ] `docs/frontend/per-page-brief/super-04-sistem.md`, backend gaps, route/schema docs, and screenshots are updated.

## Blocked By

- ISSUE-0085

## Implementation Notes

- Current `/admin/system-status` returns only status objects for backend, database, storage, worker, and application.
- Planning decision: Super Admin owns templates globally; staff/student keep only reservation letter download/upload workflow.
- Follow backend TDD for new contracts.

## Triage Notes

- 2026-05-19: ISSUE-0085 is done, so the blocker is clear. Kept this issue out of AFK implementation because the statistics portion is implementable, but global approval-letter template management needs product/technical decisions that are not present in the review or existing docs. Current generated approval letters are PDF bytes produced by `app/pdf/__init__.py`; there is no active template storage model or rendering contract to extend safely without deciding format and fallback behavior.

## Agent Brief

**Category:** enhancement
**Summary:** Expand Super Admin System with real operational counters and approval-letter template management after template contract decisions are confirmed.

**Known desired direction from review:**
The System page should not only show backend/database/storage/worker status; it should include related statistics. The product also needs a place to manage approval-letter templates, owned globally by Super Admin rather than staff/student.

**Decisions needed before implementation:**
- What template format is supported for v1: uploaded PDF background, DOCX, HTML, Markdown, or structured text fields rendered by the app?
- Which dynamic placeholders are required: student name, NIM, facility, organization unit, reservation code, schedule, price, extra requirements, signatures, QR/code, or official letter number?
- Should the generated approval letter keep the existing app-generated PDF layout and only overlay/merge a template, or should the uploaded template fully drive rendering?
- What file types and max file sizes are accepted for template upload?
- Should old templates be versioned/audited or should replacement keep only the active template?
- What should happen to already-generated approval letters when the template changes?
- Should storage-byte statistics come from real object storage metadata only, or show `Tidak tersedia` when unavailable?
- Which counters are mandatory for v1 versus optional/unavailable?

**Implementation direction if approved:**
- Backend: add system stats fields to `/admin/system-status` or a companion endpoint, add template metadata/upload/download/replace routes, storage persistence, access-policy checks, audit logs, and TDD coverage.
- PDF generation: update approval-letter generation to select the active template or use an explicit fallback when none exists.
- Frontend: update `/super-admin/system` to show status plus counters, unavailable metric states, and active-template upload/replace/download controls.
- Docs: update `docs/frontend/per-page-brief/super-04-sistem.md`, backend gap ledger, route/schema docs, and Playwright screenshots.

**Out of scope until approved:**
- Staff/student template management controls.
- Fake infrastructure metrics not backed by current app data or a real provider.
- Changing the student/staff approval-letter workflow beyond consuming generated output.

## Update Log

No updates yet.

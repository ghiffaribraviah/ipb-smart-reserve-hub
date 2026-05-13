---
id: ISSUE-0073
type: issue
title: Student Reservation detail cancellation review profile integration
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
  - ISSUE-0071
  - ISSUE-0072
created: 2026-05-13
updated: 2026-05-13
---

# ISSUE-0073: Student Reservation detail cancellation review profile integration

## Parent

PRD-0005

## What to build

Wire accepted/completed Reservation detail, private file downloads, cancellation request, review submission, and Student profile to backend data.

## Acceptance criteria

- [x] Reservation detail loads accepted and completed variants from backend Reservation detail.
- [x] Private file download actions appear only when metadata is non-null.
- [x] Cancellation request submits reason for eligible approved Reservations and handles unavailable states.
- [x] Review form submits one review for eligible completed Reservations and hides duplicate review CTA when review exists.
- [x] Profile page loads current user identity, NIM, phone, and Student Academic Profile fields from current-user endpoint.
- [x] Canonical route checks redirect stale detail/review/cancellation states as needed.
- [x] Vitest/RTL tests cover accepted detail, completed detail with and without review, private download visibility, cancellation success/errors, review success/errors, profile partial academic profile, and failed session redirect.
- [x] Relevant screenshots remain green or are updated only for intentional normalization.

## Blocked By

- ISSUE-0061
- ISSUE-0063
- ISSUE-0070
- ISSUE-0071
- ISSUE-0072

## Implementation Notes

- Keep missing optional files omitted, not faked.
- Frontend should not derive academic profile from NIM.

## Contract Mapping

| Backend field / endpoint | Frontend view model | Mapping rule | Omitted/deferred fields |
| --- | --- | --- | --- |
| `document/payment metadata` | document rows | Render only non-null metadata | Fake filenames/dates |
| `review` | review CTA | Hide CTA when review exists | Duplicate review flow |
| `POST cancellation-request.reason` | cancellation form | Required reason | Immediate cancellation for approved |
| `auth.me.academic_profile` | profile facts | Display nullable fields gracefully | Frontend NIM parsing |

## Agent Brief

**Category:** enhancement
**Summary:** Integrate the remaining student self-service surfaces: reservation detail, private file downloads, cancellation request, review submission, and profile.

**Current behavior:**
The accepted/completed read-only reservation detail, cancellation request form, review form, and profile page are fixture-driven. Detail pages render fake document rows, review/cancellation routes do not verify Reservation projections, cancellation/review forms do not submit to backend APIs, and profile display is not loaded from the current authenticated user.

**Desired behavior:**
Use `reservationId` from route params to load `GET /student/reservations/:reservationId` for detail, cancellation, and review pages. Render document/payment file rows only when backend metadata is non-null. Use the shared Student Reservation Workflow mapper to redirect stale detail/review/cancellation routes to the canonical page. Submit cancellation requests to `POST /student/reservations/:reservationId/cancellation-request` and reviews to `POST /student/reservations/:reservationId/review`. Load profile data from the current-user/session endpoint and display nullable Student Academic Profile fields without deriving them from NIM.

**Key interfaces:**
- `GET /student/reservations/{reservation_id}` returns `StudentReservationResponse` with `status`, `document`, `payment`, `review`, cancellation fields, summary fields, and file metadata.
- Private student file downloads are exposed by approval-letter/payment routes when metadata is present.
- `POST /student/reservations/{reservation_id}/cancellation-request` accepts `{ reason }`; 409 maps to unavailable cancellation feedback.
- `POST /student/reservations/{reservation_id}/review` accepts `rating` and optional `comment`; duplicate/ineligible review errors stay on the form.
- Current-user/session data includes role, NIM, phone, and nullable Student Academic Profile fields.

**Acceptance criteria:**
- [ ] Reservation detail loads accepted and completed variants from backend Reservation detail.
- [ ] Private file download actions appear only when metadata is non-null.
- [ ] Cancellation request submits reason for eligible approved Reservations and handles unavailable states.
- [ ] Review form submits one review for eligible completed Reservations and hides duplicate review CTA when review exists.
- [ ] Profile page loads current user identity, NIM, phone, and Student Academic Profile fields from current-user endpoint.
- [ ] Canonical route checks redirect stale detail/review/cancellation states as needed.
- [ ] Vitest/RTL tests cover accepted detail, completed detail with and without review, private download visibility, cancellation success/errors, review success/errors, profile partial academic profile, and failed session redirect.
- [ ] Relevant screenshots remain green or are updated only for intentional normalization.

**Out of scope:**
- Staff-side review/cancellation decisions.
- Editing profile fields.
- Deriving academic metadata on the frontend from NIM.
- Implementing new backend file endpoints beyond existing private download contracts.

## Update Log

- 2026-05-13: Triaged to `ready-for-agent`. Verified relevant contracts in `app/api/routes/reservation_routes.py`, `app/api/routes/review_routes.py`, existing profile/session frontend code, and page briefs; current surfaces are fixture-only.
- 2026-05-13: Implemented backend integration for accepted/completed reservation detail, metadata-gated private file actions, cancellation request submission, review submission, stale-route redirects, and profile rendering from `/auth/me`. Added RTL coverage in `frontend/src/pages/student/StudentReservationDetailReadOnlyPage.test.tsx` and `frontend/src/pages/student/StudentReviewCancellationProfilePages.test.tsx`; updated the affected Playwright mocks and screenshots for reservation detail, review/cancellation, and profile. Verified with `npm test -- --run src/pages/student/StudentReservationDetailReadOnlyPage.test.tsx src/pages/student/StudentReviewCancellationProfilePages.test.tsx`, `npm run typecheck`, `npx playwright test tests/e2e/student-reservation-detail.spec.ts tests/e2e/student-review-cancellation-profile.spec.ts --update-snapshots`, and `npx playwright test tests/e2e/student-reservation-detail.spec.ts tests/e2e/student-review-cancellation-profile.spec.ts`.

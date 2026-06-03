# Frontend Backend Gap Ledger

This file is an index. Detailed backend integration requirements and backend gap definitions live in page briefs under `docs/frontend/per-page-brief/`.

## Stable Contract Documentation

- `README.md` contains the current local run, demo account, and reservation file metadata overview.
- `backend/app/README.md` contains the backend package overview.
- `CONTEXT.md` contains domain language for frontend/backend integration concepts.
- `docs/frontend/per-page-brief/` contains page-owned integration details and backend gap entries.
- `docs/frontend/frontend-stack.md` contains frontend stack, session, and testing conventions.

Gap statuses:

- `open`: backend support is missing.
- `resolved`: verified from current route/schema/docs or code.
- `needs-verification`: likely implemented, but exact behavior needs test or deeper code verification.
- `deferred`: intentionally outside current frontend scope.

## Auth And Session

| Gap ID | Page Brief | Status | Label |
| --- | --- | --- | --- |
| [BG-AUTH-LOGIN-01](per-page-brief/login.md#bg-auth-login-01-login-and-session-contract) | `login.md` | resolved | Login and session contract |
| [BG-AUTH-REGISTER-01](per-page-brief/register.md#bg-auth-register-01-student-registration-contract) | `register.md` | resolved | Student registration contract |
| [BG-STUDENT-20-01](per-page-brief/student-20-profile-page.md#bg-student-20-01-current-user-profile-identity) | `student-20-profile-page.md` | resolved | Current user profile identity |

## Facility Catalog

| Gap ID | Page Brief | Status | Label |
| --- | --- | --- | --- |
| [BG-STUDENT-00-01](per-page-brief/student-00-home.md#bg-student-00-01-home-categories-and-featured-facilities) | `student-00-home.md` | resolved | Home categories and featured facilities |
| [BG-STUDENT-01-01](per-page-brief/student-01-facility-catalog.md#bg-student-01-01-paginated-filterable-facility-catalog) | `student-01-facility-catalog.md` | resolved | Paginated filterable facility catalog |
| [BG-STUDENT-02-01](per-page-brief/student-02-facility-details.md#bg-student-02-01-public-facility-detail-and-calendar) | `student-02-facility-details.md` | resolved | Public facility detail and calendar |
| [BG-STUDENT-02-02](per-page-brief/student-02-facility-details.md#bg-student-02-02-privacy-safe-public-calendar-blocks) | `student-02-facility-details.md` | resolved | Privacy-safe public calendar blocks |

## Reservation Workflow

| Gap ID | Page Brief | Status | Label |
| --- | --- | --- | --- |
| [BG-STUDENT-03-01](per-page-brief/student-03-reservation-time-form.md#bg-student-03-01-reservation-time-validation) | `student-03-reservation-time-form.md` | resolved | Reservation time validation |
| [BG-STUDENT-04-01](per-page-brief/student-04-reservation-detail-form.md#bg-student-04-01-reservation-submission-free-form-organization-and-extra-requirements) | `student-04-reservation-detail-form.md` | resolved | Reservation submission, free-form organization, and extra requirements |
| [BG-STUDENT-05-01](per-page-brief/student-05-reservation-letter.md#bg-student-05-01-approval-letter-generation-and-upload) | `student-05-reservation-letter.md` | resolved | Approval letter issuance, PDF-only upload, and explicit verification submit |
| [BG-STUDENT-06-WAITING-01](per-page-brief/student-06-reservation-verification-waiting.md#bg-student-06-waiting-01-document-waiting-projection) | `student-06-reservation-verification-waiting.md` | resolved | Document waiting projection |
| [BG-STUDENT-06-DECLINED-01](per-page-brief/student-06-reservation-verification-declined.md#bg-student-06-declined-01-document-declined-projection) | `student-06-reservation-verification-declined.md` | resolved | Document declined projection |
| [BG-STUDENT-08-01](per-page-brief/student-08-reservation-accepted.md#bg-student-08-01-accepted-reservation-projection) | `student-08-reservation-accepted.md` | resolved | Accepted reservation projection |
| [BG-STUDENT-10-01](per-page-brief/student-10-reservation-list.md#bg-student-10-01-student-reservation-list-projections) | `student-10-reservation-list.md` | resolved | Student reservation list projections |
| [BG-STUDENT-11-ACCEPTED-01](per-page-brief/student-11-reservation-details-accepted.md#bg-student-11-accepted-01-approved-detail-and-private-file-actions) | `student-11-reservation-details-accepted.md` | resolved | Approved detail and private file actions |
| [BG-STUDENT-11-COMPLETED-01](per-page-brief/student-11-reservation-details-completed.md#bg-student-11-completed-01-completed-detail-and-review-eligibility) | `student-11-reservation-details-completed.md` | resolved | Completed detail and review eligibility |
| [BG-STUDENT-13-01](per-page-brief/student-13-cancellation-request.md#bg-student-13-01-student-cancellation-request) | `student-13-cancellation-request.md` | resolved | Student cancellation request |

## Payment

| Gap ID | Page Brief | Status | Label |
| --- | --- | --- | --- |
| [BG-STUDENT-07-01](per-page-brief/student-07-payment.md#bg-student-07-01-payment-instructions-and-receipt-upload) | `student-07-payment.md` | resolved | Payment instructions, receipt upload, and explicit verification submit |
| [BG-STUDENT-07-WAITING-01](per-page-brief/student-07-payment-waiting.md#bg-student-07-waiting-01-payment-waiting-projection) | `student-07-payment-waiting.md` | resolved | Payment waiting projection |
| [BG-STUDENT-07-DECLINED-01](per-page-brief/student-07-payment-declined.md#bg-student-07-declined-01-payment-declined-projection) | `student-07-payment-declined.md` | resolved | Payment declined projection |

## Reviews

| Gap ID | Page Brief | Status | Label |
| --- | --- | --- | --- |
| [BG-STUDENT-12-01](per-page-brief/student-12-reservation-review-form.md#bg-student-12-01-student-review-submission) | `student-12-reservation-review-form.md` | resolved | Student review submission |

## Shared Shell

| Gap ID | Brief | Status | Label |
| --- | --- | --- | --- |
| [BG-SHARED-NOTIFICATIONS-01](per-component-brief/notification-surface.md#bg-shared-notifications-01-notification-category-and-target-contract) | `notification-surface.md` | resolved | Notification category and target contract |
| [BG-SHARED-NOTIFICATIONS-02](per-page-brief/student-21-notifications.md#bg-shared-notifications-02-paginated-notification-listing) | `student-21-notifications.md` | resolved | Paginated notification listing |

## Staff Operations

| Gap ID | Page Brief | Status | Label |
| --- | --- | --- | --- |
| [BG-STAFF-00-01](per-page-brief/staff-00-home.md#bg-staff-00-01-staff-verification-queue) | `staff-00-home.md` | resolved | Staff verification queue |
| [BG-STAFF-01-01](per-page-brief/staff-01-facility-list.md#bg-staff-01-01-staff-assigned-facility-list) | `staff-01-facility-list.md` | resolved | Staff assigned facility list |
| [BG-STAFF-02-01](per-page-brief/staff-02-facility-schedule.md#bg-staff-02-01-staff-facility-schedule) | `staff-02-facility-schedule.md` | resolved | Staff facility schedule |
| [BG-STAFF-03-01](per-page-brief/staff-03-edit-facility-details.md#bg-staff-03-01-staff-facility-profile-editing) | `staff-03-edit-facility-details.md` | resolved | Staff facility profile editing |
| [BG-STAFF-10-01](per-page-brief/staff-10-reservation-lists.md#bg-staff-10-01-staff-reservation-list-read-model) | `staff-10-reservation-lists.md` | resolved | Staff reservation list read model |
| [BG-STAFF-11-01](per-page-brief/staff-11-reservation-details.md#bg-staff-11-01-staff-reservation-detail-read-model) | `staff-11-reservation-details.md` | resolved | Staff reservation detail read model |
| [BG-STAFF-12-01](per-page-brief/staff-12-review-decision-dialogs.md#bg-staff-12-01-staff-review-decision-actions) | `staff-12-review-decision-dialogs.md` | resolved | Staff review decision actions |

## Super Admin

| Gap ID | Page Brief | Status | Label |
| --- | --- | --- | --- |
| [BG-SUPER-00-01](per-page-brief/super-00-dashboard.md#bg-super-00-01-super-admin-dashboard-read-model) | `super-00-dashboard.md` | resolved | Super Admin dashboard read model |
| [BG-SUPER-00-02](per-page-brief/super-00-dashboard.md#bg-super-00-02-dashboard-export-action) | `super-00-dashboard.md` | resolved | Dashboard export action |
| [BG-SUPER-01-01](per-page-brief/super-01-pengguna.md#bg-super-01-01-super-admin-user-management-read-model) | `super-01-pengguna.md` | resolved | Super Admin user management read model |
| [BG-SUPER-02-01](per-page-brief/super-02-fasilitas.md#bg-super-02-01-super-admin-facility-governance-read-model) | `super-02-fasilitas.md` | resolved | Super Admin facility governance read model |
| [BG-SUPER-02-02](per-page-brief/super-02-fasilitas.md#bg-super-02-02-facility-create-and-export-actions) | `super-02-fasilitas.md` | resolved | Facility create and export actions |
| [BG-SUPER-03-01](per-page-brief/super-03-laporan.md#bg-super-03-01-super-admin-report-aggregates) | `super-03-laporan.md` | resolved | Super Admin report aggregates |
| [BG-SUPER-03-02](per-page-brief/super-03-laporan.md#bg-super-03-02-super-admin-audit-and-review-moderation) | `super-03-laporan.md` | resolved | Super Admin audit and review moderation |
| [BG-SUPER-03-03](per-page-brief/super-03-laporan.md#bg-super-03-03-report-export-action) | `super-03-laporan.md` | resolved | Report export action |
| [BG-SUPER-04-01](per-page-brief/super-04-sistem.md#bg-super-04-01-super-admin-system-status-and-settings) | `super-04-sistem.md` | resolved | Super Admin system status and settings |

# Domain Context

## User Account

A User account is the campus login record for exactly one MVP role: `student`, `staff`, or `super_admin`.

Student User accounts are created through self-registration and must use an allowed institutional email domain. Staff and Super Admin User accounts are admin-created. Inactive User accounts keep their history but cannot log in or refresh sessions.

## Access Policy

An Access Policy decides whether an active User account may perform a role-limited action.

In the MVP, shell access is exact-role access: Student User accounts enter the student shell, Staff User accounts enter the staff shell, and Super Admin User accounts enter the admin shell.

Access Policy callers should ask about named actions, not raw role comparisons, so role rules stay local to the Access Policy Module.

## Application Settings

Application Settings are the runtime configuration values needed to assemble the app: database URL, token secret, and allowed student email domains.

Application Settings may come from defaults, tests, or deployment environment variables, but callers should not need to know those environment variable names.

## Booking Settings

Booking Settings are admin-managed reservation policy values, including booking windows, document and payment due hours, final approval cutoffs, and allowed student email domains.

Booking Settings own value validation and normalization so callers can use one settings record without knowing storage encoding or default-merging rules.

## Booking Settings Repository

A Booking Settings Repository is the persistence Seam for stored Booking Settings values.

It lets Booking Settings load and save recognized settings values without knowing the System Setting database Adapter, JSON encoding, or unrelated setting rows.

## User Repository

A User Repository is the persistence Seam for User account records.

It lets account workflows store a User account and look one up by email address or ID without knowing the database Adapter or query Implementation.

## Facility

A Facility is a reservable campus place that students can discover and later reserve.

Active Facilities are visible to students in the Facility Catalog. Inactive Facilities keep their history but are hidden from student browsing and should not accept new reservations.

## Facility Category

A Facility Category is a managed label used to group Facilities for browsing and administration.

In the MVP, each Facility belongs to one Facility Category.

## Facility Image

A Facility Image is a public image for a Facility.

Facility Images are shown in student browsing. Exactly one active Facility Image should be treated as the cover image for catalog cards, while Facility detail may show multiple active Facility Images.

## Facility Catalog

The Facility Catalog is the student browsing Module for public Facility information.

It lists active Facilities for comparison and exposes Facility detail with public information: images, contact details, price or free status, open-hours summary, and review summary placeholders. The Facility Catalog should not expose private staff, reservation, payment, or student data.

## Public Facility Reviews

Public Facility Reviews are the visible Facility Review facts shown in the Facility Catalog.

Public Facility Reviews own deleted-review filtering and visible rating summaries so the Facility Catalog can expose reviews without knowing Facility Review moderation state rules.

## Public Facility Calendar

Public Facility Calendar is the Facility Catalog view of Reservation time blocks that students may see for a Facility.

Public Facility Calendar owns which Facility Reservation statuses appear as public calendar entries so persistence Adapters do not encode public visibility rules.

## Facility Catalog Reader

A Facility Catalog Reader is the read Seam for public Facility Catalog records.

It gives the Facility Catalog public Facility records and public calendar reservation records without exposing database records, private reservation data, or ORM relationship loading details.

## Facility Availability Reader

A Facility Availability Reader is the read Seam for Facility availability facts.

It loads the Facility availability facts for a candidate reservation time in one read so availability workflows do not need to choreograph database Adapter queries or know the query Implementation.

## Facility Availability

Facility Availability decides whether a Facility can accept a candidate reservation time.

It owns the rules for open-hours fit, blackout overlap, and blocking reservation overlap. Callers should ask for availability reasons, not inspect Facility, Blackout, or Reservation persistence records directly.

## Reservation Time Selection

Reservation Time Selection is the student-facing validation Module for a candidate reservation start and end time.

It combines local time rules, booking window rules, and Facility Availability into one result so callers do not need to know validation ordering or reason-message mapping.

## Reservation Submission Conflict Guard

A Reservation Submission Conflict Guard is the write-path Module that protects Reservation submission from creating a Facility Reservation that overlaps an existing blocking Reservation.

Reservation Time Selection can tell students whether a candidate time appears acceptable before submission, but Reservation submission must still ask the Reservation Submission Conflict Guard before holding the Facility time.

## Facility Reservation Lifecycle

Facility Reservation Lifecycle owns the status transitions and effective-status rules for a Facility Reservation.

Reservation, Approval Letter, Payment, Cancellation, Deadline Worker, and Review callers should ask the Facility Reservation Lifecycle to move or interpret a Facility Reservation instead of comparing raw reservation statuses directly.

## Staff Reservation Review Access

Staff Reservation Review Access decides whether a Staff User account may review a Facility Reservation for a Facility they are assigned to.

Approval Letter, Payment, and Cancellation callers should ask Staff Reservation Review Access for an assigned Facility Reservation instead of knowing how staff assignments and Reservation existence checks are queried.

## Assigned Facility Access

Assigned Facility Access decides whether a Staff User account may manage a Facility assigned to them.

Facility Management callers should ask Assigned Facility Access for an assigned Facility instead of knowing how Facility existence and staff assignment checks are queried.

## Organization Unit

An Organization Unit is a student organization or campus unit that can be associated with a Facility Reservation.

Active Organization Units are available for student selection. Inactive Organization Units keep their history but should not be offered for new student-facing reservation choices.

## Organization Unit Repository

An Organization Unit Repository is the persistence Seam for Organization Unit records.

It lets Organization Unit Management create, update, activate, deactivate, and list Organization Units without knowing the database Adapter, ORM record shape, or mutation Implementation.

## Organization Unit Management

Organization Unit Management is the admin workflow for creating, updating, activating, and deactivating Organization Units.

It owns Organization Unit profile rules, including duplicate-name handling, so HTTP routes and callers do not need to know database constraint details.

## HTTP Application

The HTTP Application is the runtime shell that adapts HTTP requests to User account workflows and Access Policy checks.

It owns FastAPI route registration and dependency assembly, but it should not own account, policy, settings, or persistence rules.

## Runtime Dependency Registry

A Runtime Dependency Registry is the HTTP Application assembly Module that provides grouped route dependencies and owns database schema creation.

It lets the HTTP Application register routes without knowing every workflow factory, storage Adapter, session dependency, or authentication dependency Implementation.

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

## Facility Catalog Reader

A Facility Catalog Reader is the read Seam for public Facility Catalog records.

It gives the Facility Catalog public Facility records and public calendar reservation records without exposing database records, private reservation data, or ORM relationship loading details.

## Facility Availability Reader

A Facility Availability Reader is the read Seam for Facility availability facts.

It lets availability workflows check active Facility existence, open hours, blackout periods, and overlapping reservation facts without knowing the database Adapter or query Implementation.

## Facility Availability

Facility Availability decides whether a Facility can accept a candidate reservation time.

It owns the rules for open-hours fit, blackout overlap, and blocking reservation overlap. Callers should ask for availability reasons, not inspect Facility, Blackout, or Reservation persistence records directly.

## Reservation Time Selection

Reservation Time Selection is the student-facing validation Module for a candidate reservation start and end time.

It combines local time rules, booking window rules, and Facility Availability into one result so callers do not need to know validation ordering or reason-message mapping.

## Organization Unit

An Organization Unit is a student organization or campus unit that can be associated with a Facility Reservation.

Active Organization Units are available for student selection. Inactive Organization Units keep their history but should not be offered for new student-facing reservation choices.

## Organization Unit Management

Organization Unit Management is the admin workflow for creating, updating, activating, and deactivating Organization Units.

It owns Organization Unit profile rules, including duplicate-name handling, so HTTP routes and callers do not need to know database constraint details.

## HTTP Application

The HTTP Application is the runtime shell that adapts HTTP requests to User account workflows and Access Policy checks.

It owns FastAPI route registration and dependency assembly, but it should not own account, policy, settings, or persistence rules.

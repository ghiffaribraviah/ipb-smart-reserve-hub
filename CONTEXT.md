# Domain Context

## User Account

A User account is the campus login record for exactly one MVP role: `student`, `staff`, or `super_admin`.

Student User accounts are created through self-registration and must use an allowed institutional email domain. Staff and Super Admin User accounts are admin-created. Inactive User accounts keep their history but cannot log in or refresh sessions.

## Access Policy

An Access Policy decides whether an active User account may perform a role-limited action.

In the MVP, shell access is exact-role access: Student User accounts enter the student shell, Staff User accounts enter the staff shell, and Super Admin User accounts enter the admin shell.

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

## Facility Repository

A Facility Repository is the persistence Seam for Facility records.

It lets Facility browsing and future reservation workflows look up active Facilities without knowing the database Adapter or query Implementation.

## HTTP Application

The HTTP Application is the runtime shell that adapts HTTP requests to User account workflows and Access Policy checks.

It owns FastAPI route registration and dependency assembly, but it should not own account, policy, settings, or persistence rules.

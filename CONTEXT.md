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

## HTTP Application

The HTTP Application is the runtime shell that adapts HTTP requests to User account workflows and Access Policy checks.

It owns FastAPI route registration and dependency assembly, but it should not own account, policy, settings, or persistence rules.

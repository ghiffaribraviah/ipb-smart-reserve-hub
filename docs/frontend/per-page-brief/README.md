# Frontend Page Briefs

This directory contains one page brief per HTML reference/screenshot pair. Page briefs are mandatory inputs before frontend implementation.

Rules:

- HTML references and screenshots are mandatory design source of truth.
- Page briefs own page-level backend integration details and backend gap entries.
- `docs/frontend/backend-gaps.md` only links to backend gap entries defined here.
- Filenames preserve reference ordering and use backend role language (`staff` for `Admin - ...` references).
- Technical descriptions are English; user-facing labels and status copy preserve Indonesian reference text.

## Coverage Notes

- `Admin - ...` HTML references map to `staff-*` page briefs.
- `Student - ...` HTML references map to `student-*` page briefs.
- `Super - ...` HTML references map to `super-*` page briefs.
- Shared reference boards are component contracts and are covered in `docs/frontend/per-component-brief/`.

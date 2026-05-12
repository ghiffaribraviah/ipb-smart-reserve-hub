# Frontend Design Source Of Truth

The intended frontend design is defined by:

1. Source HTML files in `docs/frontend/html-reference/`.
2. Canonical target screenshots in `docs/frontend/screenshots/`.
3. This document, as the reference-derived design contract.

When this document disagrees with the revised HTML references or screenshots, update the HTML reference and this document together. Do not translate the references back into the older generic Satoshi/Emerald design system.

## Visual Direction

IPB Smart Reserve Hub is a practical campus reservation product. The UI should feel institutional, calm, and task-focused: clear navigation, readable forms, compact data, and enough whitespace for mobile workflows to breathe.

Use the revised pages as the standard:

- Admin pages: dense operational screens with compact tables/cards and clear action states.
- Student pages: green-led reservation flows, card-based facility browsing, lightweight booking summaries, and read-only profile/detail surfaces.
- Super Admin pages: indigo-accent operational dashboards with dense KPI, governance table, and activity-log patterns.
- Login/Register: consistent split/auth layouts with the same Inter typography, control sizing, and green primary actions.

Avoid marketing-page flourishes, one-off palettes, oversized decorative cards, and mixed visual systems inside the same flow.

## Language And Copy

- Revised references use Indonesian user-facing copy by default.
- Keep role/product nouns stable: `Reservasi`, `Fasilitas`, `Profil`, `Dashboard`, `Super Admin`, `IPB SRH`.
- Buttons and commands use normal Indonesian casing, for example `Detail Reservasi`, `Ajukan Pembatalan`, `Tulis Ulasan`, `Kirim Ulasan`, `Keluar`, `Ekspor Laporan`, and `Tambah Admin`.
- Status labels must be explicit Indonesian text, not English placeholders: `Disetujui`, `Menunggu Pembayaran`, `Menunggu Verifikasi Dokumen`, `Selesai`, `Ditolak`, `Dibatalkan`, `Aktif`, and `Nonaktif`.
- Dates and times in revised references use Indonesian formatting and 24-hour time, for example `24 Oktober 2024` and `09:00 - 13:00`.
- Do not keep mockup-only English strings such as `Search...`, `All rights reserved`, `Upcoming`, `Pending`, `Cancel`, `Add Review`, or `View Document` in revised Indonesian pages.

## Typography

- Primary UI family: `Inter`, falling back to system sans-serif.
- Brand/logo display family: `Playfair Display`, used only for the `IPB SRH` wordmark.
- Body text and controls: 14-16px, regular or medium weight.
- App page titles: 24-34px depending on page density and viewport.
- Section headings: 20-24px.
- Labels: 10-12px uppercase only for field labels, step labels, table labels, and metadata labels.
- Buttons and user-facing commands should use normal Indonesian title/sentence casing, not all caps.
- Letter spacing should be subtle and reserved for small labels; do not use negative letter spacing.

## Color And Tone

Use these shared tokens unless a reference page has a documented exception:

- Brand green: `#10b981`.
- Brand green dark/hover: `#059669` or page-local `#0f9d58` where already used in revised references.
- Deep logo green: `#1d7667`.
- Footer logo green: `#4da38b`.
- Primary text: `#111827`.
- Secondary text: `#6b7280`.
- Muted placeholder text: `#9ca3af`.
- Border neutral: `#e5e7eb`.
- Page backgrounds: `#ffffff`, `#f8fafc`, `#f9fafb`.
- Input background: `#ffffff` or `#f8fafc`.
- Success surfaces: pale green fills such as `#e8f5e9`, `#ecfdf5`, or `#dcfce7`.
- Error/declined surfaces: pale red fills from the reservation references.
- Super Admin uses the reference indigo accent `#6366f1` for primary actions, profile affordance, and operational links; do not force student green into Super Admin-only surfaces.
- Warning/cancellation-request actions may use amber text/borders, such as `#92400e` on `#fffbeb` with `#fde68a`.
- Neutral waiting/review states may use gray pills; payment-waiting states may use amber pills; approved/completed states use green pills; rejected/declined states use red pills.

Avoid introducing new dominant palettes. A page should not read as a separate product unless it is intentionally a separate role surface.

## Shared Chrome

All student pages must use the Student 00 header/footer pattern:

- Fixed white top nav, `80px` desktop height and `64px` mobile height.
- Desktop logo is two-line `IPB` / `SRH`; mobile logo displays inline as `IPB SRH`.
- Desktop header includes search, centered nav links, notification action, and profile circle.
- Mobile header shows hamburger, inline logo, notification, and profile circle; desktop nav/search are hidden.
- Student desktop nav uses `Beranda`, `Fasilitas`, `Reservasi`, and `Profil` when the profile route is in scope. Reservation workflow pages may keep only the relevant primary nav set when matching their reference.
- Footer uses the large Playfair `IPB SRH` mark, Indonesian copyright text, and simple links. Mobile footer is centered.

Admin pages should use the Admin 00 header conventions consistently across admin references.

Super Admin pages use their own top navigation:

- Fixed white top nav with the same `IPB SRH` brand mark.
- Desktop nav labels are `Dashboard`, `Pengguna`, `Fasilitas`, `Laporan`, and `Sistem`.
- No stray desktop hamburger or search input should appear unless a revised Super Admin reference explicitly adds one.
- Mobile shows hamburger, inline brand, notification, and `SA` profile circle; desktop nav links are hidden.
- Footer links mirror Super Admin sections and use Indonesian copyright text.

## Layout

- Desktop content generally centers in a `1200px` container with `95%` max width.
- Mobile target is `390 x 844`; every revised page must be checked at this viewport.
- Mobile pages must not horizontally scroll.
- Use full-width page sections or direct content containers. Do not nest decorative cards inside cards.
- Cards should be used for functional units: facility items, forms, summaries, payment widgets, review items, and modal-like panels.
- Desktop reservation workflow pages use two-column layouts when useful: main form/calendar plus right summary/sidebar.
- Mobile reservation workflow pages stack vertically with the primary next action clearly visible after the current task section.
- Dashboard pages use dense grids and tables on desktop, then convert tables to readable mobile cards without horizontal scrolling.
- Profile pages use a sidebar identity card plus main information card on desktop, then stack cards on mobile.

## Cards, Forms, And Controls

- Cards: white surface, `12px` desktop radius, `14px` mobile radius when extra touch comfort is useful.
- Card borders: neutral `#e5e7eb` or a very light `rgba(226, 232, 240, 0.9)`.
- Card shadows: subtle neutral shadow, not heavy colored shadow.
- Inputs: 50-52px mobile height, 8-10px radius, neutral border, green focus/action state.
- Textareas: at least 100-118px on mobile when used for descriptions.
- Filter/search controls on mobile should stack label-over-control and use full available width.
- Checkbox option rows should be compact touch targets around 56-60px high on mobile, with normal-case option text.
- Read-only information grids use small uppercase labels with normal-value text. On mobile, long labels and values must wrap inside the card.
- Document rows use neutral row cards, clear file metadata, status text, and action links. Long filenames must wrap within the document card.
- Rating inputs use accessible radio semantics with large star targets; selected/hovered stars use amber.

## Buttons And Actions

- Primary actions are green filled buttons with white text.
- Desktop primary buttons are compact but readable; mobile primary buttons should be full-width when they advance a flow.
- Button radius is usually 8-10px.
- Minimum touch height is 44px; flow-advancing mobile actions should be about 52px.
- User-facing button text uses Indonesian normal casing, for example `Lanjutkan`, `Reservasi Sekarang`, or `Lanjut ke Konfirmasi`.
- Secondary/back actions are text buttons or quiet outline controls. They should not visually compete with the primary action.
- Destructive or session-ending actions, such as `Keluar`, use a red-tinted quiet button rather than a heavy primary button.
- Cancellation-request actions are not destructive-confirm red by default; use quiet amber styling for `Ajukan Pembatalan`.
- Super Admin primary actions use indigo filled buttons; secondary dashboard actions use quiet outline buttons.

## Reservation Workflow

Student reservation steps must share one visual language:

- Desktop stepper: centered, three steps, green active/completed state, gray inactive connectors.
- Mobile stepper: compact three-step layout that fits 390px, wraps labels under each circle, and avoids label collision.
- Step 1 time selection: calendar and time card use the same white-card, subtle-border style.
- Step 2 detail form: form controls, summary card, policy box, and primary action must match Step 1 spacing, radii, and casing.
- Step 3/confirmation pages should continue the same card rhythm and Indonesian copy.
- Reservation status pages use compact centered status cards with the same summary rows, green primary CTA, and Indonesian status copy.
- Payment upload pages use the same summary card spacing as verification pages; mobile summaries must breathe and avoid cramped rows.
- Reservation accepted pages use the same completed workflow rhythm and route onward with `Lihat Detail Reservasi`.

## Reservation Lists And Details

- Student reservation lists use horizontal image/content/action cards on desktop and stacked cards on mobile.
- Reservation list cards use realistic mixed statuses instead of repeated placeholders. Terminal history cards do not show cancellation actions.
- Ongoing approved reservations use `Ajukan Pembatalan`; pre-approval or pending states may use `Batalkan`; completed/rejected/cancelled history cards show only `Detail Reservasi`.
- Status badges must be readable on mobile; long labels such as `Menunggu Verifikasi Dokumen` may wrap within a constrained pill.
- Reservation detail pages use a large facility heading, compact metadata, asymmetric gallery on desktop, simplified stacked gallery on mobile, information cards, and a `Dokumen Reservasi` section.
- Approved detail pages show `Ajukan Pembatalan`; completed detail pages show `Tulis Ulasan`.
- Document/payment rows show Indonesian filenames and metadata, `Terverifikasi` status, and action links such as `Lihat Dokumen` or `Lihat Bukti`.
- Mobile document rows stack file metadata and actions, and long filenames must wrap without causing horizontal overflow.

## Review And Profile Pages

- Review pages use a two-column desktop layout: form card plus reservation summary card. Mobile stacks form first, summary second.
- Review forms contain required rating and optional `Komentar`; do not include a separate review-title field unless the backend contract changes.
- Mobile review actions are full-width stacked buttons, with `Kirim Ulasan` as the green primary action.
- Student profile pages are read-only for MVP: identity card, active badge, logout action, and academic information.
- Profile information includes NIM, phone, program study, faculty, entry year, and degree/strata when available.
- Mobile profile information uses a single-column label/value layout for readability.

## Super Admin Dashboard

- Preserve the Super Admin indigo accent and operational dashboard tone.
- Desktop layout uses four KPI cards followed by a two-column content area: administrator governance table and system activity log.
- Mobile layout stacks KPI cards, converts the administrator table into cards, and keeps the activity log as a compact list.
- Super Admin dashboard labels and activity copy are Indonesian, while product/role terms such as `Super Admin` may remain as role names.
- KPI examples use Indonesian labels: `Total Pengguna`, `Fasilitas Aktif`, `Total Reservasi`, and `Kesehatan Sistem`.
- Activity and table timestamps use Indonesian relative/time text such as `2 menit lalu`, `Hari ini, 09:42`, and `Kemarin, 23:30`.
- Super Admin footer links are `Dashboard`, `Pengguna`, `Fasilitas`, `Laporan`, and `Sistem`.

## Media

- Reference screenshots must use deterministic fixtures for remote images.
- Facility media should show the same green/gold IPB SRH placeholder treatment in reference screenshots unless real local assets are provided.
- Do not depend on remote placeholder or Unsplash URLs for screenshot baselines.

## Verification Rule

Every meaningful visual change must regenerate both desktop `1440 x 900` and mobile `390 x 844` screenshots. Check mobile for horizontal overflow before asking for review.

Acceptance is reference-faithful, not pixel-perfect while local Inter and Playfair Display font files are not bundled. Layout, hierarchy, spacing, copy, responsive behavior, state styling, media rendering, and overflow issues must be fixed even when typography-sensitive pixel diffs are temporarily tolerated.

Bundling local Inter and Playfair Display font files is required before typography-sensitive screenshot diffs become final approval gates. Until then, typography-sensitive diffs are provisional only; non-typographic visual defects remain blockers.

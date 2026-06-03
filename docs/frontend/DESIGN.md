# Frontend Design Source Of Truth

The intended frontend design is defined by:

1. Source HTML files in `docs/frontend/html-reference/`.
2. Canonical target screenshots in `docs/frontend/screenshots/`.
3. This document, as the reference-derived design contract.

When this document disagrees with the revised HTML references or screenshots, update the HTML reference and this document together. Do not translate the references back into the older generic Satoshi/Emerald design system.

## Visual Direction

IPB Smart Reserve Hub is a practical campus reservation product. The UI should feel institutional, calm, and task-focused: clear navigation, readable forms, compact data, and enough whitespace for mobile workflows to breathe.

Use the revised pages as the standard:

- Staff/Admin pages: dense operational screens with compact tables/cards and clear review action states.
- Student pages: green-led reservation flows, card-based facility browsing, lightweight booking summaries, and read-only profile/detail surfaces.
- Super Admin pages: logo-green-accent operational dashboards with dense KPI, governance table, and activity-log patterns.
- Login/Register: consistent split/auth layouts with the same Inter typography, control sizing, and green primary actions.
- Shared references: state boards, upload/calendar boards, mobile drawer, shell variants, primitives, workflow components, and data display components are implementation contracts, not decorative examples.

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

- Brand green: `#0f9d58` for the revised shell/component references; `#10b981` remains an accepted legacy alias where older page references already use it.
- Brand green dark/hover: `#0b7340`, `#059669`, or page-local hover values already present in revised references.
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
- Super Admin uses logo-derived green `#0f9d58` for primary actions, active navigation, profile affordance, and operational links.
- Icons are line-based and inherit their parent text/action color; icon containers may use pale semantic fills, but the icon itself should stay simple and one-color.
- Warning/cancellation-request actions may use amber text/borders, such as `#92400e` on `#fffbeb` with `#fde68a`.
- Staff document/payment verification states use amber pills. Staff student-action waiting states that are still viable, such as `Menunggu Unggah Dokumen` and `Menunggu Pembayaran`, use blue pills. Approved/completed states use green pills; rejected/expired/cancelled states use red pills; neutral administrative states use gray pills.

Avoid introducing new dominant palettes. A page should not read as a separate product unless it is intentionally a separate role surface.

## Iconography

- Use `lucide-react` for frontend implementation. HTML references embed equivalent Lucide-style inline SVGs so screenshot capture remains deterministic.
- Icons should be simple outline icons with `fill="none"`, `stroke="currentColor"`, round caps/joins, and roughly `18-20px` default size inside buttons, nav actions, cards, and table actions.
- Do not use colorful emoji, multicolor pictograms, or icon-only text replacements. If an icon needs a label, keep the label as real text beside or below the icon.
- Semantic color comes from the surrounding control or container: green for positive/primary, amber for caution/cancellation requests, red for destructive/rejection/logout, green for Super Admin operational accents, and gray for neutral utilities.
- File type chips may use short text such as `PDF` or `JPG`; problem or action states should use Lucide-style icons such as alert, check, clock, upload, download, search, bell, users, building, monitor, calendar, settings, and x.

## Shared Chrome

Student and staff pages use the green-accent shell; Super Admin uses the logo-green-accent shell. Treat `Shared - 05 - Layout Shells.html` as the compact shared shell reference and role pages as the page-specific expanded examples.

All student pages must use the shared compact shell pattern:

- Fixed white top nav, `72px` desktop height and `64px` mobile height.
- Desktop logo is two-line `IPB` / `SRH`; mobile logo displays inline as `IPB SRH`.
- Desktop header includes search, centered nav links, notification action, and profile circle.
- Mobile header shows hamburger, inline logo, notification, and profile circle; desktop nav/search are hidden.
- Student desktop nav uses only `Beranda`, `Fasilitas`, and `Reservasi`. Profile access is represented by the profile circle, not a fourth nav link.
- Student search is a rounded search control with a Lucide-style search icon, neutral border, pale background, and placeholder such as `Cari fasilitas...`.
- Footer uses the Playfair `IPB SRH` mark, Indonesian copyright text, and the same simple section links as the shell. The compact shared shell footer keeps brand/copyright grouped on the left and links on the right; mobile footer is centered.

Staff/Admin pages should use the shared compact staff shell consistently across admin references:

- Staff desktop nav uses `Beranda`, `Reservasi`, and `Fasilitas`; reservation review pages may visually emphasize `Reservasi`.
- Staff search is rounded with a Lucide-style search icon and reservation-oriented placeholder such as `Cari reservasi...`.
- Review table actions use icon buttons with tooltips/titles for download, verify, and reject actions. Do not replace these action icons with text-only controls.
- Staff footer mirrors the green shell footer with `Beranda`, `Reservasi`, and `Fasilitas`.

Super Admin pages use their own shared compact top navigation:

- Fixed white top nav with the same `IPB SRH` brand mark, `72px` desktop height, and `64px` mobile height.
- Desktop nav labels are `Dashboard`, `Pengguna`, `Fasilitas`, `Laporan`, and `Sistem`.
- No stray desktop hamburger or search input should appear unless a revised Super Admin reference explicitly adds one.
- Mobile shows hamburger, inline brand, notification, and `SA` profile circle; desktop nav links are hidden.
- Footer links mirror Super Admin sections and use Indonesian copyright text.

Across all shells, the footer should feel quiet and balanced: no cramped link stacks, no oversized copy blocks next to tiny links, and no English copyright text.

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
- Search and filter controls should not look like plain text boxes: include an icon where useful, keep a rounded/pill shape for top-nav search, use pale neutral fills such as `#f1f5f9` or `#f8fafc`, and show clear focus borders.
- Textareas: at least 100-118px on mobile when used for descriptions.
- Filter/search controls on mobile should stack label-over-control and use full available width.
- Checkbox option rows should be compact touch targets around 56-60px high on mobile, with normal-case option text.
- Read-only information grids use small uppercase labels with normal-value text. On mobile, long labels and values must wrap inside the card.
- Document rows use neutral row cards, clear file metadata, status text, and action links. Desktop rows use icon/file type, flexible metadata, then a separated right-side status/action area with enough width and gap. On mobile, the right-side status/action area moves below the metadata with a top divider.
- Long filenames must wrap within the document card. Status badges and action buttons must not collide with each other or with file metadata at desktop or mobile sizes.
- Rating inputs use accessible radio semantics with large star targets; selected/hovered stars use logo green.

## Buttons And Actions

- Primary actions are green filled buttons with white text.
- Desktop primary buttons are compact but readable; mobile primary buttons should be full-width when they advance a flow.
- Button radius is usually 8-10px.
- Minimum touch height is 44px; flow-advancing mobile actions should be about 52px.
- User-facing button text uses Indonesian normal casing, for example `Lanjutkan`, `Reservasi Sekarang`, or `Lanjut ke Konfirmasi`.
- Secondary/back actions are text buttons or quiet outline controls. They should not visually compete with the primary action.
- Destructive or session-ending actions, such as `Keluar`, use a red-tinted quiet button rather than a heavy primary button.
- Rejection actions such as `Tolak Dokumen` use red-tinted styling. Disabled/loading actions such as `Memproses` use neutral gray styling with reduced affordance.
- Cancellation-request actions are not destructive-confirm red by default; use quiet amber styling for `Ajukan Pembatalan`.
- Button rows inside upload, payment, document, and reservation status panels need visible breathing room: use `12-14px` gaps, wrap where needed, and stack to full width on mobile.
- Super Admin primary actions use logo-green filled buttons; secondary dashboard actions use quiet outline buttons.

## Reservation Workflow

Student reservation steps must share one visual language:

- Desktop stepper: centered three-step grid with a gray connector line and green progress line. Completed steps use a pale green filled circle/check, the active step uses a white circle with green border and pale focus ring, and inactive steps use quiet gray.
- Mobile stepper: compact three-step layout that fits 390px, wraps labels under each circle, and avoids label collision. Step labels stay short, for example `Pilih Waktu`, `Detail Reservasi`, and `Surat`.
- Step 1 time selection: calendar and time card use the same white-card, subtle-border style.
- Step 2 detail form: form controls, summary card, policy box, and primary action must match Step 1 spacing, radii, and casing.
- Step 3/confirmation pages should continue the same card rhythm and Indonesian copy.
- Reservation status pages use compact centered status cards with the same summary rows, green primary CTA, and Indonesian status copy.
- Payment upload pages use the same summary card spacing as verification pages; mobile summaries must breathe and avoid cramped rows.
- Reservation accepted pages use the same completed workflow rhythm and route onward with `Lihat Detail`.
- Document status panels show each document as a row with a file/type marker, filename, metadata, semantic badge, and action button. The status/action column must be visually separated on desktop and stacked below on mobile.
- Upload panels use dashed or subtle bordered surfaces, a clear title, file constraints, selected-file text such as `Belum ada file dipilih`, and a button row with enough gap between `Pilih File` and `Unggah`/`Kirim`.
- Reservation status panels may pair a green confirmation icon with primary and caution actions, for example `Lihat Detail` and `Ajukan Pembatalan`, with buttons spaced enough to avoid a crowded footer.

## Reservation Lists And Details

- Student reservation lists use horizontal image/content/action cards on desktop and stacked cards on mobile.
- Reservation list cards use realistic mixed statuses instead of repeated placeholders. Terminal history cards do not show cancellation actions.
- Ongoing approved reservations use `Ajukan Pembatalan`; pre-approval or pending states may use `Batalkan`; completed/rejected/cancelled history cards show only `Lihat Detail`.
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

- Preserve the Super Admin logo green accent and operational dashboard tone.
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

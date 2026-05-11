# IPB Smart Reserve Hub

IPB Smart Reserve Hub dirancang sebagai website reservasi fasilitas kampus yang mempertemukan mahasiswa, staff pengelola fasilitas, dan Super Admin dalam satu alur layanan. Pada akhirnya, mahasiswa dapat mencari fasilitas, mengecek ketersediaan jadwal, mengajukan reservasi, mengunggah dokumen, melakukan pembayaran bila diperlukan, menerima notifikasi, serta memberi review setelah kegiatan selesai. Staff fasilitas dapat mengelola fasilitas yang ditugaskan, memverifikasi dokumen dan pembayaran, menangani pembatalan, serta memantau review. Super Admin mengelola user, unit organisasi, assignment staff, pengaturan booking, moderasi review, audit log, dan status sistem.

Status implementasi saat ini:

| Area | Status | Keterangan |
| --- | --- | --- |
| Frontend | Pengembangan | Aplikasi Vite React TypeScript tersedia di `frontend/`. Login dan student shell sudah terintegrasi. |
| Backend/API | Selesai | Fondasi API dan business workflow utama sudah tersedia dan tercakup test. |

## Ringkasan Fitur

- Autentikasi berbasis Bearer token untuk mahasiswa, staff, dan Super Admin.
- Katalog fasilitas, detail fasilitas, kalender publik, dan pengecekan ketersediaan.
- Pengaturan booking seperti batas waktu upload dokumen, review staff, pembayaran, dan domain email mahasiswa.
- Reservasi mahasiswa dengan proteksi konflik slot.
- Surat persetujuan otomatis, upload surat bertanda tangan, dan review dokumen oleh staff fasilitas.
- Upload bukti pembayaran dan review pembayaran untuk fasilitas berbayar.
- Deadline worker untuk expired, overdue verification, dan completed status.
- Cancellation workflow untuk pembatalan sebelum approval dan pengajuan pembatalan setelah approval.
- In-app notifications dengan read/unread timestamp.
- Review dan rating fasilitas setelah reservasi selesai.
- Audit log untuk tindakan operasional penting.
- Health check dan system status untuk deployment readiness.

## Struktur Repository

```text
app/
  api/routes/        Endpoint FastAPI per area fitur.
  core/              Konfigurasi, database, security, access policy, factory modul.
  models/            SQLAlchemy ORM model dan enum domain.
  repositories/      Query dan persistence database.
  schemas/           Pydantic request/response schema.
  services/          Business logic utama aplikasi.
  storage/           Abstraksi storage file private.
docs/                Dokumentasi proyek dan deployment.
tests/               Test behavior/API dan service workflow.
```

Business logic utama berada di `app/services`, bukan di class ORM. Class ORM di `app/models` dipakai sebagai mapping database: tabel, field, enum, dan relationship. Repository di `app/repositories` menjadi batas akses database, sedangkan route FastAPI memanggil service melalui dependency factory di `app/core/module_factories.py`.

## Koneksi Antar Komponen

Alur request backend secara umum:

```text
Client
  -> FastAPI route di app/api/routes
  -> AccessPolicyModule untuk cek role
  -> Service module di app/services
  -> Repository di app/repositories
  -> SQLAlchemy ORM model di app/models
  -> Database
```

Contoh alur reservasi:

1. Mahasiswa login dan mengirim `POST /facilities/{facility_id}/reservations`.
2. Route memvalidasi role student.
3. `ReservationModule` mengecek fasilitas aktif, unit organisasi aktif, open hour, blackout, dan konflik reservasi.
4. Repository menyimpan reservation dengan status `pending_document_upload`, termasuk `extra_requirements` bila mahasiswa meminta dukungan AV, koordinasi logistik, cleaning tambahan, personel keamanan, atau catatan operasional.
5. Notification module membuat notifikasi awal untuk mahasiswa.

## Menjalankan Project Lokal

Project memakai Python 3.12 dan `uv`.

```sh
uv sync --extra dev
uv run uvicorn app.main:create_app --factory --reload
```

Secara default aplikasi memakai SQLite lokal:

```text
sqlite+pysqlite:///./ipb_smart_reserve_hub.db
```

Saat aplikasi start, schema SQLAlchemy dibuat otomatis melalui runtime FastAPI. Untuk production, lihat `docs/backend-deployment.md`.

### Dev Seed Data

Untuk mengisi database lokal dengan data demo frontend yang konsisten:

```sh
uv run python -m app.dev.seed
```

Command ini hanya untuk development dan akan menolak berjalan saat `IPB_ENVIRONMENT=production`. Command aman dijalankan berulang kali; data seed yang sama akan diperbarui tanpa membuat duplikat user, fasilitas, unit organisasi, open hour, gambar, assignment staff, atau reservasi blocking.

Credential lokal yang dibuat:

| Role | Email | Password |
| --- | --- | --- |
| Student | `demo.student@apps.ipb.ac.id` | `demo12345` |
| Staff | `demo.staff@ipb.ac.id` | `demo12345` |
| Super Admin | `demo.admin@ipb.ac.id` | `demo12345` |

Seed juga membuat synthetic Student `demo.blocking@apps.ipb.ac.id` untuk pemilik reservasi blocking kalender publik. Akun demo Student utama sengaja dibiarkan tanpa reservasi awal agar alur frontend baru mudah diverifikasi.

## Frontend

Frontend adalah aplikasi Vite React TypeScript di `frontend/`.

```sh
cd frontend
npm install
npm run dev          # dev server (default port 5173)
npm run build        # production build
npm test             # jalankan test
npm run test:watch   # test dalam watch mode
```

Backend base URL dikonfigurasi melalui environment variable `VITE_API_BASE_URL` (default: `http://localhost:8000`).

## Testing

Jalankan semua test backend:

```sh
uv run --extra dev pytest -q
```

Test dirancang behavior-first melalui API/service publik. Ini sesuai workflow TDD repository.

## Environment Variables

Ada variabel environment yang relevan. Karena itu repository menyediakan `.env.example` sebagai template. File `.env` lokal diabaikan oleh git.

| Variable | Wajib | Default | Keterangan |
| --- | --- | --- | --- |
| `IPB_ENVIRONMENT` | Tidak untuk lokal, ya untuk production | development implicit | Set `production` di deployment agar validasi konfigurasi aman aktif. |
| `IPB_DATABASE_URL` | Ya di production | `sqlite+pysqlite:///./ipb_smart_reserve_hub.db` | SQLAlchemy database URL. Gunakan PostgreSQL untuk production. |
| `IPB_SECRET_KEY` | Ya di production | `dev-secret-change-me` | Secret untuk signing token. Harus diganti di production. |
| `IPB_ALLOWED_STUDENT_EMAIL_DOMAINS` | Tidak | `apps.ipb.ac.id` | Domain email mahasiswa yang boleh self-register, pisahkan dengan koma. |

Contoh production:

```env
IPB_ENVIRONMENT=production
IPB_DATABASE_URL=postgresql+psycopg://user:password@host:5432/ipb_smart_reserve_hub
IPB_SECRET_KEY=change-with-strong-random-secret
IPB_ALLOWED_STUDENT_EMAIL_DOMAINS=apps.ipb.ac.id
```

Catatan: aplikasi membaca environment dari process OS. Jika memakai file `.env` lokal, export dulu variabelnya atau gunakan tooling shell yang memuat `.env`.

## Autentikasi dan Role

Endpoint yang memerlukan login memakai header:

```http
Authorization: Bearer <access_token>
```

Role yang dipakai:

- `student`: mahasiswa, membuat dan mengelola reservasi sendiri.
- `staff`: staff fasilitas, mengelola fasilitas yang ditugaskan dan mereview workflow terkait fasilitas tersebut.
- `super_admin`: admin sistem, mengelola user, assignment staff, settings, moderation, audit log, dan system status.

## Daftar API

### Health dan Status

| Method | Endpoint | Role | Kegunaan |
| --- | --- | --- | --- |
| `GET` | `/health` | Public | Smoke check backend, database, dan metadata aplikasi. |
| `GET` | `/admin/system-status` | Super Admin | Melihat status backend, database, storage, worker, dan aplikasi. |

### Auth dan User

| Method | Endpoint | Role | Kegunaan |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Public | Registrasi mahasiswa memakai domain email yang diizinkan. |
| `POST` | `/auth/login` | Public | Login dan mendapatkan access token. |
| `POST` | `/auth/refresh` | Authenticated | Refresh token aktif. |
| `POST` | `/admin/users` | Super Admin | Membuat akun staff atau Super Admin. |
| `GET` | `/student/shell` | Student | Verifikasi akses shell student. |
| `GET` | `/staff/shell` | Staff | Verifikasi akses shell staff. |
| `GET` | `/admin/shell` | Super Admin | Verifikasi akses shell admin. |

### Fasilitas Publik

| Method | Endpoint | Role | Kegunaan |
| --- | --- | --- | --- |
| `GET` | `/facility-categories` | Public | Daftar kategori fasilitas aktif untuk shortcut/filter, berisi `id`, `name`, `slug`, `icon_hint`, dan `facility_count` fasilitas aktif. |
| `GET` | `/facilities` | Public | Daftar fasilitas aktif dalam envelope paginated berisi `items`, `page`, `page_size`, `total_items`, dan `total_pages`. Query: `q`, `category`, `min_capacity`, `sort`, `page`, `page_size`, `featured`, `limit`. `featured=true` meranking fasilitas untuk student home berdasarkan cover aktif, jumlah review, rating, lalu nama; `limit` menjadi alias ukuran halaman featured. |
| `GET` | `/facilities/{facility_id}` | Public | Detail fasilitas aktif. |
| `GET` | `/facilities/{facility_id}/calendar` | Public | Kalender publik slot yang terblokir tanpa data privat. Query: `start`, `end`. |
| `GET` | `/facilities/{facility_id}/availability` | Public | Cek ketersediaan berdasarkan open hour, blackout, dan reservasi blocking. Query: `start`, `end`. |
| `POST` | `/facilities/{facility_id}/reservation-time-selection` | Public | Validasi pilihan waktu reservasi sebelum submit. |

### Reservasi Mahasiswa

| Method | Endpoint | Role | Kegunaan |
| --- | --- | --- | --- |
| `POST` | `/facilities/{facility_id}/reservations` | Student | Membuat reservasi dan hold slot jika valid. |
| `GET` | `/student/reservations` | Student | Melihat daftar reservasi milik mahasiswa. |
| `GET` | `/student/reservations/{reservation_id}` | Student | Melihat detail reservasi sendiri. |
| `POST` | `/student/reservations/{reservation_id}/cancel` | Student | Membatalkan reservasi sebelum approval. |
| `POST` | `/student/reservations/{reservation_id}/cancellation-request` | Student | Mengajukan pembatalan reservasi yang sudah approved dengan alasan. |

`POST /facilities/{facility_id}/reservations` menerima objek opsional `extra_requirements` berisi `av_support`, `logistics_coordination`, `extra_cleaning`, `security_personnel`, dan `notes`. Jika objek ini tidak dikirim, semua flag bernilai `false` dan `notes` bernilai `null`. Response create, list, dan detail reservasi mahasiswa mengembalikan objek `extra_requirements` yang tersimpan.

Response create, list, dan detail reservasi mahasiswa juga mengembalikan proyeksi workflow:

- `document`: metadata `approval_letter` dan `signed_approval_letter` jika sudah ada, `review_status`, dan `rejection_reason` untuk penolakan dokumen.
- `payment`: `required`, metadata `receipt` jika sudah ada, `review_status`, dan `rejection_reason` untuk penolakan pembayaran.
- `rejection`: `source` dan `reason` hanya untuk reservasi terminal `rejected`.

Nilai `ReservationStatus` tetap status lifecycle utama. Substate UI seperti upload-needed, waiting-review, dan declined harus dibaca dari proyeksi workflow, bukan dari enum status baru. Penolakan dokumen menyimpan `rejection_source=document`, penolakan pembayaran menyimpan `rejection_source=payment`, dan data rejected lama tanpa source diekspos sebagai `source=unknown`. Penolakan pembatalan tetap memakai `cancellation_rejection_reason` dan tidak mengisi `rejection`.

### Surat Persetujuan dan Review Dokumen

| Method | Endpoint | Role | Kegunaan |
| --- | --- | --- | --- |
| `GET` | `/student/reservations/{reservation_id}/approval-letter` | Student | Membuat atau mengambil metadata surat persetujuan. |
| `GET` | `/student/reservations/{reservation_id}/approval-letter/download` | Student | Download surat persetujuan milik mahasiswa. |
| `POST` | `/student/reservations/{reservation_id}/signed-approval-letter` | Student | Upload surat persetujuan bertanda tangan. File: PDF/JPG/JPEG/PNG max 5 MB. |
| `GET` | `/staff/reservations/{reservation_id}/signed-approval-letter/download` | Staff assigned | Download surat bertanda tangan untuk review. |
| `POST` | `/staff/reservations/{reservation_id}/document-review/approve` | Staff assigned | Approve dokumen. Gratis menjadi `approved`, berbayar menjadi `pending_payment`. |
| `POST` | `/staff/reservations/{reservation_id}/document-review/reject` | Staff assigned | Reject dokumen dengan alasan. |

### Pembayaran

| Method | Endpoint | Role | Kegunaan |
| --- | --- | --- | --- |
| `GET` | `/student/reservations/{reservation_id}/payment` | Student | Melihat instruksi pembayaran untuk reservasi berbayar yang menunggu pembayaran. |
| `POST` | `/student/reservations/{reservation_id}/payment-receipt` | Student | Upload bukti pembayaran. File: JPG/JPEG/PNG max 5 MB. |
| `GET` | `/staff/reservations/{reservation_id}/payment-receipt/download` | Staff assigned | Download bukti pembayaran untuk review. |
| `POST` | `/staff/reservations/{reservation_id}/payment-review/approve` | Staff assigned | Approve pembayaran dan mengaktifkan reservasi. |
| `POST` | `/staff/reservations/{reservation_id}/payment-review/reject` | Staff assigned | Reject pembayaran dengan alasan. |

### Review Pembatalan

| Method | Endpoint | Role | Kegunaan |
| --- | --- | --- | --- |
| `POST` | `/staff/reservations/{reservation_id}/cancellation-review/approve` | Staff assigned | Menyetujui pengajuan pembatalan dan mengubah status menjadi `cancelled`. |
| `POST` | `/staff/reservations/{reservation_id}/cancellation-review/reject` | Staff assigned | Menolak pengajuan pembatalan dengan alasan dan mengembalikan status ke `approved`. |

### Notifikasi

| Method | Endpoint | Role | Kegunaan |
| --- | --- | --- | --- |
| `GET` | `/notifications` | Student/Staff/Super Admin | Melihat inbox notifikasi terbaru. |
| `POST` | `/notifications/{notification_id}/read` | Student/Staff/Super Admin | Menandai notifikasi milik user sebagai dibaca. |

### Review dan Rating

| Method | Endpoint | Role | Kegunaan |
| --- | --- | --- | --- |
| `POST` | `/student/reservations/{reservation_id}/review` | Student | Mengirim review untuk reservasi yang sudah completed. |
| `DELETE` | `/student/reviews/{review_id}` | Student | Menghapus review sendiri secara soft-delete. |
| `GET` | `/staff/facilities/{facility_id}/reviews` | Staff assigned | Melihat review fasilitas yang ditugaskan. |
| `GET` | `/staff/facilities/{facility_id}/statistics` | Staff assigned | Melihat statistik fasilitas: rating, total reservasi, completed count. |
| `GET` | `/admin/reviews` | Super Admin | Moderasi daftar review dengan filter. |
| `POST` | `/admin/reviews/{review_id}/delete` | Super Admin | Soft-delete review dengan alasan moderasi. |
| `POST` | `/admin/reviews/{review_id}/restore` | Super Admin | Restore review yang dihapus admin. |

### Manajemen Fasilitas Staff dan Assignment

| Method | Endpoint | Role | Kegunaan |
| --- | --- | --- | --- |
| `PUT` | `/admin/facilities/{facility_id}/staff-assignments/{staff_id}` | Super Admin | Menugaskan staff ke fasilitas. |
| `DELETE` | `/admin/facilities/{facility_id}/staff-assignments/{staff_id}` | Super Admin | Menghapus assignment staff dari fasilitas. |
| `GET` | `/staff/facilities` | Staff | Melihat fasilitas yang ditugaskan. |
| `PATCH` | `/staff/facilities/{facility_id}` | Staff assigned | Mengubah profil fasilitas yang ditugaskan. |
| `POST` | `/staff/facilities/{facility_id}/deactivate` | Staff assigned | Menonaktifkan fasilitas yang ditugaskan. |
| `POST` | `/staff/facilities/{facility_id}/images` | Staff assigned | Menambah gambar fasilitas. |
| `POST` | `/staff/facilities/{facility_id}/open-hours` | Staff assigned | Menambah jam buka fasilitas. |
| `POST` | `/staff/facilities/{facility_id}/blackouts` | Staff assigned | Menambah blackout period fasilitas. |

### Unit Organisasi

| Method | Endpoint | Role | Kegunaan |
| --- | --- | --- | --- |
| `GET` | `/organization-units` | Public | Melihat unit organisasi aktif untuk form reservasi. |
| `POST` | `/admin/organization-units` | Super Admin | Membuat unit organisasi. |
| `PATCH` | `/admin/organization-units/{organization_unit_id}` | Super Admin | Mengubah profil unit organisasi. |
| `POST` | `/admin/organization-units/{organization_unit_id}/deactivate` | Super Admin | Menonaktifkan unit organisasi. |
| `POST` | `/admin/organization-units/{organization_unit_id}/activate` | Super Admin | Mengaktifkan kembali unit organisasi. |

### Booking Settings

| Method | Endpoint | Role | Kegunaan |
| --- | --- | --- | --- |
| `GET` | `/admin/settings` | Super Admin | Melihat aturan booking aktif. |
| `PATCH` | `/admin/settings` | Super Admin | Mengubah deadline/cutoff dan domain email mahasiswa. |

### Audit Log

| Method | Endpoint | Role | Kegunaan |
| --- | --- | --- | --- |
| `GET` | `/admin/audit-logs` | Super Admin | Melihat log tindakan dengan filter `actor_id`, `action_type`, `target_type`, `facility_id`, `student_id`, `reservation_id`, `created_from`, dan `created_to`. |

## Status Reservasi Utama

- `pending_document_upload`: reservasi dibuat, menunggu student upload surat bertanda tangan.
- `pending_document_review`: dokumen sudah diunggah, menunggu review staff.
- `pending_payment`: dokumen disetujui dan reservasi berbayar menunggu pembayaran.
- `overdue_verification`: staff melewati deadline review tetapi belum melewati final cutoff.
- `approved`: reservasi aktif.
- `cancellation_requested`: student meminta pembatalan approved reservation; slot tetap blocking sampai staff approve.
- `completed`: reservasi approved yang waktu akhirnya sudah lewat atau diproses worker.
- `cancelled`: reservasi dibatalkan.
- `rejected`: dokumen atau pembayaran ditolak.
- `expired`: reservasi melewati deadline/cutoff.

## Deployment

Repository sudah memiliki `railway.toml` untuk Railway/Nixpacks:

```sh
uvicorn app.main:create_app --factory --host 0.0.0.0 --port $PORT
```

Untuk production:

1. Set `IPB_ENVIRONMENT=production`.
2. Set `IPB_DATABASE_URL` ke PostgreSQL.
3. Set `IPB_SECRET_KEY` yang kuat.
4. Set `IPB_ALLOWED_STUDENT_EMAIL_DOMAINS` sesuai kebijakan kampus.
5. Jalankan smoke check `GET /health`.

Detail tambahan ada di `docs/backend-deployment.md`.

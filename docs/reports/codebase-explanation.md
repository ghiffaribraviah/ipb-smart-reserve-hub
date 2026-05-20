# Penjelasan Codebase IPB Smart Reserve Hub

Dokumen ini ditulis untuk membantu memahami codebase dengan bahasa yang lebih mudah, sambil menunjuk konsep OOP yang memang dipakai di repository ini.

## 1. Tujuan Aplikasi

`IPB Smart Reserve Hub` adalah aplikasi reservasi fasilitas kampus dengan 3 peran utama:

- `student`
  Mahasiswa mencari fasilitas, memilih waktu, membuat reservasi, unggah surat, unggah bukti pembayaran jika perlu, lalu melihat status akhir reservasi.
- `staff`
  Petugas fasilitas memeriksa dokumen, memeriksa pembayaran, memproses pembatalan, dan mengelola fasilitas yang menjadi tanggung jawabnya.
- `super_admin`
  Admin pusat mengelola user, pengaturan booking, governance fasilitas, laporan, audit log, dan status sistem.

Secara sederhana:

1. Frontend menampilkan halaman sesuai role.
2. Frontend memanggil backend API.
3. Backend menjalankan aturan bisnis.
4. Backend menyimpan atau membaca data dari database.
5. Hasilnya dikirim kembali ke frontend.

---

## 2. Cara Membaca Struktur Repository

Struktur besar repo:

```text
app/        Backend FastAPI
frontend/   Frontend React + Vite
tests/      Backend tests
docs/       Dokumentasi produk, frontend, backend, dan laporan
```

### `app/` = backend

Folder ini adalah inti logika sistem.

Subbagian penting:

- `app/main.py`
  Titik masuk backend. Fungsi `create_app()` membuat aplikasi FastAPI.
- `app/api/routes/`
  Kumpulan endpoint HTTP. Ini adalah "pintu masuk" request dari frontend.
- `app/services/`
  Aturan bisnis utama. Di sinilah logika aplikasi berada.
- `app/repositories/`
  Lapisan akses data. Bertugas membaca/menulis ke database.
- `app/models/`
  Model SQLAlchemy untuk tabel database.
- `app/schemas/`
  Bentuk request/response API.
- `app/core/`
  Fondasi seperti settings, database, access policy, security, dan module factory.
- `app/storage/`
  Penyimpanan file privat.
- `app/pdf/`
  Generator PDF surat persetujuan.

### `frontend/` = antarmuka user

Frontend memakai React + Vite.

Subbagian penting:

- `frontend/src/App.tsx`
  Peta route halaman.
- `frontend/src/auth/`
  Session user, role guard, login flow.
- `frontend/src/api/http.ts`
  HTTP client bersama untuk semua request ke backend.
- `frontend/src/pages/`
  Halaman-halaman per role.
- `frontend/src/components/`
  Komponen UI bersama.
- `frontend/src/reservations/`
  Mapper/presenter untuk workflow reservasi.

### `tests/` = backend behavior tests

Test di repo ini cukup kuat untuk sisi backend. Fokusnya bukan test method private, tapi test perilaku sistem, misalnya:

- auth
- reservation submission
- approval letter workflow
- payment workflow
- cancellation workflow
- dashboard/report
- notifications

Ini bagus karena test seperti ini lebih dekat ke use case nyata.

---

## 3. Gambaran Arsitektur Secara Sederhana

Kalau disederhanakan, backend berjalan seperti ini:

```text
Frontend / User
  -> Route FastAPI
  -> Service / Module bisnis
  -> Repository
  -> SQLAlchemy Model / Database
```

Contoh nyata:

1. Mahasiswa submit reservasi dari frontend.
2. Request masuk ke route `reservation_routes.py`.
3. Route memanggil `ReservationModule`.
4. `ReservationModule` cek aturan waktu, cek konflik, set status awal, buat notifikasi.
5. `SqlAlchemyReservationRepository` menyimpan data ke database.
6. Hasil dikirim kembali ke frontend.

Poin penting: route tidak menyimpan logika bisnis besar. Route hanya meneruskan request ke module/service yang tepat.

Ini desain yang cukup sehat.

---

## 4. Konsep OOP yang Dipakai di Repo Ini

Berikut konsep OOP yang benar-benar terlihat di codebase.

## 4.1 Encapsulation

Encapsulation artinya aturan dan data terkait suatu konsep dibungkus di dalam satu module/class.

Contoh bagus:

- `UserAccountModule` di `app/services/accounts.py`
  Semua hal tentang registrasi, login, refresh token, dan current user dikumpulkan di satu module.
- `FacilityReservationLifecycleModule` di `app/services/reservation_lifecycle.py`
  Semua aturan perubahan status reservasi diletakkan di satu tempat.
- `ApprovalLetterModule` di `app/services/approval_letters.py`
  Semua urusan generate/download/upload surat ada di satu module.

Kenapa ini bagus:

- caller tidak perlu tahu detail implementasi di dalamnya
- perubahan aturan cukup dilakukan di satu tempat
- code lebih mudah dibaca sebagai domain behavior, bukan kumpulan utilitas acak

## 4.2 Abstraction

Abstraction artinya caller hanya melihat interface penting, bukan detail implementasi.

Contoh kuat di repo ini:

- `UserRepository`
- `BookingSettingsRepository`
- `FacilityCatalogReader`
- `ReservationRepository`
- `NotificationRepository`

Biasanya repo ini memakai `Protocol`, lalu implementasi nyatanya adalah adapter SQLAlchemy, misalnya:

- `SqlAlchemyUserRepository`
- `SqlAlchemyReservationRepository`
- `SqlAlchemyFacilityCatalogReader`

Artinya service bisa "berbicara" ke abstraction, bukan langsung ke database detail.

Keuntungan:

- service lebih mudah dites
- implementasi data bisa diganti tanpa mengubah banyak service
- coupling ke ORM lebih kecil

## 4.3 Composition

Composition artinya object/module dibangun dari object/module lain.

Ini salah satu konsep OOP paling dominan di repo ini.

Contoh:

- `HttpRuntimeModule` membangun dependency per route
- `FacilityModuleFactory` menyusun banyak module kecil menjadi workflow reservasi
- `FacilityReservationWorkflowAssembly` menyatukan:
  - booking settings
  - reservation repository
  - lifecycle
  - notification module
  - audit log module
  - staff review access
  - private storage

Ini penting karena aplikasi ini bukan satu class besar yang menangani semua hal. Ia disusun dari beberapa object yang punya tanggung jawab jelas.

## 4.4 Single Responsibility

Walau ini prinsip SOLID, secara praktik ini juga sangat terasa dalam desain OOP repo ini.

Contoh:

- `NotificationModule`
  Fokus ke notifikasi.
- `ReviewModule`
  Fokus ke review.
- `PaymentModule`
  Fokus ke pembayaran.
- `OrganizationUnitManagementModule`
  Fokus ke unit organisasi.
- `SystemStatusModule`
  Fokus ke health/system status.

Setiap module mewakili satu domain behavior yang cukup jelas.

## 4.5 Dependency Injection

Dependency injection berarti object tidak membuat semua dependency sendiri, tetapi diberi dependency dari luar.

Contoh:

- `UserAccountModule(user_repository=..., secret_key=..., student_email_policy=...)`
- `ReservationModule(reservation_repository=..., reservation_time_selection=..., submission_conflict_guard=...)`
- `PaymentModule(reservation_repository=..., storage=..., booking_settings=..., clock=...)`

Kenapa ini penting:

- object lebih fleksibel
- test lebih mudah
- module lebih reusable
- implementasi bisa diganti

Di repo ini, dependency injection dirakit terutama oleh:

- `HttpRuntimeModule`
- `UserAccountModuleFactory`
- `FacilityModuleFactory`
- `FacilityReservationWorkflowAssembly`

## 4.6 Polymorphism

Polymorphism di repo ini tidak terlalu "class inheritance berat", tapi lebih banyak lewat `Protocol` dan adapter.

Contoh:

- service mengharapkan `UserRepository`
- implementasi nyatanya `SqlAlchemyUserRepository`

Secara OOP, ini tetap polymorphism: service cukup tahu "objek ini bisa melakukan kontrak repository", tidak peduli implementasi detailnya.

## 4.7 Inheritance

Inheritance bukan konsep yang dominan di sini.

Yang paling terlihat:

- SQLAlchemy models mewarisi `Base`
- exception hierarchy sederhana seperti:
  - `ReservationError`
  - `UserAccountError`
  - `ReviewError`

Ini masuk akal. Repo ini lebih mengandalkan composition daripada inheritance. Itu keputusan desain yang biasanya lebih aman untuk codebase bisnis seperti ini.

---

## 5. Contoh Membaca Satu Flow dengan Cara Mudah

Supaya lebih kebayang, ini contoh flow "student submit reservation".

## Langkah 1: frontend ambil data awal

File yang relevan:

- `frontend/src/pages/student/StudentReservationCreatePages.tsx`

Halaman ini:

- ambil kalender fasilitas
- ambil organization unit
- validasi slot waktu
- submit detail reservasi

## Langkah 2: backend validasi waktu

File yang relevan:

- `app/api/routes/facility_routes.py`
- `app/services/reservation_time_selection.py`
- `app/services/facility_availability.py`

Yang terjadi:

1. backend cek aturan lokal
   misalnya durasi minimal, tidak lintas tengah malam, lead time
2. backend cek ketersediaan fasilitas
   misalnya bentrok reservasi, blackout, di luar jam buka

## Langkah 3: backend simpan reservasi

File yang relevan:

- `app/api/routes/reservation_routes.py`
- `app/services/reservations.py`
- `app/repositories/reservation_repository.py`

Yang terjadi:

1. route memanggil `ReservationModule`
2. `ReservationModule` validasi ulang
3. `ReservationModule` membuat reservation code
4. lifecycle menetapkan status awal `pending_document_upload`
5. repository menyimpan ke database

## Langkah 4: efek samping workflow

File yang relevan:

- `app/services/reservation_lifecycle.py`
- `app/services/notifications.py`
- `app/services/audit_logs.py`

Yang terjadi:

- deadline upload dokumen ditetapkan
- notifikasi dibuat
- audit log bisa direkam

Ini menunjukkan satu hal penting tentang codebase ini:

`ReservationModule` bukan sekadar CRUD. Ia adalah orchestration module.

---

## 6. Cara Memahami Backend dengan Cepat

Kalau ingin memahami backend tanpa tersesat, baca dengan urutan ini:

1. `app/main.py`
   untuk tahu entry point
2. `app/api/http_application.py`
   untuk tahu bagaimana dependency dirakit dan route didaftarkan
3. `app/api/routes/`
   untuk tahu endpoint yang tersedia
4. `app/services/`
   untuk tahu logika bisnis yang sebenarnya
5. `app/repositories/`
   untuk tahu akses database
6. `app/models/__init__.py`
   untuk tahu bentuk tabel

Untuk memahami satu fitur, pakai pola:

1. cari route
2. lihat service yang dipanggil
3. lihat repository yang dipakai
4. lihat model yang disimpan/dibaca

---

## 7. Cara Memahami Frontend dengan Cepat

Urutan membaca frontend yang paling efektif:

1. `frontend/src/App.tsx`
   untuk tahu route halaman
2. `frontend/src/auth/session.tsx`
   untuk tahu auth/session flow
3. `frontend/src/api/http.ts`
   untuk tahu cara request ke backend
4. `frontend/src/pages/...`
   untuk tahu UI per role
5. `frontend/src/components/...`
   untuk tahu komponen bersama

Kalau bingung halaman tertentu:

1. buka file page
2. cari `apiRequest(...)`
3. lihat endpoint mana yang dipanggil
4. cari route backend endpoint tersebut

Dengan cara ini, hubungan frontend-backend jadi cepat terbaca.

---

## 8. Kekuatan Desain Codebase Ini

Hal-hal yang menurut saya bagus:

- Logika bisnis dipisah cukup jelas dari route HTTP.
- Banyak domain penting punya module sendiri.
- Repository memakai abstraction, bukan query liar di semua tempat.
- Lifecycle reservasi dipusatkan.
- Workflow dokumen dan payment tidak bercampur ke route.
- OOP dipakai secara pragmatis, bukan berlebihan.
- Test backend cukup kaya dan behavior-oriented.

Kalau disingkat:

Codebase ini cukup matang untuk ukuran aplikasi kampus MVP yang sudah punya workflow bisnis lumayan kompleks.

---

## 9. Hal yang Masih Kurang atau Perlu Diperhatikan

Berikut area yang perlu dipahami sebagai "gap" atau "warning".

### 9.1 Penyimpanan file privat belum durable

Di `app/storage/__init__.py`, implementasi nyata saat ini adalah `InMemoryPrivateStorage`.

Artinya:

- file hilang saat process restart
- belum cocok untuk production

### 9.2 Worker deadline sudah ada, tapi deployment worker belum kelihatan

`DeadlineWorkerModule` sudah ada, tapi belum terlihat scheduler/worker runtime yang benar-benar dijalankan di deployment config.

Artinya:

- secara desain workflow deadline sudah dipikirkan
- secara operasional, implementasi deployment-nya belum lengkap

### 9.3 Belum ada migration system

Schema dibuat lewat `Base.metadata.create_all()`.

Artinya:

- praktis untuk awal development
- berisiko untuk evolusi schema production

### 9.4 Ada gap kecil antara backend dan frontend

Contoh dari hasil map sebelumnya:

- notifikasi super admin menunjuk ke route `/super-admin/reservations/{reservation_id}`
- route frontend itu belum ada

Jadi secara konsep ada integrasi yang belum full tertutup.

---

## 10. Rencana Pembuatan Sistem

Berdasarkan struktur codebase dan dokumentasi, rencana besar sistem terlihat seperti ini:

1. Membangun platform reservasi fasilitas kampus berbasis role.
2. Memisahkan alur kerja student, staff, dan super admin.
3. Menjadikan reservasi bukan hanya CRUD, tapi workflow:
   - pilih waktu
   - submit reservasi
   - unggah surat
   - review dokumen
   - pembayaran
   - review pembayaran
   - pembatalan
   - review dan notifikasi
4. Menjaga aturan bisnis tetap berada di backend.
5. Menyediakan frontend yang mengikuti status workflow secara jelas.
6. Menyiapkan fondasi untuk audit log, reporting, dan worker deadline.

---

## 11. Yang Sudah Dibuat

Bagian yang sudah ada dan cukup jelas implementasinya:

- autentikasi login/register/current user
- role-based shell access
- facility catalog publik
- facility detail dan public calendar
- reservation time validation
- reservation submission
- approval letter generation dan upload signed letter
- payment upload dan payment review
- cancellation request dan cancellation review
- notifications
- audit logs
- staff reservation operations
- staff facility management
- organization unit management
- super admin dashboard
- super admin reports
- booking settings
- system status endpoint
- backend behavior tests yang cukup luas
- frontend screens untuk student, staff, dan super admin

---

## 12. Yang Masih Kurang

Bagian yang kelihatan masih kurang matang atau belum selesai sepenuhnya:

- penyimpanan file privat production-grade
- deployment worker/scheduler untuk deadline processing
- migration database yang proper
- sebagian gap frontend-backend kecil
- konsistensi penuh beberapa route/notification target
- verifikasi production readiness di area storage dan background jobs

---

## 13. Yang Belum Terimplementasi Sepenuhnya

Bagian yang secara konsep sudah ada jejaknya, tapi belum terlihat lengkap end-to-end:

- durable private storage seperti S3/object storage untuk file reservasi
- worker yang benar-benar berjalan otomatis di deployment
- pipeline migrasi schema database
- integrasi penuh semua target notifikasi super admin ke halaman frontend
- hardening production infrastructure untuk file workflow dan operational scheduling

Catatan penting:

Ini bukan berarti sistemnya buruk. Justru artinya fondasi domain dan OOP-nya sudah lumayan rapi, tapi ada beberapa bagian operasional production yang belum ditutup penuh.

---

## 14. Kesimpulan Sederhana

Kalau dijelaskan dengan sangat singkat:

- frontend menangani tampilan dan interaksi user
- backend route menerima request
- service/module menjalankan aturan bisnis
- repository berbicara ke database
- lifecycle mengatur perubahan status reservasi
- notification dan audit menjadi efek samping workflow

Dari sisi OOP:

- repo ini kuat di `encapsulation`
- kuat di `abstraction`
- sangat kuat di `composition`
- cukup rapi di `dependency injection`
- lebih memilih composition daripada inheritance

Kalau kamu ingin memahami repo ini dengan cepat, fokuslah pada pola ini:

`Route -> Service -> Repository -> Model`

Lalu untuk workflow reservasi:

`ReservationModule + LifecycleModule + NotificationModule + Repository`

Itu adalah jantung bisnis aplikasi ini.

---

## 15. Saran Cara Belajar Selanjutnya

Kalau ingin lanjut memahami codebase ini lebih dalam, urutan terbaik menurut saya:

1. pahami auth:
   `accounts.py`, `account_routes.py`, `session.tsx`
2. pahami facility browsing:
   `facility_routes.py`, `facilities.py`, `facility_catalog_reader.py`
3. pahami reservation workflow:
   `reservations.py`, `reservation_lifecycle.py`, `approval_letters.py`, `payments.py`
4. pahami staff ops:
   `staff_reservation_operations.py`, `facility_management.py`
5. pahami super admin:
   `super_admin_dashboard.py`, `super_admin_reports.py`, `booking_settings.py`

Kalau kamu mau, langkah berikutnya saya bisa buat dokumen lanjutan yang lebih teknis, misalnya:

- "backend walkthrough per folder"
- "penjelasan class-by-class OOP di backend"
- "flow reservasi dari awal sampai selesai"
- "bagaimana test di repo ini mencerminkan desain OOP"

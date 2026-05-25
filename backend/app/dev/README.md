# Development Local Data

Ada empat command local utama:
- `reset_db.py` untuk wipe total database lokal
- `catalog_seed.py` untuk load katalog fasilitas real
- `bootstrap_seed.py` untuk 3 akun login minimal
- `seed.py` untuk demo workflow lengkap

Jangan jalankan seed ini untuk production. Script akan menolak environment `production`.

## Demo Workflow Seed

```bash
uv run python -m app.dev.seed
```

`seed.py` membuat data demo lengkap untuk development lokal. Data ini idempotent: menjalankan seed berulang kali akan memperbarui data demo yang sama, bukan menggandakan row.

Jangan jalankan seed ini untuk production. Script akan menolak environment `production`.

## Reset Database

`reset_db.py` menghapus seluruh isi database lokal lalu membuat tabel kembali dari nol.

Jangan jalankan command ini pada database production.

```bash
uv run python -m app.dev.reset_db
```

## Katalog Fasilitas

`catalog_seed.py` memuat katalog fasilitas canonical yang diambil dari TLS IPB dan DUI IPB ke database yang sudah bersih atau sudah direfresh. Command ini tidak menambahkan user demo, reservasi demo, atau data workflow lain.

Jangan jalankan command ini pada database production.

```bash
uv run python -m app.dev.catalog_seed
```

## Demo Workflow Accounts

Semua akun demo workflow aktif dan memakai password yang sama:

```text
demo12345
```

## Demo Workflow Accounts Detail

Total akun seed: 10.

| Email | Role | Nama | NIM | Telepon | Kegunaan testing |
| --- | --- | --- | --- | --- | --- |
| `demo.admin@ipb.ac.id` | `super_admin` | Demo Super Admin | - | - | Testing dashboard, laporan, manajemen user, dan tata kelola fasilitas Super Admin. |
| `demo.staff.operations@ipb.ac.id` | `staff` | Demo Staff Operasional | - | - | Testing staff untuk Auditorium Andi Hakim Nasoetion dan reservasi approved. |
| `demo.staff.facilities@ipb.ac.id` | `staff` | Demo Staff Fasilitas | - | - | Testing staff untuk Ruang Sidang Rektorat dan reservasi pending document upload. |
| `demo.staff.finance@ipb.ac.id` | `staff` | Demo Staff Keuangan | - | - | Testing staff untuk Lapangan Basket Indoor, terutama fasilitas berbayar. |
| `demo.student@apps.ipb.ac.id` | `student` | Demo Student | `G64000001` | `081234500001` | Akun student bersih tanpa reservasi seed; cocok untuk testing flow pembuatan reservasi baru. |
| `demo.student.02@apps.ipb.ac.id` | `student` | Demo Student 02 | `G64000003` | `081234500003` | Akun student tambahan untuk variasi testing. |
| `demo.student.03@apps.ipb.ac.id` | `student` | Demo Student 03 | `G64000004` | `081234500004` | Akun student tambahan untuk variasi testing. |
| `demo.student.04@apps.ipb.ac.id` | `student` | Demo Student 04 | `G64000005` | `081234500005` | Akun student tambahan untuk variasi testing. |
| `demo.student.05@apps.ipb.ac.id` | `student` | Demo Student 05 | `G64000006` | `081234500006` | Akun student tambahan untuk variasi testing. |
| `demo.student.06@apps.ipb.ac.id` | `student` | Demo Student Reservasi | `G64000002` | `081234500002` | Akun student dengan reservasi seed; cocok untuk testing daftar/detail reservasi dan kalender. |

Catatan legacy: seed lama memakai `demo.blocking@apps.ipb.ac.id`. Jika database development lama masih punya akun itu, seed akan menggantinya menjadi `demo.student.06@apps.ipb.ac.id` agar total akun tetap 10.

## Fasilitas

Total fasilitas seed: 13.

| Fasilitas | Kategori | Lokasi | Kapasitas | Harga | Jam buka ringkas |
| --- | --- | --- | ---: | ---: | --- |
| Auditorium Andi Hakim Nasoetion | Auditorium | Kampus IPB Dramaga | 450 | 0 | Senin-Jumat 08.00-16.00 |
| Ruang Sidang Rektorat | Ruang Kelas | Kampus IPB Dramaga | 80 | 150000 | Senin-Jumat 09.00-15.00 |
| Lapangan Basket Indoor | Olahraga | Gymnasium IPB | 120 | 250000 | Senin-Sabtu 08.00-18.00 |
| Auditorium Fakultas Ekonomi dan Manajemen | Auditorium | FEM Kampus IPB Dramaga | 260 | 100000 | Senin-Jumat 08.00-16.00 |
| Gedung Kuliah Bersama Auditorium | Auditorium | Kampus IPB Dramaga | 320 | 0 | Senin-Jumat 07.30-16.30 |
| Ruang Kelas CCR 2.03 | Ruang Kelas | Common Class Room | 60 | 0 | Senin-Jumat 07.00-17.00 |
| Ruang Diskusi Perpustakaan LSI | Ruang Kelas | Perpustakaan LSI IPB | 24 | 0 | Senin-Sabtu 08.00-19.00 |
| Lapangan Futsal Outdoor | Olahraga | Student Center IPB | 80 | 125000 | Senin-Minggu 07.00-21.00 |
| Laboratorium Komputer Departemen Ilmu Komputer | Laboratorium | FMIPA IPB Dramaga | 40 | 0 | Senin-Jumat 08.00-17.00 |
| Laboratorium Bahasa | Laboratorium | Gedung Kuliah Bersama | 36 | 75000 | Senin-Jumat 08.00-16.00 |
| Plaza Rektorat | Area Terbuka | Kampus IPB Dramaga | 600 | 0 | Senin-Minggu 06.00-22.00 |
| Taman Koleksi Kampus | Area Terbuka | Kampus IPB Baranangsiang | 150 | 50000 | Senin-Sabtu 07.00-18.00 |
| Lapangan Tenis IPB | Olahraga | Gymnasium IPB | 40 | 100000 | Senin-Sabtu 07.00-20.00 |

Setiap fasilitas punya:

- 2 gambar aktif: cover dan detail.
- 5 row jam buka, Senin sampai Jumat pukul 08.00-16.00.
- 1 staff assignment, dibagi bergantian ke tiga akun staff demo.

## Bootstrap Login Seed

`bootstrap_seed.py` membuat 3 akun login canonical untuk smoke test setelah reset.

```bash
uv run python -m app.dev.bootstrap_seed
```

Password bootstrap:

```text
bootstrap12345
```

| Role | Email |
| --- | --- |
| Super Admin | `bootstrap.admin@ipb.ac.id` |
| Staff | `bootstrap.staff@ipb.ac.id` |
| Student | `bootstrap.student@apps.ipb.ac.id` |

Command ini juga local-only dan refuse di production.

## Catatan Katalog Real

`reset_db.py` dan `catalog_seed.py` dipakai bersama untuk membersihkan database lokal dan mengisi fasilitas real dari situs TLS/DUI. `bootstrap_seed.py` dipakai setelah reset kalau kamu masih perlu login minimal. `seed.py` tetap dipertahankan untuk kebutuhan blackbox testing alur reservasi, verifikasi dokumen, dan pembayaran.

## Kategori

Total kategori seed: 5.

| Nama | Slug | Icon hint |
| --- | --- | --- |
| Area Terbuka | `area-terbuka` | `trees` |
| Auditorium | `auditorium` | `presentation` |
| Laboratorium | `laboratorium` | `flask-conical` |
| Olahraga | `olahraga` | `dumbbell` |
| Ruang Kelas | `ruang-kelas` | `school` |

## Organisasi

Total organization unit seed: 5.

| Nama | Tipe | Kode |
| --- | --- | --- |
| BEM KM IPB | `student_organization` | `BEM` |
| Himpunan Mahasiswa Ilmu Komputer | `student_organization` | `HIMALKOM` |
| Paduan Suara Mahasiswa Agria Swara | `student_activity_unit` | `AGRIASWARA` |
| UKM Pramuka IPB | `student_activity_unit` | `PRAMUKA` |
| Himpunan Mahasiswa Agronomi | `student_organization` | `HIMAGRON` |

## Reservasi Demo

Total reservasi seed: 35. Akun `demo.student.06@apps.ipb.ac.id` tetap memiliki 9 reservasi tracer utama untuk semua state detail student, sementara akun student tambahan memiliki variasi data produksi untuk demo kalender, antrean staff, laporan Super Admin, dan ulasan fasilitas.

| Kode | Status | Fasilitas | Organisasi | Aktivitas | Kegunaan testing |
| --- | --- | --- | --- | --- | --- |
| `DEV-SEED-APPROVED` | `approved` | Auditorium Andi Hakim Nasoetion | BEM KM IPB | Seminar Karier | Detail reservasi approved dan kalender publik/staff. |
| `DEV-SEED-PENDING` | `pending_document_upload` | Ruang Sidang Rektorat | Himpunan Mahasiswa Ilmu Komputer | Workshop Kewirausahaan | Upload surat bertanda tangan dari sisi student. |
| `DEV-SEED-DOCUMENT-REVIEW` | `pending_document_review` | Auditorium Andi Hakim Nasoetion | BEM KM IPB | Review Surat UKM | Queue review dokumen staff dan download surat bertanda tangan. |
| `DEV-SEED-PAYMENT-PENDING` | `pending_payment` | Ruang Sidang Rektorat | Himpunan Mahasiswa Ilmu Komputer | Forum Berbayar Menunggu Upload | Instruksi pembayaran dan upload bukti bayar dari sisi student. |
| `DEV-SEED-PAYMENT-REVIEW` | `pending_payment` | Lapangan Basket Indoor | BEM KM IPB | Turnamen Basket Menunggu Review | Queue review pembayaran staff dan download bukti bayar. |
| `DEV-SEED-CANCELLATION` | `cancelled` | Auditorium Andi Hakim Nasoetion | BEM KM IPB | Kegiatan Dibatalkan Mahasiswa | Detail reservasi cancelled dengan alasan pembatalan mahasiswa. |
| `DEV-SEED-COMPLETED` | `completed` | Lapangan Basket Indoor | Himpunan Mahasiswa Ilmu Komputer | Kegiatan Selesai Dengan Ulasan | Detail completed dan review/rating. |
| `DEV-SEED-DOCUMENT-REJECTED` | `rejected` | Auditorium Andi Hakim Nasoetion | BEM KM IPB | Surat Ditolak | Tampilan penolakan dokumen. |
| `DEV-SEED-PAYMENT-REJECTED` | `rejected` | Lapangan Basket Indoor | Himpunan Mahasiswa Ilmu Komputer | Pembayaran Ditolak | Tampilan penolakan pembayaran. |

Reservasi yang memiliki metadata surat atau bukti bayar memakai key `dev-seed/...`. Runtime development menyediakan isi placeholder kecil untuk key tersebut, sehingga endpoint download bisa dipakai untuk blackbox testing tanpa upload manual lebih dulu.

Ringkasan variasi tambahan:

- 4 reservasi `pending_document_upload` untuk demo upload surat dan deadline dokumen.
- 3 reservasi `pending_document_review` dan 1 `overdue_verification` untuk antrean review dokumen staff.
- 5 reservasi `pending_payment` dengan kombinasi menunggu upload dan menunggu review bukti bayar.
- 4 reservasi `approved` untuk kalender publik dan jadwal staff.
- 11 reservasi `completed`, termasuk 10 ulasan terlihat yang tersebar di beberapa fasilitas dengan rating 3 sampai 5.
- 1 ulasan tersembunyi untuk demo moderasi review Super Admin.
- Variasi `cancelled`, `cancellation_requested`, `expired`, dan `rejected` untuk daftar/filter/status laporan.

## Rekomendasi Akun Testing

- Student flow baru di data demo: pakai `demo.student@apps.ipb.ac.id`, karena akun ini sengaja dibersihkan dari reservasi seed setiap seed dijalankan.
- Student flow dengan data semua state reservasi: pakai `demo.student.06@apps.ipb.ac.id`.
- Smoke test setelah reset: pakai `bootstrap.student@apps.ipb.ac.id`.
- Staff auditorium / review dokumen: pakai `demo.staff.operations@ipb.ac.id`.
- Staff ruang kelas / flow pembayaran menunggu upload: pakai `demo.staff.facilities@ipb.ac.id`.
- Staff fasilitas berbayar / review pembayaran: pakai `demo.staff.finance@ipb.ac.id`.
- Super Admin: pakai `demo.admin@ipb.ac.id`.

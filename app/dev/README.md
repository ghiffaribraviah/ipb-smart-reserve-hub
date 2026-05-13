# Development Seed Data

`seed.py` membuat data demo untuk development lokal. Data ini idempotent: menjalankan seed berulang kali akan memperbarui data demo yang sama, bukan menggandakan row.

Jangan jalankan seed ini untuk production. Script akan menolak environment `production`.

## Cara Menjalankan

```bash
uv run python -m app.dev.seed
```

## Login Demo

Semua akun aktif dan memakai password yang sama:

```text
demo12345
```

## Akun

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

Total reservasi seed: 9. Semuanya dimiliki oleh `demo.student.06@apps.ipb.ac.id`.

| Kode | Status | Fasilitas | Organisasi | Aktivitas | Kegunaan testing |
| --- | --- | --- | --- | --- | --- |
| `DEV-SEED-APPROVED` | `approved` | Auditorium Andi Hakim Nasoetion | BEM KM IPB | Seminar Karier | Detail reservasi approved dan kalender publik/staff. |
| `DEV-SEED-PENDING` | `pending_document_upload` | Ruang Sidang Rektorat | Himpunan Mahasiswa Ilmu Komputer | Workshop Kewirausahaan | Upload surat bertanda tangan dari sisi student. |
| `DEV-SEED-DOCUMENT-REVIEW` | `pending_document_review` | Auditorium Andi Hakim Nasoetion | BEM KM IPB | Review Surat UKM | Queue review dokumen staff dan download surat bertanda tangan. |
| `DEV-SEED-PAYMENT-PENDING` | `pending_payment` | Ruang Sidang Rektorat | Himpunan Mahasiswa Ilmu Komputer | Forum Berbayar Menunggu Upload | Instruksi pembayaran dan upload bukti bayar dari sisi student. |
| `DEV-SEED-PAYMENT-REVIEW` | `pending_payment` | Lapangan Basket Indoor | BEM KM IPB | Turnamen Basket Menunggu Review | Queue review pembayaran staff dan download bukti bayar. |
| `DEV-SEED-CANCELLATION` | `cancellation_requested` | Auditorium Andi Hakim Nasoetion | BEM KM IPB | Kegiatan Menunggu Pembatalan | Queue review pembatalan staff. |
| `DEV-SEED-COMPLETED` | `completed` | Lapangan Basket Indoor | Himpunan Mahasiswa Ilmu Komputer | Kegiatan Selesai Dengan Ulasan | Detail completed dan review/rating. |
| `DEV-SEED-DOCUMENT-REJECTED` | `rejected` | Auditorium Andi Hakim Nasoetion | BEM KM IPB | Surat Ditolak | Tampilan penolakan dokumen. |
| `DEV-SEED-PAYMENT-REJECTED` | `rejected` | Lapangan Basket Indoor | Himpunan Mahasiswa Ilmu Komputer | Pembayaran Ditolak | Tampilan penolakan pembayaran. |

Reservasi yang memiliki metadata surat atau bukti bayar memakai key `dev-seed/...`. Runtime development menyediakan isi placeholder kecil untuk key tersebut, sehingga endpoint download bisa dipakai untuk blackbox testing tanpa upload manual lebih dulu.

## Rekomendasi Akun Testing

- Student flow baru: pakai `demo.student@apps.ipb.ac.id`, karena akun ini sengaja dibersihkan dari reservasi seed setiap seed dijalankan.
- Student flow dengan data semua state reservasi: pakai `demo.student.06@apps.ipb.ac.id`.
- Staff auditorium / review dokumen / review pembatalan: pakai `demo.staff.operations@ipb.ac.id`.
- Staff ruang kelas / flow pembayaran menunggu upload: pakai `demo.staff.facilities@ipb.ac.id`.
- Staff fasilitas berbayar / review pembayaran: pakai `demo.staff.finance@ipb.ac.id`.
- Super Admin: pakai `demo.admin@ipb.ac.id`.

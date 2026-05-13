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

Total fasilitas seed: 3.

| Fasilitas | Kategori | Lokasi | Kapasitas | Harga | Jam buka ringkas | Staff assigned |
| --- | --- | --- | ---: | ---: | --- | --- |
| Auditorium Andi Hakim Nasoetion | Auditorium | Kampus IPB Dramaga | 450 | 0 | Senin-Jumat 08.00-16.00 | `demo.staff.operations@ipb.ac.id` |
| Ruang Sidang Rektorat | Ruang Kelas | Kampus IPB Dramaga | 80 | 150000 | Senin-Jumat 09.00-15.00 | `demo.staff.facilities@ipb.ac.id` |
| Lapangan Basket Indoor | Olahraga | Gymnasium IPB | 120 | 250000 | Senin-Sabtu 08.00-18.00 | `demo.staff.finance@ipb.ac.id` |

Setiap fasilitas punya:

- 2 gambar aktif: cover dan detail.
- 5 row jam buka, Senin sampai Jumat pukul 08.00-16.00.
- 1 staff assignment.

## Kategori

Total kategori seed: 3.

| Nama | Slug | Icon hint |
| --- | --- | --- |
| Auditorium | `auditorium` | `presentation` |
| Ruang Kelas | `ruang-kelas` | `school` |
| Olahraga | `olahraga` | `dumbbell` |

## Organisasi

Total organization unit seed: 2.

| Nama | Tipe | Kode |
| --- | --- | --- |
| BEM KM IPB | `student_organization` | `BEM` |
| Himpunan Mahasiswa Ilmu Komputer | `student_organization` | `HIMALKOM` |

## Reservasi Demo

Total reservasi seed: 2. Keduanya dimiliki oleh `demo.student.06@apps.ipb.ac.id`.

| Kode | Status | Fasilitas | Organisasi | Aktivitas | Jadwal relatif |
| --- | --- | --- | --- | --- | --- |
| `DEV-SEED-APPROVED` | `approved` | Auditorium Andi Hakim Nasoetion | BEM KM IPB | Seminar Karier | 7 hari setelah seed, 02.00-04.00 UTC |
| `DEV-SEED-PENDING` | `pending_document_upload` | Ruang Sidang Rektorat | Himpunan Mahasiswa Ilmu Komputer | Workshop Kewirausahaan | 8 hari setelah seed, 03.00-05.00 UTC |

## Rekomendasi Akun Testing

- Student flow baru: pakai `demo.student@apps.ipb.ac.id`, karena akun ini sengaja dibersihkan dari reservasi seed setiap seed dijalankan.
- Student flow dengan data reservasi: pakai `demo.student.06@apps.ipb.ac.id`.
- Staff auditorium / reservasi approved: pakai `demo.staff.operations@ipb.ac.id`.
- Staff ruang kelas / reservasi pending upload dokumen: pakai `demo.staff.facilities@ipb.ac.id`.
- Staff fasilitas berbayar: pakai `demo.staff.finance@ipb.ac.id`.
- Super Admin: pakai `demo.admin@ipb.ac.id`.

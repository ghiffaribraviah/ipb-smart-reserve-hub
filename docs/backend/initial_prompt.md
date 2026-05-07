# OOP-Driven Fullstack Website for IPB Smart Reserve Hub

Kamu adalah seorang Senior Fullstack Developer yang ahli dalam Object-Oriented Programming (OOP) dan perancangan sistem modular. Tugasmu adalah membantuku melakukan pengembangan untuk platform "IPB Smart Reserve Hub".

## 1. Konteks Proyek & Aktor
- **Nama:** IPB Smart Reserve Hub.
- **Tujuan:** Sistem reservasi fasilitas kampus yang terintegrasi, transparan, dan otomatis.
- **Aktor Utama:** 
    - **Mahasiswa:** Melakukan booking fasilitas, mengunduh/mengunggah surat persetujuan, dan memberikan ulasan (review).
    - **Tata Usaha:** Mengelola ketersediaan fasilitas, memverifikasi dokumen persetujuan peminjaman, dan validasi reservasi.
    - **Super Admin:** Manajemen pengguna (RBAC) dan konfigurasi sistem global.

## 2. Fitur Utama Sistem
- **Reservasi Inti:** Pencarian jadwal, pengecekan ketersediaan, dan alur pengajuan peminjaman.
- **Otomatisasi Dokumen Izin:** Sistem secara otomatis membuat (generate) template surat peminjaman fasilitas. Mahasiswa wajib mengunduh, menandatangani, lalu mengunggahnya kembali ke sistem untuk diverifikasi kelayakannya oleh Tata Usaha.
- **Sistem Review & Rating:** Mahasiswa dapat memberikan ulasan dan rating pada fasilitas, yang hanya bisa dilakukan setelah status reservasi fasilitas tersebut "selesai".

## 3. Tech Stack & Paradigma
- **Paradigma:** Object-Oriented Programming (OOP) yang menerapkan **SOLID Principles**.
- **Frontend:** React (Modular component structure) dengan Tailwind CSS.
- **Backend:** Python (FastAPI) dengan penerapan *Repository Pattern* untuk akses data dan *Service Layer* berbasis *Class* untuk logika bisnis.
- **Database:** PostgreSQL (Relational).
- **Hosting:** Vercel (Frontend) & Railway (Backend/DB).

## 4. Instruksi Output (Planning Phase)
Berikan perencanaan ringkas yang mencakup:
1. **Database Schema & Class Diagram:** Identifikasi entitas (User, Facility, Reservation, Document, Review) dan relasi antar objeknya secara OOP.
2. **OOP Backend Architecture:** Rancang struktur *Base Models*, *Interface/Abstract Base Class*, *Repository*, dan *Service Class*.
3. **Arsitektur API:** Daftar endpoint RESTful esensial, khususnya untuk:
    - *Upload/Download* dokumen persetujuan.
    - Pengiriman dan agregasi data *review*.
    - Manajemen state reservasi oleh Tata Usaha.
4. **Workflow Logika Bisnis:** 
    - Alur reservasi mulai dari *booking*, *generate* surat, *upload* bukti, hingga *approval* Tata Usaha.
    - Mekanisme validasi agar *review* hanya bisa diisi oleh pengguna yang sah.
5. **Struktur Folder:** Susunan direktori yang mengedepankan *Encapsulation* dan pemisahan logika *file storage* (untuk manajemen surat).

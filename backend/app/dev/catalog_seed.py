from __future__ import annotations

import os
from datetime import time

from sqlalchemy import select

from app.core.database import Base, build_session_factory
from app.core.settings import SettingsModule
from app.models import Facility, FacilityCategory, FacilityImage, FacilityOpenHour


class CatalogSeedRefused(Exception):
    pass


CATEGORY_DEFINITIONS = [
    {"name": "Area Terbuka", "slug": "area-terbuka", "icon_hint": "trees"},
    {"name": "Auditorium", "slug": "auditorium", "icon_hint": "presentation"},
    {"name": "Keamanan", "slug": "keamanan", "icon_hint": "shield-check"},
    {"name": "Lapangan", "slug": "lapangan", "icon_hint": "dribbble"},
    {"name": "Laboratorium", "slug": "laboratorium", "icon_hint": "flask-conical"},
    {"name": "Ruang Meeting", "slug": "ruang-meeting", "icon_hint": "message-square"},
    {"name": "Transportasi", "slug": "transportasi", "icon_hint": "bus"},
]

FACILITY_DEFINITIONS = [
    {
        "category": "Auditorium",
        "name": "Ballroom GSC 1",
        "location": "Gedung Startup Center (GSC) Lantai 5, Kampus IPB Taman Kencana, Bogor",
        "capacity": 50,
        "description": "Ballroom untuk rapat, seminar, dan kegiatan institusional di kawasan Taman Kencana.",
        "contact_name": "Pengelola TLS IPB",
        "contact_phone": "-",
        "contact_email": None,
        "price_rupiah": 0,
        "open_hours_summary": "Sesuai jadwal layanan TLS IPB.",
    },
    {
        "category": "Auditorium",
        "name": "Ballroom GSC 2",
        "location": "Gedung Startup Center (GSC) Lantai 5, Kampus IPB Taman Kencana, Bogor",
        "capacity": 50,
        "description": "Ballroom yang tersedia untuk kegiatan rapat dan acara resmi di GSC.",
        "contact_name": "Pengelola TLS IPB",
        "contact_phone": "-",
        "contact_email": None,
        "price_rupiah": 0,
        "open_hours_summary": "Sesuai jadwal layanan TLS IPB.",
    },
    {
        "category": "Auditorium",
        "name": "Grand Ballroom GSC",
        "location": "Gedung Startup Center (GSC) Lantai 5, Kampus IPB Taman Kencana, Bogor",
        "capacity": 150,
        "description": "Ballroom besar untuk acara skala besar, presentasi, dan forum kampus.",
        "contact_name": "Pengelola TLS IPB",
        "contact_phone": "-",
        "contact_email": None,
        "price_rupiah": 0,
        "open_hours_summary": "Sesuai jadwal layanan TLS IPB.",
    },
    {
        "category": "Ruang Meeting",
        "name": "Breakout Room GSC3.1",
        "location": "Gedung Startup Center (GSC) Lantai 3, Kampus IPB Taman Kencana, Bogor",
        "capacity": 12,
        "description": "Ruang meeting kecil untuk diskusi tim, presentasi singkat, dan koordinasi kerja.",
        "contact_name": "Pengelola TLS IPB",
        "contact_phone": "-",
        "contact_email": None,
        "price_rupiah": 0,
        "open_hours_summary": "Sesuai jadwal layanan TLS IPB.",
    },
    {
        "category": "Ruang Meeting",
        "name": "Ruang Calina 1 dan 2",
        "location": "Gedung CRC STP IPB, Kampus IPB Taman Kencana, Bogor",
        "capacity": 30,
        "description": "Ruang meeting di kawasan CRC STP untuk rapat dan diskusi kelompok.",
        "contact_name": "Pengelola TLS IPB",
        "contact_phone": "-",
        "contact_email": None,
        "price_rupiah": 0,
        "open_hours_summary": "Sesuai jadwal layanan TLS IPB.",
    },
    {
        "category": "Ruang Meeting",
        "name": "Ruang Calina 3",
        "location": "Gedung CRC Lt. 1 STP IPB, Kampus IPB Taman Kencana, Bogor",
        "capacity": 15,
        "description": "Ruang meeting kecil di Gedung CRC untuk pertemuan terbatas.",
        "contact_name": "Pengelola TLS IPB",
        "contact_phone": "-",
        "contact_email": None,
        "price_rupiah": 0,
        "open_hours_summary": "Sesuai jadwal layanan TLS IPB.",
    },
    {
        "category": "Ruang Meeting",
        "name": "Ruang Calina 4",
        "location": "Gedung CRC Lt. 1 STP IPB, Kampus IPB Taman Kencana, Bogor",
        "capacity": 15,
        "description": "Ruang meeting kecil di Gedung CRC untuk forum internal dan koordinasi.",
        "contact_name": "Pengelola TLS IPB",
        "contact_phone": "-",
        "contact_email": None,
        "price_rupiah": 0,
        "open_hours_summary": "Sesuai jadwal layanan TLS IPB.",
    },
    {
        "category": "Ruang Meeting",
        "name": "Ruang Rapat GSC 04.01",
        "location": "Gedung Startup Center (GSC) Lantai 4, Kampus IPB Taman Kencana, Bogor",
        "capacity": 10,
        "description": "Ruang rapat kecil untuk pertemuan formal dan koordinasi unit.",
        "contact_name": "Pengelola TLS IPB",
        "contact_phone": "-",
        "contact_email": None,
        "price_rupiah": 0,
        "open_hours_summary": "Sesuai jadwal layanan TLS IPB.",
    },
    {
        "category": "Ruang Meeting",
        "name": "Focus Room 1",
        "location": "Gedung Perpustakaan Lantai 2",
        "capacity": 6,
        "description": "Ruang meeting dengan perangkat online meeting dan smartboard.",
        "contact_name": "Dewi Sundari",
        "contact_phone": "-",
        "contact_email": None,
        "price_rupiah": 0,
        "open_hours_summary": "Senin-Sabtu 08.00-21.00",
    },
    {
        "category": "Ruang Meeting",
        "name": "Focus Room 2",
        "location": "Perpustakaan",
        "capacity": 8,
        "description": "Smart room untuk meeting kecil dan diskusi dengan perangkat online meeting.",
        "contact_name": "Dewi Sundari",
        "contact_phone": "-",
        "contact_email": None,
        "price_rupiah": 0,
        "open_hours_summary": "Senin-Sabtu 08.00-21.00",
    },
    {
        "category": "Ruang Meeting",
        "name": "Ruang Diskusi D1",
        "location": "Gedung A Perpustakaan LSI Lantai 3",
        "capacity": 8,
        "description": "Ruang diskusi dengan meja besar, kursi, dan televisi untuk kolaborasi kecil.",
        "contact_name": "Dewi Sundari",
        "contact_phone": "-",
        "contact_email": None,
        "price_rupiah": 0,
        "open_hours_summary": "Senin-Sabtu 08.00-21.00",
    },
    {
        "category": "Ruang Meeting",
        "name": "Ruang Diskusi D2",
        "location": "Gedung A Perpustakaan LSI Lantai 3",
        "capacity": 8,
        "description": "Ruang diskusi dengan fasilitas smart TV untuk kerja kelompok dan presentasi.",
        "contact_name": "Pengelola TLS IPB",
        "contact_phone": "-",
        "contact_email": None,
        "price_rupiah": 0,
        "open_hours_summary": "Senin-Sabtu 08.00-21.00",
    },
    {
        "category": "Laboratorium",
        "name": "Laboratorium Komputer Hall B",
        "location": "Gedung Perpustakaan B Lantai 2",
        "capacity": 0,
        "description": "Laboratorium komputer yang tersedia untuk kegiatan praktikum dan pelatihan.",
        "contact_name": "Pengelola TLS IPB",
        "contact_phone": "-",
        "contact_email": None,
        "price_rupiah": 0,
        "open_hours_summary": "Sesuai jadwal laboratorium.",
    },
    {
        "category": "Laboratorium",
        "name": "Lab Komputer GPK",
        "location": "Gedung Pusat Komputer Lantai 2",
        "capacity": 0,
        "description": "Laboratorium komputer di pusat komputasi kampus.",
        "contact_name": "Pengelola TLS IPB",
        "contact_phone": "-",
        "contact_email": None,
        "price_rupiah": 0,
        "open_hours_summary": "Sesuai jadwal laboratorium.",
    },
    {
        "category": "Laboratorium",
        "name": "Lab Komputer Singkong A",
        "location": "Gedung Perpustakaan A Lantai 3",
        "capacity": 0,
        "description": "Laboratorium komputer untuk kegiatan pembelajaran dan praktikum.",
        "contact_name": "Pengelola TLS IPB",
        "contact_phone": "-",
        "contact_email": None,
        "price_rupiah": 0,
        "open_hours_summary": "Sesuai jadwal laboratorium.",
    },
    {
        "category": "Laboratorium",
        "name": "Lab Komputer Singkong C",
        "location": "Gedung Perpustakaan A Lantai 3",
        "capacity": 0,
        "description": "Laboratorium komputer untuk penggunaan bersama di area perpustakaan.",
        "contact_name": "Pengelola TLS IPB",
        "contact_phone": "-",
        "contact_email": None,
        "price_rupiah": 0,
        "open_hours_summary": "Sesuai jadwal laboratorium.",
    },
    {
        "category": "Laboratorium",
        "name": "Lab. Instrumen lantai 4",
        "location": "Departemen Ilmu dan Teknologi Pangan, Fakultas Teknologi Pertanian",
        "capacity": 10,
        "description": "Laboratorium instrumen dengan perangkat analisis seperti HPLC, FTIR, dan UHPLC.",
        "contact_name": "Pengelola TLS IPB",
        "contact_phone": "-",
        "contact_email": None,
        "price_rupiah": 0,
        "open_hours_summary": "Sesuai jadwal laboratorium.",
    },
    {
        "category": "Laboratorium",
        "name": "Lab. Biokimia Pangan",
        "location": "Departemen Ilmu dan Teknologi Pangan, Fakultas Teknologi Pertanian",
        "capacity": 10,
        "description": "Laboratorium biokimia pangan untuk kegiatan analisis dan praktikum.",
        "contact_name": "Pengelola TLS IPB",
        "contact_phone": "-",
        "contact_email": None,
        "price_rupiah": 0,
        "open_hours_summary": "Sesuai jadwal laboratorium.",
    },
    {
        "category": "Laboratorium",
        "name": "Laboratorium Fisiologi dan Kesehatan Benih",
        "location": "Departemen Agronomi dan Hortikultura (AGH), Fakultas Pertanian",
        "capacity": 10,
        "description": "Laboratorium benih untuk kegiatan fisiologi, germinasi, dan kesehatan benih.",
        "contact_name": "Pengelola TLS IPB",
        "contact_phone": "-",
        "contact_email": None,
        "price_rupiah": 0,
        "open_hours_summary": "Sesuai jadwal laboratorium.",
    },
    {
        "category": "Laboratorium",
        "name": "Laboratorium Pengujian",
        "location": "Departemen Agronomi dan Hortikultura, Fakultas Pertanian",
        "capacity": 10,
        "description": "Laboratorium pengujian untuk analisis instrumen dan bahan pertanian.",
        "contact_name": "Pengelola TLS IPB",
        "contact_phone": "-",
        "contact_email": None,
        "price_rupiah": 0,
        "open_hours_summary": "Sesuai jadwal laboratorium.",
    },
    {
        "category": "Laboratorium",
        "name": "Laboratorium Mikrobiologi",
        "location": "Departemen Teknologi Hasil Perairan, Fakultas Perikanan dan Ilmu Kelautan",
        "capacity": 10,
        "description": "Laboratorium mikrobiologi dengan perangkat analisis dan kultur.",
        "contact_name": "Pengelola TLS IPB",
        "contact_phone": "-",
        "contact_email": None,
        "price_rupiah": 0,
        "open_hours_summary": "Sesuai jadwal laboratorium.",
    },
    {
        "category": "Laboratorium",
        "name": "Laboratorium Kesehatan Organisme Akuatik",
        "location": "Departemen Budidaya Perairan, Fakultas Perikanan dan Ilmu Kelautan",
        "capacity": 10,
        "description": "Laboratorium kesehatan organisme akuatik dengan perlengkapan mikroskopi dan analisis.",
        "contact_name": "Pengelola TLS IPB",
        "contact_phone": "-",
        "contact_email": None,
        "price_rupiah": 0,
        "open_hours_summary": "Sesuai jadwal laboratorium.",
    },
    {
        "category": "Laboratorium",
        "name": "Laboratorium Nutrisi Ikan",
        "location": "Departemen Budidaya Perairan, Fakultas Perikanan dan Ilmu Kelautan",
        "capacity": 10,
        "description": "Laboratorium nutrisi ikan untuk pengujian pakan dan teknologi nutrisi.",
        "contact_name": "Pengelola TLS IPB",
        "contact_phone": "-",
        "contact_email": None,
        "price_rupiah": 0,
        "open_hours_summary": "Sesuai jadwal laboratorium.",
    },
    {
        "category": "Laboratorium",
        "name": "Laboratorium AC",
        "location": "Departemen Ilmu Komputer",
        "capacity": 10,
        "description": "Laboratorium komputer yang digunakan untuk kegiatan berbasis komputer.",
        "contact_name": "Pengelola TLS IPB",
        "contact_phone": "-",
        "contact_email": None,
        "price_rupiah": 0,
        "open_hours_summary": "Sesuai jadwal laboratorium.",
    },
    {
        "category": "Laboratorium",
        "name": "Laboratorium Terpadu-BMN",
        "location": "Departemen Ilmu Nutrisi dan Teknologi Pakan, Fakultas Peternakan",
        "capacity": 10,
        "description": "Laboratorium terpadu untuk analisis dan perangkat pendukung riset peternakan.",
        "contact_name": "Pengelola TLS IPB",
        "contact_phone": "-",
        "contact_email": None,
        "price_rupiah": 0,
        "open_hours_summary": "Sesuai jadwal laboratorium.",
    },
    {
        "category": "Laboratorium",
        "name": "Laboratorium Lapang Agrostologi",
        "location": "Departemen Ilmu Nutrisi dan Teknologi Pakan, Fakultas Peternakan",
        "capacity": 10,
        "description": "Laboratorium lapang untuk kegiatan agrostologi dan alat ukur lapang.",
        "contact_name": "Pengelola TLS IPB",
        "contact_phone": "-",
        "contact_email": None,
        "price_rupiah": 0,
        "open_hours_summary": "Sesuai jadwal laboratorium.",
    },
    {
        "category": "Laboratorium",
        "name": "Ruang Analisa Teaching Factory",
        "location": "Sekolah Vokasi",
        "capacity": 5,
        "description": "Ruang analisa untuk kegiatan teaching factory dan alat destruksi/destilasi.",
        "contact_name": "Pengelola TLS IPB",
        "contact_phone": "-",
        "contact_email": None,
        "price_rupiah": 0,
        "open_hours_summary": "Sesuai jadwal laboratorium.",
    },
    {
        "category": "Laboratorium",
        "name": "Persiapan Alat dan Bahan Mikrobiologi",
        "location": "Sekolah Vokasi",
        "capacity": 10,
        "description": "Ruang persiapan alat dan bahan mikrobiologi untuk kegiatan praktikum.",
        "contact_name": "Pengelola TLS IPB",
        "contact_phone": "-",
        "contact_email": None,
        "price_rupiah": 0,
        "open_hours_summary": "Sesuai jadwal laboratorium.",
    },
    {
        "category": "Lapangan",
        "name": "Lapangan Sepakbola",
        "location": "GELORA - Jl. Meranti, Prov. Jawa Barat",
        "capacity": 0,
        "description": "Stadion IPB untuk kegiatan sepak bola dan acara olahraga lain di area olahraga kampus.",
        "contact_name": "Unit Olahraga dan Seni",
        "contact_phone": "-",
        "contact_email": None,
        "price_rupiah": 0,
        "open_hours_summary": "Sesuai jadwal olahraga.",
    },
    {
        "category": "Area Terbuka",
        "name": "Taman Inovasi / Gladiator",
        "location": "Kampus IPB Dramaga",
        "capacity": 1000,
        "description": "Ruang terbuka untuk kegiatan kampus, pameran, dan aktivitas komunitas.",
        "contact_name": "Direktorat Umum dan Infrastruktur",
        "contact_phone": "-",
        "contact_email": None,
        "price_rupiah": 0,
        "open_hours_summary": "Sesuai jadwal layanan kampus.",
    },
    {
        "category": "Area Terbuka",
        "name": "Taman SDGs",
        "location": "Kampus IPB Dramaga",
        "capacity": 1000,
        "description": "Ruang terbuka kampus untuk aktivitas publik dan kegiatan komunitas.",
        "contact_name": "Direktorat Umum dan Infrastruktur",
        "contact_phone": "-",
        "contact_email": None,
        "price_rupiah": 0,
        "open_hours_summary": "Sesuai jadwal layanan kampus.",
    },
    {
        "category": "Transportasi",
        "name": "Verifikasi Gate Sistem",
        "location": "Gerbang depan dan gerbang belakang IPB University",
        "capacity": 0,
        "description": "Fasilitas verifikasi kendaraan masuk dan keluar kampus di dua gerbang utama.",
        "contact_name": "DUI IPB",
        "contact_phone": "-",
        "contact_email": "dui@apps.ipb.ac.id",
        "price_rupiah": 0,
        "open_hours_summary": "Sesuai jadwal operasional pengamanan.",
    },
    {
        "category": "Transportasi",
        "name": "Bus Jemputan Pegawai",
        "location": "Kampus IPB Dramaga",
        "capacity": 6,
        "description": "Layanan bus untuk mengantar jemput pegawai IPB.",
        "contact_name": "DUI IPB",
        "contact_phone": "-",
        "contact_email": "dui@apps.ipb.ac.id",
        "price_rupiah": 0,
        "open_hours_summary": "Sesuai jadwal operasional transportasi.",
    },
    {
        "category": "Transportasi",
        "name": "Bus Keliling Kampus",
        "location": "Kampus IPB Dramaga",
        "capacity": 11,
        "description": "Bus kampus untuk mobilisasi civitas akademika di dalam kawasan kampus.",
        "contact_name": "DUI IPB",
        "contact_phone": "-",
        "contact_email": "dui@apps.ipb.ac.id",
        "price_rupiah": 0,
        "open_hours_summary": "Sesuai jadwal operasional transportasi.",
    },
    {
        "category": "Transportasi",
        "name": "Bus Keluar Kampus",
        "location": "Kampus IPB Dramaga",
        "capacity": 2,
        "description": "Bus untuk kebutuhan praktikum dan kegiatan mahasiswa di luar kampus.",
        "contact_name": "DUI IPB",
        "contact_phone": "-",
        "contact_email": "dui@apps.ipb.ac.id",
        "price_rupiah": 0,
        "open_hours_summary": "Sesuai jadwal operasional transportasi.",
    },
    {
        "category": "Transportasi",
        "name": "Mobil Listrik",
        "location": "Kampus IPB Dramaga",
        "capacity": 6,
        "description": "Mobil listrik untuk kegiatan khusus dan permintaan civitas IPB.",
        "contact_name": "DUI IPB",
        "contact_phone": "-",
        "contact_email": "dui@apps.ipb.ac.id",
        "price_rupiah": 0,
        "open_hours_summary": "Sesuai jadwal operasional transportasi.",
    },
    {
        "category": "Transportasi",
        "name": "Sepeda Kampus",
        "location": "Kampus IPB Dramaga",
        "capacity": 1,
        "description": "Sepeda kampus untuk menunjang mobilitas sivitas akademika di dalam kampus.",
        "contact_name": "DUI IPB",
        "contact_phone": "-",
        "contact_email": "dui@apps.ipb.ac.id",
        "price_rupiah": 0,
        "open_hours_summary": "Sesuai jadwal operasional transportasi.",
    },
]

FACILITY_IMAGE_URLS_BY_NAME = {
    "Ballroom GSC 1": (
        "https://www.ipb.ac.id/wp-content/uploads/2023/07/"
        "gedung-startup-center-stp-ipb-university-siap-menerima-tenant-program-inkubasi-bisnis-news.png"
    ),
    "Ballroom GSC 2": (
        "https://www.ipb.ac.id/wp-content/uploads/2025/06/"
        "LKST-IPB-University-Fasilitasi-25-Startup-Melalui-Program-Inkubasi-Bisnis-Tahun-2025.jpg"
    ),
    "Grand Ballroom GSC": (
        "https://www.ipb.ac.id/wp-content/uploads/2025/05/"
        "LKST-IPB-University-Seleksi-44-Calon-Startup-Program-Inkubasi-Bisnis-Tahun-2025.jpg"
    ),
    "Breakout Room GSC3.1": (
        "https://www.ipb.ac.id/wp-content/uploads/2024/12/"
        "LKST-IPB-University-Gelar-Business-Matching-20-Startup-Paparkan-Potensi-Bisnis.jpg"
    ),
    "Ruang Calina 1 dan 2": (
        "https://cdn.ipb.ac.id/inventory/FotoRuangan_2010_64330239-a0dc-4f53-963c-e9329b43db70.jpg"
    ),
    "Ruang Calina 3": (
        "https://cdn.ipb.ac.id/inventory/FotoRuangan_2010_d2cc9073-2c52-47ac-a726-45b3bda5dcd3.jpg"
    ),
    "Ruang Calina 4": (
        "https://cdn.ipb.ac.id/inventory/FotoRuangan_2010_1b33d0fc-b99a-47eb-a97c-35466bf16359.jpg"
    ),
    "Ruang Rapat GSC 04.01": (
        "https://www.ipb.ac.id/wp-content/uploads/2026/05/"
        "ipb-university-dan-kemdiktisaintek-gelar-seleksi-bersama-prime-step-2026-"
        "untuk-pengembangan-inovasi-dan-startup-.jpg-770x400.jpeg"
    ),
    "Focus Room 1": (
        "https://cdn.ipb.ac.id/inventory/FotoRuangan_3607_1884829b-d075-475c-98ff-89fd668dc829.jpg"
    ),
    "Focus Room 2": (
        "https://cdn.ipb.ac.id/inventory/FotoRuangan_3608_031e62b7-50d3-439a-9fce-bcfd6499eff6.jpg"
    ),
    "Ruang Diskusi D1": (
        "https://cdn.ipb.ac.id/inventory/FotoRuangan_3611_dff98d69-7739-4fb2-9592-0437eed5d8bb.jpg"
    ),
    "Ruang Diskusi D2": (
        "https://cdn.ipb.ac.id/inventory/FotoRuangan_3612_939b96f0-d94d-414f-bb42-6c6058346f32.jpeg"
    ),
    "Laboratorium Komputer Hall B": "https://cs.ipb.ac.id/wp-content/uploads/2015/06/IMG_5247-1024x682.jpg",
    "Lab Komputer GPK": "https://www.ipb.ac.id/wp-content/uploads/2023/11/FMIPA.jpg",
    "Lab Komputer Singkong A": "https://www.ipb.ac.id/wp-content/uploads/2023/11/FEM.jpg",
    "Lab Komputer Singkong C": "https://www.ipb.ac.id/wp-content/uploads/2023/11/SB-2.jpg",
    "Lab. Instrumen lantai 4": (
        "https://www.ipb.ac.id/wp-content/uploads/2023/09/"
        "departemen-itp-bersama-hsc-ipb-university-gelar-workshop-aplikasi-metabolomik-"
        "dalam-bidang-pangan-news.jpg"
    ),
    "Lab. Biokimia Pangan": "https://www.ipb.ac.id/wp-content/uploads/2023/11/Fateta.jpg",
    "Laboratorium Fisiologi dan Kesehatan Benih": (
        "https://www.ipb.ac.id/wp-content/uploads/2023/11/F-Pertanian.jpg"
    ),
    "Laboratorium Pengujian": "https://www.ipb.ac.id/wp-content/uploads/2023/11/FEMA.jpg",
    "Laboratorium Mikrobiologi": "https://www.ipb.ac.id/wp-content/uploads/2023/11/FPIK.jpg",
    "Laboratorium Kesehatan Organisme Akuatik": "https://www.ipb.ac.id/wp-content/uploads/2023/11/FKH.jpg",
    "Laboratorium Nutrisi Ikan": "https://www.ipb.ac.id/wp-content/uploads/2023/11/Fahutan.jpg",
    "Laboratorium AC": "https://www.ipb.ac.id/wp-content/uploads/2023/11/SV-1.jpg",
    "Laboratorium Terpadu-BMN": "https://www.ipb.ac.id/wp-content/uploads/2023/11/FAPET-1.jpg",
    "Laboratorium Lapang Agrostologi": (
        "https://museum.ipb.ac.id/wp-content/uploads/2023/05/Agribussiness-Techno-Park.jpeg"
    ),
    "Ruang Analisa Teaching Factory": "https://museum.ipb.ac.id/wp-content/uploads/2023/05/Koin-IPB.jpg",
    "Persiapan Alat dan Bahan Mikrobiologi": (
        "https://museum.ipb.ac.id/wp-content/uploads/2023/03/photo_2023-03-15_11-21-31.jpg"
    ),
    "Lapangan Sepakbola": "https://cdn.ipb.ac.id/inventori/FotoOrsen_1_16b15580-d654-46a8-9fa1-5378e2fbb7a4.jpg",
    "Taman Inovasi / Gladiator": "https://museum.ipb.ac.id/wp-content/uploads/2023/05/Taman-Inovasi.webp",
    "Taman SDGs": "https://www.ipb.ac.id/wp-content/uploads/2025/09/Danau-SGDS-770x400.jpg",
    "Verifikasi Gate Sistem": "https://www.ipb.ac.id/wp-content/uploads/2026/03/Cuplikan-layar-2026-03-31-140708.png",
    "Bus Jemputan Pegawai": "https://www.ipb.ac.id/wp-content/uploads/2026/03/Cuplikan-layar-2026-03-31-140825.png",
    "Bus Keliling Kampus": "https://www.ipb.ac.id/wp-content/uploads/2026/03/Cuplikan-layar-2026-03-31-140849.png",
    "Bus Keluar Kampus": "https://www.ipb.ac.id/wp-content/uploads/2026/03/Cuplikan-layar-2026-03-31-140908.png",
    "Mobil Listrik": (
        "https://www.ipb.ac.id/wp-content/uploads/2023/07/"
        "yayasan-pupuk-kaltim-hibahkan-dua-unit-mobil-listrik-kepada-ipb-news.jpg"
    ),
    "Sepeda Kampus": "https://www.ipb.ac.id/wp-content/uploads/2023/07/Sepeda.jpg",
}


def seed_catalog_data(*, settings: SettingsModule | None = None, environment: str | None = None) -> None:
    seed_environment = environment if environment is not None else os.environ.get("IPB_ENVIRONMENT")
    if seed_environment == "production":
        raise CatalogSeedRefused("Catalog reset seed cannot run in production.")

    app_settings = settings or SettingsModule.from_environment()
    session_factory = build_session_factory(app_settings.database_url)
    engine = session_factory.kw["bind"]

    Base.metadata.create_all(bind=engine)

    with session_factory() as session:
        categories_by_name: dict[str, FacilityCategory] = {}
        for definition in CATEGORY_DEFINITIONS:
            category = _ensure_category(session, **definition)
            categories_by_name[category.name] = category

        session.flush()

        for definition in FACILITY_DEFINITIONS:
            facility = _ensure_facility(
                session,
                category=categories_by_name[definition["category"]],
                name=definition["name"],
                location=definition["location"],
                capacity=definition["capacity"],
                description=definition["description"],
                contact_name=definition["contact_name"],
                contact_phone=definition["contact_phone"],
                contact_email=definition["contact_email"],
                price_rupiah=definition["price_rupiah"],
                open_hours_summary=definition["open_hours_summary"],
            )

            facility.images.clear()
            facility.open_hours.clear()
            session.add(
                FacilityImage(
                    facility=facility,
                    url=_facility_image_url(definition),
                    alt_text=f"{facility.name} cover",
                    display_order=1,
                    is_cover=True,
                    is_active=True,
                )
            )
            for day_of_week in range(5):
                session.add(
                    FacilityOpenHour(
                        facility=facility,
                        day_of_week=day_of_week,
                        opens_at=time(8, 0),
                        closes_at=time(16, 0),
                    )
                )

        session.commit()


def _facility_image_url(definition: dict[str, object]) -> str:
    name = str(definition["name"])
    return FACILITY_IMAGE_URLS_BY_NAME[name]


def _ensure_category(
    session,
    *,
    name: str,
    slug: str,
    icon_hint: str,
) -> FacilityCategory:
    category = session.scalar(select(FacilityCategory).where(FacilityCategory.name == name))
    if category is None:
        category = FacilityCategory(name=name, slug=slug, icon_hint=icon_hint, is_active=True)
        session.add(category)
        return category

    category.slug = slug
    category.icon_hint = icon_hint
    category.is_active = True
    return category


def _ensure_facility(
    session,
    *,
    category: FacilityCategory,
    name: str,
    location: str,
    capacity: int,
    description: str,
    contact_name: str,
    contact_phone: str,
    contact_email: str | None,
    price_rupiah: int,
    open_hours_summary: str,
) -> Facility:
    facility = session.scalar(select(Facility).where(Facility.name == name))
    if facility is None:
        facility = Facility(
            category=category,
            name=name,
            location=location,
            capacity=capacity,
            description=description,
            contact_name=contact_name,
            contact_phone=contact_phone,
            contact_email=contact_email,
            price_rupiah=price_rupiah,
            open_hours_summary=open_hours_summary,
            is_active=True,
        )
        session.add(facility)
        session.flush()
        return facility

    facility.category = category
    facility.location = location
    facility.capacity = capacity
    facility.description = description
    facility.contact_name = contact_name
    facility.contact_phone = contact_phone
    facility.contact_email = contact_email
    facility.price_rupiah = price_rupiah
    facility.open_hours_summary = open_hours_summary
    facility.is_active = True
    session.flush()
    return facility


if __name__ == "__main__":
    try:
        seed_catalog_data()
    except CatalogSeedRefused as exc:
        print(str(exc))
    else:
        print("Catalog seed loaded.")

import type { LucideIcon } from "lucide-react";
import { Activity, Building2, Megaphone, Monitor, Trees } from "lucide-react";

export type StudentHomeCategory = {
  description: string;
  href: string;
  icon: LucideIcon;
  name: string;
  slug: string;
};

export type StudentHomeFacility = {
  capacity: string;
  category: string;
  description: string;
  href: string;
  name: string;
  rating: string;
  reviewCount: string;
  slug: string;
};

export const studentHomeSession = {
  initials: "NP",
  name: "Nadia Paramita",
};

export const studentHomeCategories: StudentHomeCategory[] = [
  {
    description: "Lapangan dan ruang aktivitas fisik untuk kegiatan mahasiswa.",
    href: "/student/facilities?category=olahraga",
    icon: Activity,
    name: "Olahraga",
    slug: "olahraga",
  },
  {
    description: "Ruang belajar, kuliah umum, dan kelas kolaboratif.",
    href: "/student/facilities?category=kelas",
    icon: Building2,
    name: "Kelas",
    slug: "kelas",
  },
  {
    description: "Auditorium dan ruang acara untuk forum akademik.",
    href: "/student/facilities?category=seminar",
    icon: Megaphone,
    name: "Seminar",
    slug: "seminar",
  },
  {
    description: "Area terbuka untuk pameran, festival, dan seremoni kampus.",
    href: "/student/facilities?category=landskap",
    icon: Trees,
    name: "Landskap",
    slug: "landskap",
  },
  {
    description: "Studio dan perangkat pendukung produksi kegiatan.",
    href: "/student/facilities?category=peralatan",
    icon: Monitor,
    name: "Peralatan",
    slug: "peralatan",
  },
];

export const studentHomeFacilities: StudentHomeFacility[] = [
  {
    capacity: "1,200",
    category: "Seminar",
    description: "Auditorium utama untuk seminar nasional, kuliah umum, dan wisuda fakultas.",
    href: "/student/facilities/grand-auditorium",
    name: "Grand Auditorium",
    rating: "4,8",
    reviewCount: "128 ulasan",
    slug: "grand-auditorium",
  },
  {
    capacity: "45",
    category: "Kelas",
    description: "Ruang kelas interaktif dengan smart board dan tata letak fleksibel.",
    href: "/student/facilities/smart-classroom-a1",
    name: "Smart Classroom A1",
    rating: "4,7",
    reviewCount: "42 ulasan",
    slug: "smart-classroom-a1",
  },
  {
    capacity: "500",
    category: "Olahraga",
    description: "Fasilitas olahraga indoor untuk basket, voli, dan bulu tangkis.",
    href: "/student/facilities/gymnasium-utama",
    name: "Gymnasium Utama",
    rating: "4,6",
    reviewCount: "75 ulasan",
    slug: "gymnasium-utama",
  },
  {
    capacity: "2,000",
    category: "Landskap",
    description: "Area terbuka hijau untuk pameran, festival, dan kegiatan komunitas.",
    href: "/student/facilities/plaza-rektorat",
    name: "Plaza Rektorat",
    rating: "4,9",
    reviewCount: "96 ulasan",
    slug: "plaza-rektorat",
  },
  {
    capacity: "60",
    category: "Seminar",
    description: "Ruang rapat formal dengan konferensi video dan audio delegasi.",
    href: "/student/facilities/ruang-sidang-senat",
    name: "Ruang Sidang Senat",
    rating: "4,8",
    reviewCount: "31 ulasan",
    slug: "ruang-sidang-senat",
  },
  {
    capacity: "15",
    category: "Peralatan",
    description: "Studio produksi konten dengan kamera, lighting, dan green screen.",
    href: "/student/facilities/multimedia-studio",
    name: "Multimedia Studio",
    rating: "4,7",
    reviewCount: "28 ulasan",
    slug: "multimedia-studio",
  },
  {
    capacity: "4",
    category: "Olahraga",
    description: "Lapangan tenis dengan lampu penerangan untuk sesi sore dan malam.",
    href: "/student/facilities/lapangan-tenis-outdoor",
    name: "Lapangan Tenis Outdoor",
    rating: "4,5",
    reviewCount: "22 ulasan",
    slug: "lapangan-tenis-outdoor",
  },
  {
    capacity: "80",
    category: "Seminar",
    description: "Ruang seminar ringkas untuk diskusi riset dan presentasi tugas akhir.",
    href: "/student/facilities/ruang-seminar-cendekia",
    name: "Ruang Seminar Cendekia",
    rating: "4,6",
    reviewCount: "47 ulasan",
    slug: "ruang-seminar-cendekia",
  },
];

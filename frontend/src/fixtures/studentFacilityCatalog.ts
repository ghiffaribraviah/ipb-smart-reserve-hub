export type FacilityCatalogItem = {
  capacity: number;
  category: string;
  categoryLabel: string;
  coverImageUrl?: string | null;
  description: string;
  href: string;
  name: string;
  price: string;
  rating: number;
  reviews: number;
  slug: string;
};

export const facilityCatalogItems: FacilityCatalogItem[] = [
  {
    capacity: 1200,
    category: "seminar",
    categoryLabel: "Seminar",
    description:
      "Fasilitas premium untuk acara seminar nasional dan internasional dengan kapasitas besar dan sistem audio visual mutakhir.",
    href: "/student/facilities/grand-auditorium",
    name: "Grand Auditorium",
    price: "Rp 100k / sesi",
    rating: 4.9,
    reviews: 124,
    slug: "grand-auditorium",
  },
  {
    capacity: 45,
    category: "kelas",
    categoryLabel: "Ruang Kelas",
    description:
      "Ruang kelas modern yang dilengkapi dengan smart board interaktif dan tata letak meja yang modular untuk diskusi kelompok.",
    href: "/student/facilities/smart-classroom-a1",
    name: "Smart Classroom A1",
    price: "Gratis",
    rating: 4.7,
    reviews: 89,
    slug: "smart-classroom-a1",
  },
  {
    capacity: 500,
    category: "olahraga",
    categoryLabel: "Olahraga",
    description:
      "Fasilitas olahraga indoor serbaguna yang dapat digunakan untuk basket, voli, dan bulu tangkis dengan tribun penonton.",
    href: "/student/facilities/gymnasium-utama",
    name: "Gymnasium Utama",
    price: "Rp 50k / sesi",
    rating: 4.8,
    reviews: 210,
    slug: "gymnasium-utama",
  },
  {
    capacity: 150,
    category: "kelas",
    categoryLabel: "Ruang Kelas",
    description:
      "Ruang kuliah teater standar dengan proyektor ganda dan sistem pengeras suara. Cocok untuk perkuliahan umum.",
    href: "/student/facilities/lecture-hall-b",
    name: "Lecture Hall B",
    price: "Gratis",
    rating: 4.5,
    reviews: 56,
    slug: "lecture-hall-b",
  },
  {
    capacity: 2000,
    category: "landskap",
    categoryLabel: "Landskap",
    description:
      "Area terbuka hijau di pusat kampus, sangat ideal untuk kegiatan pameran mahasiswa, festival, atau acara outdoor lainnya.",
    href: "/student/facilities/plaza-rektorat",
    name: "Plaza Rektorat",
    price: "Rp 200k / hari",
    rating: 4.9,
    reviews: 312,
    slug: "plaza-rektorat",
  },
  {
    capacity: 60,
    category: "seminar",
    categoryLabel: "Seminar",
    description:
      "Ruang pertemuan eksklusif dengan meja bundar besar, mikrofon delegasi, dan fasilitas video conference.",
    href: "/student/facilities/ruang-sidang-senat",
    name: "Ruang Sidang Senat",
    price: "Rp 150k / sesi",
    rating: 4.6,
    reviews: 45,
    slug: "ruang-sidang-senat",
  },
  {
    capacity: 15,
    category: "peralatan",
    categoryLabel: "Peralatan",
    description:
      "Studio rekaman kedap suara dilengkapi dengan kamera profesional, lighting rig, dan green screen untuk produksi konten.",
    href: "/student/facilities/multimedia-studio",
    name: "Multimedia Studio",
    price: "Rp 75k / sesi",
    rating: 4.8,
    reviews: 77,
    slug: "multimedia-studio",
  },
  {
    capacity: 4,
    category: "olahraga",
    categoryLabel: "Olahraga",
    description:
      "Lapangan tenis standar turnamen dengan permukaan hard court. Dilengkapi lampu penerangan untuk permainan malam hari.",
    href: "/student/facilities/lapangan-tenis-outdoor",
    name: "Lapangan Tenis Outdoor",
    price: "Rp 30k / jam",
    rating: 4.4,
    reviews: 112,
    slug: "lapangan-tenis-outdoor",
  },
];

export const facilityCatalogCategories = [
  { label: "Semua Tipe", value: "" },
  { label: "Auditorium / Seminar", value: "seminar" },
  { label: "Ruang Kelas", value: "kelas" },
  { label: "Fasilitas Olahraga", value: "olahraga" },
  { label: "Landskap / Outdoor", value: "landskap" },
  { label: "Peralatan", value: "peralatan" },
];

export const facilityCatalogOrganizations = [
  { label: "Semua Organisasi", value: "" },
  { label: "Fakultas Pertanian", value: "faperta" },
  { label: "Fakultas Kedokteran Hewan", value: "fkh" },
  { label: "Fakultas MIPA", value: "fmipa" },
];

export const facilityCatalogSorts = [
  { label: "Relevansi", value: "relevance" },
  { label: "Abjad (A-Z)", value: "name" },
  { label: "Kapasitas Terbanyak", value: "capacity" },
  { label: "Rating Tertinggi", value: "rating" },
];

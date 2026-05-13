import {
  Megaphone,
  ShieldCheck,
  Users,
  Waves,
  Wifi,
  Wind,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type FacilityDetailFeature = {
  icon: LucideIcon;
  label: string;
  value: string;
};

export type PublicCalendarEntry = {
  label: string;
  status: "reserved" | "blocked";
  timeRange: string;
};

export const studentFacilityDetail = {
  id: "grand-auditorium",
  name: "Grand Auditorium",
  location: "Kampus Timur, Plaza Tengah",
  ratingAverage: "4.9",
  reviewCount: 124,
  price: "Rp100.000",
  priceUnit: "/ sesi",
  availability: "Tersedia",
  description:
    "Grand Auditorium dirancang untuk seminar nasional, kuliah umum, pertunjukan akademik, dan acara institusi berskala besar dengan dukungan tata suara serta panggung utama.",
  reserveHref: "/student/facilities/grand-auditorium/reserve/time",
  features: [
    { icon: Users, label: "Kapasitas", value: "1,200" },
    { icon: Megaphone, label: "Sistem Audio", value: "Atmos 7.1" },
    { icon: Wifi, label: "Jaringan", value: "Gigabit" },
    { icon: Wind, label: "Aksesibel", value: "ADA" },
  ] satisfies FacilityDetailFeature[],
  notes: [
    { icon: ShieldCheck, text: "Proteksi kerusakan" },
    { icon: Waves, text: "Perubahan tanggal harus mengajukan ulang" },
  ],
  reviews: [
    {
      initials: "LI",
      name: "Laras Indah",
      context: "Oktober 2024 • Seminar Nasional",
      text: "Ruangannya luas, tata suara jelas, dan proses masuk peserta cukup tertib. Cocok untuk seminar dengan jumlah peserta besar.",
    },
    {
      initials: "LI",
      name: "Laras Indah",
      context: "Oktober 2024 • Seminar Nasional",
      text: "Tim fasilitas membantu pengecekan panggung sebelum acara. Area registrasi juga mudah diatur untuk alur kedatangan peserta.",
    },
  ],
  publicCalendar: {
    period: "Oktober 2024",
    selectedDate: "24 Oktober 2024",
    entries: [
      {
        label: "Waktu sudah dipesan",
        status: "reserved",
        timeRange: "09:00 - 12:00",
      },
      {
        label: "Waktu sudah dipesan",
        status: "reserved",
        timeRange: "13:00 - 15:00",
      },
      {
        label: "Waktu tidak tersedia",
        status: "blocked",
        timeRange: "16:00 - 18:00",
      },
    ] satisfies PublicCalendarEntry[],
  },
} as const;

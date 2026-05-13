import {
  Bell,
  CalendarDays,
  Check,
  Clock,
  Info,
  Menu,
  Search,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { reservationCreateFixture } from "../../fixtures/studentReservationCreate";
import { studentHomeSession } from "../../fixtures/studentHome";

const navItems = [
  { href: "/student", label: "Beranda" },
  { href: "/student/facilities", label: "Fasilitas" },
  { href: "/student/reservations", label: "Reservasi" },
];

const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const calendarDays = [
  { day: 29, muted: true },
  { day: 30, muted: true },
  { day: 1 },
  { day: 2 },
  { day: 3 },
  { day: 4, dots: ["success"] },
  { day: 5 },
  { day: 6 },
  { day: 7 },
  { day: 8 },
  { day: 9 },
  { day: 10, dots: ["danger"] },
  { day: 11, dots: ["warning"] },
  { day: 12 },
  { day: 13 },
  { day: 14 },
  { day: 15 },
  { day: 16, dots: ["success", "success"] },
  { day: 17 },
  { day: 18 },
  { day: 19 },
  { day: 20 },
  { day: 21 },
  { day: 22 },
  { day: 23, dots: ["warning"] },
  { day: 24, selected: true, dots: ["success", "success", "warning"] },
  { day: 25 },
  { day: 26, dots: ["danger"] },
  { day: 27 },
  { day: 28 },
  { day: 29 },
  { day: 30 },
  { day: 31, dots: ["success"] },
  { day: 1, muted: true },
  { day: 2, muted: true },
] as const;

const dotColor = {
  danger: "bg-[#ef4444]",
  success: "bg-[#10b981]",
  warning: "bg-[#f59e0b]",
};

function StudentHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-[72px] justify-center border-b border-[#e5e7eb] bg-white max-md:h-16">
      <div className="flex h-full w-[1200px] max-w-[95%] items-center justify-between gap-[22px] max-md:max-w-full max-md:px-3.5">
        <div className="flex min-w-0 items-center gap-[22px] max-md:gap-3.5">
          <button
            aria-label="Buka navigasi mahasiswa"
            className="hidden text-slate-500 max-md:inline-flex"
            type="button"
          >
            <Menu aria-hidden="true" size={24} />
          </button>
          <a
            aria-label="IPB Smart Reserve Hub"
            className="whitespace-nowrap font-serif text-2xl font-bold leading-none text-[#1d7667] no-underline max-md:text-[22px]"
            href="/student"
          >
            <span className="hidden md:inline">
              IPB
              <br />
              SRH
            </span>
            <span className="md:hidden">IPB SRH</span>
          </a>
          <label className="relative flex h-10 min-w-[232px] items-center text-slate-500 max-md:hidden">
            <span className="sr-only">Cari fasilitas</span>
            <Search aria-hidden="true" className="absolute left-4 text-slate-400" size={18} />
            <input
              className="h-10 w-[250px] rounded-full border border-[#dbe2ea] bg-gradient-to-b from-white to-slate-50 py-2.5 pl-[42px] pr-4 text-[13px] font-medium leading-5 outline-none focus:border-[#0f9d58] focus:bg-white"
              placeholder="Cari fasilitas..."
              type="search"
            />
          </label>
        </div>

        <nav
          aria-label="Navigasi mahasiswa"
          className="flex items-center gap-10 max-md:hidden"
        >
          {navItems.map((item) => (
            <a
              aria-current={item.label === "Reservasi" ? "page" : undefined}
              className={`border-b-2 pb-1 text-sm font-bold no-underline ${
                item.label === "Reservasi"
                  ? "border-[#0f9d58] text-[#0f9d58]"
                  : "border-transparent text-slate-500"
              }`}
              href={item.href}
              key={item.label}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-[22px] max-md:gap-3.5">
          <button aria-label="Notifikasi" className="inline-flex text-slate-500" type="button">
            <Bell aria-hidden="true" size={18} />
          </button>
          <a
            aria-label={`Profil ${studentHomeSession.name}`}
            className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-[#0f9d58] text-[13px] font-bold text-white no-underline"
            href="/student/profile"
          >
            {studentHomeSession.initials}
          </a>
        </div>
      </div>
    </header>
  );
}

function Stepper({ current }: { current: 1 | 2 }) {
  const steps = [
    { label: "Pilih Waktu", state: current === 1 ? "Aktif" : "Selesai" },
    { label: "Detail Reservasi", state: current === 2 ? "Aktif" : "Berikutnya" },
    { label: "Surat", state: "Berikutnya" },
  ];

  return (
    <div className="mb-12 flex justify-center max-md:mb-7">
      <nav
        aria-label="Tahapan reservasi"
        className="relative grid w-[600px] max-w-full grid-cols-3 text-center before:absolute before:left-[16.5%] before:right-[16.5%] before:top-[17px] before:h-0.5 before:bg-[#e5e7eb] after:absolute after:left-[16.5%] after:top-[17px] after:h-0.5 after:bg-[#0f9d58] max-md:w-full"
      >
        <span
          className={`absolute left-[16.5%] top-[17px] h-0.5 bg-[#0f9d58] ${
            current === 1 ? "w-0" : "w-[33.5%]"
          }`}
        />
        {steps.map((step, index) => {
          const number = index + 1;
          const done = current > number;
          const active = current === number;

          return (
            <div className="relative z-10 grid justify-items-center gap-1.5" key={step.label}>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold ${
                  done
                    ? "border-[#d1fae5] bg-[#d1fae5] text-[#065f46]"
                    : active
                      ? "border-[#0f9d58] bg-white text-[#0f9d58] shadow-[0_0_0_4px_#ecfdf5]"
                      : "border-[#f3f4f6] bg-[#f3f4f6] text-[#6b7280]"
                }`}
              >
                {done ? <Check aria-hidden="true" size={16} /> : number}
              </div>
              <span className="text-sm font-bold leading-tight text-[#111827] max-md:text-xs">
                {step.label}
              </span>
              <span className="text-xs text-[#6b7280] max-md:text-[11px]">{step.state}</span>
            </div>
          );
        })}
      </nav>
    </div>
  );
}

function CalendarCard() {
  return (
    <section className="flex-1 rounded-xl bg-white p-10 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="m-0 mb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
            Kalender Interaktif
          </p>
          <h1 className="m-0 text-2xl font-bold">Oktober 2024</h1>
        </div>
        <div className="flex gap-3">
          <button className="h-9 w-9 rounded-lg border border-[#e5e7eb] bg-white font-bold" type="button">
            &lt;
          </button>
          <button className="h-9 w-9 rounded-lg border border-[#e5e7eb] bg-white font-bold" type="button">
            &gt;
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center max-md:gap-1.5" aria-label="Kalender Oktober 2024">
        {dayNames.map((day) => (
          <div className="pb-1 text-[11px] font-bold uppercase text-[#6b7280]" key={day}>
            {day}
          </div>
        ))}
        {calendarDays.map((day, index) => (
          <div
            className={`flex aspect-square min-w-0 flex-col rounded-lg border p-2 text-left max-md:p-1.5 ${
              "muted" in day && day.muted ? "border-[#f3f4f6] bg-[#f9fafb]" : "border-[#e5e7eb] bg-white"
            }`}
            key={`${day.day}-${index}`}
          >
            <span
              className={`text-sm font-bold ${
                "selected" in day && day.selected
                  ? "flex h-7 w-7 items-center justify-center rounded-md bg-[#0f9d58] text-white"
                  : "muted" in day && day.muted
                    ? "text-slate-300"
                    : "text-[#111827]"
              }`}
            >
              {day.day}
            </span>
            {"dots" in day ? (
              <div className="mt-auto flex gap-1">
                {day.dots.map((dot, dotIndex) => (
                  <span className={`h-1.5 w-1.5 rounded-full ${dotColor[dot]}`} key={`${dot}-${dotIndex}`} />
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2.5">
        <span className="rounded-full bg-[#d1fae5] px-3 py-1.5 text-xs font-bold text-[#065f46]">
          Reservasi disetujui
        </span>
        <span className="rounded-full bg-[#fef3c7] px-3 py-1.5 text-xs font-bold text-[#92400e]">
          Menunggu review
        </span>
        <span className="rounded-full bg-[#fee2e2] px-3 py-1.5 text-xs font-bold text-[#991b1b]">
          Blokir/perawatan
        </span>
        <span className="rounded-full bg-[#eff6ff] px-3 py-1.5 text-xs font-bold text-[#1e40af]">
          Tanggal dipilih
        </span>
      </div>
      <div className="mt-5 border-t border-[#e5e7eb] pt-4">
        <p className="m-0 mb-3 text-sm font-bold">Jadwal pada {reservationCreateFixture.selectedDate}</p>
        {reservationCreateFixture.agenda.map((item) => (
          <div
            className="grid grid-cols-[86px_1fr_auto] gap-3 border-t border-dashed border-[#e5e7eb] py-3 first:border-t-0 first:pt-0 max-md:grid-cols-1"
            key={item.name}
          >
            <strong className="text-xs">{item.time}</strong>
            <div>
              <p className="m-0 text-sm font-bold">{item.name}</p>
              <p className="m-0 text-sm leading-6 text-[#6b7280]">{item.organization}</p>
            </div>
            <span
              className={`h-fit w-fit rounded-full px-3 py-1.5 text-xs font-bold ${
                item.tone === "success"
                  ? "bg-[#d1fae5] text-[#065f46]"
                  : "bg-[#fef3c7] text-[#92400e]"
              }`}
            >
              {item.badge}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function TimeCard() {
  return (
    <aside className="flex w-[400px] flex-col gap-6 max-lg:w-full">
      <section className="rounded-xl bg-white p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:p-6">
        <div className="mb-3 flex items-center gap-3">
          <Clock aria-hidden="true" className="text-[#0f9d58]" size={22} />
          <h2 className="m-0 text-xl font-semibold">Atur Waktu</h2>
        </div>
        <p className="mb-6 text-sm leading-6 text-[#6b7280]">
          Pilih jadwal mulai dan selesai untuk reservasi. Ketersediaan jadwal dapat dilihat
          pada kalender.
        </p>
        <label className="mb-5 block">
          <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.04em] text-[#111827]">
            Waktu Mulai
          </span>
          <input
            aria-label="Waktu Mulai"
            className="h-[52px] w-full rounded-lg border border-[#e5e7eb] bg-white px-4 text-[15px]"
            defaultValue={reservationCreateFixture.startTime}
            readOnly
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.04em] text-[#111827]">
            Waktu Selesai
          </span>
          <input
            aria-label="Waktu Selesai"
            className="h-[52px] w-full rounded-lg border border-[#e5e7eb] bg-white px-4 text-[15px]"
            defaultValue={reservationCreateFixture.endTime}
            readOnly
          />
        </label>
        <div className="mt-6 flex gap-3 rounded-lg bg-[#e8f5e9] p-4 text-[#0b7340]">
          <Info aria-hidden="true" size={17} />
          <div>
            <h3 className="m-0 mb-1 text-sm font-semibold">Total Durasi: {reservationCreateFixture.duration}</h3>
            <p className="m-0 text-xs leading-5">
              Waktu minimum reservasi adalah 30 menit. Zona waktu mengikuti zona waktu lokal kampus.
            </p>
          </div>
        </div>
      </section>
      <a
        className="flex min-h-[52px] items-center justify-center rounded-lg bg-[#0f9d58] px-5 text-base font-semibold text-white no-underline shadow-[0_4px_6px_rgba(15,157,88,0.2)]"
        href={reservationCreateFixture.detailHref}
      >
        Lanjutkan
      </a>
    </aside>
  );
}

function SummaryMedia() {
  return (
    <div className="relative flex h-[180px] items-center justify-center bg-gradient-to-br from-[#d1fae5] via-[#e7fbd3] to-[#fef3c7]">
      <div className="absolute inset-[18px] rounded-[10px] border-[4px] border-[#9fd9b8]/75" />
      <div className="relative text-center">
        <p className="m-0 font-serif text-[24px] font-bold leading-none text-[#1d7667]">
          IPB SRH
        </p>
        <p className="m-0 mt-2 text-[9px] text-[#374151]">Deterministic media fixture</p>
      </div>
    </div>
  );
}

function ReservationSummary() {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
      <SummaryMedia />
      <div className="p-6">
        <p className="m-0 mb-1 text-[10px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
          {reservationCreateFixture.facilityName}
        </p>
        <h3 className="m-0 mb-6 text-xl font-bold">{reservationCreateFixture.summaryTitle}</h3>
        <p className="m-0 mb-3 flex gap-3 text-sm text-[#6b7280]">
          <CalendarDays aria-hidden="true" className="text-[#0f9d58]" size={18} />
          {reservationCreateFixture.selectedDate}
        </p>
        <p className="m-0 mb-3 flex gap-3 text-sm text-[#6b7280]">
          <Clock aria-hidden="true" className="text-[#0f9d58]" size={18} />
          {reservationCreateFixture.startTime} - {reservationCreateFixture.endTime}
        </p>
        <p className="m-0 mb-6 flex gap-3 text-sm text-[#6b7280]">
          <Users aria-hidden="true" className="text-[#0f9d58]" size={18} />
          Kapasitas: {reservationCreateFixture.capacity}
        </p>
        <div className="border-t border-[#e5e7eb] pt-5">
          <h4 className="m-0 mb-4 text-[10px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
            Ringkasan Biaya
          </h4>
          <div className="space-y-3 text-sm text-[#6b7280]">
            <p className="m-0 flex justify-between gap-4">
              <span>Biaya fasilitas (4 jam)</span>
              <strong>{reservationCreateFixture.facilityCost}</strong>
            </p>
            <p className="m-0 flex justify-between gap-4">
              <span>Biaya admin</span>
              <strong>{reservationCreateFixture.adminCost}</strong>
            </p>
            <p className="m-0 flex justify-between gap-4 border-t border-[#e5e7eb] pt-4 text-base font-bold text-[#111827]">
              <span>Total Biaya</span>
              <span>{reservationCreateFixture.total}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PolicyBox() {
  return (
    <div className="flex gap-3 rounded-lg border border-[#ccfbf1] bg-[#f0fdfa] p-4 text-[#0f766e]">
      <Info aria-hidden="true" size={17} />
      <div>
        <strong className="mb-1 block text-[10px] uppercase tracking-[0.05em]">
          Kebijakan Departemen
        </strong>
        <p className="m-0 text-xs leading-5">{reservationCreateFixture.policy}</p>
      </div>
    </div>
  );
}

function StudentFooter() {
  return (
    <footer className="mt-10 flex justify-center border-t border-[#e5e7eb] bg-white py-[22px]">
      <div className="flex w-[1200px] max-w-[95%] items-center justify-between gap-6 max-md:flex-col max-md:gap-3.5 max-md:text-center">
        <div className="flex min-w-0 items-center gap-4 max-md:flex-col max-md:gap-2">
          <p className="m-0 whitespace-nowrap font-serif text-[30px] font-bold leading-none text-[#4da38b]">
            IPB SRH
          </p>
          <p className="m-0 text-[13px] leading-5 text-[#6b7280]">
            © 2026 IPB Smart Reserve Hub. Hak cipta dilindungi.
          </p>
        </div>
        <nav
          aria-label="Navigasi footer mahasiswa"
          className="flex flex-wrap justify-end gap-x-[18px] gap-y-2.5 text-sm font-semibold text-[#6b7280] max-md:justify-center"
        >
          {navItems.map((item) => (
            <a className="whitespace-nowrap no-underline" href={item.href} key={item.label}>
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}

function PageFrame({
  backHref,
  children,
  currentStep,
}: {
  backHref: string;
  children: ReactNode;
  currentStep: 1 | 2;
}) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8fafc] text-[#111827]">
      <StudentHeader />
      <main className="mx-auto mb-20 mt-[104px] w-[1200px] max-w-[95%] max-md:mb-10 max-md:mt-[88px] max-md:w-full max-md:max-w-full max-md:px-[26px]">
        <a className="mb-8 inline-flex text-sm font-semibold text-[#0f9d58] no-underline" href={backHref}>
          ← Kembali
        </a>
        <Stepper current={currentStep} />
        {children}
      </main>
      <StudentFooter />
    </div>
  );
}

export function StudentReservationTimePage() {
  return (
    <PageFrame backHref={reservationCreateFixture.facilityHref} currentStep={1}>
      <div className="flex items-start gap-8 max-lg:flex-col">
        <CalendarCard />
        <TimeCard />
      </div>
    </PageFrame>
  );
}

export function StudentReservationDetailPage() {
  return (
    <PageFrame backHref={reservationCreateFixture.timeHref} currentStep={2}>
      <div className="flex items-start gap-8 max-lg:flex-col">
        <section className="flex-1 rounded-xl bg-white p-10 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:p-6">
          <h1 className="m-0 mb-2 text-2xl font-bold">Detail Reservasi</h1>
          <p className="m-0 mb-8 text-sm leading-6 text-[#6b7280]">
            Silahkan lengkapi data berikut untuk melanjutkan proses reservasi Anda
          </p>
          <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
            <label>
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
                Nama Kegiatan
              </span>
              <input
                aria-label="Nama Kegiatan"
                className="h-[52px] w-full rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-4 text-sm"
                placeholder="Contoh: Simposium Etika AI"
              />
            </label>
            <label>
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
                Estimasi Jumlah Peserta
              </span>
              <input
                aria-label="Estimasi Jumlah Peserta"
                className="h-[52px] w-full rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-4 text-sm"
                placeholder="45"
                type="number"
              />
            </label>
            <label className="col-span-2 max-md:col-span-1">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
                Organisasi
              </span>
              <input
                aria-label="Organisasi"
                className="h-[52px] w-full rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-4 text-sm"
                placeholder="Masukkan nama organisasi"
              />
            </label>
            <label className="col-span-2 max-md:col-span-1">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
                Deskripsi Kegiatan
              </span>
              <textarea
                aria-label="Deskripsi Kegiatan"
                className="min-h-[118px] w-full rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-4 py-3 text-sm"
                placeholder="Jelaskan tujuan reservasi dan kebutuhan tata ruang secara singkat..."
              />
            </label>
            <div className="col-span-2 max-md:col-span-1">
              <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
                Keperluan Tambahan
              </span>
              <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                {reservationCreateFixture.extraRequirements.map((label) => (
                  <label
                    className="flex min-h-[58px] items-center gap-3 rounded-lg border border-[#e5e7eb] px-4 text-sm font-semibold"
                    key={label}
                  >
                    <input aria-label={label} className="h-[18px] w-[18px] accent-[#0f9d58]" type="checkbox" />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-12 flex items-center justify-between gap-4 border-t border-transparent pt-3 max-md:flex-col">
            <a className="text-sm font-semibold text-[#6b7280] no-underline max-md:order-2" href={reservationCreateFixture.timeHref}>
              Kembali ke Pencarian
            </a>
            <a
              className="rounded-lg bg-[#0f9d58] px-6 py-3.5 text-[15px] font-semibold text-white no-underline max-md:order-1 max-md:flex max-md:min-h-[52px] max-md:w-full max-md:items-center max-md:justify-center"
              href={reservationCreateFixture.letterHref}
            >
              Lanjut ke Surat
            </a>
          </div>
        </section>

        <aside className="flex w-[400px] flex-col gap-6 max-lg:w-full">
          <ReservationSummary />
          <PolicyBox />
        </aside>
      </div>
    </PageFrame>
  );
}

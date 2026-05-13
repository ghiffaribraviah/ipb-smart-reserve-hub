import { Bell, CalendarDays, Clock, LogOut, Menu, Search, Star } from "lucide-react";
import type { ReactNode } from "react";
import { studentHomeSession } from "../../fixtures/studentHome";
import { studentReviewCancellationProfileFixture } from "../../fixtures/studentReviewCancellationProfile";

const navItems = [
  { href: "/student", label: "Beranda" },
  { href: "/student/facilities", label: "Fasilitas" },
  { href: "/student/reservations", label: "Reservasi" },
];

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

function StudentFooter() {
  return (
    <footer className="mt-20 flex justify-center border-t border-[#e5e7eb] bg-white py-[22px] max-md:mt-16">
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

function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8fafc] text-[#111827]">
      <StudentHeader />
      <main className="mx-auto mt-[104px] w-[1200px] max-w-[95%] max-md:mt-[88px] max-md:w-full max-md:max-w-full max-md:px-[26px]">
        {children}
      </main>
      <StudentFooter />
    </div>
  );
}

function SummaryMedia() {
  return (
    <div className="relative flex h-[190px] items-center justify-center overflow-hidden rounded-t-xl bg-gradient-to-br from-[#d1fae5] via-[#e7fbd3] to-[#fef3c7]">
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

function ReservationSummaryCard({ includeStatus = false }: { includeStatus?: boolean }) {
  const reservation = studentReviewCancellationProfileFixture.reservation;
  return (
    <aside className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
      <SummaryMedia />
      <div className="p-6">
        <p className="m-0 mb-3 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
          Ringkasan Reservasi
        </p>
        <h2 className="m-0 text-xl font-bold">{reservation.facility}</h2>
        <div className="mt-6 grid gap-4 text-sm">
          <p className="m-0 flex items-center gap-3 text-[#6b7280]">
            <CalendarDays aria-hidden="true" className="text-[#0f9d58]" size={18} />
            {reservation.date}
          </p>
          <p className="m-0 flex items-center gap-3 text-[#6b7280]">
            <Clock aria-hidden="true" className="text-[#0f9d58]" size={18} />
            {reservation.time}
          </p>
        </div>
        {includeStatus ? (
          <dl className="m-0 mt-6 space-y-4 border-t border-[#e5e7eb] pt-5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-[#6b7280]">Organisasi</dt>
              <dd className="m-0 font-bold">{reservation.organization}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#6b7280]">Status saat ini</dt>
              <dd className="m-0">
                <span className="rounded-full bg-[#dcfce7] px-3 py-1.5 text-xs font-bold text-[#047857]">
                  Disetujui
                </span>
              </dd>
            </div>
          </dl>
        ) : null}
      </div>
    </aside>
  );
}

export function StudentReviewPage() {
  const reservation = studentReviewCancellationProfileFixture.reservation;
  return (
    <PageShell>
      <a className="text-sm font-bold text-[#0f9d58] no-underline" href={reservation.completedDetailHref}>
        ← Kembali ke Detail Reservasi
      </a>
      <div className="mt-6 grid grid-cols-[1fr_360px] items-start gap-8 max-lg:grid-cols-1">
        <section className="rounded-xl border border-[#e5e7eb] bg-white p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:p-7">
          <h1 className="m-0 text-[30px] font-bold">Tulis Ulasan</h1>
          <p className="m-0 mt-3 max-w-[520px] text-sm leading-6 text-[#6b7280]">
            Bagikan pengalaman Anda menggunakan fasilitas ini untuk membantu mahasiswa lain.
          </p>
          <form className="mt-8">
            <fieldset className="m-0 border-0 p-0">
              <legend className="mb-4 text-sm font-bold">
                Penilaian Fasilitas <span className="text-[#dc2626]">*</span>
              </legend>
              <div
                aria-label="Penilaian Fasilitas"
                className="flex gap-3"
                role="radiogroup"
              >
                {[1, 2, 3, 4, 5].map((rating) => (
                  <label
                    className="flex h-11 w-11 cursor-pointer items-center justify-center text-[#d1d5db]"
                    key={rating}
                  >
                    <input className="sr-only" name="rating" type="radio" value={rating} />
                    <span className="sr-only">{rating} dari 5</span>
                    <Star aria-hidden="true" className="fill-current" size={30} />
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="mt-8 block">
              <span className="mb-3 block text-sm font-bold">Komentar</span>
              <textarea
                aria-label="Komentar"
                className="min-h-[140px] w-full rounded-lg border border-[#d1d5db] bg-[#f8fafc] p-4 text-sm leading-6"
                defaultValue=""
                placeholder="Opsional: ceritakan pengalaman Anda terkait kebersihan, kelengkapan alat, pelayanan, atau hal lain yang membantu."
              />
            </label>
            <p className="m-0 mt-3 text-sm leading-6 text-[#6b7280]">
              Komentar bersifat opsional. Penilaian bintang wajib diisi.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 max-md:grid-cols-1">
              <button
                className="min-h-[52px] rounded-lg border border-[#e5e7eb] bg-white text-sm font-bold"
                type="button"
              >
                Batal
              </button>
              <button
                className="min-h-[52px] rounded-lg bg-[#0f9d58] text-sm font-bold text-white"
                type="button"
              >
                Kirim Ulasan
              </button>
            </div>
          </form>
        </section>
        <ReservationSummaryCard />
      </div>
    </PageShell>
  );
}

export function StudentCancellationRequestPage() {
  const reservation = studentReviewCancellationProfileFixture.reservation;
  return (
    <PageShell>
      <a className="text-sm font-bold text-[#0f9d58] no-underline" href={reservation.detailHref}>
        ← Kembali ke Detail Reservasi
      </a>
      <div className="mt-6 grid grid-cols-[1fr_360px] items-start gap-8 max-lg:grid-cols-1">
        <section className="rounded-xl border border-[#e5e7eb] bg-white p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:p-7">
          <h1 className="m-0 text-[30px] font-bold">Ajukan Pembatalan</h1>
          <p className="m-0 mt-3 text-sm leading-6 text-[#6b7280]">
            Permintaan pembatalan akan ditinjau oleh staff fasilitas sebelum status reservasi berubah.
          </p>
          <div className="mt-6 rounded-xl border border-[#fbbf24] bg-[#fffbeb] p-5 text-sm leading-6 text-[#92400e]">
            Sistem tidak memproses refund otomatis. Jika reservasi berbayar sudah disetujui,
            hubungi TU fasilitas untuk tindak lanjut pengembalian dana.
          </div>
          <form className="mt-7">
            <label className="block">
              <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
                Alasan Pembatalan
              </span>
              <select
                aria-label="Alasan Pembatalan"
                className="h-[52px] w-full rounded-lg border border-[#d1d5db] bg-white px-4 text-sm"
                defaultValue="Jadwal kegiatan berubah"
              >
                <option>Pilih alasan utama</option>
                <option>Jadwal kegiatan berubah</option>
                <option>Fasilitas tidak lagi dibutuhkan</option>
                <option>Kesalahan data reservasi</option>
              </select>
            </label>
            <label className="mt-6 block">
              <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
                Detail Alasan
              </span>
              <textarea
                aria-label="Detail Alasan"
                className="min-h-[150px] w-full rounded-lg border border-[#d1d5db] bg-white p-4 text-sm leading-6"
                defaultValue="Saya perlu membatalkan reservasi karena jadwal kegiatan organisasi dipindahkan ke minggu berikutnya."
              />
            </label>
            <p className="m-0 mt-3 text-sm leading-6 text-[#6b7280]">
              Minimal 20 karakter. Alasan ini akan dibaca oleh staff fasilitas.
            </p>
            <div className="mt-7 grid grid-cols-2 gap-4 max-md:grid-cols-1">
              <button
                className="min-h-[52px] rounded-lg border border-[#e5e7eb] bg-white text-sm font-bold"
                type="button"
              >
                Batalkan
              </button>
              <button
                className="min-h-[52px] rounded-lg border border-[#fbbf24] bg-[#fffbeb] text-sm font-bold text-[#92400e]"
                type="button"
              >
                Kirim Pengajuan
              </button>
            </div>
          </form>
        </section>
        <div className="grid gap-6">
          <ReservationSummaryCard includeStatus />
          <section>
            <h2 className="m-0 text-xl font-bold">State Setelah Pengajuan</h2>
            <p className="m-0 mt-4 text-sm leading-6 text-[#6b7280]">
              Referensi tampilan ketika mahasiswa kembali ke detail reservasi setelah pengajuan pembatalan diproses.
            </p>
            <div className="mt-5 grid gap-4">
              <div className="rounded-xl border border-[#fbbf24] bg-[#fffbeb] p-5 text-[#92400e]">
                <h3 className="m-0 text-base font-bold">Pembatalan Menunggu Review</h3>
                <p className="m-0 mt-2 text-sm leading-6">
                  Pengajuan pembatalan sudah terkirim dan menunggu tinjauan staff fasilitas.
                </p>
              </div>
              <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] p-5 text-[#991b1b]">
                <h3 className="m-0 text-base font-bold">Pembatalan Ditolak</h3>
                <p className="m-0 mt-2 text-sm leading-6">
                  Pengajuan pembatalan ditolak karena kegiatan sudah melewati batas pembatalan.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
}

const profileRows = [
  ["Nomor Induk Mahasiswa (NIM)", studentReviewCancellationProfileFixture.profile.nim],
  ["Nomor Telepon", studentReviewCancellationProfileFixture.profile.phone],
  ["Program Studi", studentReviewCancellationProfileFixture.profile.program],
  ["Fakultas", studentReviewCancellationProfileFixture.profile.faculty],
  ["Tahun Masuk", studentReviewCancellationProfileFixture.profile.entryYear],
  ["Strata", studentReviewCancellationProfileFixture.profile.degree],
] as const;

export function StudentProfilePage() {
  const profile = studentReviewCancellationProfileFixture.profile;
  return (
    <PageShell>
      <section className="max-w-[620px]">
        <h1 className="m-0 text-[32px] font-bold max-md:text-[30px]">Profil Mahasiswa</h1>
        <p className="m-0 mt-3 text-sm leading-6 text-[#6b7280]">
          Lihat identitas akun dan informasi akademik yang terhubung dengan NIM Anda.
        </p>
      </section>
      <div className="mt-8 grid grid-cols-[320px_1fr] items-start gap-8 max-lg:grid-cols-1">
        <aside className="rounded-xl border border-[#e5e7eb] bg-white p-8 text-center shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
          <div className="mx-auto flex h-[116px] w-[116px] items-center justify-center rounded-full border-4 border-white bg-[#e8f5e9] text-[38px] font-bold text-[#0f9d58] shadow">
            {profile.initials}
          </div>
          <h2 className="m-0 mt-6 text-xl font-bold">{profile.name}</h2>
          <p className="m-0 mt-2 text-sm text-[#6b7280]">{profile.nim}</p>
          <span className="mt-5 inline-flex rounded-full bg-[#dcfce7] px-4 py-2 text-sm font-bold text-[#047857]">
            {profile.status}
          </span>
          <button
            aria-label="Keluar"
            className="mt-7 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg border border-[#fecaca] bg-[#fee2e2] text-sm font-bold text-[#b91c1c]"
            type="button"
          >
            <LogOut aria-hidden="true" size={18} />
            Keluar
          </button>
        </aside>
        <section className="rounded-xl border border-[#e5e7eb] bg-white p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
          <h2 className="m-0 text-xl font-bold">Informasi Akademik</h2>
          <dl className="m-0 mt-6 grid grid-cols-2 gap-x-10 gap-y-7 border-t border-[#e5e7eb] pt-6 max-md:grid-cols-1">
            {profileRows.map(([label, value]) => (
              <div key={label}>
                <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
                  {label}
                </dt>
                <dd className="m-0 mt-3 break-words text-base font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </PageShell>
  );
}

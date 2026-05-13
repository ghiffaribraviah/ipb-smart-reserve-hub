import {
  Bell,
  Building2,
  Menu,
  Search,
  Star,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  facilityCatalogCategories,
  facilityCatalogItems,
  facilityCatalogOrganizations,
  facilityCatalogSorts,
  type FacilityCatalogItem,
} from "../../fixtures/studentFacilityCatalog";
import { studentHomeSession } from "../../fixtures/studentHome";

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
              className="h-10 w-[250px] rounded-full border border-[#dbe2ea] bg-gradient-to-b from-white to-slate-50 py-2.5 pl-[42px] pr-4 text-[13px] font-medium leading-5 outline-none focus:border-[#10b981] focus:bg-white"
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
              aria-current={item.label === "Fasilitas" ? "page" : undefined}
              className={`border-b-2 pb-1 text-sm font-bold no-underline ${
                item.label === "Fasilitas"
                  ? "border-[#10b981] text-[#10b981]"
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

function buildQueryHref(page: number) {
  return `/student/facilities?page=${page}`;
}

function formatRating(value: number) {
  return value.toFixed(1);
}

function FacilityMedia({ item }: { item: FacilityCatalogItem }) {
  return (
    <div
      aria-label={`Foto ${item.name}`}
      className="relative flex h-[180px] items-center justify-center bg-gradient-to-br from-[#d1fae5] via-[#efffd6] to-[#fef3c7] max-md:h-[190px]"
      role="img"
    >
      <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-[#111827] shadow-[0_2px_4px_rgba(0,0,0,0.12)]">
        {item.categoryLabel}
      </span>
      <div className="absolute inset-[18px] rounded-[10px] border-4 border-[#9fd9b8]/70" />
      <div className="relative text-center">
        <p className="m-0 font-serif text-[26px] font-bold leading-none text-[#1d7667]">
          IPB SRH
        </p>
        <p className="m-0 mt-2 text-[9px] font-bold tracking-normal text-[#1f2937]">
          Deterministic media fixture
        </p>
      </div>
    </div>
  );
}

function CatalogCard({ item }: { item: FacilityCatalogItem }) {
  return (
    <article className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
      <a
        className="flex h-full flex-col text-[#111827] no-underline outline-none focus-visible:ring-2 focus-visible:ring-[#10b981] focus-visible:ring-offset-4"
        href={item.href}
      >
        <FacilityMedia item={item} />
        <div className="flex flex-1 flex-col p-5">
          <h2 className="m-0 mb-2 text-base font-bold leading-snug max-md:text-[17px]">
            {item.name}
          </h2>
          <div className="mb-3 flex items-center gap-1 text-xs font-semibold text-[#111827]">
            <Star aria-hidden="true" className="fill-[#10b981] text-[#10b981]" size={14} />
            <span>{formatRating(item.rating)}</span>
            <span className="font-normal text-[#6b7280]">({item.reviews} ulasan)</span>
          </div>
          <p className="m-0 mb-5 flex-1 text-[13px] leading-[1.5] text-[#6b7280]">
            {item.description}
          </p>
          <div className="flex justify-between gap-3 border-t border-[#e5e7eb] pt-4 text-xs font-medium text-[#6b7280]">
            <span className="flex min-w-0 items-center gap-1.5">
              <Users aria-hidden="true" className="shrink-0" size={16} />
              Kapasitas: {item.capacity.toLocaleString("en-US")}
            </span>
            <span className="shrink-0">{item.price}</span>
          </div>
        </div>
      </a>
    </article>
  );
}

function StudentFooter() {
  return (
    <footer className="flex justify-center border-t border-[#e5e7eb] bg-white py-[22px]">
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

export function StudentFacilityCatalogPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const minCapacity = searchParams.get("min_capacity") ?? "";
  const sort = searchParams.get("sort") ?? "relevance";
  const page = searchParams.get("page") ?? "1";

  const filteredItems = useMemo(() => {
    const minCapacityValue = Number(minCapacity || 0);
    const normalizedQuery = query.trim().toLowerCase();
    const results = facilityCatalogItems.filter((item) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.description.toLowerCase().includes(normalizedQuery);
      const matchesCategory = category.length === 0 || item.category === category;
      const matchesCapacity = !minCapacityValue || item.capacity >= minCapacityValue;

      return matchesQuery && matchesCategory && matchesCapacity;
    });

    if (sort === "name") {
      return [...results].sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sort === "capacity") {
      return [...results].sort((a, b) => b.capacity - a.capacity);
    }
    if (sort === "rating") {
      return [...results].sort((a, b) => b.rating - a.rating);
    }

    return results;
  }, [category, minCapacity, query, sort]);

  const visibleTotal = query || category || minCapacity ? filteredItems.length : 12;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8fafc] text-[#111827]">
      <StudentHeader />
      <main className="mx-auto mb-20 mt-[112px] w-[1200px] max-w-[95%] max-md:mb-14 max-md:mt-[88px] max-md:w-full max-md:max-w-full max-md:px-4">
        <div className="mb-8 max-md:mb-6">
          <h1 className="m-0 mb-2 text-[32px] font-bold leading-tight max-md:text-[28px]">
            Katalog Fasilitas
          </h1>
          <p className="m-0 text-sm leading-6 text-[#6b7280]">
            Temukan dan reservasi ruangan yang sesuai dengan kebutuhan kegiatan Anda.
          </p>
        </div>

        <form
          action="/student/facilities"
          className="mb-8 flex flex-wrap items-end gap-4 rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:gap-4 max-md:rounded-[14px] max-md:p-[18px]"
        >
          <div className="flex min-w-[200px] flex-1 flex-col gap-2 max-md:min-w-0 max-md:basis-full">
            <label
              className="text-xs font-semibold uppercase tracking-[0.04em] text-[#6b7280] max-md:text-[10px]"
              htmlFor="catalog-search"
            >
              Pencarian
            </label>
            <div className="flex min-h-11 items-center rounded-lg border border-[#e5e7eb] bg-white px-4 focus-within:border-[#10b981] max-md:min-h-[46px] max-md:rounded-[10px]">
              <Search aria-hidden="true" className="mr-3 shrink-0 text-[#6b7280]" size={18} />
              <input
                className="min-w-0 flex-1 border-0 bg-transparent py-3 text-sm outline-none placeholder:text-[#9ca3af] max-md:text-[13px]"
                defaultValue={query}
                id="catalog-search"
                name="q"
                placeholder="Nama ruangan atau gedung..."
                type="text"
              />
            </div>
          </div>

          <div className="flex min-w-[200px] flex-1 flex-col gap-2 max-md:min-w-0 max-md:basis-full">
            <label
              className="text-xs font-semibold uppercase tracking-[0.04em] text-[#6b7280] max-md:text-[10px]"
              htmlFor="catalog-organization"
            >
              Organisasi / Fakultas
            </label>
            <div className="flex min-h-11 items-center rounded-lg border border-[#e5e7eb] bg-white px-4 focus-within:border-[#10b981] max-md:min-h-[46px] max-md:rounded-[10px]">
              <Building2 aria-hidden="true" className="mr-3 shrink-0 text-[#6b7280]" size={18} />
              <select
                className="min-w-0 flex-1 border-0 bg-transparent py-3 text-sm outline-none max-md:text-[13px]"
                defaultValue=""
                id="catalog-organization"
                name="organization"
              >
                {facilityCatalogOrganizations.map((option) => (
                  <option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex min-w-[200px] flex-1 flex-col gap-2 max-md:min-w-0 max-md:basis-full">
            <label
              className="text-xs font-semibold uppercase tracking-[0.04em] text-[#6b7280] max-md:text-[10px]"
              htmlFor="catalog-category"
            >
              Tipe Fasilitas
            </label>
            <div className="flex min-h-11 items-center rounded-lg border border-[#e5e7eb] bg-white px-4 focus-within:border-[#10b981] max-md:min-h-[46px] max-md:rounded-[10px]">
              <Building2 aria-hidden="true" className="mr-3 shrink-0 text-[#6b7280]" size={18} />
              <select
                className="min-w-0 flex-1 border-0 bg-transparent py-3 text-sm outline-none max-md:text-[13px]"
                defaultValue={category}
                id="catalog-category"
                name="category"
              >
                {facilityCatalogCategories.map((option) => (
                  <option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex min-w-[200px] flex-1 flex-col gap-2 max-md:min-w-0 max-md:basis-full">
            <label
              className="text-xs font-semibold uppercase tracking-[0.04em] text-[#6b7280] max-md:text-[10px]"
              htmlFor="catalog-min-capacity"
            >
              Min. Kapasitas
            </label>
            <div className="flex min-h-11 items-center rounded-lg border border-[#e5e7eb] bg-white px-4 focus-within:border-[#10b981] max-md:min-h-[46px] max-md:rounded-[10px]">
              <Users aria-hidden="true" className="mr-3 shrink-0 text-[#6b7280]" size={18} />
              <input
                className="min-w-0 flex-1 border-0 bg-transparent py-3 text-sm outline-none placeholder:text-[#9ca3af] max-md:text-[13px]"
                defaultValue={minCapacity}
                id="catalog-min-capacity"
                name="min_capacity"
                placeholder="Contoh: 50"
                type="number"
              />
            </div>
          </div>

          <button
            className="flex h-11 items-center justify-center rounded-lg bg-[#10b981] px-8 text-[15px] font-semibold text-white hover:bg-[#059669] max-md:min-h-[46px] max-md:w-full"
            type="submit"
          >
            Terapkan Filter
          </button>
        </form>

        <div className="mb-6 flex items-center justify-between gap-5 max-md:grid max-md:grid-cols-1 max-md:gap-3.5">
          <p className="m-0 text-sm font-medium text-[#6b7280]">
            Menampilkan <span className="font-bold text-[#111827]">{visibleTotal}</span> dari{" "}
            <span className="font-bold text-[#111827]">48</span> fasilitas
          </p>
          <label className="flex items-center gap-2 text-sm text-[#6b7280] max-md:justify-between">
            Urutkan berdasarkan:
            <select
              aria-label="Urutkan berdasarkan"
              className="border-0 bg-transparent font-semibold text-[#111827] outline-none"
              defaultValue={sort}
              name="sort"
            >
              {facilityCatalogSorts.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {filteredItems.length > 0 ? (
          <div className="mb-12 grid grid-cols-4 gap-6 max-lg:grid-cols-3 max-md:grid-cols-1 max-md:gap-5">
            {filteredItems.map((item) => (
              <CatalogCard item={item} key={item.slug} />
            ))}
          </div>
        ) : (
          <section className="mb-12 rounded-xl border border-[#e5e7eb] bg-white p-8 text-center shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
            <h2 className="m-0 text-xl font-bold">Tidak ada fasilitas ditemukan</h2>
            <p className="mx-auto mb-0 mt-2 max-w-[520px] text-sm leading-6 text-[#6b7280]">
              Ubah kata kunci, tipe fasilitas, atau kapasitas minimum untuk melihat hasil
              katalog lain.
            </p>
          </section>
        )}

        <nav
          aria-label="Halaman katalog"
          className="flex justify-center gap-2"
        >
          {["←", "1", "2", "3", "…", "8", "→"].map((label) => (
            <a
              aria-current={label === page ? "page" : undefined}
              className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-semibold no-underline ${
                label === page
                  ? "border-[#10b981] bg-[#10b981] text-white"
                  : "border-[#e5e7eb] bg-white text-[#6b7280]"
              }`}
              href={label === "…" ? "/student/facilities" : buildQueryHref(Number(label) || 1)}
              key={label}
            >
              {label}
            </a>
          ))}
        </nav>
      </main>
      <StudentFooter />
    </div>
  );
}

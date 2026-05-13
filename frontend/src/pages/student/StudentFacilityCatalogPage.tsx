import {
  Building2,
  Menu,
  Search,
  Star,
  Users,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiRequest } from "../../api/http";
import { NotificationSurface } from "../../components/NotificationSurface";
import type { FacilityCatalogItem } from "../../fixtures/studentFacilityCatalog";
import { studentHomeSession } from "../../fixtures/studentHome";

type FacilityCategoryResponse = {
  facility_count: number;
  icon_hint: string | null;
  id: string;
  name: string;
  slug: string;
};

type FacilityCatalogItemResponse = {
  capacity: number;
  category: string;
  cover_image_url: string | null;
  id: string;
  location: string;
  name: string;
  open_hours_summary: string;
  price_summary: string;
  rating_average: number | null;
  review_count: number;
};

type FacilityCatalogPageResponse = {
  items: FacilityCatalogItemResponse[];
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
};

const catalogSortOptions = [
  { label: "Abjad (A-Z)", value: "name_asc" },
  { label: "Kapasitas Terbanyak", value: "capacity_desc" },
  { label: "Rating Tertinggi", value: "rating_desc" },
  { label: "Harga Terendah", value: "price_asc" },
  { label: "Harga Tertinggi", value: "price_desc" },
] as const;

const supportedSorts: ReadonlySet<string> = new Set(catalogSortOptions.map((option) => option.value));
const defaultSort = "name_asc";
const pageSize = 12;

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
          <NotificationSurface className="text-slate-500" role="student" />
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

function buildQueryHref(searchParams: URLSearchParams, page: number) {
  const params = new URLSearchParams(searchParams);
  params.set("page", String(page));
  return `/student/facilities?${params.toString()}`;
}

function formatRating(value: number) {
  return value.toFixed(1);
}

function mapCatalogItem(item: FacilityCatalogItemResponse): FacilityCatalogItem {
  return {
    capacity: item.capacity,
    category: item.category,
    categoryLabel: item.category,
    description: `${item.location} · ${item.open_hours_summary}`,
    href: `/student/facilities/${item.id}`,
    name: item.name,
    price: item.price_summary,
    rating: item.rating_average ?? 0,
    reviews: item.review_count,
    slug: item.id,
  };
}

function categoryOptions(categories: FacilityCategoryResponse[]) {
  return [
    { label: "Semua Kategori", value: "" },
    ...categories.map((category) => ({ label: category.name, value: category.slug })),
  ];
}

function catalogPath({
  category,
  minCapacity,
  page,
  query,
  sort,
}: {
  category: string;
  minCapacity: string;
  page: string;
  query: string;
  sort: string;
}) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (category) params.set("category", category);
  if (minCapacity) params.set("min_capacity", minCapacity);
  params.set("sort", sort);
  params.set("page", page);
  params.set("page_size", String(pageSize));
  return `/facilities?${params.toString()}`;
}

async function fetchCategories() {
  return apiRequest<FacilityCategoryResponse[]>("/facility-categories");
}

async function fetchCatalog(params: {
  category: string;
  minCapacity: string;
  page: string;
  query: string;
  sort: string;
}) {
  return apiRequest<FacilityCatalogPageResponse>(catalogPath(params));
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
  const navigate = useNavigate();
  const query = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const minCapacity = searchParams.get("min_capacity") ?? "";
  const requestedSort = searchParams.get("sort") ?? defaultSort;
  const sort = supportedSorts.has(requestedSort) ? requestedSort : defaultSort;
  const page = searchParams.get("page") ?? "1";
  const invalidSort = requestedSort !== sort;
  const categoriesQuery = useQuery({
    queryFn: fetchCategories,
    queryKey: ["facility-categories"],
  });
  const catalogQuery = useQuery({
    queryFn: () => fetchCatalog({ category, minCapacity, page, query, sort }),
    queryKey: ["facility-catalog", query, category, minCapacity, sort, page],
  });
  const options = categoryOptions(categoriesQuery.data ?? []);
  const catalogPage = catalogQuery.data;
  const items = catalogPage?.items.map(mapCatalogItem) ?? [];
  const totalItems = catalogPage?.total_items ?? 0;
  const totalPages = catalogPage?.total_pages ?? 0;

  function handleSortChange(nextSort: string) {
    const params = new URLSearchParams(searchParams);
    params.set("sort", nextSort);
    params.set("page", "1");
    navigate(`/student/facilities?${params.toString()}`);
  }

  function handleCategoryChange(nextCategory: string) {
    const params = new URLSearchParams(searchParams);
    if (nextCategory) {
      params.set("category", nextCategory);
    } else {
      params.delete("category");
    }
    params.set("page", "1");
    navigate(`/student/facilities?${params.toString()}`);
  }

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
          id="catalog-filter-form"
          className="mb-8 flex flex-wrap items-end gap-4 rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:gap-4 max-md:rounded-[14px] max-md:p-[18px]"
        >
          <input name="sort" type="hidden" value={sort} />
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
              htmlFor="catalog-category"
            >
              Kategori Fasilitas
            </label>
            <div className="flex min-h-11 items-center rounded-lg border border-[#e5e7eb] bg-white px-4 focus-within:border-[#10b981] max-md:min-h-[46px] max-md:rounded-[10px]">
              <Building2 aria-hidden="true" className="mr-3 shrink-0 text-[#6b7280]" size={18} />
              <select
                className="min-w-0 flex-1 border-0 bg-transparent py-3 text-sm outline-none max-md:text-[13px]"
                id="catalog-category"
                name="category"
                onChange={(event) => handleCategoryChange(event.target.value)}
                value={category}
              >
                {options.map((option) => (
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
            Menampilkan <span className="font-bold text-[#111827]">{items.length}</span> dari{" "}
            <span className="font-bold text-[#111827]">{totalItems}</span> fasilitas
          </p>
          <label className="flex items-center gap-2 text-sm text-[#6b7280] max-md:justify-between">
            Urutkan berdasarkan:
            <select
              aria-label="Urutkan berdasarkan"
              className="border-0 bg-transparent font-semibold text-[#111827] outline-none"
              onChange={(event) => handleSortChange(event.target.value)}
              value={sort}
              name="sort"
            >
              {catalogSortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {invalidSort ? (
          <div className="mb-6 rounded-lg border border-[#fed7aa] bg-[#fff7ed] px-4 py-3 text-sm font-semibold text-[#9a3412]">
            Parameter urut tidak didukung. Menggunakan urutan nama.
          </div>
        ) : null}

        {catalogQuery.isLoading ? (
          <div className="mb-12 grid min-h-[360px] grid-cols-4 gap-6 max-lg:grid-cols-3 max-md:grid-cols-1 max-md:gap-5">
            {Array.from({ length: 8 }).map((_, index) => (
              <div className="h-[342px] rounded-xl border border-[#e5e7eb] bg-white" key={index} />
            ))}
          </div>
        ) : catalogQuery.isError ? (
          <section className="mb-12 rounded-xl border border-[#e5e7eb] bg-white p-8 text-center shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
            <h2 className="m-0 text-xl font-bold">Katalog belum dapat dimuat</h2>
            <p className="mx-auto mb-0 mt-2 max-w-[520px] text-sm leading-6 text-[#6b7280]">
              Periksa parameter pencarian atau coba muat ulang katalog.
            </p>
            <button
              className="mt-5 rounded-lg border border-[#10b981] bg-white px-4 py-2 text-sm font-bold text-[#0f9d58]"
              onClick={() => void catalogQuery.refetch()}
              type="button"
            >
              Muat ulang katalog
            </button>
          </section>
        ) : items.length > 0 ? (
          <div className="mb-12 grid grid-cols-4 gap-6 max-lg:grid-cols-3 max-md:grid-cols-1 max-md:gap-5">
            {items.map((item) => (
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
          {Array.from({ length: Math.max(totalPages, 1) }).map((_, index) => {
            const label = String(index + 1);
            return (
            <a
              aria-current={label === page ? "page" : undefined}
              className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-semibold no-underline ${
                label === page
                  ? "border-[#10b981] bg-[#10b981] text-white"
                  : "border-[#e5e7eb] bg-white text-[#6b7280]"
              }`}
              href={buildQueryHref(searchParams, Number(label))}
              key={label}
            >
              {label}
            </a>
            );
          })}
        </nav>
      </main>
      <StudentFooter />
    </div>
  );
}

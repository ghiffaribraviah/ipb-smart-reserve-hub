import {
  Activity,
  Building2,
  ChevronDown,
  House,
  Megaphone,
  Menu,
  Monitor,
  Search,
  Star,
  Trees,
  Users,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import { apiRequest } from "../../api/http";
import { NotificationSurface } from "../../components/NotificationSurface";
import { StudentHeaderSearch } from "../../components/layout/StudentHeaderSearch";
import {
  studentHomeSession,
} from "../../fixtures/studentHome";

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

type StudentHomeCategory = {
  description: string;
  href: string;
  icon: LucideIcon;
  name: string;
  slug: string;
};

type StudentHomeFacility = {
  capacity: string;
  category: string;
  coverImageUrl: string | null;
  description: string;
  href: string;
  name: string;
  price: string;
  rating: string;
  reviewCount: string;
  slug: string;
};

const navItems = [
  { href: "/student", label: "Beranda" },
  { href: "/student/facilities", label: "Fasilitas" },
  { href: "/student/reservations", label: "Reservasi" },
];

const iconByHint: Record<string, LucideIcon> = {
  classroom: Building2,
  dumbbell: Activity,
  equipment: Monitor,
  landscape: Trees,
  outdoor: Trees,
  presentation: Megaphone,
  school: Building2,
  seminar: Megaphone,
  sport: Activity,
};

function categoryIcon(iconHint: string | null) {
  if (!iconHint) {
    return House;
  }

  return iconByHint[iconHint] ?? House;
}

function formatCapacity(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatRating(value: number | null) {
  return value === null ? "Belum ada rating" : value.toFixed(1);
}

function formatReviewCount(value: number) {
  return `${new Intl.NumberFormat("id-ID").format(value)} ulasan`;
}

function mapCategory(category: FacilityCategoryResponse): StudentHomeCategory {
  return {
    description: `${new Intl.NumberFormat("id-ID").format(category.facility_count)} fasilitas tersedia`,
    href: `/student/facilities?category=${encodeURIComponent(category.slug)}`,
    icon: categoryIcon(category.icon_hint),
    name: category.name,
    slug: category.slug,
  };
}

function mapFeaturedFacility(facility: FacilityCatalogItemResponse): StudentHomeFacility {
  return {
    capacity: formatCapacity(facility.capacity),
    category: facility.category,
    coverImageUrl: facility.cover_image_url,
    description: `${facility.location} · ${facility.open_hours_summary}`,
    href: `/student/facilities/${facility.id}`,
    name: facility.name,
    price: facility.price_summary,
    rating: formatRating(facility.rating_average),
    reviewCount: formatReviewCount(facility.review_count),
    slug: facility.id,
  };
}

async function fetchHomeCategories() {
  const categories = await apiRequest<FacilityCategoryResponse[]>("/facility-categories");
  return categories.map(mapCategory);
}

async function fetchFeaturedFacilities() {
  const page = await apiRequest<FacilityCatalogPageResponse>("/facilities?featured=true&limit=8");
  return page.items.map(mapFeaturedFacility);
}

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
          <StudentHeaderSearch />
        </div>

        <nav
          aria-label="Navigasi mahasiswa"
          className="flex items-center gap-10 max-md:hidden"
        >
          {navItems.map((item) => (
            <a
              aria-current={item.label === "Beranda" ? "page" : undefined}
              className={`border-b-2 pb-1 text-sm font-bold no-underline ${
                item.label === "Beranda"
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

function HeroSearch() {
  return (
    <form
      action="/student/facilities"
      className="absolute bottom-[-40px] z-10 grid w-[900px] max-w-[95%] grid-cols-[1fr_1fr_1fr_auto] gap-4 rounded-xl bg-white p-4 shadow-[0_10px_25px_rgba(0,0,0,0.1)] max-lg:bottom-[-100px] max-lg:grid-cols-1 max-md:static max-md:mt-6 max-md:w-[calc(100%-32px)] max-md:max-w-[358px] max-md:gap-2.5 max-md:p-3"
    >
      <label className="flex min-h-12 min-w-0 items-center rounded-lg border border-[#e5e7eb] bg-white px-4 max-md:min-h-11 max-md:px-3">
        <Search aria-hidden="true" className="shrink-0 text-[#9ca3af]" size={18} />
        <span className="sr-only">Nama ruangan</span>
        <input
          className="min-w-0 flex-1 border-0 bg-transparent px-2 py-3 text-sm text-[#111827] outline-none max-md:py-2.5 max-md:text-[13px]"
          name="q"
          placeholder="Nama Ruangan"
          type="text"
        />
      </label>
      <label className="flex min-h-12 min-w-0 items-center rounded-lg border border-[#e5e7eb] bg-white px-4 max-md:min-h-11 max-md:px-3">
        <span className="sr-only">Pilih fakultas</span>
        <select
          className="min-w-0 flex-1 border-0 bg-transparent px-2 py-3 text-sm text-[#111827] outline-none max-md:py-2.5 max-md:text-[13px]"
          name="faculty"
        >
          <option value="">Semua Fakultas</option>
          <option value="faperta">Pertanian</option>
          <option value="fkh">Kedokteran Hewan</option>
        </select>
      </label>
      <label className="flex min-h-12 min-w-0 items-center rounded-lg border border-[#e5e7eb] bg-white px-4 max-md:min-h-11 max-md:px-3">
        <Users aria-hidden="true" className="shrink-0 text-[#9ca3af]" size={18} />
        <span className="sr-only">Kapasitas</span>
        <input
          className="min-w-0 flex-1 border-0 bg-transparent px-2 py-3 text-sm text-[#111827] outline-none max-md:py-2.5 max-md:text-[13px]"
          min="0"
          name="capacity"
          onChange={(event) => {
            if (Number(event.target.value) < 0) {
              event.target.value = "0";
            }
          }}
          placeholder="Kapasitas"
          type="number"
        />
      </label>
      <button
        className="min-h-12 rounded-lg bg-[#10b981] px-8 text-[15px] font-semibold text-white hover:bg-[#059669] max-md:min-h-10 max-md:w-full"
        type="submit"
      >
        Cari
      </button>
    </form>
  );
}

function StudentHero() {
  return (
    <section className="relative mt-[72px] flex h-[400px] flex-col items-center justify-center overflow-visible bg-[#12372f] px-5 text-center text-white max-md:mt-16 max-md:h-auto max-md:justify-start max-md:px-5 max-md:pb-8 max-md:pt-[34px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(254,243,199,0.24),transparent_32%),linear-gradient(135deg,rgba(15,118,103,0.96),rgba(38,44,25,0.86)_48%,rgba(15,23,42,0.88))]" />
      <div className="absolute inset-0 flex select-none items-center justify-center opacity-[0.11]">
        <div className="font-serif text-[88px] font-bold leading-none tracking-normal max-md:text-[48px]">
          IPB SRH
          <p className="m-0 mt-2 font-sans text-sm font-semibold uppercase tracking-[0.12em]">
            Deterministic media fixture
          </p>
        </div>
      </div>
      <div className="relative z-10">
        <p className="m-0 mb-2 text-base font-medium tracking-[0.06em] max-md:text-xs">
          Reservasi fasilitas kampus lebih cepat.
        </p>
        <h1 className="m-0 mb-4 text-5xl font-bold leading-tight max-md:mx-auto max-md:max-w-[330px] max-md:text-[34px] max-md:leading-[1.15]">
          IPB Smart Reserve Hub
        </h1>
        <p className="m-0 mb-10 max-w-[700px] text-base leading-6 opacity-90 max-md:mx-auto max-md:mb-0 max-md:max-w-[330px] max-md:text-[13px] max-md:leading-5">
          Temukan ruang, cek ketersediaan, dan ajukan reservasi fasilitas IPB dalam
          satu alur yang rapi.
        </p>
      </div>
      <HeroSearch />
    </section>
  );
}

function CategoryShortcut({ category }: { category: StudentHomeCategory }) {
  const Icon = category.icon;

  return (
    <a
      className="flex min-w-0 flex-col items-center text-center text-[#111827] no-underline outline-none focus-visible:ring-2 focus-visible:ring-[#10b981] focus-visible:ring-offset-4"
      href={category.href}
    >
      <span className="mb-4 flex h-16 w-16 items-center justify-center text-[#111827] max-md:mb-2.5 max-md:h-[52px] max-md:w-[52px]">
        <Icon aria-hidden="true" size={32} strokeWidth={2} />
      </span>
      <span className="text-base font-semibold max-md:text-sm">{category.name}</span>
      <span className="mt-2 max-w-[168px] text-xs leading-[1.5] text-[#6b7280] max-md:max-w-[130px] max-md:text-[11px]">
        {category.description}
      </span>
    </a>
  );
}

function FacilityMedia({ facility }: { facility: StudentHomeFacility }) {
  const hasImage = Boolean(facility.coverImageUrl);

  return (
    <div
      aria-label={hasImage ? undefined : `Foto ${facility.name}`}
      className="relative flex h-[180px] items-center justify-center overflow-hidden bg-gradient-to-br from-[#d1fae5] via-[#efffd6] to-[#fef3c7] text-center max-md:h-[150px]"
      role={hasImage ? undefined : "img"}
    >
      {facility.coverImageUrl ? (
        <img
          alt={`Foto ${facility.name}`}
          className="absolute inset-0 h-full w-full object-cover"
          src={facility.coverImageUrl}
        />
      ) : null}
      <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-[#111827] shadow-[0_2px_4px_rgba(0,0,0,0.12)] max-md:px-2.5 max-md:text-[10px]">
        {facility.category}
      </span>
      {!facility.coverImageUrl ? (
        <>
          <div className="absolute inset-[18px] rounded-[10px] border-4 border-[#9fd9b8]/70 max-md:inset-3" />
          <div className="relative">
            <p className="m-0 font-serif text-[26px] font-bold leading-none text-[#1d7667] max-md:text-xl">
              IPB SRH
            </p>
            <p className="m-0 mt-2 text-[9px] font-bold tracking-normal text-[#1f2937] max-md:text-[8px]">
              Deterministic media fixture
            </p>
          </div>
        </>
      ) : null}
    </div>
  );
}

function FacilityCard({ facility }: { facility: StudentHomeFacility }) {
  return (
    <article className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
      <a
        className="flex h-full flex-col text-[#111827] no-underline outline-none focus-visible:ring-2 focus-visible:ring-[#10b981] focus-visible:ring-offset-4"
        href={facility.href}
      >
        <FacilityMedia facility={facility} />
        <div className="flex flex-1 flex-col p-5 max-md:p-3.5">
          <h3 className="m-0 mb-2 text-base font-bold leading-snug max-md:text-[15px]">
            {facility.name}
          </h3>
          <div className="mb-3 flex items-center gap-1 text-xs font-semibold text-[#111827] max-md:text-[11px]">
            <Star aria-hidden="true" className="fill-[#10b981] text-[#10b981]" size={14} />
            <span>{facility.rating}</span>
            <span className="font-normal text-[#6b7280]">({facility.reviewCount})</span>
          </div>
          <p className="m-0 mb-5 flex-1 text-[13px] leading-[1.5] text-[#6b7280] max-md:mb-3.5 max-md:text-[11px]">
            {facility.description}
          </p>
          <div className="flex justify-between gap-3 border-t border-[#e5e7eb] pt-4 text-xs font-medium text-[#6b7280] max-md:flex-col max-md:gap-2 max-md:text-[10px]">
            <span className="flex min-w-0 items-center gap-1.5">
              <Users aria-hidden="true" className="shrink-0" size={16} />
              Kapasitas: {facility.capacity}
            </span>
            <span className="shrink-0 font-semibold text-[#111827]">{facility.price}</span>
          </div>
        </div>
      </a>
    </article>
  );
}

function CategorySkeletonGrid() {
  return (
    <div
      aria-label="Memuat tipe fasilitas"
      className="grid min-h-[154px] grid-cols-5 gap-6 max-lg:grid-cols-3 max-lg:gap-8 max-md:grid-cols-2 max-md:gap-x-[18px] max-md:gap-y-6"
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <div className="grid justify-items-center gap-3" key={index}>
          <span className="h-16 w-16 rounded-full bg-[#f3f4f6] max-md:h-[52px] max-md:w-[52px]" />
          <span className="h-4 w-24 rounded bg-[#f3f4f6]" />
          <span className="h-3 w-32 rounded bg-[#f3f4f6] max-md:w-24" />
        </div>
      ))}
    </div>
  );
}

function FeaturedSkeletonGrid() {
  return (
    <div
      aria-label="Memuat fasilitas unggulan"
      className="grid min-h-[374px] grid-cols-4 gap-6 max-lg:grid-cols-2 max-md:grid-cols-2 max-md:gap-x-3.5 max-md:gap-y-[18px]"
    >
      {Array.from({ length: 8 }).map((_, index) => (
        <article className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white" key={index}>
          <div className="h-[180px] bg-[#f3f4f6] max-md:h-[132px]" />
          <div className="grid gap-3 p-5 max-md:p-3.5">
            <span className="h-3 w-24 rounded bg-[#f3f4f6]" />
            <span className="h-4 w-36 rounded bg-[#f3f4f6]" />
            <span className="h-12 rounded bg-[#f3f4f6]" />
            <span className="h-4 rounded bg-[#f3f4f6]" />
          </div>
        </article>
      ))}
    </div>
  );
}

function SectionState({
  actionLabel,
  message,
  onRetry,
}: {
  actionLabel?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-[154px] flex-col items-center justify-center rounded-xl border border-dashed border-[#d1d5db] bg-[#f9fafb] px-6 py-8 text-center">
      <p className="m-0 text-sm font-semibold text-[#6b7280]">{message}</p>
      {onRetry && actionLabel ? (
        <button
          className="mt-4 rounded-lg border border-[#10b981] bg-white px-4 py-2 text-sm font-bold text-[#0f9d58]"
          onClick={onRetry}
          type="button"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function CategorySection({
  categories,
  isError,
  isLoading,
  onRetry,
}: {
  categories: StudentHomeCategory[];
  isError: boolean;
  isLoading: boolean;
  onRetry: () => void;
}) {
  if (isLoading) {
    return <CategorySkeletonGrid />;
  }

  if (isError) {
    return (
      <SectionState
        actionLabel="Muat ulang tipe fasilitas"
        message="Tipe fasilitas belum dapat dimuat."
        onRetry={onRetry}
      />
    );
  }

  if (categories.length === 0) {
    return <SectionState message="Belum ada tipe fasilitas yang tersedia." />;
  }

  return (
    <div className="grid min-h-[154px] grid-cols-5 gap-6 max-lg:grid-cols-3 max-lg:gap-8 max-md:grid-cols-2 max-md:gap-x-[18px] max-md:gap-y-6">
      {categories.map((category) => (
        <CategoryShortcut category={category} key={category.slug} />
      ))}
    </div>
  );
}

function FeaturedSection({
  facilities,
  isError,
  isLoading,
  onRetry,
}: {
  facilities: StudentHomeFacility[];
  isError: boolean;
  isLoading: boolean;
  onRetry: () => void;
}) {
  if (isLoading) {
    return <FeaturedSkeletonGrid />;
  }

  if (isError) {
    return (
      <SectionState
        actionLabel="Muat ulang fasilitas unggulan"
        message="Fasilitas unggulan belum dapat dimuat."
        onRetry={onRetry}
      />
    );
  }

  if (facilities.length === 0) {
    return <SectionState message="Belum ada fasilitas unggulan yang tersedia." />;
  }

  return (
    <div className="grid min-h-[374px] grid-cols-4 gap-6 max-lg:grid-cols-2 max-md:grid-cols-2 max-md:gap-x-3.5 max-md:gap-y-[18px]">
      {facilities.map((facility) => (
        <FacilityCard facility={facility} key={facility.slug} />
      ))}
    </div>
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

export function StudentHomePage() {
  const categoriesQuery = useQuery({
    queryFn: fetchHomeCategories,
    queryKey: ["student-home", "categories"],
  });
  const featuredQuery = useQuery({
    queryFn: fetchFeaturedFacilities,
    queryKey: ["student-home", "featured-facilities"],
  });
  const categories = categoriesQuery.data ?? [];
  const featuredFacilities = featuredQuery.data ?? [];

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-[#111827]">
      <StudentHeader />
      <main>
        <StudentHero />

        <section className="mx-auto mb-20 mt-[120px] w-[1200px] max-w-[95%] text-center max-lg:mt-40 max-md:my-14 max-md:w-full max-md:max-w-full max-md:px-4">
          <h2 className="mb-10 text-xl font-bold text-[#111827] max-md:mb-7">
            Tipe Fasilitas
          </h2>
          <CategorySection
            categories={categories}
            isError={categoriesQuery.isError}
            isLoading={categoriesQuery.isLoading}
            onRetry={() => void categoriesQuery.refetch()}
          />
        </section>

        <section className="mx-auto mb-[100px] w-[1200px] max-w-[95%] max-md:mb-[72px] max-md:w-full max-md:max-w-full max-md:px-4">
          <div className="mb-8 flex items-center justify-between gap-6 max-md:mb-[22px] max-md:grid max-md:grid-cols-[1fr_auto] max-md:items-end max-md:gap-x-4 max-md:gap-y-2.5">
            <h2 className="m-0 text-xl font-bold leading-tight text-[#111827]">
              Jelajah fasilitas
            </h2>
            <a
              className="text-[13px] font-bold uppercase tracking-[0.04em] text-[#10b981] no-underline max-md:col-start-1 max-md:text-[10px] max-md:leading-[1.3]"
              href="/student/facilities"
            >
              Lihat semua fasilitas
            </a>
            <button
              className="flex items-center gap-2 text-sm font-semibold text-[#6b7280] max-md:col-start-2 max-md:row-span-2 max-md:row-start-1 max-md:self-center max-md:text-xs"
              type="button"
            >
              Filter <ChevronDown aria-hidden="true" size={14} />
            </button>
          </div>

          <FeaturedSection
            facilities={featuredFacilities}
            isError={featuredQuery.isError}
            isLoading={featuredQuery.isLoading}
            onRetry={() => void featuredQuery.refetch()}
          />
        </section>
      </main>
      <StudentFooter />
    </div>
  );
}

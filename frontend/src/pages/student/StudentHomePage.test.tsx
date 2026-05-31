import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../../test/render";
import { StudentFacilityCatalogPage } from "./StudentFacilityCatalogPage";
import { StudentHomePage } from "./StudentHomePage";

const categoriesResponse = [
  {
    facility_count: 4,
    icon_hint: "presentation",
    id: "cat-seminar",
    name: "Auditorium / Seminar",
    slug: "seminar",
  },
  {
    facility_count: 2,
    icon_hint: "unknown-icon",
    id: "cat-peralatan",
    name: "Peralatan",
    slug: "peralatan",
  },
];

const featuredResponse = {
  items: [
    {
      capacity: 1200,
      category: "Auditorium / Seminar",
      cover_image_url: "https://cdn.example.test/grand-auditorium.jpg",
      id: "facility-uuid-1",
      location: "Kampus Timur",
      name: "Grand Auditorium",
      open_hours_summary: "Senin-Jumat 08:00-18:00",
      price_summary: "Rp100.000 / sesi",
      rating_average: 4.8,
      review_count: 128,
    },
  ],
  page: 1,
  page_size: 8,
  total_items: 1,
  total_pages: 1,
};

const catalogResponse = {
  items: [
    {
      capacity: 1200,
      category: "Auditorium / Seminar",
      cover_image_url: null,
      id: "facility-uuid-1",
      location: "Kampus Timur",
      name: "Grand Auditorium",
      open_hours_summary: "Senin-Jumat 08:00-18:00",
      price_summary: "Rp100.000 / sesi",
      rating_average: 4.8,
      review_count: 128,
    },
  ],
  page: 1,
  page_size: 12,
  total_items: 1,
  total_pages: 1,
};

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      headers: { "Content-Type": "application/json" },
      status,
    }),
  );
}

function mockDiscoveryFetch({
  categories = categoriesResponse,
  featured = featuredResponse,
}: {
  categories?: unknown;
  featured?: unknown;
} = {}) {
  return vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
    const url = String(input);

    if (url === "http://localhost:8000/facility-categories") {
      return jsonResponse(categories);
    }

    if (url === "http://localhost:8000/facilities?featured=true&limit=8") {
      return jsonResponse(featured);
    }

    if (url.startsWith("http://localhost:8000/facilities?")) {
      return jsonResponse(catalogResponse);
    }

    return jsonResponse({ detail: `Unhandled ${url}` }, 404);
  });
}

async function categoryLink(name: string) {
  const matches = await screen.findAllByText(name);
  const link = matches.find((match) => match.closest('a[href^="/student/facilities?category="]'))?.closest("a");
  expect(link).not.toBeNull();
  return link as HTMLAnchorElement;
}

describe("StudentHomePage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it("loads categories and featured facilities from public discovery endpoints", async () => {
    const fetchMock = mockDiscoveryFetch();

    renderWithProviders(<StudentHomePage />, { initialEntries: ["/student"] });

    expect(await categoryLink("Auditorium / Seminar")).toHaveAttribute(
      "href",
      "/student/facilities?category=seminar",
    );
    expect(await categoryLink("Peralatan")).toHaveAttribute(
      "href",
      "/student/facilities?category=peralatan",
    );
    expect(await screen.findByRole("link", { name: /Grand Auditorium/ })).toHaveAttribute(
      "href",
      "/student/facilities/facility-uuid-1",
    );
    expect(screen.getByRole("img", { name: "Foto Grand Auditorium" })).toHaveAttribute(
      "src",
      "https://cdn.example.test/grand-auditorium.jpg",
    );
    expect(screen.getByText("Kapasitas: 1,200")).toBeVisible();
    expect(screen.getByText("Rp100.000 / sesi")).toBeVisible();
    expect(screen.getByText("Kampus Timur · Senin-Jumat 08:00-18:00")).toBeVisible();
    expect(screen.getByText("4.8")).toBeVisible();
    expect(screen.getByText("(128 ulasan)")).toBeVisible();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/facility-categories", expect.any(Object));
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/facilities?featured=true&limit=8",
        expect.any(Object),
      );
    });
  });

  it("does not allow negative capacity in the hero search", async () => {
    const user = userEvent.setup();
    mockDiscoveryFetch();

    renderWithProviders(<StudentHomePage />, { initialEntries: ["/student"] });

    const capacityInput = await screen.findByPlaceholderText("Kapasitas");
    expect(capacityInput).toHaveAttribute("min", "0");

    await user.type(capacityInput, "-1");
    expect(capacityInput).toHaveValue(0);
  });

  it("navigates from the header search to the facilities catalog", async () => {
    const user = userEvent.setup();
    const fetchMock = mockDiscoveryFetch();

    renderWithProviders(
      <Routes>
        <Route element={<StudentHomePage />} path="/student" />
        <Route element={<StudentFacilityCatalogPage />} path="/student/facilities" />
      </Routes>,
      { initialEntries: ["/student"] },
    );

    const searchInput = screen.getByRole("searchbox", { name: "Cari fasilitas" });
    await user.type(searchInput, "auditorium{enter}");

    expect(await screen.findByRole("heading", { name: "Katalog Fasilitas" })).toBeVisible();
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/facilities?q=auditorium&sort=name_asc&page=1&page_size=12",
        expect.any(Object),
      );
    });
  });

  it("keeps the category section stable when no categories are returned", async () => {
    mockDiscoveryFetch({ categories: [] });

    renderWithProviders(<StudentHomePage />, { initialEntries: ["/student"] });

    expect(await screen.findByText("Belum ada tipe fasilitas yang tersedia.")).toBeVisible();
    expect(await screen.findByRole("link", { name: /Grand Auditorium/ })).toBeVisible();
  });

  it("keeps the featured section stable when no featured facilities are returned", async () => {
    mockDiscoveryFetch({
      featured: { ...featuredResponse, items: [], total_items: 0, total_pages: 0 },
    });

    renderWithProviders(<StudentHomePage />, { initialEntries: ["/student"] });

    expect(await categoryLink("Auditorium / Seminar")).toBeVisible();
    expect(await screen.findByText("Belum ada fasilitas unggulan yang tersedia.")).toBeVisible();
  });

  it("shows a retry action when a discovery query fails", async () => {
    const user = userEvent.setup();
    let categoryCalls = 0;

    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url === "http://localhost:8000/facility-categories") {
        categoryCalls += 1;
        return categoryCalls === 1
          ? jsonResponse({ detail: "temporary outage" }, 503)
          : jsonResponse(categoriesResponse);
      }

      if (url === "http://localhost:8000/facilities?featured=true&limit=8") {
        return jsonResponse(featuredResponse);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderWithProviders(<StudentHomePage />, { initialEntries: ["/student"] });

    await user.click(await screen.findByRole("button", { name: "Muat ulang tipe fasilitas" }));

    expect(await categoryLink("Auditorium / Seminar")).toBeVisible();
  });
});

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../../test/render";
import { StudentFacilityCatalogPage } from "./StudentFacilityCatalogPage";

const categoriesResponse = [
  { facility_count: 4, icon_hint: "presentation", id: "cat-seminar", name: "Seminar", slug: "seminar" },
  { facility_count: 2, icon_hint: "equipment", id: "cat-peralatan", name: "Peralatan", slug: "peralatan" },
];

const catalogResponse = {
  items: [
    {
      capacity: 15,
      category: "Peralatan",
      cover_image_url: null,
      id: "multimedia-studio-id",
      location: "Gedung Media",
      name: "Multimedia Studio",
      open_hours_summary: "Senin-Jumat 09:00-17:00",
      price_summary: "Rp75.000 / sesi",
      rating_average: 4.8,
      review_count: 77,
    },
  ],
  page: 2,
  page_size: 12,
  total_items: 13,
  total_pages: 3,
};

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      headers: { "Content-Type": "application/json" },
      status,
    }),
  );
}

function renderCatalog(initialEntry = "/student/facilities") {
  return renderWithProviders(
    <Routes>
      <Route element={<StudentFacilityCatalogPage />} path="/student/facilities" />
    </Routes>,
    { initialEntries: [initialEntry] },
  );
}

function mockCatalogFetch({
  categories = categoriesResponse,
  catalog = catalogResponse,
}: {
  categories?: unknown;
  catalog?: unknown;
} = {}) {
  return vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
    const url = String(input);

    if (url === "http://localhost:8000/facility-categories") {
      return jsonResponse(categories);
    }

    if (url.startsWith("http://localhost:8000/facilities?")) {
      return jsonResponse(catalog);
    }

    return jsonResponse({ detail: `Unhandled ${url}` }, 404);
  });
}

describe("StudentFacilityCatalogPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it("syncs URL query parameters to backend catalog API params", async () => {
    const fetchMock = mockCatalogFetch();

    renderCatalog("/student/facilities?q=studio&category=peralatan&min_capacity=10&sort=rating_desc&page=2");

    expect(await screen.findByRole("link", { name: /Multimedia Studio/ })).toHaveAttribute(
      "href",
      "/student/facilities/multimedia-studio-id",
    );
    expect(screen.getByLabelText("Pencarian")).toHaveValue("studio");
    await screen.findByRole("option", { name: "Peralatan" });
    expect(screen.getByLabelText("Kategori Fasilitas")).toHaveValue("peralatan");
    expect(screen.getByLabelText("Min. Kapasitas")).toHaveValue(10);
    expect(screen.getByLabelText("Urutkan berdasarkan")).toHaveValue("rating_desc");
    expect(
      screen.getByText((_, element) => element?.textContent === "Menampilkan 1 dari 13 fasilitas"),
    ).toBeVisible();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/facilities?q=studio&category=peralatan&min_capacity=10&sort=rating_desc&page=2&page_size=12",
        expect.any(Object),
      );
    });
  });

  it("clamps negative minimum capacity to zero", async () => {
    const user = userEvent.setup();
    const fetchMock = mockCatalogFetch();

    renderCatalog("/student/facilities?min_capacity=-5");

    const capacityInput = await screen.findByLabelText("Min. Kapasitas");
    expect(capacityInput).toHaveAttribute("min", "0");
    expect(capacityInput).toHaveValue(0);

    await user.clear(capacityInput);
    await user.type(capacityInput, "-1");
    expect(capacityInput).toHaveValue(0);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/facilities?min_capacity=0&sort=name_asc&page=1&page_size=12",
        expect.any(Object),
      );
    });
  });

  it("renders backend category options and supported sort values", async () => {
    mockCatalogFetch();

    renderCatalog();

    expect(await screen.findByRole("option", { name: "Seminar" })).toHaveValue("seminar");
    expect(screen.getByRole("option", { name: "Peralatan" })).toHaveValue("peralatan");
    expect(screen.getByRole("option", { name: "Rating Tertinggi" })).toHaveValue("rating_desc");
    expect(screen.getByRole("option", { name: "Harga Terendah" })).toHaveValue("price_asc");
  });

  it("preserves filters in pagination links", async () => {
    mockCatalogFetch();

    renderCatalog("/student/facilities?q=studio&category=peralatan&sort=rating_desc&page=2");

    expect(await screen.findByRole("link", { name: "3" })).toHaveAttribute(
      "href",
      "/student/facilities?q=studio&category=peralatan&sort=rating_desc&page=3",
    );
  });

  it("renders empty catalog results without breaking the shell", async () => {
    mockCatalogFetch({
      catalog: { ...catalogResponse, items: [], page: 1, total_items: 0, total_pages: 0 },
    });

    renderCatalog("/student/facilities?q=zzzz");

    expect(await screen.findByText("Tidak ada fasilitas ditemukan")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Katalog Fasilitas" })).toBeVisible();
  });

  it("shows recoverable feedback for failed or invalid queries", async () => {
    const user = userEvent.setup();
    let catalogCalls = 0;

    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url === "http://localhost:8000/facility-categories") {
        return jsonResponse(categoriesResponse);
      }

      if (url.startsWith("http://localhost:8000/facilities?")) {
        catalogCalls += 1;
        return catalogCalls === 1
          ? jsonResponse({ detail: "invalid sort" }, 422)
          : jsonResponse(catalogResponse);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderCatalog("/student/facilities?sort=unsupported");

    expect(await screen.findByText("Parameter urut tidak didukung. Menggunakan urutan nama.")).toBeVisible();
    await user.click(await screen.findByRole("button", { name: "Muat ulang katalog" }));

    expect(await screen.findByRole("link", { name: /Multimedia Studio/ })).toBeVisible();
  });
});

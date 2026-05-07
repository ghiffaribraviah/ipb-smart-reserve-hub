import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";
import { App } from "../App";
import { server } from "./server";

function renderAsStudent(initialRoute: string) {
  localStorage.setItem("access_token", "fake-token-123");
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <App />
    </MemoryRouter>,
  );
}

const facilityDetail = {
  id: "fac-1",
  name: "Auditorium Andi Hakim Nasoetion",
  location: "Kampus Dramaga",
  capacity: 500,
  category: "Auditorium",
  description: "Auditorium serbaguna untuk acara akademik dan kemahasiswaan.",
  contact: { name: "Pak Budi", phone: "08123456789", email: null },
  images: [],
  price: { is_free: false, amount_rupiah: 5000000, summary: "Rp 5.000.000" },
  open_hours_summary: "Senin-Jumat, 08:00-17:00",
  review_summary: { rating_average: null, review_count: 0 },
  reviews: [],
};

describe("Student Reservation Details", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("loads Organization Units and continues after the student completes the details form", async () => {
    let requestedOrganizationUnits = false;
    server.use(
      http.get("http://localhost:8000/facilities/fac-1", () =>
        HttpResponse.json(facilityDetail),
      ),
      http.get("http://localhost:8000/organization-units", () => {
        requestedOrganizationUnits = true;
        return HttpResponse.json([
          {
            id: "org-bem",
            name: "BEM KM IPB",
            type: "student_organization",
            code: "BEM-KM",
            is_active: true,
          },
          {
            id: "org-himalkom",
            name: "Himpunan Mahasiswa Ilmu Komputer",
            type: "student_organization",
            code: "HIMALKOM",
            is_active: true,
          },
        ]);
      }),
    );

    const user = userEvent.setup();
    renderAsStudent(
      "/student/facilities/fac-1/reserve/details?startsAt=2026-06-15T09%3A00%3A00%2B07%3A00&endsAt=2026-06-15T11%3A00%3A00%2B07%3A00",
    );

    expect(
      await screen.findByRole("heading", { name: /detail reservasi/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/auditorium andi hakim nasoetion/i),
    ).toBeInTheDocument();
    expect(await screen.findByText(/bem km ipb/i)).toBeInTheDocument();
    expect(screen.getByText(/15 juni 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/09:00.*11:00/i)).toBeInTheDocument();
    expect(
      screen.getByText(/judul kegiatan dan unit organisasi.*kalender publik/i),
    ).toBeInTheDocument();

    await user.type(
      screen.getByLabelText(/judul kegiatan/i),
      "Seminar Nasional Pertanian",
    );
    await user.type(
      screen.getByLabelText(/deskripsi kegiatan/i),
      "Diskusi riset pertanian berkelanjutan.",
    );
    await user.type(screen.getByLabelText(/jumlah peserta/i), "120");
    await user.selectOptions(screen.getByLabelText(/unit organisasi/i), [
      "org-bem",
    ]);
    await user.type(screen.getByLabelText(/nomor kontak/i), "081234567890");
    await user.click(screen.getByRole("button", { name: /lanjut ke konfirmasi/i }));

    expect(await screen.findByText(/^konfirmasi$/i)).toBeInTheDocument();
    expect(requestedOrganizationUnits).toBe(true);
  });

  it("restores the in-progress draft when the same Facility and selected time remount", async () => {
    server.use(
      http.get("http://localhost:8000/facilities/fac-1", () =>
        HttpResponse.json(facilityDetail),
      ),
      http.get("http://localhost:8000/organization-units", () =>
        HttpResponse.json([
          {
            id: "org-bem",
            name: "BEM KM IPB",
            type: "student_organization",
            code: "BEM-KM",
            is_active: true,
          },
        ]),
      ),
    );

    const route =
      "/student/facilities/fac-1/reserve/details?startsAt=2026-06-15T09%3A00%3A00%2B07%3A00&endsAt=2026-06-15T11%3A00%3A00%2B07%3A00";
    const user = userEvent.setup();
    const firstRender = renderAsStudent(route);

    await user.type(
      await screen.findByLabelText(/judul kegiatan/i),
      "Rapat Koordinasi",
    );
    await user.type(
      screen.getByLabelText(/deskripsi kegiatan/i),
      "Koordinasi panitia acara.",
    );
    await user.type(screen.getByLabelText(/jumlah peserta/i), "45");
    await user.selectOptions(screen.getByLabelText(/unit organisasi/i), [
      "org-bem",
    ]);
    await user.type(screen.getByLabelText(/nomor kontak/i), "081211112222");

    firstRender.unmount();
    renderAsStudent(route);

    expect(await screen.findByLabelText(/judul kegiatan/i)).toHaveValue(
      "Rapat Koordinasi",
    );
    expect(screen.getByLabelText(/deskripsi kegiatan/i)).toHaveValue(
      "Koordinasi panitia acara.",
    );
    expect(screen.getByLabelText(/jumlah peserta/i)).toHaveValue(45);
    expect(await screen.findByText(/bem km ipb/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/unit organisasi/i)).toHaveValue("org-bem");
    expect(screen.getByLabelText(/nomor kontak/i)).toHaveValue("081211112222");
  });

  it("redirects back to time selection when selected-time params are missing", async () => {
    server.use(
      http.get("http://localhost:8000/facilities/fac-1", () =>
        HttpResponse.json(facilityDetail),
      ),
      http.get("http://localhost:8000/facilities/fac-1/calendar", () =>
        HttpResponse.json([]),
      ),
    );

    renderAsStudent("/student/facilities/fac-1/reserve/details");

    expect(
      await screen.findByRole("heading", { name: /pilih waktu reservasi/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /detail reservasi/i })).toBeNull();
  });

  it("does not restore a draft from a different selected time", async () => {
    server.use(
      http.get("http://localhost:8000/facilities/fac-1", () =>
        HttpResponse.json(facilityDetail),
      ),
      http.get("http://localhost:8000/organization-units", () =>
        HttpResponse.json([
          {
            id: "org-bem",
            name: "BEM KM IPB",
            type: "student_organization",
            code: "BEM-KM",
            is_active: true,
          },
        ]),
      ),
    );

    const firstRoute =
      "/student/facilities/fac-1/reserve/details?startsAt=2026-06-15T09%3A00%3A00%2B07%3A00&endsAt=2026-06-15T11%3A00%3A00%2B07%3A00";
    const secondRoute =
      "/student/facilities/fac-1/reserve/details?startsAt=2026-06-16T09%3A00%3A00%2B07%3A00&endsAt=2026-06-16T11%3A00%3A00%2B07%3A00";
    const user = userEvent.setup();
    const firstRender = renderAsStudent(firstRoute);

    await user.type(
      await screen.findByLabelText(/judul kegiatan/i),
      "Rapat Koordinasi",
    );

    firstRender.unmount();
    renderAsStudent(secondRoute);

    expect(await screen.findByLabelText(/judul kegiatan/i)).toHaveValue("");
  });

  it("shows loading and empty states while loading Organization Units", async () => {
    server.use(
      http.get("http://localhost:8000/facilities/fac-1", () =>
        HttpResponse.json(facilityDetail),
      ),
      http.get(
        "http://localhost:8000/organization-units",
        async () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(HttpResponse.json([])), 20);
          }),
      ),
    );

    renderAsStudent(
      "/student/facilities/fac-1/reserve/details?startsAt=2026-06-15T09%3A00%3A00%2B07%3A00&endsAt=2026-06-15T11%3A00%3A00%2B07%3A00",
    );

    expect(
      await screen.findByText(/memuat unit organisasi/i),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/belum ada unit organisasi aktif/i),
    ).toBeInTheDocument();
  });

  it("shows an API error state when Organization Units fail to load", async () => {
    server.use(
      http.get("http://localhost:8000/facilities/fac-1", () =>
        HttpResponse.json(facilityDetail),
      ),
      http.get("http://localhost:8000/organization-units", () =>
        HttpResponse.json(
          { detail: "Unit organisasi sedang tidak tersedia." },
          { status: 500 },
        ),
      ),
    );

    renderAsStudent(
      "/student/facilities/fac-1/reserve/details?startsAt=2026-06-15T09%3A00%3A00%2B07%3A00&endsAt=2026-06-15T11%3A00%3A00%2B07%3A00",
    );

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/unit organisasi sedang tidak tersedia/i);
  });
});

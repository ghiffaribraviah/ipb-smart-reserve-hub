import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";
import { RequireRole, SESSION_TOKEN_KEY } from "../../auth/session";
import type { StudentReservationWorkflowProjection } from "../../reservations/studentReservationWorkflow";
import { renderWithProviders } from "../../test/render";
import {
  StudentCancellationRequestPage,
  StudentProfilePage,
  StudentReviewPage,
} from "./StudentReviewCancellationProfilePages";

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      headers: { "Content-Type": "application/json" },
      status,
    }),
  );
}

const baseReservation: StudentReservationWorkflowProjection = {
  activity_title: "Simposium Etika AI",
  cancellation_reason: null,
  cancellation_rejection_reason: null,
  contact_phone: "08123456789",
  document: {
    approval_letter: null,
    rejection_reason: null,
    review_status: "approved",
    signed_approval_letter: null,
  },
  document_upload_due_at: null,
  document_verification_due_at: null,
  ends_at: "2026-06-24T13:00:00Z",
  event_description: "Diskusi akademik lintas fakultas.",
  extra_requirements: {
    av_support: false,
    extra_cleaning: false,
    logistics_coordination: false,
    notes: null,
    security_personnel: false,
  },
  facility: { id: "facility-1", name: "Grand Auditorium" },
  id: "reservation-1",
  organization_unit: { id: "org-1", name: "BEM KM IPB" },
  participant_count: 80,
  payment: {
    receipt: null,
    rejection_reason: null,
    required: false,
    review_status: "not_required",
  },
  payment_upload_due_at: null,
  payment_verification_due_at: null,
  price_rupiah: 0,
  rejection: null,
  reservation_code: "RSV-001",
  review: null,
  starts_at: "2026-06-24T09:00:00Z",
  status: "completed",
};

type ReservationOverride = Partial<Omit<StudentReservationWorkflowProjection, "document" | "payment">> & {
  document?: Partial<StudentReservationWorkflowProjection["document"]>;
  payment?: Partial<StudentReservationWorkflowProjection["payment"]>;
};

function reservation(overrides: ReservationOverride = {}): StudentReservationWorkflowProjection {
  return {
    ...baseReservation,
    ...overrides,
    document: { ...baseReservation.document, ...overrides.document },
    payment: { ...baseReservation.payment, ...overrides.payment },
  };
}

function renderWorkflowRoutes(initialEntry: string) {
  return renderWithProviders(
    <Routes>
      <Route element={<StudentReviewPage />} path="/student/reservations/:reservationId/review" />
      <Route element={<StudentCancellationRequestPage />} path="/student/reservations/:reservationId/cancellation" />
      <Route element={<p>Detail route</p>} path="/student/reservations/:reservationId" />
      <Route element={<p>Cancellation requested route</p>} path="/student/reservations/:reservationId/cancellation-request" />
    </Routes>,
    { initialEntries: [initialEntry] },
  );
}

describe("StudentReviewCancellationProfilePages", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it("submits a completed reservation review and returns to detail", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
      const url = String(input);

      if (url === "http://localhost:8000/student/reservations/reservation-1") {
        return jsonResponse(reservation());
      }

      if (url === "http://localhost:8000/student/reservations/reservation-1/review" && init?.method === "POST") {
        return jsonResponse({ id: "review-1" }, 201);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderWorkflowRoutes("/student/reservations/reservation-1/review");

    await user.click(await screen.findByRole("radio", { name: "5 dari 5" }));
    await user.type(screen.getByLabelText("Komentar"), "Ruang bersih dan perangkat audio siap digunakan.");
    await user.click(screen.getByRole("button", { name: "Kirim Ulasan" }));

    await screen.findByText("Detail route");
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/student/reservations/reservation-1/review",
      expect.objectContaining({
        body: JSON.stringify({
          comment: "Ruang bersih dan perangkat audio siap digunakan.",
          rating: 5,
        }),
        method: "POST",
      }),
    );
  });

  it("keeps duplicate review errors on the form", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
      const url = String(input);

      if (url === "http://localhost:8000/student/reservations/reservation-1") {
        return jsonResponse(reservation());
      }

      if (url === "http://localhost:8000/student/reservations/reservation-1/review" && init?.method === "POST") {
        return jsonResponse({ detail: "Review untuk reservasi ini sudah dikirim." }, 409);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderWorkflowRoutes("/student/reservations/reservation-1/review");

    await user.click(await screen.findByRole("radio", { name: "4 dari 5" }));
    await user.click(screen.getByRole("button", { name: "Kirim Ulasan" }));

    expect(await screen.findByText("Review untuk reservasi ini sudah dikirim.")).toBeVisible();
  });

  it("submits cancellation reason for approved reservations", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
      const url = String(input);

      if (url === "http://localhost:8000/student/reservations/reservation-1") {
        return jsonResponse(reservation({ status: "approved" }));
      }

      if (url === "http://localhost:8000/student/reservations/reservation-1/cancellation-request" && init?.method === "POST") {
        return jsonResponse(reservation({ status: "cancellation_requested" }));
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderWorkflowRoutes("/student/reservations/reservation-1/cancellation");

    await user.type(
      await screen.findByLabelText("Detail Alasan"),
      "Kegiatan organisasi dipindahkan ke jadwal lain setelah koordinasi fakultas.",
    );
    await user.click(screen.getByRole("button", { name: "Kirim Pengajuan" }));

    await screen.findByText("Cancellation requested route");
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/student/reservations/reservation-1/cancellation-request",
      expect.objectContaining({
        body: JSON.stringify({
          reason:
            "Jadwal kegiatan berubah: Kegiatan organisasi dipindahkan ke jadwal lain setelah koordinasi fakultas.",
        }),
        method: "POST",
      }),
    );
  });

  it("redirects unavailable cancellation states to their canonical route", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url === "http://localhost:8000/student/reservations/reservation-1") {
        return jsonResponse(reservation({ status: "completed" }));
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderWorkflowRoutes("/student/reservations/reservation-1/cancellation");

    expect(await screen.findByRole("heading", { name: "Tulis Ulasan" })).toBeVisible();
  });

  it("keeps cancellation backend errors on the form", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
      const url = String(input);

      if (url === "http://localhost:8000/student/reservations/reservation-1") {
        return jsonResponse(reservation({ status: "approved" }));
      }

      if (url === "http://localhost:8000/student/reservations/reservation-1/cancellation-request" && init?.method === "POST") {
        return jsonResponse({ detail: "Pembatalan hanya dapat diajukan untuk reservasi yang sudah disetujui." }, 409);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderWorkflowRoutes("/student/reservations/reservation-1/cancellation");

    await user.type(await screen.findByLabelText("Detail Alasan"), "Reservasi ini perlu dibatalkan karena agenda berubah.");
    await user.click(screen.getByRole("button", { name: "Kirim Pengajuan" }));

    expect(await screen.findByText("Pembatalan hanya dapat diajukan untuk reservasi yang sudah disetujui.")).toBeVisible();
  });

  it("renders current user identity and partial academic profile from /auth/me", async () => {
    sessionStorage.setItem(SESSION_TOKEN_KEY, "session-token");
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url === "http://localhost:8000/auth/me") {
        return jsonResponse({
          academic_profile: {
            degree: "Sarjana (S1)",
            entry_year: null,
            faculty: null,
            program_studi: "Ilmu Komputer",
          },
          email: "nabila@apps.ipb.ac.id",
          full_name: "Nabila Putri",
          id: "student-1",
          is_active: true,
          nim: "G64190099",
          phone: "081234567890",
          role: "student",
        });
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderWithProviders(<StudentProfilePage />, { initialEntries: ["/student/profile"] });

    expect(await screen.findByText("Nabila Putri")).toBeVisible();
    expect(screen.getAllByText("G64190099")).toHaveLength(2);
    expect(screen.getByText("081234567890")).toBeVisible();
    expect(screen.getByText("Ilmu Komputer")).toBeVisible();
    expect(screen.getAllByText("Belum tersedia")).toHaveLength(2);
  });

  it("redirects to login when current session validation fails", async () => {
    sessionStorage.setItem(SESSION_TOKEN_KEY, "expired-token");
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url === "http://localhost:8000/auth/me") {
        return jsonResponse({ detail: "Token tidak valid." }, 401);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderWithProviders(
      <Routes>
        <Route
          element={<RequireRole allow={["student"]}><StudentProfilePage /></RequireRole>}
          path="/student/profile"
        />
        <Route element={<p>Login route</p>} path="/login" />
      </Routes>,
      { initialEntries: ["/student/profile"] },
    );

    await waitFor(() => {
      expect(screen.getByText("Login route")).toBeVisible();
    });
  });
});

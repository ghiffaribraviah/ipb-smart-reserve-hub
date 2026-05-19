import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../../test/render";
import { StaffHomePage, StaffReservationListPage } from "./StaffReservationOperationsPages";

type StaffOperationItem = {
  cancellation: { requested: boolean; review_status: string };
  document: { due_at: string | null; review_status: string };
  due_at: string | null;
  ends_at: string;
  facility: { id: string; name: string };
  id: string;
  organization_unit: { id: string; name: string };
  payment: { due_at: string | null; required: boolean; review_status: string };
  reservation_code: string;
  review_status: string;
  starts_at: string;
  status: string;
  student: { email: string; full_name: string; id: string };
  activity_title: string;
  workflow_type: string;
};

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      headers: { "Content-Type": "application/json" },
      status,
    }),
  );
}

const queueItem: StaffOperationItem = {
  activity_title: "Seminar Karier",
  cancellation: { requested: false, review_status: "not_requested" },
  document: { due_at: "2026-05-03T00:00:00Z", review_status: "pending_review" },
  due_at: "2026-05-03T00:00:00Z",
  ends_at: "2026-06-01T04:00:00Z",
  facility: { id: "facility-1", name: "Auditorium Andi Hakim Nasoetion" },
  id: "reservation-1",
  organization_unit: { id: "org-1", name: "BEM KM IPB" },
  payment: { due_at: null, required: false, review_status: "not_required" },
  reservation_code: "RSV-SEMINAR-KARIER",
  review_status: "pending_review",
  starts_at: "2026-06-01T02:00:00Z",
  status: "pending_document_review",
  student: {
    email: "student@apps.ipb.ac.id",
    full_name: "Siti Aminah",
    id: "student-1",
  },
  workflow_type: "document_review",
};

const paymentQueueItem: StaffOperationItem = {
  ...queueItem,
  activity_title: "Bukti Pembayaran",
  document: { due_at: null, review_status: "approved" },
  due_at: "2026-05-04T00:00:00Z",
  id: "reservation-payment",
  payment: { due_at: "2026-05-04T00:00:00Z", required: true, review_status: "pending_review" },
  reservation_code: "RSV-BAYAR",
  status: "pending_payment",
  student: {
    email: "budi@apps.ipb.ac.id",
    full_name: "Budi Santoso",
    id: "student-2",
  },
  workflow_type: "payment_review",
};

const approvedListItem: StaffOperationItem = {
  ...queueItem,
  activity_title: "Seminar Approved",
  document: { due_at: null, review_status: "approved" },
  due_at: null,
  id: "approved-reservation",
  payment: { due_at: null, required: false, review_status: "not_required" },
  reservation_code: "RSV-APPROVED",
  review_status: "not_actionable",
  starts_at: "2026-06-10T02:00:00Z",
  status: "approved",
  workflow_type: "reservation",
};

const cancelledQueueItem: StaffOperationItem = {
  ...approvedListItem,
  activity_title: "Kegiatan Dibatalkan",
  cancellation: { requested: true, review_status: "approved" },
  id: "cancelled-reservation",
  reservation_code: "RSV-CANCELLED",
  status: "cancelled",
};

function mockStaffFetch({
  list = [approvedListItem],
  queue = [queueItem, paymentQueueItem],
}: {
  list?: StaffOperationItem[];
  queue?: StaffOperationItem[];
} = {}) {
  return vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
    const url = String(input);

    if (url === "http://localhost:8000/staff/reservations/verification-queue") {
      return jsonResponse(queue);
    }

    if (url.startsWith("http://localhost:8000/staff/reservations")) {
      return jsonResponse(list);
    }

    return jsonResponse({ detail: `Unhandled ${url}` }, 404);
  });
}

function renderStaffHome() {
  return renderWithProviders(
    <Routes>
      <Route element={<StaffHomePage />} path="/staff" />
    </Routes>,
    { initialEntries: ["/staff"] },
  );
}

function renderStaffList() {
  return renderWithProviders(
    <Routes>
      <Route element={<StaffReservationListPage />} path="/staff/reservations" />
    </Routes>,
    { initialEntries: ["/staff/reservations"] },
  );
}

describe("StaffReservationOperationsPages", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it("loads actionable verification queue items from the backend", async () => {
    const fetchMock = mockStaffFetch({ queue: [queueItem, paymentQueueItem, approvedListItem, cancelledQueueItem] });

    renderStaffHome();

    expect(await screen.findByText("Siti Aminah")).toBeVisible();
    expect(screen.getAllByText("BEM KM IPB")[0]).toBeVisible();
    expect(screen.getAllByText("Auditorium Andi Hakim Nasoetion")[0]).toBeVisible();
    expect(screen.getByText("Menunggu Verifikasi Dokumen")).toBeVisible();
    expect(screen.getByText("Menunggu Verifikasi Pembayaran")).toBeVisible();
    expect(screen.queryByText("Seminar Approved")).not.toBeInTheDocument();
    expect(screen.queryByText("Kegiatan Dibatalkan")).not.toBeInTheDocument();
    expect(screen.getByText("2", { selector: "p" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Tinjau Pengajuan Siti Aminah" })).toHaveAttribute(
      "href",
      "/staff/reservations/reservation-1",
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/staff/reservations/verification-queue",
        expect.any(Object),
      );
    });
  });

  it("uses the same reservation table language on home and list without legacy cancellation filters", async () => {
    mockStaffFetch();

    renderStaffHome();

    expect(await screen.findByRole("columnheader", { name: "Pemohon" })).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Fasilitas" })).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Jadwal" })).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Status" })).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Aksi" })).toBeVisible();

    renderStaffList();

    expect(await screen.findByLabelText("Filter status")).toBeVisible();
    expect(screen.queryByRole("option", { name: "Menunggu Pembatalan" })).not.toBeInTheDocument();
  });

  it("loads assigned reservations and sends supported filter parameters", async () => {
    const user = userEvent.setup();
    const fetchMock = mockStaffFetch();

    renderStaffList();

    expect(await screen.findByText("Seminar Approved")).toBeVisible();
    expect(screen.getByText("Disetujui", { selector: "span" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Lihat Detail Siti Aminah" })).toHaveAttribute(
      "href",
      "/staff/reservations/approved-reservation",
    );

    await user.selectOptions(screen.getByLabelText("Filter fasilitas"), "facility-1");
    await user.selectOptions(screen.getByLabelText("Filter status"), "approved");
    await user.type(screen.getByLabelText("Tanggal reservasi"), "2026-06-10");

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/staff/reservations?status=approved&facility_id=facility-1&date_from=2026-06-10&date_to=2026-06-10",
        expect.any(Object),
      );
    });
  });

  it("renders stable empty states for queue and list data", async () => {
    mockStaffFetch({ list: [], queue: [] });

    renderStaffHome();
    expect(await screen.findByText("Tidak ada pengajuan yang menunggu verifikasi.")).toBeVisible();

    renderStaffList();
    expect(await screen.findByText("Tidak ada reservasi untuk filter ini.")).toBeVisible();
  });

  it("shows recoverable queue and list errors", async () => {
    const user = userEvent.setup();
    let queueCalls = 0;
    let listCalls = 0;

    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url === "http://localhost:8000/staff/reservations/verification-queue") {
        queueCalls += 1;
        return queueCalls === 1 ? jsonResponse({ detail: "temporary outage" }, 503) : jsonResponse([queueItem]);
      }

      if (url.startsWith("http://localhost:8000/staff/reservations")) {
        listCalls += 1;
        return listCalls === 1 ? jsonResponse({ detail: "temporary outage" }, 503) : jsonResponse([approvedListItem]);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderStaffHome();
    await user.click(await screen.findByRole("button", { name: "Muat ulang antrian verifikasi" }));
    expect(await screen.findByText("Siti Aminah")).toBeVisible();

    renderStaffList();
    await user.click(await screen.findByRole("button", { name: "Muat ulang daftar reservasi" }));
    expect(await screen.findByText("Seminar Approved")).toBeVisible();
  });
});

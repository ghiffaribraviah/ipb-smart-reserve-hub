import { expect, type Page, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectPageScreenshot,
  screenshotViewports,
} from "./utils/visual";

const baseReservation = {
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
  ends_at: "2024-10-24T13:00:00Z",
  event_description: "Diskusi akademik lintas fakultas.",
  extra_requirements: {
    av_support: false,
    extra_cleaning: false,
    logistics_coordination: false,
    notes: null,
    security_personnel: false,
  },
  facility: { id: "facility-1", name: "Grand Auditorium" },
  id: "RSV-FIXTURE-001",
  organization_unit: { id: "org-1", name: "Gedung Graha Widya Wisuda, Lantai 1" },
  participant_count: 80,
  payment: {
    receipt: null,
    rejection_reason: null,
    required: false,
    review_status: "approved",
  },
  payment_upload_due_at: null,
  payment_verification_due_at: null,
  price_rupiah: 0,
  rejection: null,
  reservation_code: "RSV-FIXTURE-001",
  review: null,
  starts_at: "2024-10-24T09:00:00Z",
  status: "approved",
};

const reservationsResponse = [
  baseReservation,
  {
    ...baseReservation,
    ends_at: "2024-10-29T15:00:00Z",
    facility: { id: "facility-2", name: "Ruang Seminar Cendekia" },
    id: "RSV-FIXTURE-002",
    organization_unit: { id: "org-2", name: "Fakultas Ekonomi dan Manajemen, Lantai 2" },
    payment: { ...baseReservation.payment, required: true, review_status: "upload_needed" },
    price_rupiah: 250000,
    reservation_code: "RSV-FIXTURE-002",
    starts_at: "2024-10-29T13:00:00Z",
    status: "pending_payment",
  },
  {
    ...baseReservation,
    document: { ...baseReservation.document, review_status: "waiting_review" },
    ends_at: "2024-10-31T12:00:00Z",
    facility: { id: "facility-3", name: "Ruang Rapat Fahutan" },
    id: "RSV-FIXTURE-003",
    organization_unit: { id: "org-3", name: "Fakultas Kehutanan dan Lingkungan, Lantai 1" },
    reservation_code: "RSV-FIXTURE-003",
    starts_at: "2024-10-31T10:00:00Z",
    status: "pending_document_review",
  },
  {
    ...baseReservation,
    ends_at: "2024-09-12T10:00:00Z",
    facility: { id: "facility-10", name: "Studio Kreatif Cendana" },
    id: "RSV-FIXTURE-010",
    organization_unit: { id: "org-10", name: "Fakultas Ekologi Manusia, Lantai 3" },
    reservation_code: "RSV-FIXTURE-010",
    review: { admin_removal_reason: null, deleted_at: null, deleted_by: null, id: "review-1", is_deleted: false },
    starts_at: "2024-09-12T08:00:00Z",
    status: "completed",
  },
  {
    ...baseReservation,
    ends_at: "2024-09-18T16:00:00Z",
    facility: { id: "facility-11", name: "Aula Student Center" },
    id: "RSV-FIXTURE-011",
    organization_unit: { id: "org-11", name: "Student Center IPB, Lantai 1" },
    rejection: { reason: "Tidak memenuhi syarat.", source: "unknown" },
    reservation_code: "RSV-FIXTURE-011",
    starts_at: "2024-09-18T14:00:00Z",
    status: "rejected",
  },
  {
    ...baseReservation,
    ends_at: "2024-10-02T09:00:00Z",
    facility: { id: "facility-12", name: "Lapangan Agria" },
    id: "RSV-FIXTURE-012",
    organization_unit: { id: "org-12", name: "Kompleks Olahraga Kampus Dramaga" },
    reservation_code: "RSV-FIXTURE-012",
    starts_at: "2024-10-02T07:00:00Z",
    status: "cancelled",
  },
];

async function mockReservationListApi(page: Page) {
  await page.route("http://localhost:8000/student/reservations", async (route) => {
    await route.fulfill({ json: reservationsResponse });
  });
}

test.describe("student reservation list page", () => {
  test("matches the ongoing reservation list reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await mockReservationListApi(page);
    await page.goto("/student/reservations");

    await expect(page.getByRole("heading", { name: "Reservasi Saya" })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Sedang Berlangsung/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(page.getByRole("tab", { name: "Riwayat" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
    await expect(page.getByRole("heading", { name: "Grand Auditorium" })).toBeVisible();
    await expect(page.getByText("Disetujui", { exact: true })).toBeVisible();
    await expect(page.getByText("Menunggu Pembayaran")).toBeVisible();
    await expect(page.getByText("Menunggu Verifikasi Dokumen")).toBeVisible();
    await expect(page.getByRole("link", { name: "Ajukan Pembatalan" })).toHaveAttribute(
      "href",
      "/student/reservations/RSV-FIXTURE-001/cancellation",
    );

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(
      page,
      `student-reservation-list-${isMobile ? "mobile" : "desktop"}`,
    );
  });

  test("shows terminal history reservations without cancellation actions", async ({ page }) => {
    await mockReservationListApi(page);
    await page.goto("/student/reservations");
    await page.getByRole("tab", { name: "Riwayat" }).click();

    await expect(page.getByRole("tab", { name: "Riwayat" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(page.getByRole("heading", { name: "Studio Kreatif Cendana" })).toBeVisible();
    await expect(page.getByText("Selesai", { exact: true })).toBeVisible();
    await expect(page.getByText("Ditolak", { exact: true })).toBeVisible();
    await expect(page.getByText("Dibatalkan", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Ajukan Pembatalan" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Batalkan" })).toHaveCount(0);
  });
});

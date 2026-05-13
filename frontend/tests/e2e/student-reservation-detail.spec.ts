import { expect, type Page, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectPageScreenshot,
  screenshotViewports,
} from "./utils/visual";

const baseReservation: Record<string, any> = {
  activity_title: "Simposium Etika AI",
  cancellation_reason: null,
  cancellation_rejection_reason: null,
  contact_phone: "08123456789",
  document: {
    approval_letter: null,
    rejection_reason: null,
    review_status: "approved",
    signed_approval_letter: {
      content_type: "application/pdf",
      filename: "surat-persetujuan-ditandatangani.pdf",
      size_bytes: 1200000,
      uploaded_at: "2024-10-15T09:00:00Z",
    },
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
  organization_unit: { id: "org-1", name: "Himpunan Mahasiswa Ilmu Komputer" },
  participant_count: 80,
  payment: {
    receipt: {
      content_type: "image/jpeg",
      filename: "bukti-pembayaran.jpg",
      size_bytes: 840000,
      uploaded_at: "2024-10-18T09:00:00Z",
    },
    rejection_reason: null,
    required: true,
    review_status: "approved",
  },
  payment_upload_due_at: null,
  payment_verification_due_at: null,
  price_rupiah: 1500000,
  rejection: null,
  reservation_code: "RSV-2026-00024",
  review: null,
  starts_at: "2024-10-24T09:00:00Z",
  status: "approved",
};

async function mockDetailApi(page: Page, reservation: Record<string, any>) {
  await page.route(`http://localhost:8000/student/reservations/${reservation.id}`, async (route) => {
    await route.fulfill({ json: reservation });
  });

  await page.route("http://localhost:8000/student/reservations/*/approval-letter/download", async (route) => {
    await route.fulfill({ body: "pdf", contentType: "application/pdf" });
  });

  await page.route("http://localhost:8000/student/reservations/*/signed-approval-letter/download", async (route) => {
    await route.fulfill({ body: "pdf", contentType: "application/pdf" });
  });

  await page.route("http://localhost:8000/student/reservations/*/payment-receipt/download", async (route) => {
    await route.fulfill({ body: "jpg", contentType: "image/jpeg" });
  });
}

test.describe("student reservation detail pages", () => {
  test("matches the accepted reservation detail reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await mockDetailApi(page, baseReservation);
    await page.goto("/student/reservations/RSV-FIXTURE-001");

    await expect(page.getByRole("link", { name: "← Kembali" })).toHaveAttribute(
      "href",
      "/student/reservations",
    );
    await expect(page.getByRole("heading", { name: "Grand Auditorium" })).toBeVisible();
    await expect(page.getByText("4.9 (124 ulasan)")).toBeVisible();
    await expect(page.getByText("Gedung Graha Widya Wisuda, Lantai 1")).toBeVisible();
    await expect(page.getByRole("link", { name: "Ajukan Pembatalan" })).toHaveAttribute(
      "href",
      "/student/reservations/RSV-FIXTURE-001/cancellation",
    );
    await expect(page.getByRole("heading", { name: "Dokumen Reservasi" })).toBeVisible();
    await expect(page.getByText("surat-persetujuan-ditandatangani.pdf")).toBeVisible();
    await expect(page.getByText("bukti-pembayaran.jpg")).toBeVisible();
    await expect(page.getByText("Terverifikasi")).toHaveCount(2);
    await expect(page.getByText("Reservasi ini sudah disetujui.")).toBeVisible();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(
      page,
      `student-reservation-detail-accepted-${isMobile ? "mobile" : "desktop"}`,
    );
  });

  test("matches the completed reservation detail reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await mockDetailApi(page, {
      ...baseReservation,
      id: "RSV-FIXTURE-010",
      status: "completed",
    });
    await page.goto("/student/reservations/RSV-FIXTURE-010");

    await expect(page.getByRole("heading", { name: "Grand Auditorium" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Tulis Ulasan" })).toHaveAttribute(
      "href",
      "/student/reservations/RSV-FIXTURE-010/review",
    );
    await expect(page.getByRole("link", { name: "Ajukan Pembatalan" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Dokumen Reservasi" })).toBeVisible();
    await expect(page.getByText("Terverifikasi")).toHaveCount(2);
    await expect(page.getByText("Reservasi telah selesai.")).toBeVisible();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(
      page,
      `student-reservation-detail-completed-${isMobile ? "mobile" : "desktop"}`,
    );
  });
});

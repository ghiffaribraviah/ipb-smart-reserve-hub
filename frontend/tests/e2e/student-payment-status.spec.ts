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
  organization_unit: { id: "org-1", name: "BEM KM IPB" },
  participant_count: 80,
  payment: {
    receipt: null,
    rejection_reason: null,
    required: true,
    review_status: "upload_needed",
  },
  payment_upload_due_at: "2024-10-25T09:00:00Z",
  payment_verification_due_at: null,
  price_rupiah: 1500000,
  rejection: null,
  reservation_code: "RSV-2026-00024",
  review: null,
  starts_at: "2024-10-24T09:00:00Z",
  status: "pending_payment",
};

async function mockPaymentApi(page: Page, reservation = baseReservation) {
  await page.route("http://localhost:8000/student/reservations/RSV-FIXTURE-001", async (route) => {
    await route.fulfill({ json: reservation });
  });

  await page.route("http://localhost:8000/student/reservations/RSV-FIXTURE-001/payment", async (route) => {
    await route.fulfill({
      json: {
        amount_rupiah: 1500000,
        payment_instructions: "Transfer ke BNI 123456789 a.n. IPB",
        reservation_code: "RSV-2026-00024",
        reservation_id: "RSV-FIXTURE-001",
      },
    });
  });
}

test.describe("student payment status pages", () => {
  test("matches the payment upload reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await mockPaymentApi(page);
    await page.goto("/student/reservations/RSV-FIXTURE-001/payment");

    await expect(page.getByRole("link", { name: "← Kembali" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Unggah Bukti Pembayaran" })).toBeVisible();
    await expect(page.getByText("JPG/JPEG/PNG maksimal 5 MB")).toBeVisible();
    await expect(page.getByText("bukti-pembayaran.jpg")).toBeVisible();
    await expect(page.getByText("JPG · 840 KB · siap dikirim")).toBeVisible();
    await expect(page.getByText("Total Pembayaran")).toBeVisible();
    await expect(page.getByText("Rp1.500.000").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Unggah Bukti" })).toHaveAttribute(
      "href",
      "/student/reservations/RSV-FIXTURE-001/payment/waiting",
    );

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(
      page,
      `student-payment-upload-${isMobile ? "mobile" : "desktop"}`,
    );
  });

  test("matches the payment waiting reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await mockPaymentApi(page, {
      ...baseReservation,
      payment: {
        ...baseReservation.payment,
        receipt: {
          content_type: "image/jpeg",
          filename: "bukti-pembayaran.jpg",
          size_bytes: 860000,
          uploaded_at: "2024-10-23T10:00:00Z",
        },
        review_status: "waiting_review",
      },
      payment_verification_due_at: "2024-10-25T10:00:00Z",
    });
    await page.goto("/student/reservations/RSV-FIXTURE-001/payment/waiting");

    await expect(page.getByRole("heading", { name: "Rangkuman Reservasi" })).toBeVisible();
    await expect(page.getByText("Menunggu Verifikasi Pembayaran")).toHaveCount(2);
    await expect(page.getByText("Tim fasilitas sedang meninjau bukti pembayaran yang Anda unggah.")).toBeVisible();
    await expect(page.getByText("Total Pembayaran")).toBeVisible();
    await expect(page.getByText("Rp1.500.000")).toBeVisible();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(
      page,
      `student-payment-waiting-${isMobile ? "mobile" : "desktop"}`,
    );
  });

  test("matches the payment declined reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await mockPaymentApi(page, {
      ...baseReservation,
      payment: {
        ...baseReservation.payment,
        rejection_reason: "Bukti pembayaran belum dapat diverifikasi.",
        review_status: "rejected",
      },
      rejection: { reason: "Bukti pembayaran belum dapat diverifikasi.", source: "payment" },
      status: "rejected",
    });
    await page.goto("/student/reservations/RSV-FIXTURE-001/payment/declined");

    await expect(page.getByRole("heading", { name: "Bukti Pembayaran Ditolak" })).toBeVisible();
    await expect(page.getByText("Pembayaran Ditolak", { exact: true })).toBeVisible();
    await expect(page.getByText("Bukti pembayaran belum dapat diverifikasi.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Unggah Ulang Bukti Pembayaran" })).toHaveAttribute(
      "href",
      "/student/reservations/RSV-FIXTURE-001/payment",
    );

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(
      page,
      `student-payment-declined-${isMobile ? "mobile" : "desktop"}`,
    );
  });

  test("matches the accepted reservation reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await mockPaymentApi(page, {
      ...baseReservation,
      payment: {
        ...baseReservation.payment,
        review_status: "approved",
      },
      status: "approved",
    });
    await page.goto("/student/reservations/RSV-FIXTURE-001/accepted");

    await expect(page.getByRole("heading", { name: "Reservasi Disetujui" })).toBeVisible();
    await expect(page.getByText("Kode Reservasi")).toBeVisible();
    await expect(page.getByText("RSV-2026-00024")).toBeVisible();
    await expect(page.getByText("Disetujui", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Lihat Detail Reservasi" })).toHaveAttribute(
      "href",
      "/student/reservations/RSV-FIXTURE-001",
    );

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(
      page,
      `student-reservation-accepted-${isMobile ? "mobile" : "desktop"}`,
    );
  });
});

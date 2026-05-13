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
    review_status: "upload_needed",
    signed_approval_letter: null,
  },
  document_upload_due_at: "2024-10-23T09:00:00Z",
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
    required: false,
    review_status: "not_required",
  },
  payment_upload_due_at: null,
  payment_verification_due_at: null,
  price_rupiah: 0,
  rejection: null,
  reservation_code: "RSV-FIXTURE-001",
  review: null,
  starts_at: "2024-10-24T09:00:00Z",
  status: "pending_document_upload",
};

async function mockDocumentApi(page: Page, reservation = baseReservation) {
  await page.route("http://localhost:8000/student/reservations/RSV-FIXTURE-001", async (route) => {
    await route.fulfill({ json: reservation });
  });

  await page.route("http://localhost:8000/student/reservations/RSV-FIXTURE-001/approval-letter", async (route) => {
    await route.fulfill({
      json: {
        content_type: "application/pdf",
        filename: "template-surat-permohonan-reservasi.pdf",
        generated_at: "2024-10-23T09:00:00Z",
        reservation_code: "RSV-FIXTURE-001",
        reservation_id: "RSV-FIXTURE-001",
        size_bytes: 428000,
      },
    });
  });
}

test.describe("student document workflow pages", () => {
  test("matches the approval letter upload reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await mockDocumentApi(page);
    await page.goto("/student/reservations/RSV-FIXTURE-001/letter");

    await expect(page.getByRole("link", { name: "← Kembali" })).toHaveAttribute(
      "href",
      "/student/reservations/RSV-FIXTURE-001",
    );
    await expect(page.getByRole("navigation", { name: "Tahapan reservasi" })).toContainText(
      "Surat",
    );
    await expect(page.getByRole("heading", { name: "Template Surat" })).toBeVisible();
    await expect(page.getByText("template-surat-permohonan-reservasi.pdf")).toBeVisible();
    await expect(page.getByRole("button", { name: "Unduh Surat" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Unggah Dokumen" })).toBeVisible();
    await expect(page.getByLabel("Pilih file surat persetujuan")).toBeVisible();
    await expect(page.getByText("surat-reservasi.pdf")).toBeVisible();
    await expect(page.getByText("PDF · 1,2 MB · siap dikirim")).toBeVisible();
    await expect(page.getByRole("link", { name: "Kirim Reservasi" })).toHaveAttribute(
      "href",
      "/student/reservations/RSV-FIXTURE-001/verification/waiting",
    );

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(
      page,
      `student-document-letter-${isMobile ? "mobile" : "desktop"}`,
    );
  });

  test("matches the document verification waiting reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await mockDocumentApi(page, {
      ...baseReservation,
      document: {
        ...baseReservation.document,
        review_status: "waiting_review",
        signed_approval_letter: {
          content_type: "application/pdf",
          filename: "surat-reservasi.pdf",
          size_bytes: 1200000,
          uploaded_at: "2024-10-23T10:00:00Z",
        },
      },
      document_verification_due_at: "2024-10-25T10:00:00Z",
      status: "pending_document_review",
    });
    await page.goto("/student/reservations/RSV-FIXTURE-001/verification/waiting");

    await expect(page.getByRole("navigation", { name: "Tahapan reservasi" })).toContainText(
      "Aktif",
    );
    await expect(page.getByRole("heading", { name: "Rangkuman Reservasi" })).toBeVisible();
    await expect(page.getByText("Grand Auditorium")).toBeVisible();
    await expect(page.getByText("24 Oktober 2024")).toBeVisible();
    await expect(page.getByText("09:00 - 13:00")).toBeVisible();
    await expect(page.getByText("Menunggu Verifikasi Dokumen")).toHaveCount(2);
    await expect(page.getByText("Tim fasilitas sedang meninjau surat permohonan yang Anda unggah.")).toBeVisible();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(
      page,
      `student-document-waiting-${isMobile ? "mobile" : "desktop"}`,
    );
  });

  test("matches the document verification declined reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await mockDocumentApi(page, {
      ...baseReservation,
      document: {
        ...baseReservation.document,
        rejection_reason: "Tanda tangan pembina belum terlihat jelas.",
        review_status: "rejected",
      },
      rejection: { reason: "Tanda tangan pembina belum terlihat jelas.", source: "document" },
      status: "rejected",
    });
    await page.goto("/student/reservations/RSV-FIXTURE-001/verification/declined");

    await expect(page.getByRole("heading", { name: "Rangkuman Reservasi" })).toBeVisible();
    await expect(page.getByText("Ditolak")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Dokumen Perlu Diperbaiki" })).toBeVisible();
    await expect(page.getByText("Reservasi belum dapat diterima karena dokumen perlu diperbaiki.")).toBeVisible();
    await expect(page.getByText("Tanda tangan pembina belum terlihat jelas.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Kembali ke Daftar Reservasi" })).toHaveAttribute(
      "href",
      "/student/reservations",
    );

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(
      page,
      `student-document-declined-${isMobile ? "mobile" : "desktop"}`,
    );
  });
});

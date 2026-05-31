import { expect, type Page, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectPageScreenshot,
  screenshotViewports,
} from "./utils/visual";

const facilityImageFixture =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 480'%3E%3Crect width='1200' height='480' fill='%23e8f5e9'/%3E%3Cpath d='M0 360 260 150 480 310 760 95 1200 365v115H0z' fill='%230f9d58' opacity='.55'/%3E%3Cpath d='M0 420 220 280 410 375 620 245 1200 430v50H0z' fill='%231d7667' opacity='.25'/%3E%3C/svg%3E";

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
  facility: { cover_image_url: facilityImageFixture, id: "facility-1", name: "Grand Auditorium" },
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

async function authenticateStudent(page: Page) {
  await page.route("http://localhost:8000/auth/me", async (route) => {
    await route.fulfill({
      json: {
        email: "student@apps.ipb.ac.id",
        full_name: "Student Aktif",
        id: "student-1",
        is_active: true,
        role: "student",
      },
    });
  });

  await page.addInitScript(() => {
    window.sessionStorage.setItem("ipb-srh-token", "e2e-student-token");
  });

  await page.route("http://localhost:8000/notifications", async (route) => {
    await route.fulfill({ json: [] });
  });
  await page.route("http://localhost:8000/notifications?**", async (route) => {
    await route.fulfill({ json: [] });
  });
  await page.route("http://localhost:8000/notifications/unread-count", async (route) => {
    await route.fulfill({ json: { unread_count: 0 } });
  });
  await page.route("http://localhost:8000/notifications/*/read", async (route) => {
    await route.fulfill({ json: { id: "notification-1", read_at: "2026-05-26T00:00:00Z" } });
  });
  await page.route("http://localhost:8000/notifications/read-all", async (route) => {
    await route.fulfill({ json: [] });
  });
}

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
    await authenticateStudent(page);
    await mockDetailApi(page, baseReservation);
    await page.goto("/student/reservations/RSV-FIXTURE-001");

    await expect(page.getByRole("link", { name: "← Kembali" })).toHaveAttribute(
      "href",
      "/student/reservations",
    );
    await expect(page.getByRole("heading", { name: "Grand Auditorium" })).toBeVisible();
    await expect(page.getByRole("img", { name: "Foto Grand Auditorium" })).toBeVisible();
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
    await expect(page.getByRole("link", { name: "Ajukan Pembatalan" })).toBeVisible();

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
    await authenticateStudent(page);
    await mockDetailApi(page, {
      ...baseReservation,
      id: "RSV-FIXTURE-010",
      status: "completed",
    });
    await page.goto("/student/reservations/RSV-FIXTURE-010");

    await expect(page.getByRole("heading", { name: "Grand Auditorium" })).toBeVisible();
    await expect(page.getByRole("img", { name: "Foto Grand Auditorium" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Tulis Ulasan" })).toBeVisible();
    await expect(page.getByRole("radiogroup", { name: "Penilaian Fasilitas" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Kirim Ulasan" })).toBeVisible();
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

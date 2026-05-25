import { expect, type Page, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectPageScreenshot,
  screenshotViewports,
} from "./utils/visual";

const detailResponse = {
  activity_title: "AI Ethics Symposium 2024",
  cancellation: {
    reason: null,
    rejection_reason: null,
    requested: false,
    review_status: "not_requested",
  },
  contact_phone: "+62 812-3456-7890",
  document: {
    approval_letter: null,
    due_at: "2024-10-20T02:00:00Z",
    rejection_reason: null,
    review_status: "pending_review",
    signed_approval_letter: {
      content_type: "application/pdf",
      filename: "surat-dekan.pdf",
      generated_at: null,
      size_bytes: 1100000,
      uploaded_at: "2024-10-15T02:00:00Z",
    },
  },
  ends_at: "2024-10-24T06:00:00Z",
  event_description:
    "Simposium tahunan yang mempertemukan mahasiswa, dosen, dan praktisi industri untuk membahas implikasi etis teknologi kecerdasan buatan.",
  extra_requirements: {
    av_support: true,
    extra_cleaning: true,
    logistics_coordination: false,
    notes: null,
    security_personnel: false,
  },
  facility: { id: "grand-auditorium", name: "Grand Auditorium" },
  id: "RSV-STF-001",
  organization_unit: { id: "himalkom", name: "Himpunan Mahasiswa Ilmu Komputer" },
  participant_count: 150,
  payment: {
    due_at: null,
    receipt: null,
    rejection_reason: null,
    required: false,
    review_status: "not_required",
  },
  price_rupiah: 0,
  reservation_code: "RSV-STF-001",
  review_actions: {
    cancellation: {
      approve_url: "/staff/reservations/RSV-STF-001/cancellation-review/approve",
      download_url: null,
      reject_url: "/staff/reservations/RSV-STF-001/cancellation-review/reject",
    },
    document: {
      approve_url: "/staff/reservations/RSV-STF-001/document-review/approve",
      download_url: "/staff/reservations/RSV-STF-001/signed-approval-letter/download",
      reject_url: "/staff/reservations/RSV-STF-001/document-review/reject",
    },
    payment: {
      approve_url: "/staff/reservations/RSV-STF-001/payment-review/approve",
      download_url: "/staff/reservations/RSV-STF-001/payment-receipt/download",
      reject_url: "/staff/reservations/RSV-STF-001/payment-review/reject",
    },
  },
  starts_at: "2024-10-24T02:00:00Z",
  status: "pending_document_review",
  student: {
    email: "johnathan_doe@apps.ipb.ac.id",
    full_name: "Johnathan Doe",
    id: "G64190001",
  },
};

async function authenticateStaff(page: Page) {
  await page.route("http://localhost:8000/auth/me", async (route) => {
    await route.fulfill({
      json: {
        email: "staff@apps.ipb.ac.id",
        full_name: "Staf Fasilitas",
        id: "staff-1",
        is_active: true,
        role: "staff",
      },
    });
  });

  await page.addInitScript(() => {
    window.sessionStorage.setItem("ipb-srh-token", "e2e-staff-token");
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

async function mockStaffDetailApi(page: Page) {
  await page.route("http://localhost:8000/staff/reservations/RSV-STF-001", async (route) => {
    await route.fulfill({ json: detailResponse });
  });
  await page.route("http://localhost:8000/staff/reservations/RSV-STF-001/signed-approval-letter/download", async (route) => {
    await route.fulfill({
      body: "pdf",
      headers: {
        "Content-Disposition": 'attachment; filename="surat-dekan.pdf"',
        "Content-Type": "application/pdf",
      },
    });
  });
}

test.describe("staff reservation detail and decision surfaces", () => {
  test("matches the staff reservation detail reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await authenticateStaff(page);
    await mockStaffDetailApi(page);
    await page.goto("/staff/reservations/RSV-STF-001");

    await expect(page.getByRole("link", { name: "Kembali ke Daftar Reservasi" })).toHaveAttribute(
      "href",
      "/staff/reservations",
    );
    await expect(page.getByRole("heading", { name: "Informasi Pemohon" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Johnathan Doe" })).toBeVisible();
    await expect(page.getByText("AI Ethics Symposium 2024")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Verifikasi Dokumen" })).toBeVisible();
    await expect(page.getByText("surat-dekan.pdf")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Grand Auditorium" })).toBeVisible();
    await expect(page.getByText("Menunggu Peninjauan").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Setujui Dokumen" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Tolak Pengajuan" })).toHaveAttribute(
      "href",
      "/staff/reservations/RSV-STF-001/review-decision?target=document",
    );

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(
      page,
      `staff-reservation-detail-${isMobile ? "mobile" : "desktop"}`,
    );
  });

  test("matches the review decision dialog reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await authenticateStaff(page);
    await mockStaffDetailApi(page);
    await page.goto("/staff/reservations/RSV-STF-001/review-decision");

    await expect(page.getByRole("heading", { name: "Tolak Pengajuan" })).toBeVisible();
    const dialog = page.getByRole("dialog", { name: "Tolak Dokumen Reservasi" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Isi alasan yang jelas sebelum menolak pengajuan.")).toBeVisible();
    await expect(page.getByLabel("Alasan penolakan")).toHaveValue(
      "Surat persetujuan belum memuat tanda tangan pembina organisasi. Mohon unggah ulang dokumen yang sudah ditandatangani.",
    );
    await expect(dialog.getByText("surat-dekan.pdf")).not.toBeVisible();
    await expect(dialog.getByText("Menolak dokumen akan mengubah reservasi menjadi ditolak")).not.toBeVisible();
    await expect(dialog.getByRole("link", { name: "Kembali" })).toHaveAttribute(
      "href",
      "/staff/reservations/RSV-STF-001",
    );
    await expect(dialog.getByRole("button", { name: "Tolak Dokumen" })).toBeVisible();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(
      page,
      `staff-review-decision-dialog-${isMobile ? "mobile" : "desktop"}`,
    );
  });
});

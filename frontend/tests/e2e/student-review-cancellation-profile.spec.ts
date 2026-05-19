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
  id: "RSV-FIXTURE-010",
  organization_unit: { id: "org-1", name: "Himalkom" },
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
  reservation_code: "RSV-2026-00024",
  review: null,
  starts_at: "2024-10-24T09:00:00Z",
  status: "completed",
};

async function mockReservationApi(page: Page, reservation: Record<string, any>) {
  await page.route(`http://localhost:8000/student/reservations/${reservation.id}`, async (route) => {
    await route.fulfill({ json: reservation });
  });

  await page.route(`http://localhost:8000/student/reservations/${reservation.id}/review`, async (route) => {
    await route.fulfill({ json: { id: "review-1" }, status: 201 });
  });

  await page.route(`http://localhost:8000/student/reservations/${reservation.id}/cancellation-request`, async (route) => {
    await route.fulfill({
      json: {
        ...reservation,
        cancellation_reason: "Jadwal kegiatan berubah: agenda organisasi dipindahkan.",
        status: "cancelled",
      },
    });
  });
}

async function mockProfileApi(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem("ipb-srh-token", "visual-token");
  });

  await page.route("http://localhost:8000/auth/me", async (route) => {
    await route.fulfill({
      json: {
        academic_profile: {
          degree: "Sarjana (S1)",
          entry_year: 2019,
          faculty: "Matematika dan Ilmu Pengetahuan Alam (FMIPA)",
          program_studi: "Ilmu Komputer",
        },
        email: "ari.rahman@apps.ipb.ac.id",
        full_name: "Ari Rahman",
        id: "student-1",
        is_active: true,
        nim: "G64190001",
        phone: "+62 812 3456 7890",
        role: "student",
      },
    });
  });
}

test.describe("student review, cancellation, and profile pages", () => {
  test("redirects the deprecated reservation review route to detail", async ({ page }) => {
    await mockReservationApi(page, baseReservation);
    await page.goto("/student/reservations/RSV-FIXTURE-010/review");

    await expect(page.getByRole("heading", { name: "Tulis Ulasan" })).toBeVisible();
    await expect(page).toHaveURL(/\/student\/reservations\/RSV-FIXTURE-010#review$/);
  });

  test("matches the cancellation request reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await mockReservationApi(page, {
      ...baseReservation,
      id: "RSV-FIXTURE-001",
      status: "approved",
    });
    await page.goto("/student/reservations/RSV-FIXTURE-001/cancellation");

    await expect(page.getByRole("link", { name: "← Kembali ke Detail Reservasi" })).toHaveAttribute(
      "href",
      "/student/reservations/RSV-FIXTURE-001",
    );
    await expect(page.getByRole("heading", { name: "Ajukan Pembatalan" })).toBeVisible();
    await expect(page.getByLabel("Alasan Pembatalan")).toBeVisible();
    await expect(page.getByLabel("Detail Alasan")).toBeVisible();
    await expect(page.getByRole("button", { name: "Kirim Pengajuan" })).toBeVisible();
    await expect(page.getByText("Pembatalan dapat berdampak pada denda")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Reservasi Dibatalkan" })).toBeVisible();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(
      page,
      `student-cancellation-request-${isMobile ? "mobile" : "desktop"}`,
    );
  });

  test("matches the student profile reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await mockProfileApi(page);
    await page.goto("/student/profile");

    await expect(page.getByRole("heading", { name: "Profil Mahasiswa" })).toBeVisible();
    await expect(page.getByText("Ari Rahman")).toBeVisible();
    await expect(page.getByText("ari.rahman@apps.ipb.ac.id").first()).toBeVisible();
    await expect(page.getByText("Mahasiswa Aktif")).toBeVisible();
    await expect(page.getByRole("button", { name: "Keluar" })).toBeVisible();
    await expect(page.getByText("Nomor Induk Mahasiswa (NIM)")).toBeVisible();
    await expect(page.getByRole("definition").filter({ hasText: "G64190001" })).toBeVisible();
    await expect(page.getByText("Ilmu Komputer")).toBeVisible();
    await expect(page.getByText("Sarjana (S1)")).toBeVisible();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(
      page,
      `student-profile-${isMobile ? "mobile" : "desktop"}`,
    );
  });
});

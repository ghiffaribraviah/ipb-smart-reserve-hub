import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectPageScreenshot,
  screenshotViewports,
} from "./utils/visual";

const systemStatus = {
  application: { name: "IPB SRH", version: "1.0.0" },
  backend: { status: "ok" },
  database: { status: "ok" },
  storage: { status: "degraded" },
  worker: { status: "ok" },
};

const bookingSettings = {
  allowed_student_email_domains: ["apps.ipb.ac.id"],
  document_upload_due_hours: 24,
  document_verification_due_hours: 48,
  final_approval_cutoff_hours: 168,
  max_booking_advance_hours: 1440,
  min_booking_lead_hours: 336,
  overdue_final_approval_cutoff_hours: 96,
  payment_upload_due_hours: 24,
  payment_verification_due_hours: 48,
};

async function mockSystem(page: Page) {
  await page.route("http://localhost:8000/admin/system-status", async (route) => {
    await route.fulfill({ json: systemStatus });
  });
  await page.route("http://localhost:8000/admin/settings", async (route) => {
    await route.fulfill({ json: bookingSettings });
  });
}

test.describe("super admin system page", () => {
  test("matches the super admin sistem reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await mockSystem(page);
    await page.goto("/super-admin/system");

    await expect(page.getByRole("heading", { exact: true, name: "Sistem" })).toBeVisible();
    if (!isMobile) {
      await expect(page.getByRole("link", { name: "Sistem" }).first()).toHaveAttribute(
        "aria-current",
        "page",
      );
    }
    await expect(page.getByText("Backend").first()).toBeVisible();
    await expect(page.getByText("OK").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Status Layanan" })).toBeVisible();
    await expect(page.getByText("IPB SRH 1.0.0")).toBeVisible();
    await expect(page.getByText("Storage").first()).toBeVisible();
    await expect(page.getByText("Pantau", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Aturan Booking" })).toBeVisible();
    await expect(page.getByLabel("Domain email mahasiswa")).toHaveValue("apps.ipb.ac.id");
    await expect(page.getByLabel("Minimum lead time jam")).toHaveValue("336");
    await expect(page.getByLabel("Batas unggah surat jam")).toHaveValue("24");
    await expect(page.getByRole("button", { name: "Unduh Snapshot" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Simpan Pengaturan" })).toBeDisabled();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(page, `super-admin-system-${isMobile ? "mobile" : "desktop"}`);
  });
});

import { expect, test } from "@playwright/test";

const studentUser = {
  academic_profile: {
    degree: "S1",
    entry_year: 2022,
    faculty: "FMIPA",
    program_studi: "Ilmu Komputer",
  },
  email: "rani@apps.ipb.ac.id",
  full_name: "Rani Prameswari",
  id: "student-1",
  is_active: true,
  nim: "G64000000",
  phone: "08123456789",
  role: "student",
};

test.beforeEach(async ({ page }) => {
  await page.route("http://localhost:8000/auth/me", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      json: studentUser,
      status: 200,
    });
  });
  await page.addInitScript(() => {
    window.sessionStorage.setItem("ipb-srh-session-token", "playwright-token");
  });
});

test("student shell content route matches desktop and mobile layout", async ({ page }) => {
  await page.goto("/student");

  await expect(page.getByRole("heading", { name: "Beranda Mahasiswa" })).toBeVisible();
  await expect(page.getByRole("searchbox", { name: "Cari fasilitas" })).toBeVisible();
  await expect(page).toHaveScreenshot("student-shell-home.png", {
    maxDiffPixelRatio: 0.02,
  });
});

test("student shell workflow route hides global search and keeps reservation active", async ({ page }) => {
  await page.goto("/student/reservations/RSV-1024/payment");

  await expect(page.getByRole("heading", { name: "Pembayaran Reservasi" })).toBeVisible();
  await expect(page.getByRole("searchbox", { name: "Cari fasilitas" })).toBeHidden();
  await expect(page.getByRole("link", { name: "Reservasi" })).toHaveAttribute("aria-current", "page");
  await expect(page).toHaveScreenshot("student-shell-workflow.png", {
    maxDiffPixelRatio: 0.02,
  });
});

test("student shell search routes to catalog query results", async ({ page }) => {
  await page.goto("/student");

  await page.getByRole("searchbox", { name: "Cari fasilitas" }).fill("Auditorium CCR");
  await page.getByRole("button", { name: "Cari" }).click();

  await expect(page).toHaveURL("/student/facilities?q=Auditorium+CCR");
  await expect(page.getByRole("heading", { name: "Katalog Fasilitas" })).toBeVisible();
});

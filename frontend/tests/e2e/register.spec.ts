import { expect, test } from "@playwright/test";

test("register page matches default desktop and mobile layout", async ({ page }) => {
  await page.goto("/register");

  await expect(page.getByRole("heading", { name: "Daftar Akun" })).toBeVisible();
  await expect(page.getByLabel(/Nama lengkap/)).toBeVisible();
  await expect(page.getByLabel(/Nomor telepon/)).toBeVisible();
  await expect(page).toHaveScreenshot("register-default.png", {
    maxDiffPixelRatio: 0.02,
  });
});

test("register page shows validation errors without losing form context", async ({ page }) => {
  await page.goto("/register");

  await page.getByLabel(/Nama lengkap/).fill("Rani Prameswari Kusumawardhani Putri Lestari");
  await page.getByLabel(/Email institusi mahasiswa/).fill("rani@ipb.ac.id");
  await page.getByRole("button", { name: "Daftar" }).click();

  await expect(page.getByText("NIM wajib diisi.")).toBeVisible();
  await expect(page.getByText("Nomor telepon wajib diisi.")).toBeVisible();
  await expect(page.getByText("Gunakan email mahasiswa apps.ipb.ac.id.")).toBeVisible();
  await expect(page.getByLabel(/Nama lengkap/)).toHaveValue("Rani Prameswari Kusumawardhani Putri Lestari");
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight)).toBe(true);
  await expect(page).toHaveScreenshot("register-validation-error.png", {
    maxDiffPixelRatio: 0.02,
  });
});

test("register page shows success state with login CTA", async ({ page }) => {
  await page.route("http://localhost:8000/auth/register", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      json: {
        academic_profile: null,
        email: "rani@apps.ipb.ac.id",
        full_name: "Rani Prameswari",
        id: "student-1",
        is_active: true,
        nim: "G64000000",
        phone: "08123456789",
        role: "student",
      },
      status: 201,
    });
  });

  await page.goto(`/register?redirect=${encodeURIComponent("/student/reservations")}`);
  await page.getByLabel(/Nama lengkap/).fill("Rani Prameswari");
  await page.getByLabel(/NIM/).fill("G64000000");
  await page.getByLabel(/Nomor telepon/).fill("08123456789");
  await page.getByLabel(/Email institusi mahasiswa/).fill("rani@apps.ipb.ac.id");
  await page.locator("#register-password").fill("secret123");
  await page.locator("#register-confirm-password").fill("secret123");
  await page.getByRole("button", { name: "Daftar" }).click();

  await expect(page.getByRole("status")).toContainText("Akun berhasil dibuat");
  await expect(page.getByRole("link", { name: "Masuk Sekarang" })).toHaveAttribute(
    "href",
    "/login?registered=1&redirect=%2Fstudent%2Freservations",
  );
  await expect(page).toHaveScreenshot("register-success.png", {
    maxDiffPixelRatio: 0.02,
  });
});

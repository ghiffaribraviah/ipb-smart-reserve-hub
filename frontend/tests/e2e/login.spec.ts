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

test("login page matches default desktop and mobile layout", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: "Masuk" })).toBeVisible();
  await expect(page.getByLabel("Email institusi")).toBeVisible();
  await expect(page.locator("#login-password")).toBeVisible();
  await expect(page).toHaveScreenshot("login-default.png", {
    maxDiffPixelRatio: 0.02,
  });
});

test("login page shows registered success message", async ({ page }) => {
  await page.goto(`/login?registered=1&redirect=${encodeURIComponent("/student/reservations")}`);

  await expect(page.getByRole("status")).toContainText("Akun berhasil dibuat");
  await expect(page).toHaveScreenshot("login-registered.png", {
    maxDiffPixelRatio: 0.02,
  });
});

test("login page shows expired-session warning", async ({ page }) => {
  await page.goto(`/login?expired=1&redirect=${encodeURIComponent("/student/reservations/RSV-1024")}`);

  await expect(page.getByRole("status")).toContainText("Sesi Anda berakhir");
  await expect(page).toHaveScreenshot("login-expired.png", {
    maxDiffPixelRatio: 0.02,
  });
});

test("login page shows invalid credential error without losing form context", async ({ page }) => {
  await page.route("http://localhost:8000/auth/login", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      json: { detail: "Email atau password salah." },
      status: 401,
    });
  });
  await page.route("http://localhost:8000/auth/me", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      json: studentUser,
      status: 200,
    });
  });

  await page.goto("/login");
  await page.getByLabel("Email institusi").fill("rani@apps.ipb.ac.id");
  await page.locator("#login-password").fill("salah");
  await page.getByRole("button", { name: "Masuk ke Akun" }).click();

  await expect(page.getByRole("alert")).toContainText("Email atau password salah.");
  await expect(page.getByLabel("Email institusi")).toHaveValue("rani@apps.ipb.ac.id");
  await expect(page).toHaveScreenshot("login-invalid-credentials.png", {
    maxDiffPixelRatio: 0.02,
  });
});

test("login page keeps network error state within the viewport", async ({ page }) => {
  await page.route("http://localhost:8000/auth/login", async (route) => {
    await route.abort();
  });

  await page.goto("/login");
  await page.getByLabel("Email institusi").fill("rani@apps.ipb.ac.id");
  await page.locator("#login-password").fill("secret123");
  await page.getByRole("button", { name: "Masuk ke Akun" }).click();

  await expect(page.getByRole("alert")).toContainText("Tidak dapat terhubung ke server");
  await expect(page).toHaveScreenshot("login-network-error.png", {
    maxDiffPixelRatio: 0.02,
  });
  expect(
    await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight),
  ).toBe(true);
});

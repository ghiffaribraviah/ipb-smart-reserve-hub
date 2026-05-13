import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectPageScreenshot,
  screenshotViewports,
} from "./utils/visual";

test.describe("staff edit facility page", () => {
  test("matches the edit facility details reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await page.goto("/staff/facilities/grand-auditorium/edit");

    await expect(page.getByRole("link", { name: "Kembali" })).toHaveAttribute(
      "href",
      "/staff/facilities",
    );
    await expect(page.getByRole("heading", { name: "Edit Detail Fasilitas" })).toBeVisible();
    await expect(page.getByLabel("Nama")).toHaveValue("Grand Auditorium");
    await expect(page.getByLabel("Lokasi")).toHaveValue("Kampus Timur, Plaza Tengah");
    await expect(page.getByLabel("Kapasitas (Orang)")).toHaveValue("1200");
    await expect(page.getByLabel("Harga sewa (Rupiah)")).toHaveValue("100000");
    await expect(page.getByLabel("Audio & Speaker")).toBeChecked();
    await expect(page.getByLabel("Layar & Proyektor")).not.toBeChecked();
    await expect(page.getByText("24 Oktober 2024 - 14:32")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Galeri Media" })).toBeVisible();
    await expect(page.getByText("main-auditorium.jpg")).toBeVisible();
    await expect(page.getByText("Open hours: Senin-Jumat 08:00-18:00")).toBeVisible();
    await expect(page.getByText("Blackout: 30 Oktober 2024")).toBeVisible();
    await expect(page.getByText("Perubahan tersimpan sebagai fixture.")).toBeVisible();
    await expect(page.getByText("Harga sewa memerlukan verifikasi bendahara.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Simpan Perubahan" })).toBeVisible();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(page, `staff-edit-facility-${isMobile ? "mobile" : "desktop"}`);
  });
});

import { expect, test } from "@playwright/test";

test("reservation workflow components cover shared states across desktop and mobile", async ({ page }) => {
  await page.goto("/reservation-workflow-components");

  await expect(page.getByRole("heading", { name: "Reservation Workflow Components" })).toBeVisible();
  await expect(page.getByText("Menunggu Verifikasi Dokumen").first()).toBeVisible();
  await expect(page.getByText("receipt-final.png").first()).toBeVisible();
  await expect(page).toHaveScreenshot("reservation-workflow-components.png", {
    fullPage: true,
    maxDiffPixelRatio: 0.02,
  });

  await page.getByRole("button", { name: "Buka dialog pembatalan" }).click();
  await expect(page.getByRole("dialog", { name: "Ajukan pembatalan reservasi" })).toBeVisible();
  await expect(page).toHaveScreenshot("reservation-confirmation-dialog.png", {
    maxDiffPixelRatio: 0.02,
  });
});

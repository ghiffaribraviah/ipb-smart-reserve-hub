import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectPageScreenshot,
  screenshotViewports,
} from "./utils/visual";

test.describe("shared workflow and data display boards", () => {
  test("matches the reservation workflow components board", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await page.goto("/__reference__/reservation-workflow-components");

    await expect(
      page.getByRole("heading", { name: "Reservation Workflow Components" }),
    ).toBeVisible();
    await expect(page.getByText("Reservation Stepper")).toBeVisible();
    await expect(page.getByText("Document Status Panel")).toBeVisible();
    await expect(page.getByText("Reservation Status Panel")).toBeVisible();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(
      page,
      `reservation-workflow-components-${isMobile ? "mobile" : "desktop"}`,
    );
  });

  test("matches the data display components board", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await page.goto("/__reference__/data-display-components");

    await expect(page.getByRole("heading", { name: "Data Display Components" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Facility Card" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Staff / Mobile Card List" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Super Governance Row" })).toBeVisible();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(
      page,
      `data-display-components-${isMobile ? "mobile" : "desktop"}`,
    );
  });
});

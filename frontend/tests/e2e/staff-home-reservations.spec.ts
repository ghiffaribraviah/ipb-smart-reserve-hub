import { expect, type Page, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectPageScreenshot,
  screenshotViewports,
} from "./utils/visual";

const baseOperation = {
  cancellation: { requested: false, review_status: "not_requested" },
  document: { due_at: null, review_status: "approved" },
  due_at: null,
  ends_at: "2024-10-24T06:00:00Z",
  facility: { id: "bio-labs", name: "Bio-Labs Complex A" },
  organization_unit: { id: "org-1", name: "Kandidat Doktor" },
  payment: { due_at: null, required: false, review_status: "not_required" },
  reservation_code: "RSV-STF-001",
  review_status: "not_actionable",
  starts_at: "2024-10-24T02:00:00Z",
  status: "approved",
  student: { email: "johnathan@apps.ipb.ac.id", full_name: "Johnathan Doe", id: "student-1" },
  activity_title: "Praktikum Mikrobiologi Lanjutan",
  workflow_type: "reservation",
};

const queueResponse = [
  {
    ...baseOperation,
    document: { due_at: "2024-10-24T02:00:00Z", review_status: "pending_review" },
    due_at: "2024-10-24T02:00:00Z",
    id: "RSV-STF-001",
    status: "pending_document_review",
    workflow_type: "document_review",
  },
  {
    ...baseOperation,
    activity_title: "Pengujian Material",
    due_at: "2024-10-23T02:00:00Z",
    facility: { id: "materials", name: "Materials Sci Wing" },
    id: "RSV-STF-002",
    organization_unit: { id: "org-2", name: "Peneliti Senior" },
    payment: { due_at: "2024-10-23T02:00:00Z", required: true, review_status: "pending_review" },
    reservation_code: "RSV-STF-002",
    status: "pending_payment",
    student: { email: "elena@apps.ipb.ac.id", full_name: "Elena Rodriguez", id: "student-2" },
    workflow_type: "payment_review",
  },
  {
    ...baseOperation,
    activity_title: "Seminar Industri 2024",
    due_at: "2024-10-22T02:00:00Z",
    facility: { id: "innovation", name: "Innovation Hub Pod 4" },
    id: "RSV-STF-003",
    organization_unit: { id: "org-3", name: "Mitra Eksternal" },
    reservation_code: "RSV-STF-003",
    status: "approved",
    student: { email: "marcus@apps.ipb.ac.id", full_name: "Marcus Knight", id: "student-3" },
    workflow_type: "reservation",
  },
  {
    ...baseOperation,
    activity_title: "Pertemuan Klub Mingguan",
    due_at: "2024-10-21T02:00:00Z",
    facility: { id: "quantum", name: "Quantum Computing Lab" },
    id: "RSV-STF-004",
    organization_unit: { id: "org-4", name: "Peneliti Pascasarjana" },
    reservation_code: "RSV-STF-004",
    status: "approved",
    student: { email: "sarah@apps.ipb.ac.id", full_name: "Sarah Chen", id: "student-4" },
    workflow_type: "reservation",
  },
  {
    ...baseOperation,
    activity_title: "Praktikum Fisiologi Tanaman",
    due_at: "2024-10-20T02:00:00Z",
    facility: { id: "greenhouses", name: "Agri-Tech Greenhouses" },
    id: "RSV-STF-005",
    organization_unit: { id: "org-5", name: "Staf Fakultas" },
    reservation_code: "RSV-STF-005",
    status: "rejected",
    student: { email: "arthur@apps.ipb.ac.id", full_name: "Arthur Hansen", id: "student-5" },
  },
  {
    ...baseOperation,
    activity_title: "Observasi Studi Perilaku",
    due_at: "2024-10-19T02:00:00Z",
    facility: { id: "neuro", name: "Neuroscience Center" },
    id: "RSV-STF-006",
    organization_unit: { id: "org-6", name: "Peneliti Pascadoktoral" },
    reservation_code: "RSV-STF-006",
    status: "pending_document_review",
    student: { email: "linda@apps.ipb.ac.id", full_name: "Linda Wu", id: "student-6" },
    workflow_type: "document_review",
  },
];

const listResponse = queueResponse.map((item, index) => ({
  ...item,
  document: { due_at: null, review_status: index === 1 ? "approved" : item.document.review_status },
  due_at: null,
  ends_at: [
    "2024-10-24T06:00:00Z",
    "2024-10-25T05:00:00Z",
    "2024-10-20T09:00:00Z",
    "2024-10-26T11:00:00Z",
    "2024-10-19T04:00:00Z",
    "2024-10-28T10:00:00Z",
  ][index],
  starts_at: [
    "2024-10-24T02:00:00Z",
    "2024-10-25T03:00:00Z",
    "2024-10-20T01:00:00Z",
    "2024-10-26T09:00:00Z",
    "2024-10-19T02:00:00Z",
    "2024-10-28T06:00:00Z",
  ][index],
  status: ["approved", "pending_payment", "completed", "approved", "rejected", "pending_document_review"][index],
  workflow_type: "reservation",
}));

async function mockStaffOperationsApi(page: Page) {
  await page.route("http://localhost:8000/staff/reservations/verification-queue", async (route) => {
    await route.fulfill({ json: queueResponse });
  });
  await page.route(/http:\/\/localhost:8000\/staff\/reservations(?:\?.*)?$/, async (route) => {
    await route.fulfill({ json: listResponse });
  });
}

test.describe("staff operations pages", () => {
  test("matches the staff verification hub reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await mockStaffOperationsApi(page);
    await page.goto("/staff");

    await expect(page.getByRole("heading", { name: "Hub Verifikasi" })).toBeVisible();
    await expect(page.getByText("MENUNGGU VERIFIKASI", { exact: true })).toBeVisible();
    await expect(page.getByText("6", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Pengajuan Reservasi" })).toBeVisible();
    await expect(page.getByText("Johnathan Doe")).toBeVisible();
    await expect(page.getByText("Menunggu Verifikasi Dokumen").first()).toBeVisible();
    await expect(page.getByText("Menunggu Verifikasi Pembayaran")).toBeVisible();
    await expect(page.getByRole("table").getByText("Reservasi").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Unduh dokumen Johnathan Doe" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Verifikasi Johnathan Doe" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Tolak Johnathan Doe" })).toBeVisible();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(page, `staff-home-${isMobile ? "mobile" : "desktop"}`);
  });

  test("matches the staff reservation list reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await mockStaffOperationsApi(page);
    await page.goto("/staff/reservations");

    await expect(page.getByRole("heading", { name: "Semua Reservasi" })).toBeVisible();
    await expect(page.getByLabel("Filter fasilitas")).toHaveValue("all");
    await expect(page.getByLabel("Filter status")).toHaveValue("all");
    await expect(page.getByText("Menampilkan 6 hasil")).toBeVisible();
    await expect(page.getByText("Johnathan Doe")).toBeVisible();
    await expect(page.getByText("Disetujui", { exact: true }).nth(1)).toBeVisible();
    await expect(page.getByRole("table").getByText("Menunggu Pembayaran")).toBeVisible();
    await expect(page.getByRole("table").getByText("Menunggu Verifikasi Dokumen")).toBeVisible();
    await expect(page.getByRole("link", { name: "Lihat Detail Johnathan Doe" })).toHaveAttribute(
      "href",
      "/staff/reservations/RSV-STF-001",
    );

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(page, `staff-reservation-list-${isMobile ? "mobile" : "desktop"}`);
  });
});

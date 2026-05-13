import { chromium } from "playwright";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const htmlReferenceDir = path.join(repoRoot, "docs", "frontend", "html-reference");
const screenshotsDir = path.join(repoRoot, "docs", "frontend", "screenshots");

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

const REMOTE_IMAGE_FIXTURE = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#d1fae5"/>
      <stop offset="100%" stop-color="#fef3c7"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#bg)"/>
  <rect x="72" y="72" width="1056" height="656" rx="42" fill="none" stroke="#1d7667" stroke-width="14" opacity="0.24"/>
  <text x="600" y="386" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="72" font-weight="700" fill="#1d7667">IPB SRH</text>
  <text x="600" y="452" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="30" fill="#4b5563">Deterministic media fixture</text>
</svg>`;

function screenshotStem(htmlFilename) {
  return path
    .basename(htmlFilename, ".html")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[()]/g, " ")
    .replace(/&/g, " and ")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

async function listHtmlReferences() {
  const entries = await readdir(htmlReferenceDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, "en"));
}

async function preparePage(context) {
  await context.route("**/*", async (route) => {
    const request = route.request();
    const url = request.url();

    if (url.startsWith("file:") || url.startsWith("data:") || url.startsWith("blob:")) {
      await route.continue();
      return;
    }

    if (request.resourceType() === "image") {
      await route.fulfill({
        status: 200,
        contentType: "image/svg+xml",
        body: REMOTE_IMAGE_FIXTURE,
      });
      return;
    }

    await route.abort();
  });
}

async function captureOneHtmlReference(browser, htmlFilename) {
  const htmlPath = path.join(htmlReferenceDir, htmlFilename);
  const pageUrl = pathToFileURL(htmlPath).href;
  const stem = screenshotStem(htmlFilename);
  const captures = [];

  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
      reducedMotion: "reduce",
    });
    await preparePage(context);

    const page = await context.newPage();
    await page.goto(pageUrl, { waitUntil: "domcontentloaded" });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.waitForLoadState("load").catch(() => {});

    const screenshotFilename = `${stem}-${viewport.name}.png`;
    await page.screenshot({
      path: path.join(screenshotsDir, screenshotFilename),
      fullPage: true,
    });
    captures.push({ viewport: viewport.name, filename: screenshotFilename });

    await context.close();
  }

  return { htmlFilename, captures };
}

function screenshotFor(captures, viewportName) {
  return captures.find((capture) => capture.viewport === viewportName)?.filename ?? "";
}

async function writeInventory(results) {
  const lines = [
    "# HTML Reference Screenshots",
    "",
    "Generated from `docs/frontend/html-reference/*.html` with `npm run capture:html-reference` from `frontend/`.",
    "",
    "These PNGs are target-only screenshots. They are the canonical visual reference for frontend refactors alongside the source HTML files.",
    "",
    "Capture is deterministic: live network requests are blocked, remote images are replaced with a generated local SVG fixture, and screenshots use `1440px` desktop and `390px` mobile viewport widths with full-page height.",
    "",
    "Current font note: this machine does not have local Inter or Playfair Display installed, so Chromium falls back to available system fonts during capture. Add bundled font files and update the capture script before using typography-sensitive screenshots as final approval gates.",
    "",
    "## Inventory",
    "",
    "| HTML Reference | Desktop | Mobile |",
    "| --- | --- | --- |",
  ];

  for (const result of results) {
    lines.push(
      `| \`${result.htmlFilename}\` | \`${screenshotFor(result.captures, "desktop")}\` | \`${screenshotFor(result.captures, "mobile")}\` |`,
    );
  }

  await writeFile(path.join(screenshotsDir, "README.md"), `${lines.join("\n")}\n`);
}

export async function captureHtmlReferenceScreenshots() {
  await mkdir(screenshotsDir, { recursive: true });

  const htmlReferences = await listHtmlReferences();
  if (htmlReferences.length === 0) {
    throw new Error(`No HTML reference files found in ${htmlReferenceDir}`);
  }

  const browser = await chromium.launch();
  const results = [];

  try {
    for (const htmlFilename of htmlReferences) {
      results.push(await captureOneHtmlReference(browser, htmlFilename));
    }
  } finally {
    await browser.close();
  }

  await writeInventory(results);
  return results;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  captureHtmlReferenceScreenshots()
    .then((results) => {
      const screenshotCount = results.reduce((count, result) => count + result.captures.length, 0);
      console.log(`Captured ${screenshotCount} screenshots from ${results.length} HTML references.`);
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}

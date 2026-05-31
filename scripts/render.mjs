// Render the legacy Duda gallery pages in a real browser, force every photo
// gallery to initialise, then extract per-vehicle image lists straight from the
// live DOM (signed le-cdn URLs are only generated once an image renders).
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const PAGES = [
  ["https://www.selecttrucks.co.uk/gallery/usedcars", "cars"],
  ["https://www.selecttrucks.co.uk/mpvs/pickups/vans", "vans"],
];

async function slowScroll(page) {
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height + 2000; y += 350) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(180);
  }
  // explicitly bring every gallery + image element into view to force load
  const n = await page.evaluate(() => document.querySelectorAll(".dmPhotoGallery, [data-image-url], figure, .image-container").length);
  for (let i = 0; i < n; i++) {
    await page.evaluate((idx) => {
      const els = document.querySelectorAll(".dmPhotoGallery, [data-image-url], figure, .image-container");
      els[idx]?.scrollIntoView({ block: "center" });
    }, i);
    if (i % 12 === 0) await page.waitForTimeout(120);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1500);
}

// Collect, per <h3> vehicle block, every signed le-cdn image URL in document order.
function extractPerVehicle() {
  const SIGNED = /le-cdn\.website-editor\.net/;
  const urlFrom = (el) => {
    const out = [];
    const bg = (el.style && el.style.backgroundImage) || getComputedStyle(el).backgroundImage;
    if (bg && bg !== "none") {
      const m = bg.match(/url\(["']?(.*?)["']?\)/);
      if (m && SIGNED.test(m[1])) out.push(m[1]);
    }
    if (el.tagName === "IMG") {
      const s = el.currentSrc || el.src;
      if (s && SIGNED.test(s)) out.push(s);
    }
    return out;
  };
  const h3s = [...document.querySelectorAll("h3")];
  const results = [];
  for (let i = 0; i < h3s.length; i++) {
    const title = h3s[i].innerText.replace(/\s+/g, " ").trim();
    // walk forward through DOM until the next h3, gathering image urls
    const stop = h3s[i + 1] || null;
    const imgs = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
    walker.currentNode = h3s[i];
    let node = walker.nextNode();
    while (node && node !== stop) {
      for (const u of urlFrom(node)) imgs.push(u);
      node = walker.nextNode();
    }
    results.push({ title, images: imgs });
  }
  return results;
}

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127 Safari/537.36",
});
const page = await ctx.newPage();

for (const [url, name] of PAGES) {
  console.log("loading", url);
  await page.goto(url, { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForTimeout(1500);
  await slowScroll(page);
  const data = await page.evaluate(extractPerVehicle);
  const withImg = data.filter((d) => d.images.length).length;
  const total = data.reduce((a, d) => a + d.images.length, 0);
  writeFileSync(join(ROOT, "data", "raw", `${name}_images.json`), JSON.stringify(data, null, 2));
  // also keep full rendered html for description/price parsing
  writeFileSync(join(ROOT, "data", "raw", `${name}_rendered.html`), await page.content());
  console.log(`  ${name}: ${data.length} vehicles, ${withImg} with images, ${total} images total`);
}

await browser.close();
console.log("done");

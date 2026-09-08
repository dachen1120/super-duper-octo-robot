const { chromium } = require("C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
(async () => {
  const browser = await chromium.launch({ headless: true, channel: "msedge" });
  const page = await browser.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));
  page.on("response", (r) => { if (r.status() >= 400) errs.push(r.status() + " " + r.url()); });
  const url = "https://6a9fbede39b5a6d8acfe169c--newstalk-english.netlify.app/";
  const resp = await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  console.log("status:", resp && resp.status());
  const body = await page.locator("body").innerText().catch(() => "");
  console.log("body head:", JSON.stringify(body.slice(0, 300)));
  console.log("bad:", errs.slice(0, 8).join(" | ") || "none");
  await browser.close();
})().catch((e) => { console.error("FAILED:", e); process.exit(1); });
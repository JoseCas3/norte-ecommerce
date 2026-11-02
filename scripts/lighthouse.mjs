import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
import { mkdir, writeFile } from "node:fs/promises";
const chrome = await chromeLauncher.launch({
  chromePath: process.env.CHROME_PATH,
  chromeFlags: ["--headless=new", "--disable-gpu"],
});
try {
  await mkdir("evidencias", { recursive: true });
  const result = await lighthouse(
    process.env.AUDIT_URL || "http://localhost:3000/catalogo",
    {
      port: chrome.port,
      output: ["html", "json"],
      logLevel: "info",
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
    },
  );
  if (!result) throw Error("No se generó un reporte.");
  await writeFile("evidencias/lighthouse.html", result.report[0]);
  await writeFile("evidencias/lighthouse.json", result.report[1]);
  console.log(
    JSON.stringify(
      Object.fromEntries(
        Object.entries(result.lhr.categories).map(([k, v]) => [k, v.score]),
      ),
      null,
      2,
    ),
  );
} finally {
  await chrome.kill();
}

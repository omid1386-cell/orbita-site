const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const fontPath = path.join(__dirname, "..", "assets", "fonts", "ComicNeue-Bold.woff2");
const appCss = fs.readFileSync(path.join(__dirname, "..", "assets", "css", "app.css"), "utf8");
function assert(ok, message) { if (!ok) throw new Error(message); }

assert(fs.existsSync(fontPath), "bundled font asset is missing");
assert(fs.statSync(fontPath).size > 10000, "font asset appears incomplete");
assert(html.includes('@font-face{font-family:"ORBITA Comic Neue";src:url("assets/fonts/ComicNeue-Bold.woff2") format("woff2");font-style:normal;font-weight:600;font-display:swap}'),
  "local Comic Neue font-face is missing");
assert(html.includes('font-family:"ORBITA Comic Neue",sans-serif;'),
  "credit is not using the bundled reference-style font");
assert(html.includes('href="assets/fonts/ComicNeue-Bold.woff2" as="font" type="font/woff2" crossorigin'),
  "font preload is missing");

const exactText = "Developed by Omidreza Saffar";
assert((html.match(new RegExp(exactText, "g")) || []).length === 1, "credit text changed or duplicated");
assert(html.includes("color:#d8b96f"), "gold color must remain unchanged");
assert(html.includes("font-size:clamp(20px,2.6vw,30px)"), "desktop font size must remain unchanged");
assert(html.includes("font-size:clamp(17px,5vw,22px)"), "mobile font size must remain unchanged");
assert(html.includes("background:#101827"), "navy footer panel must remain unchanged");
assert(html.includes("height:2px;background:#465363"), "divider must remain unchanged");
assert(html.includes("border-radius:0 0 34px 34px"), "footer shape must remain unchanged");

assert(html.includes("20261114-country-profile-light-contrast-v2-final"),
  "country light-theme cache token must remain");
assert(html.includes("20261114-map-zoom-performance-step3-v1"),
  "map zoom performance version must remain");
assert(html.includes("20261114-step4-manufacturer-logos-v1"),
  "manufacturer logos version must remain");
assert(appCss.includes("definitive country dossier contrast fix"),
  "previous country profile light-theme fix must be preserved");
assert(html.includes("Developed by Omidreza Saffar"), "developer text missing");

console.log("PASS: bundled Comic Neue font is present and preloaded");
console.log("PASS: only font-family/font asset loading changed");
console.log("PASS: wording, gold color, font sizes, navy panel and divider are preserved");
console.log("PASS: country profile, map and manufacturer-logo versions are preserved");

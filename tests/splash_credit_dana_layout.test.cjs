const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const appCss = fs.readFileSync(path.join(__dirname, "..", "assets", "css", "app.css"), "utf8");
function assert(ok, message) { if (!ok) throw new Error(message); }

assert(html.includes('font-family:"Dana","Vazirmatn",Tahoma,"Segoe UI",system-ui,-apple-system,sans-serif;'),
  "credit must use the same font stack as the app");
assert(html.includes("font-size:clamp(13px,1vw,14px)"), "desktop credit size must be balanced");
assert(html.includes("font-size:13px"), "mobile credit size must be balanced");
assert(html.includes("font-weight:500"), "credit weight must match app typography");
assert(!html.includes("ORBITA Comic Neue") && !html.includes("ComicNeue-Bold.woff2"),
  "previous decorative font must be removed from splash references");

assert(html.includes("Developed by Omidreza Saffar"), "credit wording must remain unchanged");
assert(html.includes("color:#d8b96f"), "gold text color must remain unchanged");
assert(html.includes("background:#101827"), "navy footer background must remain unchanged");
assert(html.includes("height:2px;background:#465363"), "desktop divider must remain");
assert(html.includes("top:17px;left:22px;right:22px;height:1px"), "mobile divider must remain");
assert(html.includes("min-height:104px"), "desktop footer height must be reduced");
assert(html.includes("min-height:88px"), "mobile footer height must be reduced");
assert(html.includes("padding:34px 16px 126px"), "desktop stage must reserve balanced footer space");
assert(html.includes("padding:22px 12px 104px"), "mobile stage must reserve balanced footer space");
assert(html.includes("border-radius:0 0 30px 30px"), "desktop rounded footer corners must remain");
assert(html.includes("border-radius:0 0 24px 24px"), "mobile rounded footer corners must remain");

assert(html.includes("20261114-country-profile-light-contrast-v2-final"),
  "country profile contrast fix version must remain");
assert(html.includes("20261114-map-zoom-performance-step3-v1"),
  "map zoom performance version must remain");
assert(html.includes("20261114-step4-manufacturer-logos-v1"),
  "manufacturer logo version must remain");
assert(appCss.includes('font-family:"Dana","Vazirmatn",Tahoma,"Segoe UI",system-ui,-apple-system,sans-serif'),
  "global app Dana font stack must remain in CSS");

console.log("PASS: credit uses app's Dana font stack");
console.log("PASS: desktop 13–14px and mobile 13px sizing");
console.log("PASS: gold color and text are unchanged");
console.log("PASS: footer and reserved stage spacing are reduced");
console.log("PASS: map, logos and country dossier versions are preserved");

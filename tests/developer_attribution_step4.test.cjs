const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
function assert(ok, message) { if (!ok) throw new Error(message); }

const splashStart = html.indexOf('<section id="raspehrSplash"');
const splashEnd = html.indexOf("</section>", splashStart);
assert(splashStart >= 0 && splashEnd > splashStart, "opening splash section not found");
const splash = html.slice(splashStart, splashEnd);

assert((html.match(/Produced by/g) || []).length === 1,
  "the attribution phrase must appear exactly once");
assert((html.match(/Omidreza Safar/g) || []).length === 1,
  "the developer name must appear exactly once");
assert(splash.includes('<p class="raspehr-credit" lang="en" dir="ltr">Produced by Omidreza Safar</p>'),
  "exact English credit markup is missing from the opening splash");
assert(!html.slice(splashEnd).includes("Omidreza Safar"),
  "developer credit must not appear in the rest of the site");

assert(html.includes("#raspehrSplash .raspehr-credit{position:absolute;"),
  "credit must be independently anchored at the bottom of the opening screen");
assert(html.includes("bottom:max(16px,env(safe-area-inset-bottom))"),
  "bottom spacing must respect mobile safe-area insets");
assert(html.includes(".raspehr-orbit:after,#raspehrSplash .raspehr-credit{animation:none;transition:none;opacity:1}"),
  "credit must honor reduced-motion accessibility preferences");

assert(html.includes("assets/js/raspehr-splash.js?v=20261113-speed-v1"),
  "existing splash controller reference must remain unchanged");
assert(html.includes("assets/js/app.js?_t=20261114-map-zoom-performance-step3-v1"),
  "Step 3 map-performance app reference must remain unchanged");
assert(html.includes('window.ORBITA_APP_V = "20261114-map-zoom-performance-step3-v1";'),
  "Step 3 app version must remain unchanged");
assert(html.includes('window.ORBITA_V = "20261114-step4-manufacturer-logos-v1";') &&
       html.includes('window.ORBITA_COMPANIES_V = "20261114-step4-manufacturer-logos-v1";'),
  "company/data versions must remain unchanged");

console.log("PASS: exact attribution appears once");
console.log("PASS: credit is inside the opening splash only");
console.log("PASS: credit is bottom-anchored and mobile safe-area aware");
console.log("PASS: responsive bottom placement and reduced-motion behavior are preserved");
console.log("PASS: Step 3 scripts, app version and data versions are unchanged");

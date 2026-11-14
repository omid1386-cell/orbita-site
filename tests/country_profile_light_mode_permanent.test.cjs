const fs = require("fs");
const path = require("path");
const css = fs.readFileSync(path.join(__dirname, "..", "assets", "css", "app.css"), "utf8");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
function assert(ok, message) { if (!ok) throw new Error(message); }

const finalStart = css.indexOf("ORBITA — definitive country dossier contrast fix");
assert(finalStart > 0, "final country dossier contrast block is missing");
const block = css.slice(finalStart);

const required = [
  ':root[data-theme="light"] .detail-panel .country-profile-summary-item > span:last-child',
  'color:#ffffff!important',
  'opacity:1!important',
  'font-size:10px!important',
  'font-weight:600!important',
  ':root[data-theme="light"] .detail-panel .country-profile-total',
  'color:#075985!important',
  ':root[data-theme="light"] .detail-panel .country-profile-tabs .country-profile-tab',
  ':root[data-theme="light"] .detail-panel .country-profile-name',
  ':root[data-theme="light"] .detail-panel .country-profile-location',
  ':root[data-theme="light"] .detail-panel .country-profile-tag',
  ':root[data-theme="light"] .detail-panel .country-profile-description',
  ':root[data-theme="light"] .detail-panel .country-profile-links a',
  ':root[data-theme="light"] .detail-panel .country-profile-empty'
];
for (const s of required) assert(block.includes(s), "missing required contrast rule: " + s);

// The colored numbers must continue to use the category's own color variable.
assert(block.includes('.country-profile-summary-item > strong{\n  color:var(--country-category-color)!important;'),
  "numeric category colors must remain data-driven");
assert(css.includes('.country-profile-summary-item strong{font-size:16px;color:var(--country-category-color);'),
  "base numeric styling was unexpectedly removed");

// The new light-theme rules must not alter the dark theme.
assert(!block.includes('data-theme="navy"'), "dark theme must remain untouched");

// Cache-busting must force browsers to fetch the new CSS, not reuse an old copy.
assert(html.includes('assets/css/app.css?_t=20261114-country-profile-light-contrast-v2-final'),
  "new CSS cache token is missing");
assert(html.includes('window.ORBITA_CSS_V = "20261114-country-profile-light-contrast-v2-final";'),
  "CSS version variable is missing");

// Preserve the already-installed work.
assert(html.includes('assets/js/app.js?_t=20261114-map-zoom-performance-step3-v1'),
  "map zoom performance app reference was changed");
assert(html.includes('window.ORBITA_APP_V = "20261114-map-zoom-performance-step3-v1";'),
  "map zoom performance app version was changed");
assert(html.includes('window.ORBITA_V = "20261114-step4-manufacturer-logos-v1";') &&
       html.includes('window.ORBITA_COMPANIES_V = "20261114-step4-manufacturer-logos-v1";'),
  "manufacturer logo data versions were changed");
assert(html.includes("Produced by Omidreza Safar"),
  "developer attribution from Step 4 must remain");

console.log("PASS: 14-category labels are forced to readable white in light theme");
console.log("PASS: label size and weight are improved");
console.log("PASS: category numbers retain their individual colors");
console.log("PASS: country header, total badge, tabs and dossier cards have explicit light-theme contrast");
console.log("PASS: dark theme has no new overrides");
console.log("PASS: cache token forces a fresh CSS load");
console.log("PASS: map performance, manufacturer logos and developer credit are preserved");

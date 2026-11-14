const fs = require("fs");
const path = require("path");
const css = fs.readFileSync(path.join(__dirname, "..", "assets/css/app.css"), "utf8");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(
  css.includes(':root[data-theme="light"] .country-profile-summary-item span:last-child{color:#fff}'),
  "Light theme country category labels must be white"
);
assert(
  css.includes(".country-profile-summary-item strong{font-size:16px;color:var(--country-category-color);font-variant-numeric:tabular-nums}"),
  "Colored summary numbers must remain unchanged"
);
assert(
  css.includes(".country-profile-summary-item span:last-child{font-size:9px;line-height:1.45;color:var(--text);overflow-wrap:anywhere}"),
  "Default/dark theme label styling must remain unchanged"
);
assert(
  !css.includes(".country-profile-summary-note{"),
  "Obsolete explanatory-note CSS should be removed"
);
assert(
  html.includes("assets/css/app.css?_t=20261114-country-profile-light-contrast-v1"),
  "CSS cache-busting token missing"
);
assert(
  html.includes('window.ORBITA_CSS_V = "20261114-country-profile-light-contrast-v1";'),
  "CSS version variable missing"
);
assert(
  html.includes('window.ORBITA_V = "20261114-step4-manufacturer-logos-v1";') &&
  html.includes('window.ORBITA_APP_V = "20261114-step4-manufacturer-logos-v1";') &&
  html.includes('window.ORBITA_COMPANIES_V = "20261114-step4-manufacturer-logos-v1";'),
  "Data/app cache versions should not be changed by a CSS-only fix"
);
console.log("PASS: Light-theme country summary labels are white");
console.log("PASS: Category numbers retain their original colors");
console.log("PASS: Dark-theme/default label styling is unchanged");
console.log("PASS: Obsolete explanatory-note CSS is removed");
console.log("PASS: Only CSS cache version is bumped; data/app versions are preserved");

const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const css = fs.readFileSync(path.join(__dirname, "..", "assets", "css", "app.css"), "utf8");
function assert(ok, message) { if (!ok) throw new Error(message); }

const splashStart = html.indexOf('<section id="raspehrSplash"');
const splashEnd = html.indexOf("</section>", splashStart);
assert(splashStart >= 0 && splashEnd > splashStart, "splash section missing");
const splash = html.slice(splashStart, splashEnd);
assert((html.match(/Developed by Omidreza Saffar/g) || []).length === 1,
  "correct developer credit must appear exactly once");
assert(!html.includes("Omidreza Safar"), "old misspelling must not remain");
assert(splash.includes('<p class="raspehr-credit" lang="en" dir="ltr">Developed by Omidreza Saffar</p>'),
  "exact credit must be inside the splash");

const styleStart = html.indexOf('<style id="raspehrSplashCritical">');
const styleEnd = html.indexOf("</style>", styleStart);
const critical = html.slice(styleStart, styleEnd);
assert(critical.includes("background:#101827"), "navy credit panel background missing");
assert(critical.includes("border-radius:0 0 34px 34px"), "rounded lower panel corners missing");
assert(critical.includes("background:#465363"), "thin separator line missing");
assert(critical.includes("color:#d8b96f"), "gold credit text missing");
assert(critical.includes('font-family:"Segoe Print","Bradley Hand","Comic Sans MS",cursive'),
  "handwritten-style font stack missing");
assert(critical.includes("padding:34px 16px 174px") || critical.includes("padding:34px 16px 174px"),
  "desktop splash content must reserve space for the footer panel");
assert(critical.includes("padding:22px 12px 136px"), "mobile splash content must reserve footer space");
assert(critical.includes("width:94vw"), "mobile footer sizing missing");
assert(critical.includes("#raspehrSplash .raspehr-credit{animation:none;transition:none;opacity:1}"),
  "reduced-motion behavior must remain supported");

assert(html.includes("20261114-country-profile-light-contrast-v2-final"),
  "country light-theme cache token must remain");
assert(html.includes("20261114-map-zoom-performance-step3-v1"),
  "map zoom performance version must remain");
assert(html.includes("20261114-step4-manufacturer-logos-v1"),
  "manufacturer logo version must remain");
assert(html.includes("Produced by") === false, "previous credit wording must not remain");
assert(css.includes("definitive country dossier contrast fix"),
  "previous country light-theme CSS fix must be preserved");

console.log("PASS: exact name spelling is Omidreza Saffar");
console.log("PASS: footer uses navy panel, thin divider and gold handwritten-style credit");
console.log("PASS: footer is responsive and splash content reserves space");
console.log("PASS: reduced-motion support is preserved");
console.log("PASS: country light-theme, map zoom and company logo versions are preserved");

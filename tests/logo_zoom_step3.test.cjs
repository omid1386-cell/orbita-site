const fs = require("fs");
const path = require("path");
const vm = require("vm");
const root = path.join(__dirname, "..");
const app = fs.readFileSync(path.join(root, "assets/js/app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "assets/css/app.css"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

function assert(ok, message) {
  if (!ok) throw new Error(message);
}

assert(html.includes('<dialog id="logoZoomDialog"'), "native logo dialog missing");
assert(html.includes('id="logoZoomImage"'), "dialog image element missing");
assert(html.includes('id="logoZoomClose"'), "dialog close button missing");
assert(css.includes('img[data-logo-zoom="true"]'), "zoomable-logo affordance styles missing");
assert(css.includes(".logo-zoom-dialog::backdrop"), "dark lightbox backdrop missing");
assert(css.includes("max-height:calc(84vh - 88px)"), "responsive image sizing missing");
assert(app.includes("function initLogoZoom()"), "zoom initialization function missing");
assert(app.includes("initLogoZoom();"), "zoom feature not initialized");
assert(app.includes('img[data-logo-zoom="true"]'), "delegated logo click selector missing");
assert(app.includes('event.key !== "Enter" && event.key !== " "'), "keyboard activation missing");
assert(app.includes('event.target === dialog'), "backdrop click close behavior missing");
assert(app.includes('dialog.addEventListener("close"'), "focus restoration close handler missing");

const calls = (app.match(/logoZoomAttrs\(/g) || []).length;
assert(calls === 11, "expected helper plus 10 logo insertion points, found " + calls);
assert(app.includes('(!isInfrastructure && (item.logo_data || item.logo)) ? logoZoomAttrs(itemName)'),
  "country profile cards must only magnify real company logos");
assert(app.includes('o.logo ? \'<img class="verified-profile-logo"'), "verified dossier logo path missing");
assert(html.includes("20261114-logo-zoom-step3-v1"), "asset cache version not updated");
assert(app.includes("renderNextLandingAnnouncement"), "Step 2 landing feature was not preserved");

const start = app.indexOf("  function logoZoomAttrs(label)");
const end = app.indexOf("  function initLogoZoom()", start);
assert(start >= 0 && end > start, "logo attribute helper not found");
const helper = app.slice(start, end);
const context = { LANG: "fa", esc: (s) => String(s).replace(/[&<>"]/g, c => ({
  "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;"
}[c])) };
vm.createContext(context);
vm.runInContext(helper + "\nglobalThis.result = logoZoomAttrs('A & B <Company>');", context);
assert(context.result.includes('data-logo-zoom="true"'), "logo helper does not enable zoom");
assert(context.result.includes('role="button"') && context.result.includes('tabindex="0"'),
  "logo helper is not keyboard accessible");
assert(context.result.includes("A &amp; B &lt;Company&gt;"), "logo label is not safely escaped");

context.LANG = "en";
vm.runInContext("globalThis.enResult = logoZoomAttrs('NASA');", context);
assert(context.enResult.includes("Click to enlarge the logo of NASA"), "English accessible label missing");

console.log("PASS: accessible native lightbox markup and dark backdrop");
console.log("PASS: logo-only click/keyboard delegation and close behavior");
console.log("PASS: 10 logo rendering points are wired; fallback icons/photos/flags remain outside scope");
console.log("PASS: multilingual accessible labels and HTML escaping");
console.log("PASS: Step 2 landing announcement and cache version retained");

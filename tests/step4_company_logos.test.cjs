const fs = require("fs");
const path = require("path");
const app = fs.readFileSync(path.join(__dirname, "..", "assets/js/app.js"), "utf8");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const sat = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data/companies_satmaker.json"), "utf8"));
const components = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data/companies_components.json"), "utf8"));
const updates = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "logo_updates_only.json"), "utf8"));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(sat.length === 37, "satellite-maker record count must remain 37");
assert(components.length === 19, "component-maker record count must remain 19");
assert(Object.keys(updates).length === 54, "expected 54 unique companies across the two categories");

const all = sat.concat(components);
for (const row of all) {
  assert(row.logo && /^https:\/\/www\.google\.com\/s2\/favicons\?/.test(row.logo),
    `logo favicon URL missing or invalid for ${row.id}`);
  assert(row.logo_kind === "official_site_favicon", `logo_kind incorrect for ${row.id}`);
  assert(row.logo_source_type === "official_website_favicon_via_google_s2",
    `logo source type missing for ${row.id}`);
  assert(row.logo_source_url && /^https:\/\//.test(row.logo_source_url),
    `official website URL missing for ${row.id}`);
  assert(row.logo_bg === "light", `light logo surface missing for ${row.id}`);
  assert(!String(row.logo).includes("assets/logos/orbita/"),
    `non-official ORBITA placeholder remains for ${row.id}`);
}

for (const id of ["cubespace", "blue-canyon"]) {
  const a = sat.find(x => x.id === id);
  const b = components.find(x => x.id === id);
  assert(a && b && a.logo === b.logo, `${id} must use the same logo in both categories`);
}

assert(sat.find(x => x.id === "maxar").site === "https://lanterisspace.com/",
  "Lanteris website should point to the current brand");
assert(components.find(x => x.id === "orbita-arumotech").site === "https://arumotech.co.jp/",
  "ArumoTech official website missing");
assert(components.find(x => x.id === "orbita-genesia").site === "https://www.genesia.com/",
  "GENESIA official website missing");
assert(components.find(x => x.id === "orbita-nec-space-technologies").site === "https://group.nec/space-technologies/en/",
  "NEC Space Technologies current website missing");

assert(html.includes("20261114-step4-manufacturer-logos-v1"), "cache token was not updated");
assert(app.includes("function renderSatmakerDetail"), "satmaker dossier renderer missing");
assert(app.includes("fallbackImageErrorAttribute(defaultLogoSvg)"),
  "satmaker image fallback missing");
assert(app.includes("logoFallbackSvg = fallbackLogoDataUri"), "specialist profile image fallback missing");
assert(app.includes("style=\"background:' + logoBg + ';\""),
  "country profile logo background handling missing");

console.log("PASS: 37 satellite makers and 19 component suppliers retained");
console.log("PASS: 54 unique company logo mappings");
console.log("PASS: duplicate CubeSpace and Blue Canyon logos remain consistent");
console.log("PASS: official website mappings for Lanteris, ArumoTech, GENESIA and NEC Space Technologies");
console.log("PASS: graceful image fallback and light logo surfaces");
console.log("PASS: cache-busting token updated");

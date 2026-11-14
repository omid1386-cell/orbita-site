const fs = require("fs");
const path = require("path");
const vm = require("vm");

const source = fs.readFileSync(path.join(__dirname, "..", "assets", "js", "app.js"), "utf8");
if (!source.includes("function applyOccupiedPalestinePersianDisplay")) {
  throw new Error("Display replacement helper is missing");
}
if (!source.includes("applyOccupiedPalestinePersianDisplay(renderCountryProfile(p), p)")) {
  throw new Error("Country profile rendering is not wrapped");
}
if (!source.includes("applyOccupiedPalestinePersianDisplay(renderCompanyDetail(p), p.o || p)")) {
  throw new Error("Company detail rendering is not wrapped");
}

const helperStart = source.indexOf("  function isOccupiedPalestineDisplayEntity");
const helperEnd = source.indexOf("  function activeDetailTabId", helperStart);
const helper = source.slice(helperStart, helperEnd);
const context = { LANG: "fa" };
vm.createContext(context);
vm.runInContext(helper + `
  globalThis.run = function(html, entity) {
    return applyOccupiedPalestinePersianDisplay(html, entity);
  };
`, context);

const input = '<h2>سازمان فضایی اسرائیل</h2><div>Israel Space Agency</div><p>شرکت اسرائیلی</p><a href="https://example.com/israel">وب‌سایت رسمی</a>';
const expected = '<h2>سازمان فضایی فلسطین اشغالی</h2><div>Occupied Palestine Space Agency</div><p>شرکت وابسته به فلسطین اشغالی</p><a href="https://example.com/israel">وب‌سایت رسمی</a>';
const actual = context.run(input, { country: "Israel", country_iso: "IL" });
if (actual !== expected) throw new Error("Persian Israel profile replacement failed: " + actual);

const otherCountry = context.run('<h2>شرکت اسرائیلی</h2>', { country: "France" });
if (otherCountry !== '<h2>شرکت اسرائیلی</h2>') throw new Error("Other country was modified");

context.LANG = "en";
const english = context.run('<h2>Israel Space Agency</h2>', { country: "Israel" });
if (english !== '<h2>Israel Space Agency</h2>') throw new Error("English UI was modified");

console.log("PASS: Persian country profile names and visible labels are rewritten.");
console.log("PASS: URLs, other countries, and English UI remain unchanged.");

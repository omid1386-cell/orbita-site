const fs = require("fs");
const path = require("path");
const vm = require("vm");

const appPath = path.join(__dirname, "..", "assets", "js", "app.js");
const source = fs.readFileSync(appPath, "utf8");
if (source.includes("country-profile-summary-note")) {
  throw new Error("Country profile explanatory note markup still exists");
}
if (source.includes("This figures count only current ORBITA") ||
    source.includes("این آمار فقط رکوردهای فعلی ORBITA")) {
  throw new Error("Country profile note text still exists");
}
if (source.includes("applyOccupiedPalestinePersianDisplay") ||
    source.includes("occupiedPalestineDisplayText")) {
  throw new Error("Old broad replacement helper still exists");
}
if (!source.includes("applyCountrySpecificDisplay(renderCompanyDetail(p), p.o || p)")) {
  throw new Error("Company detail does not use the precise country display helper");
}
if (!source.includes('var cFa = isOccupiedPalestineDisplay ? "فلسطین اشغالی"')) {
  throw new Error("Country profile Persian heading override missing");
}

const helperStart = source.indexOf("  // Display-only country naming for records whose canonical country is Israel.");
const helperEnd = source.indexOf("  function activeDetailTabId(body)", helperStart);
if (helperStart < 0 || helperEnd < 0) throw new Error("Country display helper not found");
const helper = source.slice(helperStart, helperEnd);

function runHelper(lang, html, entity) {
  const context = { LANG: lang };
  vm.createContext(context);
  vm.runInContext(helper + `
    globalThis.run = function(html, entity) {
      return applyCountrySpecificDisplay(html, entity);
    };
  `, context);
  return context.run(html, entity);
}

const faInput = '<h2>سازمان فضایی اسرائیل</h2><div>Israel Space Agency</div><p>شرکت پیشرو در کشور اسرائیل</p><div class="cell"><small>کشور</small><b>اسرائیل</b></div>';
const faExpected = '<h2>سازمان فضایی اسرائیل</h2><div>Israel Space Agency</div><p>شرکت پیشرو در فلسطین اشغالی</p><div class="cell"><small>کشور</small><b>فلسطین اشغالی</b></div>';
const faActual = runHelper("fa", faInput, { country: "Israel", country_fa: "اسرائیل" });
if (faActual !== faExpected) throw new Error("Persian precise country-field test failed: " + faActual);

const enInput = '<h2>Israel Space Agency</h2><p>Operating in the country of Israel</p><div class="cell"><small>Country</small><b>Israel</b></div>';
const enExpected = '<h2>Israel Space Agency</h2><p>Operating in Occupied Palestine</p><div class="cell"><small>Country</small><b>Occupied Palestine</b></div>';
const enActual = runHelper("en", enInput, { country: "Israel" });
if (enActual !== enExpected) throw new Error("English precise country-field test failed: " + enActual);

const arInput = '<h2>وكالة الفضاء الإسرائيلية</h2><p>تعمل في دولة إسرائيل</p><div class="cell"><small>الدولة</small><b>إسرائيل</b></div>';
const arExpected = '<h2>وكالة الفضاء الإسرائيلية</h2><p>تعمل في فلسطين المحتلة</p><div class="cell"><small>الدولة</small><b>فلسطين المحتلة</b></div>';
const arActual = runHelper("ar", arInput, { country: "Israel" });
if (arActual !== arExpected) throw new Error("Arabic precise country-field test failed: " + arActual);

const other = runHelper("fa", '<h2>شرکت در کشور اسرائیل</h2>', { country: "France" });
if (other !== '<h2>شرکت در کشور اسرائیل</h2>') throw new Error("A different country's record was modified");

console.log("PASS: country profile explanatory note removed");
console.log("PASS: organization names containing Israel remain unchanged");
console.log("PASS: country field/prose country references use the requested display label");
console.log("PASS: other countries remain unchanged");

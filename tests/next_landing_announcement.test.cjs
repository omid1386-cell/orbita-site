const fs = require("fs");
const path = require("path");
const vm = require("vm");
const app = fs.readFileSync(path.join(__dirname, "..", "assets/js/app.js"), "utf8");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const css = fs.readFileSync(path.join(__dirname, "..", "assets/css/app.css"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(html.includes('id="landBar"'), "landing ticker markup missing");
assert(html.includes('id="landName"') && html.includes('id="landCd"'), "landing ticker fields missing");
assert(html.indexOf('id="landBar"') > html.indexOf('id="lnchBar"'), "landing ticker should follow launch ticker");
assert(css.includes("body.has-lnch.has-landing .view{inset:116px 0 0 0}"), "stacked map offset missing");
assert(app.includes("renderNextLandingAnnouncement();") && app.includes("UPL.data = j; renderNextLandingAnnouncement();"),
  "landing snapshot loader does not trigger the banner");
assert(app.includes('on("#landClose", "click"'), "landing dismiss handler missing");
assert(app.includes('data/upcoming_landings.json'), "existing landing snapshot source is not used");

const start = app.indexOf("  function landingDigits(value)");
const end = app.indexOf("  function landingDateLabel(entry)", start);
assert(start >= 0 && end > start, "landing parsing functions not found");
const functions = app.slice(start, end);
const context = {};
vm.createContext(context);
vm.runInContext(functions + `
  globalThis.testLandingDateInfo = landingDateInfo;
  globalThis.testNextLandingFromData = nextLandingFromData;
`, context);

const now = Date.parse("2026-11-14T00:00:00Z");
const exact = context.testLandingDateInfo({
  date: "2026-11-15",
  time_utc: "01:30",
  precision_en: "minute"
});
assert(exact && exact.exact === true, "UTC clock with minute precision should be exact");
assert(exact.epoch === Date.parse("2026-11-15T01:30:00Z"), "UTC clock should parse correctly");

const utcSuffix = context.testLandingDateInfo({
  date: "2026-11-15", time_utc: "01:30 UTC", precision_en: "minute"
});
assert(utcSuffix && utcSuffix.epoch === Date.parse("2026-11-15T01:30:00Z"),
  "UTC suffix in time_utc should be accepted");

const approx = context.testLandingDateInfo({ date: "2026-11-15", precision_en: "day" });
assert(approx && approx.exact === false, "date-only landing must be approximate");

const candidates = {
  landings: [
    { id: "past", date: "2026-11-13", mission: "Past landing", status: "go" },
    { id: "undated", mission: "Undated queued mission", status: "queued" },
    { id: "later", date: "2026-11-17", mission: "Later landing", status: "go" },
    { id: "soon", date: "2026-11-15", time_utc: "01:30", precision_en: "minute", mission: "Next landing", status: "tbc" },
    { id: "cancelled", date: "2026-11-14", datetime_utc: "2026-11-14T03:00:00Z", mission: "Cancelled", status: "cancelled" }
  ]
};
const next = context.testNextLandingFromData(candidates, now);
assert(next && next.key === "soon", "the earliest valid future landing should be selected");
assert(context.testNextLandingFromData({ landings: [] }, now) === null, "empty snapshot should not produce an announcement");

console.log("PASS: landing ticker markup and stacked layout");
console.log("PASS: announcement reads the existing upcoming-landings snapshot");
console.log("PASS: exact UTC time and date-only precision are handled safely");
console.log("PASS: earliest future, non-cancelled dated landing is selected");
console.log("PASS: dismiss control is wired");

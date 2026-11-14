const fs = require("fs");
const path = require("path");
const vm = require("vm");
const app = fs.readFileSync(path.join(__dirname, "..", "assets/js/app.js"), "utf8");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const css = fs.readFileSync(path.join(__dirname, "..", "assets/css/app.css"), "utf8");

function assert(ok, message) { if (!ok) throw new Error(message); }

assert(app.includes("maxTileCacheSize: 256"), "existing tile-cache safety cap must remain");
assert(app.includes("maxTileCacheZoomLevels: mobileView() ? 6 : 7"),
  "adaptive tile cache should retain a modestly wider zoom range");
assert(app.includes('map.on("zoomstart", function () {') &&
       app.includes('map.on("zoomend", function () {'),
  "zoom lifecycle hooks must be registered");
assert(!app.includes('map.on("zoom", function () { scheduleMarkerZoomRefresh'),
  "marker clustering must not be triggered on every zoom frame");
assert(app.includes("var markerZoomRefreshFrame = 0, markerZoomInProgress = false;"),
  "zoom refresh state missing");
assert(!app.includes("markerZoomRefreshTimer") && !app.includes("markerZoomRefreshInterval"),
  "old repeating debounce timer must be removed");

const start = app.indexOf("  function scheduleMarkerZoomRefresh() {");
const end = app.indexOf("  function publishMarkerFeatureCollection()", start);
assert(start >= 0 && end > start, "scheduleMarkerZoomRefresh function not found");
const fn = app.slice(start, end);

let nextId = 1;
const frames = new Map();
const cancelled = [];
let renders = 0;
const context = {
  map: {},
  markerZoomInProgress: true,
  mapStyleTransitionPending: false,
  markerZoomRefreshFrame: 0,
  requestAnimationFrame(callback) {
    const id = nextId++;
    frames.set(id, callback);
    return id;
  },
  cancelAnimationFrame(id) {
    cancelled.push(id);
    frames.delete(id);
  },
  renderMarkers() { renders++; }
};
vm.createContext(context);
vm.runInContext(fn + "\nglobalThis.schedule = scheduleMarkerZoomRefresh;", context);

context.schedule();
assert(frames.size === 0 && renders === 0,
  "marker source must remain untouched during zoom animation");

context.markerZoomInProgress = false;
context.schedule();
const firstFrame = context.markerZoomRefreshFrame;
assert(firstFrame !== 0 && frames.has(firstFrame), "post-zoom refresh should be queued");

context.schedule();
const secondFrame = context.markerZoomRefreshFrame;
assert(secondFrame !== firstFrame && cancelled.includes(firstFrame),
  "duplicate refresh requests should coalesce");
assert(frames.size === 1, "only one pending refresh frame should remain");

frames.get(secondFrame)();
assert(renders === 1 && context.markerZoomRefreshFrame === 0,
  "exactly one final marker render should occur");

context.schedule();
const thirdFrame = context.markerZoomRefreshFrame;
context.markerZoomInProgress = true;
frames.get(thirdFrame)();
assert(renders === 1, "stale cluster snapshot must not publish during a new zoom");

context.markerZoomInProgress = false;
context.mapStyleTransitionPending = true;
context.schedule();
assert(context.markerZoomRefreshFrame === 0 && renders === 1,
  "style transition must suppress marker refresh");

assert(html.includes("assets/js/app.js?_t=20261114-map-zoom-performance-step3-v1"),
  "JavaScript cache-busting token missing");
assert(html.includes('window.ORBITA_APP_V = "20261114-map-zoom-performance-step3-v1";'),
  "JavaScript version variable missing");
assert(html.includes("assets/css/app.css?_t=20261114-country-profile-light-contrast-v1"),
  "Step 1 stylesheet version must be retained");
assert(css.includes(':root[data-theme="light"] .country-profile-summary-item span:last-child{color:#fff}'),
  "Step 1 country profile contrast fix must remain");
assert(app.includes("launch: false, propulsion: false, agency: true, satmaker: false, site: true"),
  "Step 2 layer defaults must remain");
console.log("PASS: marker clusters are not rebuilt during active zoom");
console.log("PASS: one coalesced marker refresh runs after zoom settles");
console.log("PASS: stale refresh is cancelled when another zoom starts");
console.log("PASS: style transitions suppress stale marker refreshes");
console.log("PASS: adaptive MapLibre tile cache uses the supported zoom-level option");
console.log("PASS: Step 1 and Step 2 changes remain integrated");

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const app = fs.readFileSync(path.join(__dirname, "..", "assets/js/app.js"), "utf8");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const css = fs.readFileSync(path.join(__dirname, "..", "assets/css/app.css"), "utf8");

function assert(ok, message) { if (!ok) throw new Error(message); }
function getState(initialStorage = {}) {
  const store = { ...initialStorage };
  const localStorage = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); }
  };
  const start = app.indexOf("  // Retain the v1 legacy key");
  const end = app.indexOf("  var COMPANY_CATEGORY_KEYS", start);
  assert(start >= 0 && end > start, "map filter state block not found");
  const context = { localStorage };
  vm.createContext(context);
  vm.runInContext(app.slice(start, end) + `
    globalThis.__snapshot = function() {
      return { defaults: DEFAULT_MAP_FILTERS, filters: filters };
    };
    globalThis.__save = saveMapFilters;
    globalThis.__filters = filters;
  `, context);
  return { context, store, snapshot: JSON.parse(JSON.stringify(context.__snapshot())) };
}

const expected = {
  launch: false, propulsion: false, agency: true, satmaker: false, site: true, recovery: false,
  components: false, payloads: false, ground_services: false, inspace_services: false,
  test_facility: false, ground_station: false, mission_control: false, university_space: false
};

const fresh = getState();
assert(JSON.stringify(fresh.snapshot.filters) === JSON.stringify(expected),
  "fresh visitors should see only Space Agencies and Launch Sites active");
assert(Object.keys(expected).length === 14, "all 14 layer defaults must be explicit");
assert(Object.keys(expected).filter(k => expected[k]).join(",") === "agency,site",
  "exactly agency and site should be active by default");

// Existing explicit preferences take precedence over first-visit defaults.
const customV2 = getState({
  orbita_map_filters_v2: JSON.stringify({ launch: true, agency: false, site: true, components: true })
});
assert(customV2.snapshot.filters.launch === true &&
       customV2.snapshot.filters.agency === false &&
       customV2.snapshot.filters.site === true &&
       customV2.snapshot.filters.components === true,
  "saved v2 visitor preferences should be restored");
assert(customV2.snapshot.filters.recovery === false,
  "missing saved values should inherit the new defaults");

// Backward compatibility with the previous six-layer preference key.
const legacy = getState({
  orbita_map_filters_v1: JSON.stringify({ launch: false, propulsion: true, agency: true, site: false })
});
assert(legacy.snapshot.filters.propulsion === true && legacy.snapshot.filters.site === false,
  "legacy six-layer preferences should be retained");
assert(legacy.snapshot.filters.components === false,
  "new categories absent from the legacy key should use the new defaults");

// Saving must continue to persist visitor selections across visits.
customV2.context.__filters.launch = false;
customV2.context.__filters.agency = true;
customV2.context.__filters.site = false;
customV2.context.__save();
const savedV2 = JSON.parse(customV2.store.orbita_map_filters_v2);
const savedV1 = JSON.parse(customV2.store.orbita_map_filters_v1);
assert(savedV2.launch === false && savedV2.agency === true && savedV2.site === false,
  "custom choices should be saved in v2");
assert(savedV1.launch === false && savedV1.agency === true && savedV1.site === false,
  "legacy-compatible six-layer state should continue to be saved");

// Verify initial map boot loads only the two default-on layers.
const bootStart = app.indexOf("  var initialMapLoads = [];");
const bootEnd = app.indexOf("  Promise.all(initialMapLoads)", bootStart);
assert(bootStart >= 0 && bootEnd > bootStart, "initial map loading block not found");
const bootContext = {
  filters: fresh.snapshot.filters,
  initialMapLoads: [],
  BOOT_LOADERS: {
    sites: () => "sites",
    recoveries: () => "recoveries"
  },
  COMPANY_CATEGORY_KEYS: ["launch", "propulsion", "agency", "satmaker", "components",
    "payloads", "ground_services", "inspace_services", "university_space",
    "test_facility", "ground_station", "mission_control"],
  loadCompanyCategorySummary: category => "company:" + category
};
vm.createContext(bootContext);
vm.runInContext(app.slice(bootStart, bootEnd), bootContext);
assert(JSON.stringify(Array.from(bootContext.initialMapLoads)) === JSON.stringify(["sites", "company:agency"]),
  "startup should load launch sites and agency summaries only");

// Reset must restore the new defaults; select all/none remain available.
assert(app.includes('on("#layerReset", "click", function () { setLayerFilters(DEFAULT_MAP_FILTERS); });'),
  "Reset button must restore the new defaults");
assert(app.includes('on("#layerSelectAll", "click"'), "Select All control should remain");
assert(app.includes('on("#layerSelectNone", "click"'), "Select None control should remain");

// Ensure Step 1 visual fix is retained in the integrated package.
assert(css.includes(':root[data-theme="light"] .country-profile-summary-item span:last-child{color:#fff}'),
  "Step 1 light-theme country profile fix must remain");
assert(html.includes("assets/css/app.css?_t=20261114-country-profile-light-contrast-v1"),
  "Step 1 CSS cache version must remain");
assert(html.includes("assets/js/app.js?_t=20261114-map-zoom-performance-step3-v1"),
  "Step 2 app cache version missing");
assert(html.includes('window.ORBITA_APP_V = "20261114-map-zoom-performance-step3-v1";'),
  "Step 2 app version variable missing");

console.log("PASS: first-visit defaults activate only Space Agencies and Launch Sites");
console.log("PASS: all other 12 layers default to off");
console.log("PASS: saved visitor preferences are restored");
console.log("PASS: legacy six-layer preferences remain compatible");
console.log("PASS: visitor choices persist across sessions");
console.log("PASS: startup loads only site data and agency map summaries");
console.log("PASS: Reset restores new defaults; Select All/None remain available");
console.log("PASS: Step 1 light-theme country profile fix is retained");

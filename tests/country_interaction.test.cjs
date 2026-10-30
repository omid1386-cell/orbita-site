'use strict';
// Regression checks for fast layer-scoped country hover and persistent selection.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'assets/js/app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const countries = JSON.parse(fs.readFileSync(path.join(root, 'assets/geo/countries.json'), 'utf8'));

for (const id of ['orbita-country-interaction', 'orbita-country-hit', 'orbita-country-hover', 'orbita-country-select-outline']) {
  assert(app.includes(id), 'online basemap interaction layer exists: ' + id);
}
assert.match(app, /map\.addSource\(COUNTRY_OVERLAY_SOURCE,\s*\{[\s\S]*?type:\s*"geojson",[\s\S]*?data:\s*"assets\/geo\/countries\.json\?v="[\s\S]*?promoteId:\s*"NAME"/,
  'online interaction source uses local GeoJSON and stable country IDs');
assert.match(app, /countries:\s*\{\s*type:\s*"geojson",\s*data:[^\n]*promoteId:\s*"NAME"/,
  'offline source also promotes the unique country name to its feature ID');
const countryNames = countries.features.map(f => f.properties.NAME);
assert.equal(new Set(countryNames).size, countryNames.length, 'promoted country IDs are unique');
assert.match(app, /map\.setFeatureState\(\{ source: source, id: name \}, state\)/,
  'hover and selection update feature state rather than restyling through filters');
assert.match(app, /map\.on\("mousemove", layerId, countryLayerMouseMove\)/,
  'hover is delegated to the country layer, avoiding map-wide per-pointer hit tests');
assert.match(app, /function countryLayerMouseMove\(e\)[\s\S]*?requestAnimationFrame\(function \(\)[\s\S]*?setHoveredCountry\(pendingHoveredCountryName\)/,
  'pointer updates are coalesced to one visual update per animation frame');
assert.match(app, /map\.on\("click", handleCountryMapClick\)/,
  'click handling is registered once and hit-tests only when a click occurs');
assert.doesNotMatch(app, /function countryAtEvent\(/, 'expensive local polygon fallback is removed from the mousemove path');
assert.match(app, /"fill-color": "#F08970"[\s\S]*?"feature-state", "hover"/,
  'hover uses a visible warm coral, not pure red');
assert.match(app, /"fill-opacity": \["case", \["boolean", \["feature-state", "hover"\], false\], 0\.72, 0\]/,
  'coral fill exists only while the country is under the pointer');
assert.match(app, /var COUNTRY_HOVER_MAX_ZOOM = 4\.001;/,
  'hover cutoff includes zoom 4.0; maxzoom semantics hide it above that point');
assert.match(app, /id: "country-hover", type: "fill", source: "countries", maxzoom: COUNTRY_HOVER_MAX_ZOOM/,
  'offline country hover fill is hidden beyond the zoom cutoff');
assert.match(app, /id: COUNTRY_HOVER_LAYER, type: "fill", source: COUNTRY_OVERLAY_SOURCE,[\s\S]*?maxzoom: COUNTRY_HOVER_MAX_ZOOM/,
  'online country hover fill is hidden beyond the same cutoff');
assert.doesNotMatch(app, /addInteractionLayer\(\{ id: COUNTRY_SELECT_OUTLINE_LAYER, type: "line", source: COUNTRY_OVERLAY_SOURCE,\s*maxzoom:/,
  'the persistent blue selection outline remains visible at high zoom');
assert.doesNotMatch(app, /id: "country-select-outline", type: "line", source: "countries", maxzoom:/,
  'offline persistent blue selection outline also remains visible at high zoom');
assert.match(app, /"line-color": "#1677F5"[\s\S]*?"feature-state", "selected"/,
  'a clicked country keeps only a blue selected border after hover ends');
assert.doesNotMatch(app, /COUNTRY_SELECT_LAYER|COUNTRY_SELECTED_COLOR/,
  'persistent selection no longer paints an orange fill');
assert.match(app, /function handleCountryMapClick\(e\)[\s\S]*?record = countryRecordFromFeature\(hits\[0\]\)[\s\S]*?setSelectedCountry\(record\.en\)[\s\S]*?openDetail\(\{[\s\S]*?country_en: record\.en[\s\S]*?\}\);/,
  'country click both changes color and opens the matching dossier');
assert.match(app, /function countryLayerMouseLeave\(\)[\s\S]*?setHoveredCountry\(""\)/,
  'hover state clears immediately after leaving a country');
assert.match(app, /function ensureCountryInteractionLayers\(\)[\s\S]*?bindCountryInteractionEvents\("country-fill"\)[\s\S]*?bindCountryInteractionEvents\(COUNTRY_HIT_LAYER\)/,
  'offline and online styles bind the same interaction behavior');
assert.match(html, /window\.ORBITA_V = "20261030country08";/, 'the OSM-aligned country boundary data has a fresh cache key');
assert.match(app, /customAttribution:\s*"© OpenStreetMap contributors; Terrae"/,
  'the map credits the OSM-derived Terrae boundary data');

console.log('PASS: fast country hover, coral cutoff above zoom 4, persistent blue outline, and click dossiers across basemaps.');

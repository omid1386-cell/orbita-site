'use strict';
// Regression checks for tiled country boundaries, fast hover, and persistent selection.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'assets/js/app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const countries = JSON.parse(fs.readFileSync(path.join(root, 'assets/geo/countries.json'), 'utf8'));
const pmtiles = path.join(root, 'assets/geo/countries.pmtiles');
const protocol = path.join(root, 'assets/vendor/pmtiles.js');

for (const id of ['orbita-country-interaction', 'orbita-country-hit', 'orbita-country-hover', 'orbita-country-select-outline']) {
  assert(app.includes(id), 'online basemap interaction layer exists: ' + id);
}
assert.match(app, /map\.addSource\(COUNTRY_OVERLAY_SOURCE,\s*\{[\s\S]*?type:\s*"vector",[\s\S]*?url:\s*COUNTRY_PM_TILES_URL,[\s\S]*?promoteId:\s*\{ countries:\s*"NAME" \}/,
  'online interaction source uses local vector tiles with stable string country IDs');
assert.match(app, /countries:\s*\{\s*type:\s*"vector",\s*url:\s*COUNTRY_PM_TILES_URL,[\s\S]*?promoteId:\s*\{ countries:\s*"NAME" \}/,
  'offline source uses the same PMTiles archive and stable IDs');
assert.match(app, /"source-layer":\s*COUNTRY_VECTOR_LAYER/,
  'all vector-tile layers target the countries source-layer');
assert.match(app, /new window\.pmtiles\.Protocol\(\)[\s\S]*?maplibregl\.addProtocol\("pmtiles"/,
  'PMTiles protocol is registered with MapLibre');
assert.match(html, /assets\/vendor\/pmtiles\.js\?v=4\.5\.0/,
  'the vendored PMTiles runtime is loaded before app.js');
assert(fs.existsSync(pmtiles) && fs.statSync(pmtiles).size > 1000000 && fs.statSync(pmtiles).size < 99000000,
  'the compressed local country archive exists and remains under the 99 MB budget');
assert(fs.existsSync(protocol) && fs.statSync(protocol).size > 10000,
  'the PMTiles JS runtime is vendored locally');
const countryNames = countries.features.map(f => f.properties.NAME);
assert.equal(new Set(countryNames).size, countryNames.length, 'promoted country IDs are unique');
assert.match(app, /map\.setFeatureState\(\{ source: source, sourceLayer: COUNTRY_VECTOR_LAYER, id: name \}, state\)/,
  'hover and selection update vector feature state rather than filters');
assert.match(app, /Object\.keys\(pendingCountryFeatureStates\)\.forEach\(function \(name\)[\s\S]*?map\.setFeatureState\(\{ source: source, sourceLayer: COUNTRY_VECTOR_LAYER, id: name \}, pendingCountryFeatureStates\[name\]\)/,
  'queued feature states are replayed against the vector source-layer when ready');
assert.match(app, /map\.on\("mousemove", layerId, countryLayerMouseMove\)/,
  'hover is delegated to the country layer, avoiding map-wide pointer hit tests');
assert.match(app, /function countryLayerMouseMove\(e\)[\s\S]*?requestAnimationFrame\(function \(\)[\s\S]*?setHoveredCountry\(pendingHoveredCountryName\)/,
  'pointer updates are coalesced to one visual update per animation frame');
assert.match(app, /map\.on\("click", handleCountryMapClick\)/,
  'click handling is registered once and hit-tests only on click');
assert.doesNotMatch(app, /function countryAtEvent\(/, 'expensive local polygon fallback is removed from the mousemove path');
assert.doesNotMatch(app, /COUNTRIES_GEO|loadCountryGeoForFallback|assets\/geo\/countries\.json\?v=/,
  'the 9.6 MB full GeoJSON is not fetched or indexed in the browser');
assert.match(app, /function getCountryAtLngLat\(lng, lat\)[\s\S]*?map\.queryRenderedFeatures\(point, \{ layers: \[layer\] \}\)[\s\S]*?countryRecordFromFeature\(hits && hits\[0\]\)/,
  'the rare fallback re-queries rendered vector features instead of approximating from labels');
assert.match(app, /Any click fallback re-queries the currently rendered vector source\. It never guesses[\s\S]*?clicking empty ocean still clears selection/,
  'clicking empty space cannot be mapped to the nearest country label');
assert.match(app, /"fill-color": "#F08970"[\s\S]*?"feature-state", "hover"/,
  'hover uses the requested warm coral color');
assert.match(app, /"fill-opacity": \["case", \["boolean", \["feature-state", "hover"\], false\], 0\.72, 0\]/,
  'coral fill is visible only while the country is hovered');
assert.match(app, /var COUNTRY_HOVER_MAX_ZOOM = 4\.001;/,
  'hover cutoff includes zoom 4.0; maxzoom semantics hide it above that point');
assert.match(app, /id: "country-hover", type: "fill", source: "countries", "source-layer": COUNTRY_VECTOR_LAYER,[\s\S]*?maxzoom: COUNTRY_HOVER_MAX_ZOOM/,
  'offline country hover is hidden above the zoom cutoff');
assert.match(app, /id: COUNTRY_HOVER_LAYER, type: "fill", source: COUNTRY_OVERLAY_SOURCE,[\s\S]*?maxzoom: COUNTRY_HOVER_MAX_ZOOM/,
  'online country hover uses the same cutoff');
assert.doesNotMatch(app, /addInteractionLayer\(\{ id: COUNTRY_SELECT_OUTLINE_LAYER, type: "line", source: COUNTRY_OVERLAY_SOURCE,[\s\S]*?maxzoom:/,
  'the online blue selection outline remains visible at high zoom');
assert.doesNotMatch(app, /id: "country-select-outline", type: "line", source: "countries", "source-layer": COUNTRY_VECTOR_LAYER,\s*maxzoom:/,
  'the offline blue selection outline remains visible at high zoom');
assert.match(app, /"line-color": "#1677F5"[\s\S]*?"feature-state", "selected"/,
  'a clicked country keeps only a blue selected border after hover ends');
assert.doesNotMatch(app, /COUNTRY_SELECT_LAYER|COUNTRY_SELECTED_COLOR/,
  'persistent selection no longer paints an orange fill');
assert.match(app, /function handleCountryMapClick\(e\)[\s\S]*?record = countryRecordFromFeature\(hits\[0\]\)[\s\S]*?setSelectedCountry\(record\.en\)[\s\S]*?openDetail\(\{[\s\S]*?country_en: record\.en[\s\S]*?\}\);/,
  'clicking a country selects it and opens its dossier');
assert.match(app, /if \(!record\) \{ setSelectedCountry\(""\); return; \}/,
  'clicking empty map space clears the selected outline');
assert.match(app, /function clearCountryHoverState\(\)[\s\S]*?setHoveredCountry\(""\)/,
  'hover has one idempotent clear path');
assert.match(app, /canvas\.addEventListener\("pointerleave", countryLayerMouseLeave\)/,
  'hover clears when the pointer leaves the map canvas');
assert.match(app, /window\.addEventListener\("blur", countryLayerMouseLeave\)/,
  'hover clears if the browser window loses focus');
assert.match(app, /map\.getZoom\(\) >= COUNTRY_HOVER_MAX_ZOOM\) clearCountryHoverState\(\)/,
  'crossing above the zoom cutoff explicitly clears active hover');
assert.match(app, /if \(map && map\.getZoom\(\) >= COUNTRY_HOVER_MAX_ZOOM\)[\s\S]*?clearCountryHoverState\(\)/,
  'pointer moves above the cutoff cannot reapply hover');
assert.match(app, /var pendingCountryFeatureStates = Object\.create\(null\)/,
  'feature-state updates made before source readiness are retained by country ID');
assert.match(app, /function queueCountryFeatureState\(name, stateName, enabled\)[\s\S]*?pendingCountryFeatureStates\[name\]\[stateName\] = !!enabled/,
  'queued hover and selection values retain their latest state');
assert.match(app, /function ensureCountryInteractionLayers\(\)[\s\S]*?bindCountryInteractionEvents\("country-fill"\)[\s\S]*?bindCountryInteractionEvents\(COUNTRY_HIT_LAYER\)/,
  'offline and online styles bind the same interaction behavior');
assert.match(app, /function renderCountryProfileHeader\(p, totalEntities\)[\s\S]*?fetchpriority="high"[\s\S]*?National Space Dossier/,
  'the local country flag and compact dossier header can render immediately');
assert.match(app, /detailBody\.innerHTML = renderCountryProfileHeader\(p, null\)[\s\S]*?requestAnimationFrame\(function \(\)[\s\S]*?renderCountryProfile\(p\)/,
  'the data-heavy country dossier is rendered after the header has a paint opportunity');
assert.match(html, /window\.ORBITA_V = "20261030country10";/,
  'the PMTiles and fast-header changes have a fresh cache key');
assert.match(app, /customAttribution:\s*"© OpenStreetMap contributors; Terrae"/,
  'the map credits the OSM-derived Terrae boundary data');

console.log('PASS: PMTiles, shared online/offline country source, feature-state interactions, and immediate dossier header.');

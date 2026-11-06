'use strict';
// Regression checks for shared GeoJSON country geometry, fast hover, and persistent selection.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'assets/js/app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const countries = JSON.parse(fs.readFileSync(path.join(root, 'assets/geo/countries_simplified.json'), 'utf8'));

assert.equal(countries.features.length, 177, 'the compact map geometry retains every country');
const countryNames = countries.features.map(f => f.properties && f.properties.NAME);
assert.equal(new Set(countryNames).size, countryNames.length, 'promoted country IDs are unique');
assert.ok(countries.features.every(f => f.properties && f.properties.NAME_AR && f.geometry),
  'compact geometry retains country labels and polygons');

assert.match(app, /var COUNTRY_OVERLAY_SOURCE = "orbita-country-interaction";/,
  'online and offline maps use one stable country interaction source ID');
const offlineStart = app.indexOf('  function offlineStyle() {');
const offlineEnd = app.indexOf('  var COUNTRY_HIT_LAYER', offlineStart);
const offlineSource = offlineStart >= 0 && offlineEnd > offlineStart ? app.slice(offlineStart, offlineEnd) : '';
assert.match(offlineSource, /\[COUNTRY_OVERLAY_SOURCE\]:\s*\{[\s\S]*?type:\s*"geojson"[\s\S]*?countries_simplified\.json[\s\S]*?promoteId:\s*"NAME"/,
  'the immediate offline basemap draws from compact, property-preserving GeoJSON');
const sharedSourceStart = app.indexOf('  function withCountryInteractionSource(style) {');
const sharedSourceEnd = app.indexOf('  function countryInteractionSourceId()', sharedSourceStart);
const sharedSource = sharedSourceStart >= 0 && sharedSourceEnd > sharedSourceStart
  ? app.slice(sharedSourceStart, sharedSourceEnd) : '';
assert.match(sharedSource, /prepared\.sources\[COUNTRY_OVERLAY_SOURCE\]\s*=\s*\{[\s\S]*?type:\s*"geojson"[\s\S]*?countries_simplified\.json[\s\S]*?promoteId:\s*"NAME"/,
  'online basemap styles receive the same compact country source');
assert.match(app, /map\.setStyle\(onlineStyle,\s*\{\s*diff:\s*true\s*\}\)/,
  'style changes diff against the shared source instead of refetching duplicate country geometry');
assert.match(app, /var COUNTRY_HIT_LAYER = "orbita-country-hit";[\s\S]*?var COUNTRY_HOVER_LAYER = "orbita-country-hover";[\s\S]*?var COUNTRY_SELECT_OUTLINE_LAYER = "orbita-country-select-outline";/,
  'country hit, hover, and selection layers have stable IDs');
assert.match(app, /addInteractionLayer\(\{ id: COUNTRY_HIT_LAYER, type: "fill", source: COUNTRY_OVERLAY_SOURCE/,
  'country clicks and hover use a transparent hit layer on the shared source');
assert.match(app, /addInteractionLayer\(\{ id: COUNTRY_HOVER_LAYER, type: "fill", source: COUNTRY_OVERLAY_SOURCE,[\s\S]*?maxzoom: COUNTRY_HOVER_MAX_ZOOM/,
  'the online hover layer is capped at the requested zoom');
assert.match(app, /addInteractionLayer\(\{ id: COUNTRY_SELECT_OUTLINE_LAYER, type: "line", source: COUNTRY_OVERLAY_SOURCE,/,
  'the online selection outline is rendered independently from hover');
assert.match(app, /map\.setFeatureState\(\{ source: source, id: name \}, state\)/,
  'hover and selection update GeoJSON feature state using promoted country names');
assert.match(app, /Object\.keys\(pendingCountryFeatureStates\)\.forEach\(function \(name\)[\s\S]*?map\.setFeatureState\(\{ source: source, id: name \}, pendingCountryFeatureStates\[name\]\)/,
  'feature-state updates made before the source is ready are replayed by country ID');

const hoverStart = app.indexOf('  function countryLayerMouseMove(e) {');
const hoverEnd = app.indexOf('  function countryLayerMouseLeave()', hoverStart);
const hoverSource = hoverStart >= 0 && hoverEnd > hoverStart ? app.slice(hoverStart, hoverEnd) : '';
assert.match(app, /map\.on\("mousemove", layerId, countryLayerMouseMove\)/,
  'hover is delegated to the country hit layer, not a map-wide mouse handler');
assert.match(hoverSource, /requestAnimationFrame\(function \(\)[\s\S]*?setHoveredCountry\(pendingHoveredCountryName\)/,
  'pointer updates are coalesced to one visual feature-state update per animation frame');
assert.doesNotMatch(hoverSource, /queryRenderedFeatures|loadCountryGeoForFallback|COUNTRIES_GEO|filteredPoints|renderMarkers/,
  'mouse movement does not query geometry, load data, or recompute marker filters');
assert.match(app, /map\.on\("click", handleCountryMapClick\)/,
  'map click handling is registered once');
assert.match(app, /function handleCountryMapClick\(e\)[\s\S]*?map\.queryRenderedFeatures\(e\.point, \{ layers: \[countryInteractionEventLayer\] \}\)[\s\S]*?setSelectedCountry\(record\.en\)[\s\S]*?openDetail\(\{/,
  'clicking a country selects it and opens its dossier');
assert.match(app, /if \(!record\) \{ setSelectedCountry\(""\); return; \}/,
  'clicking empty map space clears the selected outline');
assert.match(app, /if \(!record && e\.lngLat && \(!countryInteractionEventLayer \|\| !sourceReady\)\)[\s\S]*?getCountryAtLngLat\(/,
  'the exact-polygon fallback is only used for a click before the rendered source can answer');
assert.match(app, /function loadCountryGeoForFallback\(\)[\s\S]*?assets\/geo\/countries\.json\?v=/,
  'full-resolution boundaries remain available for the rare exact click fallback');
const initMapStart = app.indexOf('  function initMap() {');
const initMapEnd = app.indexOf('\n  function mobileView()', initMapStart);
const initMapSource = initMapStart >= 0 && initMapEnd > initMapStart ? app.slice(initMapStart, initMapEnd) : '';
assert.doesNotMatch(initMapSource, /loadCountryGeoForFallback|assets\/geo\/countries\.json\?v=/,
  'the 9.2 MB exact fallback geometry is not fetched during ordinary map startup');
assert.match(app, /"fill-color": "#F08970"[\s\S]*?"feature-state", "hover"/,
  'hover uses the requested warm coral color');
assert.match(app, /var COUNTRY_HOVER_MAX_ZOOM = 4\.001;/,
  'hover stays active through zoom 4.0 and is hidden above it');
assert.match(app, /id: "country-hover", type: "fill", source: COUNTRY_OVERLAY_SOURCE, maxzoom: COUNTRY_HOVER_MAX_ZOOM/,
  'offline country hover has the same zoom cutoff');
assert.match(app, /"line-color": "#1677F5"[\s\S]*?"feature-state", "selected"/,
  'a clicked country keeps only the requested blue selected border after hover ends');
const offlineSelectStart = offlineSource.indexOf('{ id: "country-select-outline"');
const offlineSelectEnd = offlineSource.indexOf('\n      ]', offlineSelectStart);
const offlineSelectSource = offlineSelectStart >= 0 && offlineSelectEnd > offlineSelectStart
  ? offlineSource.slice(offlineSelectStart, offlineSelectEnd) : '';
const onlineSelectStart = app.indexOf('addInteractionLayer({ id: COUNTRY_SELECT_OUTLINE_LAYER');
const onlineSelectEnd = app.indexOf('});', onlineSelectStart);
const onlineSelectSource = onlineSelectStart >= 0 && onlineSelectEnd > onlineSelectStart
  ? app.slice(onlineSelectStart, onlineSelectEnd) : '';
assert.doesNotMatch(offlineSelectSource, /maxzoom:/,
  'the offline selected border stays visible at high zoom');
assert.doesNotMatch(onlineSelectSource, /maxzoom:/,
  'the online selected border stays visible at high zoom');
assert.match(app, /canvas\.addEventListener\("pointerleave", clearMapInteractionHover\)/,
  'country hover clears when the pointer leaves the map canvas');
assert.match(app, /window\.addEventListener\("blur", clearMapInteractionHover\)/,
  'country hover clears when the browser window loses focus');
assert.match(app, /map\.getZoom\(\) >= COUNTRY_HOVER_MAX_ZOOM\) clearCountryHoverState\(\)/,
  'crossing above the hover zoom cutoff explicitly clears active hover');
assert.match(app, /function renderCountryProfile\(p\)[\s\S]*?class="d-head"[\s\S]*?National Space Dossier/,
  'the country flag and dossier heading are rendered by the country profile');
assert.match(app, /countryBody\.innerHTML = renderCountryProfile\(p\);[\s\S]*?countryPanel\.classList\.add\("open"\)[\s\S]*?if \(!countryDataReady\)[\s\S]*?loadingNote\.className = "up-empty"[\s\S]*?ensureCountryProfileData\(\)\.then/,
  'the dossier opens immediately, indicates its deferred data, and refreshes after those sources settle');
assert.match(html, /window\.ORBITA_V = "20261106africa2";/,
  'country interactions and compact geometry have a fresh cache key');
assert.match(app, /customAttribution:\s*"© OpenStreetMap contributors; Terrae"/,
  'the map credits the OSM-derived Terrae boundary data');

console.log('PASS: compact GeoJSON, shared online/offline country source, feature-state interactions, and immediate dossier header.');

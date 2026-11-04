'use strict';
// Regression checks for cluster halo pointer and click hit-testing.
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'assets/js/app.js'), 'utf8');

function block(startToken, endToken) {
  const start = app.indexOf(startToken);
  const end = app.indexOf(endToken, start);
  assert.ok(start >= 0 && end > start, `source block exists: ${startToken}`);
  return app.slice(start, end);
}

const interactionLayers = block('  function markerInteractionLayerIds() {', '  function interactionFeaturesAtPoint(');
const interactionQuery = block('  function interactionFeaturesAtPoint(point, includeCountry) {', '  function markerFeatureFromHits(');
const featurePriority = block('  function markerFeatureFromHits(hits) {', '  function markerFeatureAtPoint(');
const markerClick = block('  function handleMarkerMapClick(e) {', '  var clusterZoomBound = false;');
const markerMove = block('  function markerLayerMouseMove(e) {', '  function markerLayerMouseLeave(e) {');
const markerLeave = block('  function markerLayerMouseLeave(e) {', '  function bindMarkerHoverEvents() {');
const markerBindings = block('  function bindMarkerHoverEvents() {', '  function addMarkerLayerIfMissing(layer) {');
const countryMove = block('  function countryLayerMouseMove(e) {', '  function countryLayerMouseLeave() {');

test('cluster halo and label are included in click hit-testing', () => {
  for (const id of ['MARKER_POINT_LAYER', 'MARKER_CLUSTER_LABEL_LAYER', 'MARKER_CLUSTER_CIRCLE_LAYER', 'MARKER_CLUSTER_HALO_LAYER']) {
    assert.match(interactionLayers, new RegExp(`\\b${id}\\b`), `${id} is eligible for marker hits`);
  }
  assert.match(interactionQuery, /queryRenderedFeatures\(point,\s*\{\s*layers:\s*layers\s*\}\)/,
    'the shared hit-test queries only existing marker layers');
  assert.match(interactionQuery, /includeCountry[\s\S]*?countryInteractionEventLayer/,
    'country geometry joins the same query only at a hover-leave boundary');
  assert.match(featurePriority, /markerType === "point"[\s\S]*?pointFeature \|\| hits\.find/,
    'a point remains preferred when it overlaps a cluster');
  assert.match(markerClick, /markerFeatureAtPoint\(e\.point\)/);
  assert.match(markerClick, /openClusterList\(members\)/,
    'hitting any cluster surface opens the cluster member list');
});

test('cluster halo receives hover without adding a map-wide mousemove handler', () => {
  assert.match(markerBindings, /map\.getLayer\(MARKER_CLUSTER_HALO_LAYER\)\s*\?\s*MARKER_CLUSTER_HALO_LAYER\s*:\s*MARKER_CLUSTER_CIRCLE_LAYER/,
    'the halo is the primary cluster hover target, with the old circle as a safe fallback');
  assert.match(markerBindings, /map\.on\("mousemove",\s*clusterHoverLayer,\s*markerLayerMouseMove\)/);
  assert.match(markerBindings, /map\.on\("mouseleave",\s*clusterHoverLayer,\s*markerLayerMouseLeave\)/);
  assert.doesNotMatch(markerBindings, /map\.on\("mousemove",\s*MARKER_CLUSTER_CIRCLE_LAYER/,
    'the fallback circle is not registered as a second, overlapping hover target');
  assert.doesNotMatch(markerBindings, /map\.on\("mousemove",\s*markerLayerMouseMove\)/,
    'pointer processing remains delegated to rendered marker layers');
  assert.match(markerBindings, /map\.on\("mousemove",\s*MARKER_POINT_LAYER,\s*markerLayerMouseMove\)/,
    'individual marker hover remains active');
});

test('marker hover takes priority over country hover and hands it back on leave', () => {
  assert.match(markerMove, /clearCountryHoverState\(\)/,
    'a marker hover clears an underlying country hover');
  assert.match(countryMove, /markerHoverKey\s*\|\|\s*pendingMarkerHoverKey/,
    'country hover is suppressed while marker hover is active or pending');
  assert.match(markerLeave, /interactionFeaturesAtPoint\(e\.point,\s*true\)/,
    'a single leave-boundary query checks both marker and country surfaces');
  assert.match(markerLeave, /markerFeatureFromHits\(interactionHits\)/,
    'moving between marker layers keeps the marker hover active');
  assert.match(markerLeave, /hit\.layer\.id === countryInteractionEventLayer/,
    'country hover is restored when the pointer leaves the halo onto a country');
  assert.match(markerLeave, /countryLayerMouseMove\(\{\s*features:\s*countryHits\s*\}\)/);
  assert.match(markerLeave, /clearCountryHoverState\(\)/,
    'hover clears when neither a marker nor a country is under the pointer');
});

test('mousemove path stays frame-coalesced and does not query or rebuild geometry', () => {
  assert.match(markerMove, /requestAnimationFrame\(function \(\)/,
    'marker hover remains coalesced to animation frames');
  assert.doesNotMatch(markerMove, /queryRenderedFeatures|setData\(|renderMarkers\(|setFilter\(/,
    'marker movement does not query geometry, rebuild markers, or set filters directly');
  assert.doesNotMatch(countryMove, /queryRenderedFeatures|setData\(|renderMarkers\(/,
    'country movement remains a lightweight feature-state path');
});

console.log('PASS: cluster halo click/hover hit-testing remains layer-scoped, with country priority and fast movement preserved.');

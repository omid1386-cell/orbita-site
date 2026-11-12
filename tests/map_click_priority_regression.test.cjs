'use strict';
// Deterministic behavioral regression tests for the two launch-blocking map click bugs.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');

const source = fs.readFileSync(path.join(__dirname, '../assets/js/app.js'), 'utf8');
function section(begin, end) {
  const start = source.indexOf('  ' + begin);
  const finish = source.indexOf('  ' + end, start + 2);
  assert.ok(start >= 0 && finish > start, `missing application block: ${begin}`);
  return source.slice(start, finish);
}
const code = [
  section('function markerPointKey(p) {', 'function markerIconImage(p) {'),
  section('function markerInteractionLayerIds() {', 'function interactionFeaturesAtPoint(point, includeCountry) {'),
  section('function interactionFeaturesAtPoint(point, includeCountry) {', 'function markerFeatureFromHits(hits) {'),
  section('function markerFeatureFromHits(hits) {', 'function markerFeatureAtPoint(point) {'),
  section('function markerFeatureNearPoint(point) {', 'function markerFeatureAtPoint(point) {'),
  section('function markerFeatureAtPoint(point) {', 'var clusterZoomBound = false;'),
  section('function handleCountryMapClick(e) {', 'function resetCountryInteractionStyleState() {')
].join('\n');

function setup() {
  const actions = [];
  const ctx = {
    MARKER_POINT_LAYER: 'point', MARKER_POINT_HOVER_LAYER: 'point-hover',
    MARKER_CLUSTER_LABEL_LAYER: 'cluster-label', MARKER_CLUSTER_CIRCLE_LAYER: 'cluster-circle',
    MARKER_CLUSTER_HALO_LAYER: 'cluster-halo', MARKER_CLUSTER_HOVER_LABEL_LAYER: 'cluster-hover-label',
    MARKER_CLUSTER_HOVER_LAYER: 'cluster-hover',
    COUNTRY_HOVER_MAX_ZOOM: 4.001,
    countryInteractionEventLayer: 'country',
    markerHoverKey: '',
    markerPointsByKey: Object.create(null), markerClustersByKey: Object.create(null),
    markerFeatureCollection: { features: [] },
    selectedCountryName: '',
    map: {
      getZoom: () => 2,
      getLayer: () => ({}),
      isSourceLoaded: () => true,
      project: ([lng, lat]) => ({ x: lng, y: lat }),
      queryRenderedFeatures: () => [],
      flyTo: (options) => actions.push(['fly', options])
    },
    countryInteractionSourceId: () => 'country',
    countryRecordFromFeature: (f) => f && f.properties && f.properties.NAME
      ? { en: f.properties.NAME, fa: f.properties.NAME, ar: f.properties.NAME, iso: null } : null,
    getCountryAtLngLat: () => null,
    countryRecordFromSpatialMatch: () => null,
    setSelectedCountry: (name) => actions.push(['select-country', name]),
    openDetail: (item) => actions.push(['detail', item]),
    openClusterList: (members) => actions.push(['cluster', members])
  };
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  return { ctx, actions };
}
function point(id, lng, lat, cat = 'launch') {
  return { kind: 'company', cat, o: { id, lon: lng, lat } };
}
function feature(key, type, lng, lat, extra = {}) {
  return { properties: { markerKey: key, markerType: type, ...extra }, geometry: { coordinates: [lng, lat] } };
}
function event() { return { point: { x: 51, y: 35 }, lngLat: { lng: 51, lat: 35 } }; }

test('cluster keys are stable across ordering and never reused for different members', () => {
  const { ctx } = setup();
  const iran = point('iran-1', 51, 35), china = point('china-1', 116, 39), iran2 = point('iran-2', 52, 35);
  assert.equal(ctx.stableClusterKey([iran, china]), ctx.stableClusterKey([china, iran]));
  assert.notEqual(ctx.stableClusterKey([iran, china]), ctx.stableClusterKey([iran, iran2]));
  assert.notEqual(ctx.stableClusterKey([iran]), ctx.stableClusterKey([iran, iran2]));
  assert.match(ctx.stableClusterKey([iran, china]), /^cluster\|2\|/);
  assert.doesNotMatch(source, /var key = "cluster\|" \+ index;/);
  assert.match(source, /var key = stableClusterKey\(group\.pts\);/);
});

test('hover-highlight and halo render layers count as marker click surfaces', () => {
  const { ctx } = setup();
  const layers = Array.from(ctx.markerInteractionLayerIds());
  assert.deepEqual(layers.slice(0, 3), ['point-hover', 'cluster-hover-label', 'cluster-hover']);
  assert.ok(layers.includes('point') && layers.includes('cluster-halo'));
});

test('marker takes precedence over a country at the same point', () => {
  const { ctx, actions } = setup();
  const iran = point('iran-1', 51, 35);
  const key = ctx.markerPointKey(iran);
  ctx.markerPointsByKey[key] = iran;
  ctx.map.queryRenderedFeatures = (xy, options) => options.layers.includes('point')
    ? [feature(key, 'point', 51, 35), { properties: { NAME: 'Iran' } }]
    : [{ properties: { NAME: 'Iran' } }];
  ctx.handleCountryMapClick(event());
  assert.deepEqual(actions.map(a => a[0]), ['detail', 'fly']);
  assert.equal(actions[0][1].o.id, 'iran-1');
});

test('a stale cluster ID cannot open an unrelated country or a new cluster', () => {
  const { ctx, actions } = setup();
  const former = ctx.stableClusterKey([point('iran-1', 51, 35), point('iran-2', 51, 35)]);
  const current = ctx.stableClusterKey([point('china-1', 116, 39), point('china-2', 116, 39)]);
  ctx.markerClustersByKey[current] = [point('china-1', 116, 39), point('china-2', 116, 39)];
  ctx.map.queryRenderedFeatures = (xy, options) => options.layers.includes('cluster-halo')
    ? [feature(former, 'cluster', 51, 35)] : [{ properties: { NAME: 'Iran' } }];
  ctx.handleCountryMapClick(event());
  assert.deepEqual(actions, []);
});

test('a stale point also cannot fall through and open a country', () => {
  const { ctx, actions } = setup();
  ctx.map.queryRenderedFeatures = (xy, options) => options.layers.includes('point')
    ? [feature('company|launch|removed', 'point', 51, 35)] : [{ properties: { NAME: 'Iran' } }];
  ctx.handleCountryMapClick(event());
  assert.deepEqual(actions, []);
});

test('a valid cluster opens only its own member list', () => {
  const { ctx, actions } = setup();
  const members = [point('iran-1', 51, 35), point('iran-2', 51.2, 35)];
  const key = ctx.stableClusterKey(members);
  ctx.markerClustersByKey[key] = members;
  ctx.map.queryRenderedFeatures = (xy, options) => options.layers.includes('cluster-halo')
    ? [feature(key, 'cluster', 51, 35)] : [];
  ctx.handleCountryMapClick(event());
  assert.deepEqual(actions.map(a => a[0]), ['cluster']);
  assert.deepEqual(actions[0][1].map(p => p.o.id), ['iran-1', 'iran-2']);
});

test('short data refresh gap still lets the visible icon win over country', () => {
  const { ctx, actions } = setup();
  const iran = point('iran-1', 51, 35);
  const key = ctx.markerPointKey(iran);
  ctx.markerPointsByKey[key] = iran;
  ctx.markerFeatureCollection.features = [feature(key, 'point', 51, 35, { iconScale: 0.8 })];
  ctx.map.queryRenderedFeatures = (xy, options) => options.layers.includes('point')
    ? [] : [{ properties: { NAME: 'Iran' } }];
  ctx.handleCountryMapClick({ point: { x: 51, y: 21 }, lngLat: { lng: 51, lat: 21 } });
  assert.deepEqual(actions.map(a => a[0]), ['detail', 'fly']);
});

test('country still opens normally if no marker is under the click', () => {
  const { ctx, actions } = setup();
  ctx.map.queryRenderedFeatures = (xy, options) => options.layers.includes('point')
    ? [] : [{ properties: { NAME: 'Iran' } }];
  ctx.handleCountryMapClick(event());
  assert.deepEqual(actions.map(a => a[0]), ['select-country', 'detail']);
  assert.equal(actions[1][1].country_en, 'Iran');
});

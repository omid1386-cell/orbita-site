'use strict';
// Regression checks for OSM-aligned country polygons and source attribution.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const geo = JSON.parse(fs.readFileSync(path.join(root, 'assets/geo/countries.json'), 'utf8'));
const sourceNote = fs.readFileSync(path.join(root, 'assets/geo/countries-source.md'), 'utf8');
const app = fs.readFileSync(path.join(root, 'assets/js/app.js'), 'utf8');

assert.equal(geo.type, 'FeatureCollection');
assert.equal(geo.features.length, 177, 'all existing country records remain available');
const names = geo.features.map(feature => feature.properties && feature.properties.NAME);
assert.equal(new Set(names).size, names.length, 'promoted country names remain unique');
assert.ok(geo.features.every(feature =>
  feature.geometry && ['Polygon', 'MultiPolygon'].includes(feature.geometry.type) &&
  Array.isArray(feature.bbox) && feature.bbox.length === 4 && feature.bbox.every(Number.isFinite)),
  'every country has polygon geometry and a finite recalculated bbox');

function countPositions(value) {
  if (!Array.isArray(value)) return 0;
  if (value.length >= 2 && typeof value[0] === 'number' && typeof value[1] === 'number') return 1;
  return value.reduce((sum, item) => sum + countPositions(item), 0);
}
const iran = geo.features.find(feature => feature.properties.NAME === 'Iran');
assert.ok(iran, 'Iran feature remains present');
assert.ok(countPositions(iran.geometry.coordinates) > 1000,
  'Iran outline retains OSM-level detail instead of reverting to a coarse generalized polygon');
assert.match(sourceNote, /Terrae 2026\.10[\s\S]*OpenStreetMap[\s\S]*ODbL/,
  'the data source and ODbL terms are documented');
assert.match(app, /customAttribution:\s*"© OpenStreetMap contributors; Terrae"/,
  'the in-map attribution credits the OSM-derived boundary database');

console.log('PASS: 177 OSM-derived country polygons, detailed Iran geometry, and map attribution.');

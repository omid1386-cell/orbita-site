'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'assets/js/app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const fullCountries = JSON.parse(fs.readFileSync(path.join(root, 'assets/geo/countries.json'), 'utf8'));
const mapCountriesPath = path.join(root, 'assets/geo/countries_simplified.json');
const mapCountries = JSON.parse(fs.readFileSync(mapCountriesPath, 'utf8'));
const allCompanies = JSON.parse(fs.readFileSync(path.join(root, 'data/companies.json'), 'utf8'));

function countPositions(value) {
  if (!Array.isArray(value)) return 0;
  if (value.length >= 2 && typeof value[0] === 'number' && typeof value[1] === 'number') return 1;
  return value.reduce((sum, item) => sum + countPositions(item), 0);
}

test('company category files are an exact, non-overwriting split of the canonical source', () => {
  const counts = { launch: 61, propulsion: 44, agency: 33, satmaker: 26 };
  const canonicalCounts = { launch: 61, propulsion: 43, agency: 33, satmaker: 26 };
  const splitIds = [];
  for (const [category, expectedCount] of Object.entries(counts)) {
    const split = JSON.parse(fs.readFileSync(path.join(root, `data/companies_${category}.json`), 'utf8'));
    const expected = allCompanies.filter(row => row.cat === category);
    assert.deepEqual(split, expected, `${category} split preserves source records and field values`);
    assert.equal(split.length, expectedCount);
    assert.equal(split.filter(row => !row.alias_of_id).length, canonicalCounts[category]);
    splitIds.push(...split.map(row => row.id));
  }
  assert.equal(new Set(splitIds).size, allCompanies.length, 'each source record is included exactly once');
  assert.equal(new Set(splitIds).size, new Set(allCompanies.map(row => row.id)).size, 'no company ID was lost or duplicated');
});

test('map GeoJSON keeps every country property and feature while reducing geometry payload', () => {
  assert.equal(fullCountries.features.length, 177);
  assert.equal(mapCountries.features.length, 177);
  assert.deepEqual(mapCountries.features.map(f => f.properties), fullCountries.features.map(f => f.properties));
  assert.equal(new Set(mapCountries.features.map(f => f.properties.NAME)).size, 177);
  const fullVertices = fullCountries.features.reduce((sum, f) => sum + countPositions(f.geometry.coordinates), 0);
  const mapVertices = mapCountries.features.reduce((sum, f) => sum + countPositions(f.geometry.coordinates), 0);
  assert.ok(mapVertices < fullVertices * 0.2, `map vertices ${mapVertices} < 20% of ${fullVertices}`);
  assert.ok(fs.statSync(mapCountriesPath).size < fs.statSync(path.join(root, 'assets/geo/countries.json')).size * 0.2);
});

test('startup requests compact map geometry and only default company categories; missions are demand-loaded', () => {
  assert.match(app, /DEFAULT_MAP_FILTERS = \{ launch: true, propulsion: false, agency: true, satmaker: false, site: true, recovery: false \}/);
  assert.match(app, /MAP_FILTERS_STORAGE_KEY = "orbita_map_filters_v1"/);
  assert.match(app, /data: "assets\/geo\/countries_simplified\.json\?v="/);
  assert.equal((app.match(/data: "assets\/geo\/countries_simplified\.json\?v="/g) || []).length, 3,
    'offline rendering, online style preparation, and the interaction fallback use the compact country source');
  assert.match(app, /countryGeoLoadPromise = fetch\("assets\/geo\/countries\.json\?v="/,
    'full country geometry remains available to the rare exact spatial fallback');
  assert.match(app, /if \(b\.dataset\.view === "missions"\) ensureMissionViewData\(\)/);
  assert.match(app, /propulsion: "data\/companies_propulsion\.json"/);
  assert.match(app, /satmaker: "data\/companies_satmaker\.json"/);
  assert.match(html, /window\.ORBITA_V = "20261103boot-opt1";/);
});

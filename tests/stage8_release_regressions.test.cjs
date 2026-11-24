'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'assets/js/app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const globe = fs.readFileSync(path.join(root, 'raspehr-3d/index.html'), 'utf8');

test('new visitors see only agency and launch-site layers by default; persistent preferences are respected', () => {
  const section = app.match(/var DEFAULT_MAP_FILTERS\s*=\s*\{([\s\S]*?)\};/);
  assert.ok(section, 'the default-filter configuration exists');
  const keys = [...section[1].matchAll(/(\w+)\s*:\s*(true|false)/g)];
  assert.equal(keys.length, 14);
  assert.deepEqual(keys.filter(m => m[2] === 'true').map(m => m[1]).sort(), ['agency', 'site']);
  assert.match(app, /localStorage\.getItem\(MAP_FILTERS_V2_STORAGE_KEY\)/, 'existing saved preferences are loaded');
});

test('Antarctica still has map geometry but is not opened as a sovereign country dossier', () => {
  const geo = JSON.parse(fs.readFileSync(path.join(root, 'assets/geo/countries_simplified.json'), 'utf8'));
  const antarctica = geo.features.filter(f => f.properties.NAME === 'Antarctica');
  assert.equal(antarctica.length, 1, 'retain Antarctica in geographical base map');
  const start = app.indexOf('function handleCountryMapClick(');
  const end = app.indexOf('function resetCountryInteractionStyleState(', start);
  assert.ok(start >= 0 && end > start);
  const handler = app.slice(start, end);
  assert.match(handler, /record\.iso === "AQ"/);
  assert.match(handler, /record\.en === "Antarctica"/);
  assert.ok(handler.indexOf('record.iso === "AQ"') < handler.indexOf('openDetail({'));
});

test('the 3D module remains lazy-loaded; the original 2D map stays mounted', () => {
  assert.match(html, /id="raspehrStage5Toggle"/);
  assert.match(html, /id="raspehr3dOverlay"[^>]*hidden/);
  assert.match(html, /id="raspehrStage5Frame"/);
  assert.match(globe, /globe-engine\.js/);
  const switchSource=fs.readFileSync(path.join(root,'assets/js/raspehr-stage5-switch.js'),'utf8');
  assert.match(switchSource,/if\(!loaded\)/);
  assert.match(switchSource,/event\.origin!==origin/);
  assert.match(switchSource,/event\.source!==frame\.contentWindow/);
});

test('changed app JavaScript is cache-busted without altering the data cache key', () => {
  const token='20261123-stage8-app-final-v1';
  assert.ok(html.includes('assets/js/app.js?_t='+token));
  assert.ok(html.includes('window.ORBITA_APP_V = "20261114-map-zoom-performance-step3-v1"')); // preserve data/runtime version
  assert.ok(html.includes('window.ORBITA_COMPANIES_V = "20261114-step4-manufacturer-logos-v1"'));
});

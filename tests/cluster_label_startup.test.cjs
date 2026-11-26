'use strict';
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'assets/js/app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const start = app.indexOf('  function addClusterLabelImages(labelSpecs) {');
const end = app.indexOf('  function markerImageSvgSpecs() {', start);
assert.ok(start >= 0 && end > start, 'cluster label rasterizer block exists');
const cluster = app.slice(start, end);

test('cluster labels use a single atlas readback and preserve their drawing style', () => {
  assert.equal((cluster.match(/ctx\.getImageData\(/g) || []).length, 1,
    'all unique cluster labels are rasterized before one canvas readback');
  assert.match(cluster, /ctx\.font = "700 11\.5px Arial, sans-serif";/);
  assert.match(cluster, /ctx\.textAlign = "center"; ctx\.textBaseline = "middle"; ctx\.fillStyle = "#08131f";/);
  assert.match(cluster, /ctx\.fillText\(spec\.text, spec\.offset \+ spec\.width \/ 2, height \/ 2, spec\.width - 2\);/);
  assert.match(cluster, /ctx\.createImageData\(imageWidth, imageHeight\)/);
  assert.match(cluster, /atlas\.data\.subarray\(from, from \+ imageWidth \* 4\)/);
  assert.match(cluster, /map\.addImage\(spec\.id, image, \{ pixelRatio: scale \}\);/);
  assert.match(cluster, /props\.markerType === "cluster" && props\.clusterLabelImage/);
  assert.match(cluster, /addClusterLabelImages\(labelSpecs\);/);
});

test('CSS, application and data caches keep independent nonempty revision tokens', () => {
  const getVersion = name => html.match(new RegExp('window\\.' + name + ' = \"([^\"]+)\";'))?.[1];
  const dataV = getVersion('ORBITA_V'), cssV = getVersion('ORBITA_CSS_V'), appV = getVersion('ORBITA_APP_V');
  for (const [label,value] of Object.entries({dataV,cssV,appV})) assert.match(value||'', /^[a-zA-Z0-9_-]+$/, label+' version exists');
  assert.notEqual(appV,dataV,'app changes must not blindly invalidate canonical data');
  assert.notEqual(cssV,dataV,'CSS changes must not blindly invalidate canonical data');
  // The production page now uses static cache-busted asset URLs (not the
  // older runtime script injection code). Validate those URLs directly.
  assert.match(html, /<link[^>]+href="assets\/css\/app\.css\?_t=[a-zA-Z0-9_-]+"/);
  assert.match(html, /<script defer src="assets\/js\/app\.js\?_t=[a-zA-Z0-9_-]+"/);
  assert.equal((html.match(/<script defer src="assets\/js\/app\.js\?_t=/g)||[]).length,1,
    'only one main application bootstrap is loaded');
});

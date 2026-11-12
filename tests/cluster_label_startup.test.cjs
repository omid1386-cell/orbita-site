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

test('the detail-copy readability fix refreshes CSS and app assets without changing the map/data cache', () => {
  assert.match(html, /window\.ORBITA_V = "20261023mapuk2";/,
    'map and data assets receive a fresh token for the corrected P2 records');
  assert.match(html, /window\.ORBITA_CSS_V = "20261112tilecontinuitycssv1";/);
  assert.match(html, /window\.ORBITA_APP_V = "20261112tilecontinuityv1";/);
  assert.match(html, /var ts = window\.ORBITA_CSS_V \|\| window\.ORBITA_V;[\s\S]*?link\.href = 'assets\/css\/app\.css\?_t=' \+ ts;/,
    'only the updated stylesheet receives its dedicated cache token');
  assert.match(html, /var ts = window\.ORBITA_APP_V \|\| window\.ORBITA_V \|\| Date\.now\(\);[\s\S]*?s\.src = 'assets\/js\/app\.js\?_t=' \+ ts;/,
    'the application script uses its dedicated cache token');
});

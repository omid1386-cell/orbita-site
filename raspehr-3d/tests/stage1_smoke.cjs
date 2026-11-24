const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const html = read('index.html');
const engineCode = read('assets/js/globe-engine.js');
const controller = read('assets/js/prototype.js');

const requiredIds = ['globeMount','loading','loadingDetail','errorBox','errorMessage','retryBtn','engineStatus','lighting','clouds','rotation','stars','grid','relief','quality','qualityStatus','resetBtn','zoomIn','zoomOut','fps','altitude','sunPoint','viewName','sceneIntro'];
for (const id of requiredIds) assert.match(html, new RegExp('id="' + id + '"'), 'missing UI id: ' + id);
assert.match(html, /\.\.\/assets\/vendor\/three\.min\.js/);

for (const preset of ['world','asia','europe','americas','middleeast','africa','northpole','antarctica']) {
  assert.match(html, new RegExp('data-preset="' + preset + '"'), 'missing preset button: ' + preset);
}
assert.match(engineCode, /TILE_LEVELS = Object\.freeze\(\[/);
assert.match(engineCode, /id:'z0'/);
assert.match(engineCode, /id:'z1'/);
assert.match(engineCode, /id:'z2'/);
assert.match(engineCode, /assets\/tex-tiles\/\$\{level\.id\}\/day\/day_\$\{level\.id\}_r\$\{row\}_c\$\{col\}\.jpg/);
assert.match(engineCode, /single-fallback/);
assert.match(engineCode, /webglcontextlost/);
assert.match(engineCode, /visibilitychange/);
assert.match(engineCode, /createImageBitmap/);
assert.match(engineCode, /getTileLevelForDistance/);
assert.match(controller, /هرم تصویری فعال است/);

const expectTileCount = (dir, count) => {
  assert.equal(fs.readdirSync(path.join(root, dir)).filter(name => name.endsWith('.jpg')).length, count, 'wrong tile count in ' + dir);
};
expectTileCount('assets/tex-tiles/z0/day', 2);
expectTileCount('assets/tex-tiles/z0/night', 2);
expectTileCount('assets/tex-tiles/z1/day', 8);
expectTileCount('assets/tex-tiles/z1/night', 8);
expectTileCount('assets/tex-tiles/z2/day', 32);
expectTileCount('assets/tex-tiles/z2/night', 32);
assert.ok(fs.existsSync(path.join(root, 'assets/tex-tiles/manifest.multilevel.json')));

const code = engineCode + '\nwindow.__exported = window.RaspehrGlobe;';
const window = {THREE:{Vector3: class Vector3 { constructor(x=0,y=0,z=0){ this.x=x; this.y=y; this.z=z; } normalize(){ return this; } }}};
window.window = window;
const context = vm.createContext(window);
vm.runInContext(code, context);
const api = context.__exported;
assert.ok(api && api.PRESETS && api.QUALITY && api.TILE_LEVELS, 'RaspehrGlobe exports missing');
assert.equal(Object.keys(api.PRESETS).length, 8, '8 geographic presets expected');
assert.equal(api.TILE_LEVELS.length, 3, '3 imagery levels expected');
assert.equal(api.TILE_LEVELS[0].rows * api.TILE_LEVELS[0].cols, 2, 'z0 tile count');
assert.equal(api.TILE_LEVELS[1].rows * api.TILE_LEVELS[1].cols, 8, 'z1 tile count');
assert.equal(api.TILE_LEVELS[2].rows * api.TILE_LEVELS[2].cols, 32, 'z2 tile count');
assert.ok(api.QUALITY.low.day < api.QUALITY.balanced.day && api.QUALITY.balanced.day < api.QUALITY.high.day);
console.log('RASPEHR Stage-1 R4: multilevel imagery pyramid (z0/z1/z2), quality profiles, UI hooks and fallback paths passed.');

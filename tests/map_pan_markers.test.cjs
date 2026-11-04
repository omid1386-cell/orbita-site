'use strict';
// Regression checks: MapLibre's DOM marker positioning transform must not be CSS-transitioned.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'assets/css/app.css'), 'utf8');
const app = fs.readFileSync(path.join(root, 'assets/js/app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const rootRule = css.match(/\.pin\s*\{([^}]*)\}/);
assert(rootRule, 'the accessible recovery marker root style exists');
assert.doesNotMatch(rootRule[1], /(^|;)\s*transition\s*:[^;]*\btransform\b/i,
  'the MapLibre-positioned marker root never transitions its geographic transform');
assert.doesNotMatch(rootRule[1], /(^|;)\s*transform\s*:/i,
  'the marker root does not replace MapLibre’s inline position transform');
const svgRule = css.match(/\.pin\s+svg\s*\{([^}]*)\}/);
assert(svgRule, 'recovery marker artwork remains an SVG inside its DOM marker');
assert.match(svgRule[1], /transform-origin\s*:\s*50%\s+100%/);
assert.match(svgRule[1], /transition\s*:\s*transform\s+\.14s\s+ease/,
  'the visual hover animation is confined to the inner icon');
assert.match(css, /\.pin:hover\s+svg\s*\{\s*transform\s*:\s*scale\(1\.28\)\s*\}/,
  'mouse hover preserves the existing icon scale without animating marker position');
assert.match(app, /el\.className = "pin";[\s\S]*?el\.setAttribute\("role", "button"\); el\.tabIndex = 0;[\s\S]*?new maplibregl\.Marker\(\{ element: el, anchor: "bottom" \}\)/,
  'the recovery point remains a keyboard-focusable MapLibre DOM marker');
assert.match(app, /if \(e\.key === "Enter" \|\| e\.key === " "\)[\s\S]*?el\.click\(\)/,
  'Enter and Space continue to activate the recovery marker');
assert.match(html, /window\.ORBITA_V = "20261104panfix1";/,
  'the pan-marker CSS fix receives a fresh cache token');

console.log('PASS: DOM recovery markers keep geographic transforms immediate and remain keyboard accessible.');

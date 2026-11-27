'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'),'utf8');
const css = fs.readFileSync(path.join(root, 'assets/css/launch-mission-ui.css'),'utf8');
const js = fs.readFileSync(path.join(root, 'assets/js/upcoming-launch-browser.js'),'utf8');

const checks = [
  [ /<main id="view-map"[\s\S]*id="upcomingLaunchesBtn"[\s\S]*<\/main>/, 'Standalone launch dock inside map view'],
  [ /id="upcomingLaunchesBtn"[^>]*aria-haspopup="dialog"[^>]*aria-controls="globalLaunchDialog"/, 'Launch entry accessible'],
  [ /<dialog id="globalLaunchDialog" class="global-launch-dialog launch-mission-dialog"/, 'Exclusive dialog namespace'],
  [ /id="launchMissionDockTitle"/, 'Stable icon label'],
  [ /class="launch-mission-hero-art"/, 'Unique visual hero'],
  [ /id="launchMissionCountryToggle"[^>]*aria-expanded="false"/, 'Collapsible mobile country picker'],
  [ /id="launchMissionJumpResults"[^>]*aria-controls="globalLaunchResults"/, 'Mobile results shortcut'],
  [ /id="globalLaunchFilterSummary"/, 'Current filter summary'],
  [ /id="globalLaunchSelectedCountries"/, 'Removable applied country chips'],
  [ /<dialog id="globalLandingDialog" class="global-launch-dialog launch-mission-dialog raspehr-landing-parity"/, 'Landing uses the shared mission-room styling (UX step 5)'],
];
for (const [re, label] of checks) assert.match(html, re, label);
assert.ok(!/<nav class="tabs">[\s\S]*id="upcomingLaunchesBtn"[\s\S]*<\/nav>/.test(html), 'No old tab launcher');
assert.match(css, /\.launch-mission-dialog\s*\{/);
assert.match(css, /@media\(max-width:760px\)/);
assert.match(css, /\.global-launch-country-options:not\(\.launch-mission-expanded\)/);
for (const code of ['CHN','USA','RUS','IND']) assert.match(html, new RegExp('data-quick-country="'+code+'"'));
for (const n of ['7','14','30','120']) assert.match(html, new RegExp('data-days="'+n+'"'));
for (const language of ['fa','en','ar']) assert.match(js,new RegExp('\\b'+language+': \\{'));
assert.match(js, /function renderQuickCountries\(/);
assert.match(js, /function renderCountryBrowserMode\(/);
assert.match(js, /data-remove-country-code/);
assert.match(js, /renderResults\(\);/);
assert.doesNotMatch(js, /\brender\(\);/, 'Unknown render() must not be called on fetch completion');
assert.match(js, /Filters\.filterLaunches\(/, 'Filtering unchanged');
assert.equal((html.match(/id="upcomingLaunchesBtn"/g) || []).length,1);
assert.equal((html.match(/id="globalLaunchDialog"/g) || []).length,1);
console.log('PASS: launch mission UI redesign, responsive behavior, i18n hooks, shared landing dialog skin');

'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const read = x => fs.readFileSync(path.join(root,x),'utf8');
const html=read('index.html');
const css=read('assets/css/raspehr-event-parity-v21.css');
const landingJs=read('assets/js/upcoming-landing-browser.js');

test('two upcoming panels use the same mission-room class and shared navy surface',()=>{
  for(const id of ['globalLaunchDialog','globalLandingDialog']){
    assert.match(html,new RegExp(`<dialog id="${id}" class="global-launch-dialog launch-mission-dialog`));
    assert.match(css,new RegExp('#'+id));
  }
  assert.match(html,/id="globalLandingDialog"[^>]*raspehr-landing-parity/);
  assert.match(css,/#globalLandingDialog\.raspehr-landing-parity \.global-launch-period/);
  assert.match(css,/--panel-solid:#081a2a/);
  assert.match(css,/color-scheme:dark/);
});
test('both event modals keep their independent filters and event timelines',()=>{
  for(const prefix of ['Launch','Landing']){
    for(const name of ['Periods','CountryBasis','CountrySearch','CountryOptions','Results','Reload','Close'])
      assert.match(html,new RegExp(`id="global${prefix}${name}"`));
    for(const days of ['7','14','30','120']){
      const modal=html.split('id="global'+prefix+'Dialog"')[1].split('</dialog>')[0];
      assert.match(modal,new RegExp('data-days="'+days+'"'));
    }
  }
  assert.match(html,/id="upcomingLandingsBtn"/);
  assert.match(read('assets/js/upcoming-launch-browser.js'),/ensureDesktopLaunchButton\(/);
});
test('landing-only visual labels are localized, no change to event time semantics',()=>{
  for(const language of ['fa','en','ar'])assert.match(landingJs,new RegExp('\\b'+language+': \\['));
  assert.match(landingJs,/renderChrome\(\)/);
  assert.match(landingJs,/Filters\.filterEvents\(/);
  assert.match(read('assets/js/upcoming-launch-browser.js'),/Filters\.filterLaunches\(/);
});
test('fresh version tokens are used and data workflows retain original versions',()=>{
  for(const file of ['raspehr-event-parity-v21.css','upcoming-launch-browser.js','upcoming-landing-browser.js','app.js']){
    assert.match(html,new RegExp('(?:href|src)="assets/(?:css|js)/'+file.replaceAll('.','\\.')+'.*20261127-ux-v21'));
  }
  assert.match(html,/ORBITA_UPCOMING_GLOBAL_V = "20261121-step3-4"/);
  assert.match(html,/ORBITA_UPCOMING_LANDINGS_V = "20261121-step5-6"/);
});

'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'assets/css/prototype.css'),'utf8');
const js=fs.readFileSync(path.join(root,'assets/js/mobile-bottom-sheet.js'),'utf8');
const once=(text,token)=>assert.equal(text.split(token).length-1,1,`missing or duplicate ${token}`);
for(const id of ['mobileMainSheet','mobileSheetHeader','mobileSheetHandle','mobileSheetBody',
    'mobileSelectedSlot','mobileLocationTab','mobileMapShortcuts','mobileMapPlace','mobileDossierBar','mobileDossierHandle'])
  once(html,`id="${id}"`);
for(const required of ['data-mobile-snap="collapsed"','data-mobile-snap="half"',
  'data-mobile-snap="full"','data-mobile-tab="filters"','data-mobile-tab="place"',
  'data-mobile-tab="controls"','data-dossier-snap="collapsed"',
  'data-dossier-snap="half"','data-dossier-snap="full"'])assert.ok(html.includes(required),required);
once(html,'id="selectedLocationCard"');
once(html,'id="dossierFrame"');
assert.ok(html.indexOf('assets/js/mobile-bottom-sheet.js')>html.indexOf('assets/js/prototype.js'),
  'mobile UI must initialize after underlying real application');
assert.ok(css.includes('body.mobile-sheet-ready'), 'all mobile overrides are opt-in');
assert.ok(css.includes('prefers-reduced-motion:reduce'));
assert.ok(js.includes('slot.appendChild(card)') && js.includes('cardParent.insertBefore(card,cardNext)'),
  'quick card should move, not be cloned, and return to desktop');
assert.ok(js.includes('new MutationObserver(syncSelection)'));
assert.ok(js.includes('touch-action:none')===false,'touch behavior must stay in CSS, not JS');
assert.ok(js.includes("states=['collapsed','half','full']"));
console.log('PASS Priority4 mobile HTML/CSS/controller structure and original DOM preservation');

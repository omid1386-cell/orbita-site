'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const js=fs.readFileSync(path.join(root,'assets/js/upcoming-landing-browser.js'),'utf8');
const snapshot=JSON.parse(fs.readFileSync(path.join(root,'data/upcoming_global_landings.json'),'utf8'));
assert(html.includes('id="upcomingLandingsBtn"'));
assert(html.includes('id="globalLandingDialog"'));
assert(html.includes('src="assets/js/upcoming-landing-browser.js'));
assert(html.indexOf('upcoming-launch-filters.js')<html.indexOf('upcoming-landing-browser.js'));
for(const id of ['globalLandingPeriods','globalLandingCountryBasis','globalLandingCountryOptions','globalLandingResults','globalLandingAllCountries']) {
 assert(html.includes('id="'+id+'"'), 'missing '+id);
}
for(const days of [7,14,30,120])assert(html.includes('data-days="'+days+'"'));
assert(js.includes('data/upcoming_global_landings.json'));
assert(js.includes('Filters.filterEvents(state.data.landings'));
assert(js.includes('dateBasisLaunch') && js.includes('dateBasisMission'));
assert(js.includes('partial_source_coverage'));
assert(!js.includes('new Date(event.net)'),'landing time must not be misrepresented');
assert.equal(snapshot.schema_version,1);
assert(['awaiting_first_successful_sync','partial_source_coverage'].includes(snapshot.coverage_status));
assert.equal(snapshot.count,snapshot.landings.length);
console.log('PASS: 18 landing UI structure assertions');

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'assets/js/app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const companies = JSON.parse(fs.readFileSync(path.join(root, 'data/companies.json'), 'utf8'));
const sites = JSON.parse(fs.readFileSync(path.join(root, 'data/sites.json'), 'utf8'));
const companyById = new Map(companies.map(row => [row.id, row]));
const siteById = new Map(sites.map(row => [row.id, row]));

function company(id) {
  assert.ok(companyById.has(id), `company ${id} exists`);
  return companyById.get(id);
}
function site(id) {
  assert.ok(siteById.has(id), `site ${id} exists`);
  return siteById.get(id);
}


test('Dragonfly Aerospace and Simera Sense are clean satellite/payload-maker records, not launchers', () => {
  const counts = Object.fromEntries(['launch', 'propulsion', 'agency', 'satmaker'].map(cat =>
    [cat, companies.filter(row => row.cat === cat).length]));
  assert.deepEqual(counts, { launch: 68, propulsion: 69, agency: 96, satmaker: 28 });

  const dragonfly = company('dragonfly-space');
  const simera = company('simera-sense');
  for (const row of [dragonfly, simera]) {
    assert.equal(row.cat, 'satmaker');
    for (const obsolete of ['rockets_fleet', 'stats', 'first_launch_year', 'site_ids', 'mission_types_en', 'orbital_capabilities_en']) {
      assert.equal(Object.hasOwn(row, obsolete), false, `${row.id} has no fabricated launcher field ${obsolete}`);
    }
    assert.ok(row.product_lines_bilingual.length >= 2);
    assert.ok(row.maker_class_ar && row.satellites_built_ar);
  }
  assert.match(dragonfly.en_d, /satellite|satellite bus|imaging/i);
  assert.match(dragonfly.satellites_built_en, /EOS SAT-1/);
  assert.match(simera.en_d, /headquartered in Leuven, Belgium/);
  assert.match(simera.en_d, /Somerset West, South Africa/);
  assert.match(simera.satellites_built_en, /60\+ payloads launched/);
  assert.equal(companies.some(row => row.cat === 'launch' && ['dragonfly-space', 'simera-sense'].includes(row.id)), false);
});


test('Djibouti is a dormant, unbuilt proposal with no invented launch record or active infrastructure', () => {
  const djibouti = site('djibouti-spaceport');
  assert.equal(djibouti.status, 'dormant');
  assert.equal(djibouti.first, null);
  assert.equal(djibouti.alt, '—');
  assert.deepEqual(djibouti.launches, []);
  assert.deepEqual(djibouti.rockets, []);
  assert.ok(djibouti.pads.includes('expired 2023 MoU'));
  assert.ok(djibouti.infra.length > 0);
  assert.ok(djibouti.infra.every(item => item.active === false));
  assert.match(djibouti.en_d, /MoU lapsed without a formal construction contract/);
  assert.match(djibouti.en_d, /map pin is approximate/);
  assert.match(djibouti.target_orbits_en, /None confirmed/);
});


test('Overberg is an active test range; operational history is separated from future orbital goals', () => {
  const overberg = site('overberg');
  assert.equal(overberg.status, 'active');
  assert.match(overberg.en_d, /Phoenix suborbital sounding-rocket flights/);
  assert.match(overberg.en_d, /No orbital launch from Overberg is verified/);
  assert.match(overberg.target_orbits_en, /No orbital launches recorded/);
  assert.match(overberg.future_orbits_en, /development target only, not operational capability/);
  assert.ok(overberg.rockets.includes('Phoenix hybrid sounding rockets (suborbital)'));
  assert.equal(overberg.rockets.some(name => /RSA-4|Orbital Test Launcher/i.test(name)), false);
  assert.equal(overberg.stats_total, 0);
  assert.equal(overberg.stats_success + overberg.stats_fail, 0);
  assert.match(overberg.op, /ASRI \/ UKZN/);
  assert.match(overberg.op, /Mura Space/);
});


test('San Marco and Hammaguir infrastructure/orbit claims match their historical status', () => {
  const sanMarco = site('sanmarco');
  assert.equal(sanMarco.status, 'inactive');
  assert.equal(sanMarco.first, 1967);
  assert.match(sanMarco.op, /ASI/);
  assert.match(sanMarco.op, /Sapienza.*historical/i);
  assert.equal(sanMarco.infra.filter(item => item.active).length, 1);
  assert.match(sanMarco.infra.find(item => item.active).name, /Tracking Station/);
  assert.match(sanMarco.target_orbits_en, /Equatorial LEO/);
  assert.doesNotMatch(sanMarco.target_orbits_en, /SSO|Polar/);

  const hammaguir = site('hammaguir');
  assert.equal(hammaguir.status, 'inactive');
  assert.equal(hammaguir.first, 1952);
  assert.equal(hammaguir.launches.length, 4);
  assert.ok(hammaguir.launches.every(row => row.rocket && row.rocket !== '—'));
  assert.ok(hammaguir.infra.every(item => item.active === false));
  assert.match(hammaguir.target_orbits_en, /LEO/);
  assert.doesNotMatch(hammaguir.target_orbits_en, /GEO|SSO|Lunar|Interplanetary/);
  assert.match(hammaguir.en_d, /four Diamant A orbital launches/);
});


test('UI marks dormant sites as non-operational and renders proposed orbit goals separately', () => {
  assert.match(app, /status === "inactive" \|\| status === "dormant"/);
  assert.match(app, /p\.o\.status === "inactive" \|\| p\.o\.status === "dormant"/);
  assert.match(app, /Future \/ Proposed Orbits/);
  assert.match(app, /var statRateText = statRate == null \? "—"/);
  assert.match(app, /var altitudeUnit = altitudeValue && altitudeValue !== "—"/);
  assert.match(app, /Optical imaging payload/);
  assert.match(app, /Private optical-payload manufacturer \(Belgium; South Africa production facility\)/);
  assert.match(html, /window\.ORBITA_V = "20261023propulsionlogos2";/);
});

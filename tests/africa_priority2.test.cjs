'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'assets/js/app.js'), 'utf8');
const companies = JSON.parse(fs.readFileSync(path.join(root, 'data/companies.json'), 'utf8'));
const sites = JSON.parse(fs.readFileSync(path.join(root, 'data/sites.json'), 'utf8'));
const sourceRegistry = JSON.parse(fs.readFileSync(path.join(root, 'docs/africa_priority2_sources.json'), 'utf8'));
const byCompanyId = new Map(companies.map(row => [row.id, row]));
const bySiteId = new Map(sites.map(row => [row.id, row]));
const p2CompanyIds = [
  'rwanda-space-agency', 'ases-senegal', 'zingsa-zimbabwe', 'ageos-gabon', 'asci-civ', 'narss-egypt',
  'malawi-space-agency', 'nist-namibia', 'mric-mauritius', 'cnct-tunisia', 'gssti-ghana', 'crts-morocco',
  'lcrsss-libya', 'nrsc-zambia', 'isra-sudan', 'rssa-sudan', 'tanzania-space-programme',
  'asri-ukzn', 'cstp-nasrda', 'solid-state-propulsion-za', 'nakuja-project', 'nakuja-space', 'mura-space', 'pyralink-aerospace'
];
const p2SiteIds = [
  'somalia-spaceport', 'kipini-spaceport', 'epe-lagoon-test-site', 'isiolo-test-range',
  'reggane', 'shaba-north', 'tawiwa', 'nouadhibou'
];

function company(id) {
  assert.ok(byCompanyId.has(id), `missing company ${id}`);
  return byCompanyId.get(id);
}
function site(id) {
  assert.ok(bySiteId.has(id), `missing site ${id}`);
  return bySiteId.get(id);
}

test('Africa Priority 2 adds the reviewed agencies and correctly separates institutions from national agencies', () => {
  assert.deepEqual(
    Object.fromEntries(['agency', 'propulsion', 'launch', 'satmaker'].map(cat =>
      [cat, companies.filter(row => row.cat === cat).length])),
    { agency: 66, propulsion: 52, launch: 60, satmaker: 28 }
  );
  const agencyIds = [
    'rwanda-space-agency', 'ases-senegal', 'zingsa-zimbabwe', 'ageos-gabon', 'asci-civ', 'narss-egypt',
    'malawi-space-agency', 'nist-namibia', 'mric-mauritius', 'cnct-tunisia', 'gssti-ghana', 'crts-morocco',
    'lcrsss-libya', 'nrsc-zambia', 'isra-sudan', 'rssa-sudan', 'tanzania-space-programme'
  ];
  for (const id of agencyIds) {
    const row = company(id);
    assert.equal(row.cat, 'agency', `${id} is categorized as an institution/agency record`);
    assert.ok(row.en && row.fa && row.ar && row.en_d && row.fa_d && row.ar_d, `${id} has all three languages`);
    assert.ok((sourceRegistry.companies[id] || []).length > 0, `${id} has cited evidence in the audit registry`);
    assert.equal(row.coordinates_precision, 'approximate_city_pin', `${id} uses a clearly approximate city pin`);
    assert.match(row.location_note_en, /approximate city-area pins/);
  }
  const nist = company('nist-namibia');
  assert.match(nist.org_type_en, /University/);
  assert.match(nist.en_d, /not a standalone national space agency/);
  const gssti = company('gssti-ghana');
  assert.match(gssti.flagship_prod_status_en, /transition to a separate agency not completed/);
  assert.match(gssti.en_d, /not recorded here as completed/);
  const tanzania = company('tanzania-space-programme');
  assert.match(tanzania.org_type_en, /not an independent agency/);
  assert.match(tanzania.future_roadmap_en, /reported target/);
  assert.doesNotMatch(tanzania.en_d, /has launched/i);
  for (const id of ['isra-sudan', 'rssa-sudan']) {
    assert.equal(company(id).flagship_prod_status_en, 'Current activity unverified');
  }
  const pyra = company('pyralink-aerospace');
  assert.equal(pyra.cat, 'propulsion');
  assert.equal(pyra.evidence_confidence, 'low');
  assert.equal(pyra.flagship_status_en, 'Low confidence — directory-only');
  assert.match(pyra.en_d, /Low-confidence directory-level candidate only/);
  assert.match(pyra.source_note_en, /not as a confirmed manufacturer or operator/);
  assert.deepEqual(pyra.engine_products_bilingual, []);
  assert.deepEqual(pyra.test_history_en, []);
});

test('propulsion and launch developers remain distinct; proposed capabilities are not recorded as flown', () => {
  for (const id of ['asri-ukzn', 'cstp-nasrda', 'solid-state-propulsion-za', 'nakuja-project']) {
    assert.equal(company(id).cat, 'propulsion');
    assert.ok(company(id).history_en && company(id).history_ar &&
      (sourceRegistry.companies[id] || []).length > 0);
    assert.deepEqual(company(id).engine_products_bilingual, [], `${id} does not inflate the audited product total`);
    assert.deepEqual(company(id).test_history_en, [], `${id} does not inflate the audited test-event total`);
  }
  const project = company('nakuja-project');
  const startup = company('nakuja-space');
  const mura = company('mura-space');
  assert.notEqual(project.id, startup.id);
  assert.equal(startup.cat, 'launch');
  assert.equal(mura.cat, 'launch');
  for (const row of [startup, mura]) {
    assert.equal(row.first_launch_year, null);
    assert.deepEqual(row.rockets_fleet, []);
    assert.equal(row.stats.total_launches, 0);
    assert.equal(row.stats.success_launches, 0);
    assert.equal(row.stats.failed_launches, 0);
  }
  assert.match(startup.en_d, /No vehicle flight/);
  assert.match(mura.en_d, /No Mura orbital vehicle or operational orbital service/);
  assert.deepEqual(mura.site_ids, ['overberg']);
  assert.equal(company('asri-ukzn').site_ids.includes('overberg'), true);
});

test('Somalia and Kipini retain distinct construction and planned statuses with approximate coordinates', () => {
  const somalia = site('somalia-spaceport');
  assert.equal(somalia.status, 'under_construction');
  assert.equal(somalia.first, null);
  assert.deepEqual(somalia.launches, []);
  assert.equal(somalia.stats_total, 0);
  assert.equal(somalia.coordinates_precision, 'approximate_area_pin');
  assert.match(somalia.en_d, /publicly described construction as underway/);
  assert.match(somalia.en_d, /exact parcel and pad are unverified/);
  assert.match(somalia.target_orbits_en, /Not disclosed/);

  const kipini = site('kipini-spaceport');
  assert.equal(kipini.status, 'planned');
  assert.equal(kipini.first, null);
  assert.deepEqual(kipini.launches, []);
  assert.equal(kipini.stats_total, 0);
  assert.equal(kipini.coordinates_precision, 'approximate_area_pin');
  assert.match(kipini.en_d, /feasibility and transaction-advisory study/);
  assert.match(kipini.en_d, /Construction has not been confirmed/);
  assert.match(kipini.pads, /study area only/);
  assert.match(app, /planned: "Planned"/);
  assert.match(app, /sitePlanned: "orbita-pin-site-planned"/);
});

test('Epe and Isiolo are temporary test areas; historical ranges are not counted as orbital launches', () => {
  const epe = site('epe-lagoon-test-site');
  const isiolo = site('isiolo-test-range');
  assert.equal(epe.status, 'inactive');
  assert.equal(isiolo.status, 'inactive');
  assert.equal(epe.first, 2025);
  assert.equal(isiolo.first, 2024);
  assert.equal(epe.coordinates_precision, 'approximate_area_pin');
  assert.equal(isiolo.coordinates_precision, 'approximate_area_pin');
  assert.match(epe.en_d, /mobile suborbital test, not a permanent launch site/);
  assert.match(isiolo.en_d, /temporary suborbital test area, not a permanent launch site/);
  assert.equal(epe.launches.length, 1);
  assert.equal(isiolo.launches.length, 1);

  for (const id of ['reggane', 'shaba-north', 'tawiwa', 'nouadhibou']) {
    const row = site(id);
    assert.equal(row.status, 'inactive');
    assert.equal(row.stats_total, 0);
    assert.equal(row.coordinates_precision, 'approximate_area_pin');
    assert.ok((sourceRegistry.sites[id] || []).length > 0, `${id} has cited evidence in the audit registry`);
    assert.ok((row.launches || []).every(event => /suborbital|sounding/i.test(event.orbit || event.mtype || '')));
  }
  assert.equal(site('shaba-north').historical_test_count, 3);
  assert.equal(site('tawiwa').historical_test_count, 14);
  assert.equal(site('nouadhibou').historical_test_count, 1);
  assert.equal(Object.hasOwn(site('reggane'), 'historical_test_count'), false,
    'conflicting published Reggane totals remain unresolved rather than converted into one number');
});

test('all P2 IDs are unique, all new source records have unique names, and every site status is supported', () => {
  assert.equal(new Set(companies.map(row => row.id)).size, companies.length);
  assert.equal(new Set(sites.map(row => row.id)).size, sites.length);
  const newCompanies = p2CompanyIds.map(company);
  assert.equal(new Set(newCompanies.map(row => row.en.trim().toLocaleLowerCase())).size, p2CompanyIds.length);
  assert.equal(new Set(p2SiteIds.map(site)).size, p2SiteIds.length);
  for (const row of p2CompanyIds.map(company)) {
    for (const siteId of row.site_ids || []) assert.ok(bySiteId.has(siteId), `${row.id} links to a real site ${siteId}`);
    assert.ok((sourceRegistry.companies[row.id] || []).every(url => /^https?:\/\//.test(url)),
      `${row.id} source links are valid URL strings in the separate audit registry`);
  }
  for (const id of p2SiteIds) {
    const row = site(id);
    assert.ok(['planned', 'under_construction', 'inactive'].includes(row.status));
    assert.equal(row.coordinates_precision, 'approximate_area_pin');
    assert.equal(row.stats_success + row.stats_fail, row.stats_total);
    if (row.stats_total === 0) assert.equal(row.stats_asof, '2026-11-06');
  }
});

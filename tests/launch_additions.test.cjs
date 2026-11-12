'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const companies = JSON.parse(fs.readFileSync(path.join(root, 'data/companies.json'), 'utf8'));
const launch = JSON.parse(fs.readFileSync(path.join(root, 'data/companies_launch.json'), 'utf8'));
const byId = new Map(companies.map(row => [row.id, row]));
const addedAndSplitIds = [
  'glavkosmos', 'exolaunch', 'sirius-space-services', 'hyprspace',
  't-minus-engineering', 'otespace', 'borospace', 'pivdenmash', 'pivdenne'
];

function company(id) {
  assert.ok(byId.has(id), `company ${id} exists`);
  return byId.get(id);
}

test('the approved launch-company additions and Ukrainian split are present and fully sourced', () => {
  assert.equal(companies.length, 266);
  assert.equal(launch.length, 68);
  assert.equal(launch.filter(row => !row.alias_of_id).length, 68);
  assert.deepEqual(launch, companies.filter(row => row.cat === 'launch'));
  assert.equal(byId.has('yuzhmash'), false, 'the ambiguous combined record ID is removed');

  for (const id of addedAndSplitIds) {
    const row = company(id);
    assert.equal(row.cat, 'launch', `${id} belongs to the launch-industry layer`);
    assert.ok(row.en && row.fa && row.ar && row.en_d && row.fa_d && row.ar_d, `${id} has reviewed names and descriptions in all three languages`);
    assert.ok(row.source_note_en && row.source_note_fa && row.source_note_ar, `${id} carries source notes in all three languages`);
    assert.ok(Number.isFinite(row.lat) && Number.isFinite(row.lon), `${id} has a researched map pin`);
    assert.ok(row.coordinates_precision && row.coordinates_note_en && row.coordinates_note_fa && row.coordinates_note_ar,
      `${id} states its coordinate precision and caveats`);
    assert.match(row.coordinate_source_url, /^https:\/\/www\.openstreetmap\.org\//);
    assert.equal(row.stats.total_launches, null, `${id} does not inherit unsupported operator launch totals`);
    // Documented designs and manufacturing heritage are allowed, but never counted as operational flights.
    for (const vehicle of row.rockets_fleet) {
      assert.match(vehicle.technical_source_url || '', /^https:\/\//, `${id}/${vehicle.name}: documented development model`);
      assert.ok(vehicle.maiden_flight == null, `${id}/${vehicle.name}: no fabricated maiden flight`);
      assert.ok(vehicle.total_launches == null, `${id}/${vehicle.name}: no invented operator totals`);
      assert.ok(/development|heritage/i.test(vehicle.status_en), `${id}/${vehicle.name}: visibly non-operational`);
    }
    assert.deepEqual(row.site_ids, [], `${id} has no unverified launch-site affiliations`);
  }
});

test('launch, integration, suborbital, and development roles are not conflated', () => {
  assert.match(company('glavkosmos').org_type_en, /Rideshare.*not a vehicle operator/i);
  assert.match(company('glavkosmos').en_d, /not an independent launch-vehicle operator/i);

  assert.match(company('exolaunch').org_type_en, /Integration.*Services Provider/i);
  assert.match(company('exolaunch').en_d, /neither a rocket manufacturer nor an independent launch-vehicle operator/i);

  assert.match(company('sirius-space-services').status_en, /development.*2027/i);
  assert.match(company('sirius-space-services').stats.scope_en, /future target, not a completed flight/i);

  assert.match(company('hyprspace').en_d, /Baguette One suborbital demonstrator is planned for 2027/i);
  assert.match(company('hyprspace').en_d, /Neither is an operational orbital launch service/i);

  assert.match(company('t-minus-engineering').org_type_en, /Suborbital Sounding-Rocket/i);
  assert.deepEqual(company('t-minus-engineering').orbital_capabilities_en, ['Suborbital']);
  assert.match(company('t-minus-engineering').stats.scope_en, /six suborbital sounding-rocket flights/i);

  assert.match(company('otespace').en_d, /OTESting as a reusable suborbital-launcher concept/i);
  assert.match(company('otespace').en_d, /Neither is listed as flown or operational/i);

  assert.match(company('borospace').org_type_en, /Suborbital Rocket.*Test-System Developer/i);
  assert.match(company('borospace').en_d, /does not treat ARDEA as an operational orbital launcher/i);
});

test('Pivdenmash and Pivdenne are distinct Ukrainian manufacturing and design records', () => {
  const plant = company('pivdenmash');
  const bureau = company('pivdenne');
  assert.notEqual(plant.id, bureau.id);
  assert.match(plant.org_type_en, /Manufacturer/);
  assert.match(plant.en_d, /separate from the Pivdenne\/Yuzhnoye design bureau/);
  assert.match(bureau.org_type_en, /Design Bureau/);
  assert.match(bureau.en_d, /separate from the Pivdenmash production plant/);
  assert.ok(bureau.products.includes('Cyclone-4M design programme'));
  for (const row of [plant, bureau]) {
    assert.equal(row.first_launch_year, null);
    assert.equal(row.stats.success_rate, null);
    assert.deepEqual(row.stats.annual_trend, []);
  }
});

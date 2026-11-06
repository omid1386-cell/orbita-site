'use strict';

// Link/contact audit regressions for the 24 Africa P2 organization and company records.
// Run with: node --test tests/africa_priority2_contacts.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'assets/js/app.js'), 'utf8');
const companies = JSON.parse(fs.readFileSync(path.join(root, 'data/companies.json'), 'utf8'));
const sourceRegistry = JSON.parse(fs.readFileSync(path.join(root, 'docs/africa_priority2_sources.json'), 'utf8'));
const p2Ids = Object.keys(sourceRegistry.companies);
const byId = new Map(companies.map(row => [row.id, row]));

function company(id) {
  assert.ok(byId.has(id), `missing company ${id}`);
  return byId.get(id);
}

function agencyRenderer(language = 'en') {
  const start = app.indexOf('  function renderAgencyDetail(p) {');
  const end = app.indexOf('  function renderPropulsionDetail(p) {', start);
  assert.notEqual(start, -1, 'agency detail renderer exists');
  assert.ok(end > start, 'agency detail renderer has a bounded source slice');
  const source = app.slice(start, end);
  const context = {
    LANG: language,
    window: {},
    name: row => row.en || row.fa || row.ar || '',
    desc: row => row.en_d || row.fa_d || row.ar_d || '',
    t: key => key,
    esc: value => String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch])),
    cell: (label, value) => value ? `<div>${label}: ${value}</div>` : '',
    extractEntityLinks: row => {
      const website = row.site || (row.contacts && row.contacts.website) || '';
      return { webUrl: website || null };
    }
  };
  vm.createContext(context);
  return vm.runInContext(`${source}\n({renderAgencyDetail})`, context).renderAgencyDetail;
}

test('P2 contact audit covers the intended 24 records and confirms only explicit contact fields are stored', () => {
  assert.equal(p2Ids.length, 24);
  for (const id of p2Ids) assert.ok(byId.has(id), `${id} exists in companies.json`);

  const actualLinkedIn = p2Ids.filter(id => company(id).linkedin || (company(id).contacts || {}).linkedin);
  assert.deepEqual(actualLinkedIn, ['pyralink-aerospace']);
  assert.deepEqual(p2Ids.filter(id => company(id).email || (company(id).contacts || {}).email), []);
});

test('confirmed website corrections remove misclassified, dead, or overly generic destinations', () => {
  assert.equal(company('zingsa-zimbabwe').site, 'https://zingsa.ac.zw/');
  assert.equal(company('zingsa-zimbabwe').contacts.website, 'https://zingsa.ac.zw/');

  assert.equal(company('ageos-gabon').site, 'https://www.ageos.ga/');
  assert.equal(company('ageos-gabon').contacts.website, 'https://www.ageos.ga/');

  assert.equal(company('nist-namibia').site, 'https://www.nust.na/taxonomy/term/384');
  assert.equal(company('nist-namibia').contacts.website, 'https://www.nust.na/taxonomy/term/384');

  const ases = company('ases-senegal');
  assert.equal(ases.site, '', 'ASES X account is not presented as a website');
  assert.equal(ases.contacts.website, undefined);
  assert.equal(ases.contacts.x, 'https://x.com/AsesAgence', 'keep the existing social account identifiable');

  const isra = company('isra-sudan');
  assert.equal(isra.site, '', 'the NXDOMAIN legacy domain is not presented as a current website');
  assert.equal(isra.contacts.website, undefined);
  assert.equal(company('rssa-sudan').site, '', 'no fallback website is supplied for RSSA');

  assert.equal(company('pyralink-aerospace').site, '', 'the cPanel default page is not exposed as the company website');
  assert.equal(company('pyralink-aerospace').linkedin, 'https://www.linkedin.com/company/pyralink-aerospace/',
    'the existing LinkedIn page is retained');
});

test('agency profiles do not fabricate another agency’s website, LinkedIn, or email when fields are absent', () => {
  for (const language of ['en', 'fa']) {
    const render = agencyRenderer(language);
    const html = render({
      cat: 'agency',
      o: { id: 'missing-contacts', en: 'Example Agency', fa: 'نمونه', en_d: 'Description', site: '', contacts: {} }
    });
    assert.doesNotMatch(html, /isa\.ir|isa-iran|info@isa\.ir/i);
    assert.doesNotMatch(html, /Official Website|Official LinkedIn|Contact Email|وب‌سایت رسمی|لینکدین|پست الکترونیک/);
  }
});

test('agency profiles display only contact destinations explicitly present in the record', () => {
  const render = agencyRenderer('en');
  const html = render({
    cat: 'agency',
    o: {
      id: 'explicit-contacts',
      en: 'Example Agency',
      en_d: 'Description',
      site: 'https://agency.example/',
      linkedin: 'https://www.linkedin.com/company/example-agency/',
      email: 'contact@agency.example'
    }
  });
  assert.match(html, /https:\/\/agency\.example\//);
  assert.match(html, /https:\/\/www\.linkedin\.com\/company\/example-agency\//);
  assert.match(html, /mailto:contact@agency\.example/);
  assert.doesNotMatch(html, /isa\.ir|isa-iran|info@isa\.ir/i);
});

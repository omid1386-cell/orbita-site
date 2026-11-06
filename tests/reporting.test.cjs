'use strict';

const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'assets/js/app.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'assets/css/app.css'), 'utf8');
const api = fs.readFileSync(path.join(root, 'report-api/server.mjs'), 'utf8');
const renderBlueprint = fs.readFileSync(path.join(root, 'render.yaml'), 'utf8');

test('report UI keeps technical and scientific/data reports separate and structured', () => {
  assert.match(html, /id="reportBtn"/);
  assert.match(html, /id="reportBugFields"/);
  assert.match(html, /id="reportDataFields"/);
  for (const name of ['record', 'field', 'currentValue', 'suggestedValue', 'sourceUrl']) {
    assert.match(html, new RegExp(`name="${name}"`));
  }
  for (const name of ['expected', 'actual', 'steps']) assert.match(html, new RegExp(`name="${name}"`));
  assert.match(app, /bugFields\.disabled = isData/);
  assert.match(app, /dataFields\.disabled = !isData/);
});

test('report transmission is submission-only and does not expose email secrets in browser files', () => {
  assert.match(html, /window\.ORBITA_REPORT_API_URL = "https:\/\/orbita-report-api\.onrender\.com\/api\/report";/);
  assert.match(app, /credentials: "omit"/);
  assert.match(app, /cache: "no-store"/);
  assert.doesNotMatch(html + app + css, /RESEND_API_KEY|[A-Z0-9._%+-]+@gmail\.com/i);
  assert.match(app, /fetch\(endpoint/);
  assert.match(api, /api\.resend\.com\/emails/);
  assert.match(api, /env\.REPORT_TO/);
  assert.match(api, /RESEND_API_KEY/);
  assert.match(api, /human review|human review/i);
  assert.match(api, /no site data was changed automatically/i);
});

test('Render Blueprint creates only the private report API and keeps secrets out of YAML', () => {
  assert.match(renderBlueprint, /type: web/);
  assert.match(renderBlueprint, /rootDir: report-api/);
  assert.match(renderBlueprint, /healthCheckPath: \/api\/health/);
  assert.match(renderBlueprint, /key: REPORT_TO\n\s+sync: false/);
  assert.match(renderBlueprint, /key: RESEND_API_KEY\n\s+sync: false/);
  assert.doesNotMatch(renderBlueprint, /habib1386hrs@gmail\.com|re_[A-Za-z0-9]+/);
});

test('all three site languages have report form and status labels', () => {
  for (const key of ['report_button', 'report_title', 'report_intro', 'report_source', 'report_privacy', 'report_success', 'report_unconfigured']) {
    assert.equal((app.match(new RegExp(`\\b${key}:`, 'g')) || []).length, 3, `${key} exists in fa, en, and ar`);
  }
});

 test('report dialog styles include a narrow-screen layout and reduced-motion-free controls', () => {
  assert.match(css, /\.report-dialog/);
  assert.match(css, /@media\(max-width:600px\)/);
  assert.match(css, /\.report-dialog::backdrop/);
});

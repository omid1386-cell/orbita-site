// Regression coverage for Arabic space-agency profiles and their real openDetail route.
// Run with: node --test tests/company_agency_ar.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'assets/js/app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const companies = JSON.parse(fs.readFileSync(path.join(root, 'data/companies.json'), 'utf8'));
const agencies = companies.filter(company => company.cat === 'agency');
const satelliteMakers = companies.filter(company => company.cat === 'satmaker');
const launch = companies.filter(company => company.cat === 'launch');
const propulsion = companies.filter(company => company.cat === 'propulsion');
const PERSIAN_ONLY = /[پچژگکی]/;
const NON_LATIN_DIGITS = /[٠-٩۰-۹]/;

const ROOT_AR_FIELDS = [
  'city_ar', 'flagship_product_ar', 'flagship_program_ar', 'flagship_prod_expl_ar',
  'flagship_prog_expl_ar', 'future_roadmap_ar', 'notable_missions_detail_ar',
  'partnerships_detail_ar', 'org_type_ar'
];
const PRODUCT_AR_FIELDS = ['name_ar', 'specs_ar', 'role_ar'];
const PROGRAM_AR_FIELDS = ['name_ar', 'objective_ar', 'budget_ar', 'partners_ar', 'next_step_ar'];
const PROGRAM_VISIBLE_AR_FIELDS = ['name_ar', 'objective_ar', 'next_step_ar'];

function sourceBetween(startToken, endToken) {
  const start = app.indexOf(startToken);
  const end = app.indexOf(endToken, start);
  assert.notEqual(start, -1, `missing source marker: ${startToken}`);
  assert.notEqual(end, -1, `missing source marker: ${endToken}`);
  return app.slice(start, end);
}

function plainText(value) {
  return String(value == null ? '' : value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x([\da-f]{1,6});/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/\s+/g, ' ')
    .trim();
}

function normalized(value) {
  return plainText(value).normalize('NFC');
}

function agencyApi(language = 'ar') {
  let rendererSource = sourceBetween(
    '  function renderAgencyCompanyArabic(p) {',
    '  function renderPropulsionCompanyArabic(p) {'
  );
  const returnAnchor = '    return h;\n  }';
  const returnAt = rendererSource.lastIndexOf(returnAnchor);
  assert.notEqual(returnAt, -1, 'Arabic agency renderer has a return statement');
  rendererSource = rendererSource.slice(0, returnAt) +
    '    window.__agencyMaps = {ORG_TYPE_AR, SECTOR_AR, PRODUCT_TYPE_AR, PRODUCT_CLASS_AR, STATUS_AR, COUNTRY_AR};\n' +
    rendererSource.slice(returnAt);

  const agencyDetailSource = sourceBetween(
    '  function renderAgencyDetail(p) {',
    '  function renderPropulsionDetail(p) {'
  );
  const openStart = app.indexOf('  function openDetail(p) {');
  const openEnd = app.indexOf('\n  on("#detailClose"', openStart);
  assert.notEqual(openStart, -1, 'openDetail exists');
  assert.ok(openEnd > openStart, 'openDetail has a bounded source slice');
  const openDetailSource = app.slice(openStart, openEnd);

  const detail = {
    attributes: {},
    setAttribute(name, value) { this.attributes[name] = value; },
    classList: { add() {}, remove() {} },
    scrollTop: 0
  };
  const detailBody = { innerHTML: '' };
  const context = {
    LANG: language,
    window: {},
    document: { getElementById: id => id === 'detail' ? detail : null },
    detail,
    detailBody,
    $: selector => selector === '#detailBody' ? detailBody : detail,
    esc: value => String(value == null ? '' : value).replace(/[&<>\"]/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;'
    }[char])),
    cell: (label, value) => value ? '<div class="cell"><small>' + String(label) + '</small><b>' + String(value) + '</b></div>' : '',
    name: company => company.ar || company.en || company.fa || '',
    desc: company => company.ar_d || company.en_d || company.fa_d || '',
    countryNameAr: () => null,
    extractEntityLinks: company => {
      const site = company.site && company.site !== '—' ? company.site : '';
      return {
        webUrl: site || null,
        displayWeb: site ? site.replace(/^https?:\/\//, '').replace(/\/$/, '') : '',
        linkedinUrl: company.linkedin || null,
        displayLinkedin: 'LinkedIn'
      };
    }
  };
  vm.createContext(context);
  const helpers = `
    function latinDigits(value) {
      return String(value == null ? '' : value)
        .replace(/[۰-۹]/g, c => '0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(c)])
        .replace(/[٠-٩]/g, c => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(c)])
        .replace(/٪/g, '%');
    }
    function safeEnglish(value, fallback) {
      var v = latinDigits(value).trim();
      if (!v) return fallback === undefined ? 'غير متاح' : fallback;
      var clean = v.replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, ' ')
        .replace(/[\u200C\u200D\uFEFF]/g, '').replace(/[،؛؟]/g, ' ')
        .replace(/\(\s*\)/g, ' ').replace(/\s*([/|·–—-])\s*$/g, '')
        .replace(/\s+/g, ' ').trim();
      return /[A-Za-z0-9]/.test(clean) ? clean : (fallback === undefined ? 'غير متاح' : fallback);
    }
    function arabicField(value, fallback) {
      var text = String(value == null ? '' : value).trim();
      return text && !/[پچژگکی]/.test(text) ? text : fallback;
    }
    function orgTypeArabic(value) { return ORG_TYPE_AR[value] || 'جهة فضائية حكومية'; }
    function sectorArabic(value) { return SECTOR_AR[value] || 'الفضاء والأنشطة ذات الصلة'; }
    function productTypeArabic(value) { return PRODUCT_TYPE_AR[value] || 'نوع المنتج غير محدد'; }
    function productClassArabic(value) { return PRODUCT_CLASS_AR[value] || 'فئة المنتج غير محددة'; }
    function statusArabic(value) { return STATUS_AR[value] || 'حالة غير محددة'; }
    function timeframeArabic(value) {
      return safeEnglish(value, '').replace(/\\bto\\b/gi, '–').replace(/\\bPresent\\b/gi, 'الآن');
    }
  `;
  const api = vm.runInContext(
    `${rendererSource}\n${helpers}\n${agencyDetailSource}\n${openDetailSource}\n({renderAgencyCompanyArabic, renderAgencyDetail, openDetail, detail, detailBody, window})`,
    context
  );
  return api;
}

function renderViaOpenDetail(api, company) {
  api.detailBody.innerHTML = '';
  api.openDetail({ kind: 'agency', cat: 'agency', o: company });
  return api.detailBody.innerHTML;
}

function englishNarrativeFields(company) {
  const values = [
    company.flagship_prod_expl_en,
    company.flagship_prog_expl_en,
    company.future_roadmap_en,
    company.notable_missions_detail_en,
    company.partnerships_detail_en,
    ...(company.timeline_en || []).map(event => event.text),
    ...(company.products_list_bilingual || []).flatMap(product => [product.specs_en, product.role_en]),
    ...(company.programs_list_bilingual || []).flatMap(program => [
      program.objective_en, program.budget_en, program.partners_en, program.next_step_en
    ])
  ];
  return values.filter(value => typeof value === 'string' && value.trim());
}

test('the 33 agency records have complete Arabic profiles and retain both existing languages', () => {
  assert.equal(agencies.length, 33);
  for (const company of agencies) {
    for (const key of ['ar', 'ar_d', 'en', 'en_d', 'fa', 'fa_d']) {
      assert.ok(company[key], `${company.id}.${key} is missing`);
    }
    assert.ok(company.ar !== company.en && company.ar_d !== company.en_d,
      `${company.id} Arabic fields must not overwrite English`);
    for (const key of ROOT_AR_FIELDS) {
      assert.ok(company[key], `${company.id}.${key} is missing`);
    }
    for (const [index, product] of (company.products_list_bilingual || []).entries()) {
      for (const key of PRODUCT_AR_FIELDS) assert.ok(product[key], `${company.id}.product[${index}].${key} is missing`);
    }
    for (const [index, program] of (company.programs_list_bilingual || []).entries()) {
      for (const key of PROGRAM_AR_FIELDS) assert.ok(program[key], `${company.id}.program[${index}].${key} is missing`);
    }
    for (const [index, event] of (company.timeline_en || []).entries()) {
      assert.ok(event.text_ar, `${company.id}.timeline[${index}].text_ar is missing`);
    }
    for (const image of company.gallery || []) assert.ok(image.title_ar, `${company.id} gallery image lacks Arabic title`);
  }
});

test('Arabic data uses Arabic-script explanatory text, Latin technical digits, and no Persian-only letters', () => {
  const translatedValues = [];
  for (const company of agencies) {
    for (const key of ['ar', 'ar_d', ...ROOT_AR_FIELDS]) translatedValues.push(`${company.id}.${key}`, company[key]);
    for (const [index, product] of (company.products_list_bilingual || []).entries()) {
      for (const key of PRODUCT_AR_FIELDS) translatedValues.push(`${company.id}.product[${index}].${key}`, product[key]);
    }
    for (const [index, program] of (company.programs_list_bilingual || []).entries()) {
      for (const key of PROGRAM_AR_FIELDS) translatedValues.push(`${company.id}.program[${index}].${key}`, program[key]);
    }
    for (const [index, event] of (company.timeline_en || []).entries()) translatedValues.push(`${company.id}.timeline[${index}]`, event.text_ar);
    for (const [index, image] of (company.gallery || []).entries()) translatedValues.push(`${company.id}.gallery[${index}]`, image.title_ar);
  }
  for (let i = 0; i < translatedValues.length; i += 2) {
    const key = translatedValues[i];
    const value = translatedValues[i + 1];
    assert.match(value, /[\u0600-\u06FF]/, `${key} should include Arabic script`);
    assert.doesNotMatch(value, PERSIAN_ONLY, `${key} contains Persian-only orthography`);
    assert.doesNotMatch(value, NON_LATIN_DIGITS, `${key} must use Latin technical digits`);
  }
  assert.equal(satelliteMakers.length, 26);
  assert.equal(launch.length, 61);
  assert.equal(propulsion.length, 44);
  assert.ok(satelliteMakers.every(company => company.ar && company.ar_d));
  assert.ok(launch.every(company => company.ar && company.ar_d));
  assert.ok(propulsion.every(company => company.ar && company.ar_d));
});

test('all labels used by agency profiles map to Arabic', () => {
  const api = agencyApi();
  renderViaOpenDetail(api, agencies[0]);
  const maps = api.window.__agencyMaps;
  const products = agencies.flatMap(company => company.products_list_bilingual || []);
  const agencyStatuses = agencies.map(company => company.flagship_prod_status_en).filter(Boolean);
  const productStatuses = products.map(product => product.status_en).filter(Boolean);
  const countries = [...new Set(agencies.flatMap(company => String(company.country || '').split(/\s*\/\s*/).filter(Boolean)))];
  for (const value of new Set(agencies.map(company => company.org_type_en))) assert.ok(maps.ORG_TYPE_AR[value], `unmapped organization type: ${value}`);
  for (const value of new Set(agencies.map(company => company.sectors_en))) assert.ok(maps.SECTOR_AR[value], `unmapped sector: ${value}`);
  for (const value of new Set(products.map(product => product.type_en).filter(Boolean))) assert.ok(maps.PRODUCT_TYPE_AR[value], `unmapped product type: ${value}`);
  for (const value of new Set(products.map(product => product.class_en).filter(Boolean))) assert.ok(maps.PRODUCT_CLASS_AR[value], `unmapped product class: ${value}`);
  for (const value of new Set([...agencyStatuses, ...productStatuses])) assert.ok(maps.STATUS_AR[value], `unmapped status: ${value}`);
  for (const value of countries) assert.ok(maps.COUNTRY_AR[value], `unmapped country/region: ${value}`);
});

test('the real openDetail route follows the Persian dossier layout with Arabic content and no English narrative', () => {
  assert.match(app, /function renderAgencyDetail\(p\)\s*\{\s*if \(LANG === "ar"\) return renderAgencyCompanyArabic\(p\);/,
    'Arabic agency detail route must dispatch to the Arabic renderer');
  assert.match(app, /if \(cat === "agency" \|\| \(p\.o && p\.o\.cat === "agency"\)\)\s*\{\s*\$\("#detailBody"\)\.innerHTML = renderAgencyDetail\(p\);/,
    'openDetail must invoke the agency detail renderer for an agency record');

  const api = agencyApi();
  const outputs = new Map();
  for (const company of agencies) {
    const output = renderViaOpenDetail(api, company);
    assert.ok(output.includes(company.ar), `${company.id} rendered header should use its Arabic name`);
    assert.equal(api.detail.attributes['data-ent'], 'org', `${company.id} should use the organization detail rail`);
    assert.equal((output.match(/class="site-tab-btn/g) || []).length, 3, `${company.id} should keep the Persian template's three tabs`);
    assert.doesNotMatch(output, /compTabGallery/, `${company.id} must not add an Arabic-only gallery tab`);
    assert.ok(output.indexOf('id="compTabOverview"') < output.indexOf('id="compTabProducts"'));
    assert.ok(output.indexOf('id="compTabProducts"') < output.indexOf('id="compTabTimeline"'));
    assert.equal((output.match(/<details class="acc"/g) || []).length,
      (company.products_list_bilingual || []).length, `${company.id} product accordions should match the Persian template; programs stay compact cards`);
    const productsTabAt = output.indexOf('id="compTabProducts"');
    const timelineTabAt = output.indexOf('id="compTabTimeline"');
    const missionsAt = output.indexOf('المهمات الفضائية البارزة');
    if (company.notable_missions_detail_ar) assert.ok(missionsAt > productsTabAt && missionsAt < timelineTabAt,
      `${company.id} notable missions should stay in the products tab as in Persian`);
    if (company.future_roadmap_ar) assert.ok(output.indexOf(company.future_roadmap_ar) > timelineTabAt,
      `${company.id} roadmap should stay in the timeline tab`);
    if (company.partnerships_detail_ar) assert.ok(output.indexOf(company.partnerships_detail_ar) > timelineTabAt,
      `${company.id} partnerships should stay in the timeline tab`);
    outputs.set(company.id, { html: output, text: normalized(output) });
  }

  for (const company of agencies) {
    const { html: output, text } = outputs.get(company.id);
    const expected = [
      company.ar, company.ar_d, ...ROOT_AR_FIELDS.map(key => company[key]),
      ...((company.products_list_bilingual || []).flatMap(product => PRODUCT_AR_FIELDS.map(key => product[key]))),
      ...((company.programs_list_bilingual || []).flatMap(program => PROGRAM_VISIBLE_AR_FIELDS.map(key => program[key]))),
      ...((company.timeline_en || []).map(event => event.text_ar))
    ];
    for (const field of expected) {
      assert.ok(text.includes(normalized(field)), `${company.id} does not display translated content: ${field}`);
    }
    for (const english of englishNarrativeFields(company)) {
      const phrase = normalized(english);
      if (phrase.length > 10) {
        assert.ok(!text.includes(phrase), `${company.id} leaks English explanatory text: ${phrase}`);
      }
    }
    assert.doesNotMatch(text, PERSIAN_ONLY, `${company.id} rendered output contains Persian-only orthography`);
    assert.doesNotMatch(text, NON_LATIN_DIGITS, `${company.id} rendered output contains non-Latin digits`);
  }

  const allAgencyHtml = [...outputs.values()].map(value => value.html).join(' ');
  for (const label of ['الملف التعريفي والبرامج الرئيسة', 'المنتجات والبرامج', 'التاريخ والشبكة', 'المقر الرئيسي', 'نوع الجهة', 'مجالات العمل', 'الفئة الفيزيائية للنظام', 'الحالة التشغيلية', 'أول إطلاق', 'المواصفات الفنية والمعايير', 'الدور التشغيلي والمهمة المدارية', 'الهدف العام', 'الخطوة التالية', 'التاريخ والخط الزمني', 'المهمات الفضائية البارزة', 'خارطة الطريق الاستراتيجية للتطوير', 'الدبلوماسية الفضائية والشراكات الدولية']) {
    assert.ok(allAgencyHtml.includes(label), `agency renderer is missing Arabic UI label: ${label}`);
  }
  const nasaText = outputs.get('nasa').text;
  assert.match(nasaText, /NASA/);
  assert.match(nasaText, /Artemis/);
  assert.match(nasaText, /Orion/);
  assert.match(nasaText, /James Webb/);
});

test('missing Arabic fallbacks never expose untranslated Persian or English descriptions', () => {
  const api = agencyApi();
  const synthetic = {
    ...agencies[0],
    ar: '', ar_d: '', city_ar: '', country: 'Unmapped Fictional Republic',
    flagship_product_ar: '', flagship_prod_expl_ar: '', flagship_program_ar: '', flagship_prog_expl_ar: '',
    future_roadmap_ar: '', partnerships_detail_ar: '', notable_missions_detail_ar: '',
    en_d: 'English profile narrative that must not be shown',
    flagship_prod_expl_en: 'English product description that must not be shown',
    flagship_prog_expl_en: 'English program description that must not be shown',
    future_roadmap_en: 'English roadmap that must not be shown',
    partnerships_detail_en: 'English partnership prose that must not be shown',
    products_list_bilingual: [{
      name_en: 'Example Technical Product', type_en: 'Remote Sensing Satellite', class_en: 'LEO Earth Observation Satellite',
      first_flight_en: '2024', status_en: 'Operational', specs_en: 'English specifications must not be shown',
      role_en: 'English product role must not be shown'
    }],
    programs_list_bilingual: [{
      name_en: 'Example Technical Program', authority_en: 'NASA', timeline_en: '2024-2030',
      objective_en: 'English objective must not be shown', budget_en: 'English budget must not be shown',
      partners_en: 'English partners must not be shown', next_step_en: 'English next step must not be shown'
    }],
    timeline_en: [{ year: '۲۰۲۴', text: 'English timeline event must not be shown' }],
    gallery: [{ url: 'assets/img/missions/unknown.jpg', title: 'Persian image title', title_ar: '' }]
  };
  const output = renderViaOpenDetail(api, synthetic);
  const text = normalized(output);
  for (const expected of [
    'لا يتوفر وصف عربي موثّق لهذه الجهة حالياً.',
    'غير محدد',
    'لا يتوفر وصف عربي موثّق لهذا المنتج حالياً.',
    'لا يتوفر وصف عربي موثّق لهذا البرنامج حالياً.',
    'حدث تاريخي غير متوفر بالعربية حالياً.'
  ]) assert.ok(text.includes(expected), `missing Arabic fallback: ${expected}`);
  assert.doesNotMatch(output, /compTabGallery/, 'the Arabic dossier should follow the Persian template without an extra gallery tab');
  for (const forbidden of [
    'English profile narrative that must not be shown',
    'English product description that must not be shown',
    'English program description that must not be shown',
    'English roadmap that must not be shown',
    'English partnership prose that must not be shown',
    'English specifications must not be shown',
    'English product role must not be shown',
    'English objective must not be shown',
    'English budget must not be shown',
    'English partners must not be shown',
    'English next step must not be shown',
    'English timeline event must not be shown',
    'Persian image title'
  ]) assert.ok(!text.includes(forbidden), `fallback leaked source text: ${forbidden}`);
  assert.doesNotMatch(text, PERSIAN_ONLY);
  assert.doesNotMatch(text, NON_LATIN_DIGITS);
});

test('the global asset cache token is current and the country profile uses Arabic agency cards', () => {
  assert.ok(html.includes('window.ORBITA_V = "20261030country08";'));
  const countrySource = sourceBetween('  function renderCountryProfile(p) {', '  window.isEntityInCountry = isEntityInCountry;');
  assert.match(countrySource, /isAr \? \(item\.ar \|\| item\.en \|\| item\.fa\)/,
    'country profile cards prefer an agency Arabic name');
  assert.match(countrySource, /isAr \? \(item\.city_ar \|\| item\.city \|\| item\.city_fa \|\| "—"\)/,
    'country profile cards prefer the localized agency city');
  assert.match(countrySource, /isAr \? \(item\.org_type_ar \|\| "وكالة فضاء"\)/,
    'country profile cards use an Arabic organization-type label');
  assert.match(countrySource, /var shortDesc = desc\(item\);/,
    'country profile agency cards use the locale-aware description renderer');
});

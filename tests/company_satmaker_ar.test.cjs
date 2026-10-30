// Regression tests for the Arabic satellite-manufacturer dossier slice.
// Run with: node tests/company_satmaker_ar.test.cjs
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'assets/js/app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const companies = JSON.parse(fs.readFileSync(path.join(root, 'data/companies.json'), 'utf8'));
const makers = companies.filter(company => company.cat === 'satmaker');
const agencies = companies.filter(company => company.cat === 'agency');
const launch = companies.filter(company => company.cat === 'launch');
const propulsion = companies.filter(company => company.cat === 'propulsion');
const arabic = /[\u0600-\u06FF]/;
const persianOnly = /[پچژگکی]/;
const arabicFields = ['ar', 'ar_d', 'maker_class_ar', 'specialty_ar', 'flagship_product_ar',
  'flagship_product_app_ar', 'satellites_built_ar'];
let passed = 0;
let failed = 0;

function check(condition, label) {
  if (condition) {
    console.log('PASS ' + label);
    passed++;
  } else {
    console.error('FAIL ' + label);
    failed++;
  }
}

check(makers.length === 26, 'the satellite-manufacturer slice contains 26 records');
check(makers.every(company => arabicFields.every(field => company[field] && arabic.test(company[field]))),
  'all 26 manufacturers have Arabic names, summaries, classes, specialties, products, uses, and build records');
check(makers.every(company => arabicFields.every(field => !persianOnly.test(company[field]))),
  'all newly localized manufacturer fields use Arabic orthography, with no Persian-only letters');
check(makers.every(company => company.en && company.fa && company.en_d && company.fa_d),
  'the original English and Persian manufacturer fields remain intact');
check(makers.reduce((sum, company) => sum + (company.product_lines_bilingual || []).length, 0) === 108 &&
  makers.reduce((sum, company) => sum + (company.milestones_en || []).length, 0) === 150,
  'all 108 product lines and 150 source milestones remain available');
check(agencies.length === 33 && agencies.every(company => company.ar && company.ar_d) &&
  launch.length === 61 && launch.every(company => company.ar && company.ar_d) &&
  propulsion.length === 44 && propulsion.every(company => company.ar && company.ar_d),
  'the previously localized agency, launch, and propulsion slices remain intact');
check(companies.filter(company => company.cat !== 'satmaker').every(company =>
  !company.maker_class_ar && !company.specialty_ar && !company.flagship_product_app_ar && !company.satellites_built_ar),
  'manufacturer-specific Arabic fields were not added to other categories');
check(app.includes('if (LANG === "ar") return renderSatmakerCompanyArabic(p);'),
  'Arabic satellite-maker dossiers use the dedicated renderer');
check(app.includes('مصنّعو الأقمار الصناعية ومكوّناتها') && app.includes('المنتجات والعملاء') &&
  app.includes('الإنجازات والخطط') && app.includes('محطات بارزة') &&
  app.includes('نوع المنتج:') && app.includes('الفئة:</b>') &&
  app.includes('الوصف الهندسي') && app.includes('يُستخدم في:') && app.includes('سجل الأقمار والمكوّنات'),
  'the dossier tabs and key manufacturer labels are Arabic');
check(html.includes('window.ORBITA_V = "20261030country06";'),
  'the HTML cache version is bumped for the satellite-manufacturer slice');

const start = app.indexOf('  function renderSatmakerCompanyArabic(p) {');
const detailStart = app.indexOf('  function renderSatmakerDetail(p) {');
const detailEnd = app.indexOf('\n  window.renderSatmakerDetail = renderSatmakerDetail;', detailStart);
let renderer;
let rendered = '';
let context;

function contextFor(lang) {
  const byId = new Map(companies.map(company => [company.id, company]));
  return {
    LANG: lang,
    window: { compById: id => byId.get(id) || null },
    esc: value => String(value == null ? '' : value).replace(/[&<>\"]/g, char =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;' })[char]),
    name: company => lang === 'ar' ? (company.ar || company.en || company.fa || '') :
      (lang === 'fa' ? (company.fa || company.en || '') : (company.en || company.fa || '')),
    desc: company => lang === 'ar' ? (company.ar_d || company.en_d || '') :
      (lang === 'fa' ? (company.fa_d || company.en_d || '') : (company.en_d || company.fa_d || '')),
    cell: (label, value) => value ? '<div class="cell"><small>' + String(label) + '</small><b>' + String(value) + '</b></div>' : '',
    countryNameAr: () => null
  };
}

if (start >= 0 && detailStart > start) {
  let source = app.slice(start, detailStart);
  const tail = '    return h;\n  }';
  const at = source.lastIndexOf(tail);
  if (at >= 0) {
    source = source.slice(0, at) +
      '    window.__arabicMaps = {COUNTRY_AR, MAKER_CLASS_AR, STATUS_AR, PRODUCT_TYPE_AR, PRODUCT_CLASS_AR, SATMAKER_AR_COPY};\n' +
      source.slice(at);
  }
  context = contextFor('ar');
  try {
    renderer = vm.runInNewContext(source + '\nrenderSatmakerCompanyArabic;', context);
    rendered = makers.map(company => renderer({ o: company, cat: 'satmaker' })).join(' ');
  } catch (error) {
    console.error('Arabic satellite-manufacturer renderer error:', error);
  }
}
const visible = rendered.replace(/<[^>]*>/g, ' ').replace(/&(?:amp|lt|gt|quot);/g, ' ');
check(Boolean(renderer) && makers.every(company => rendered.includes(company.ar) && rendered.includes(company.ar_d)),
  'the Arabic renderer executes for all 26 manufacturers and displays each localized name and summary');
check(!persianOnly.test(visible), 'rendered manufacturer dossiers contain no Persian-only letters');
check(makers.every(company => rendered.includes(company.flagship_product_ar) &&
  rendered.includes(company.flagship_product_app_ar) && rendered.includes(company.satellites_built_ar)),
  'the Arabic flagship products, applications, and build records render for every manufacturer');
check(makers.every(company => (company.product_lines_bilingual || []).every(item =>
  !item.name_en || rendered.includes(item.name_en.replace(/&/g, '&amp;')))),
  'official Latin product-line names remain available in the product catalogue');
check(rendered.includes('OneWeb') && rendered.includes('Galileo') && rendered.includes('GLONASS') &&
  rendered.includes('Meteosat') && rendered.includes('ISS'),
  'official constellation, satellite, and programme names remain available as secondary/source text');
check(rendered.includes('نبذة تاريخية') && rendered.includes('تطور المنتجات') &&
  rendered.includes('العملاء') && rendered.includes('الخطط المستقبلية المعلنة'),
  'history, customers, product evolution, and future-plan content remain present');

if (context && context.window.__arabicMaps) {
  const maps = context.window.__arabicMaps;
  const statuses = [...new Set(makers.flatMap(company =>
    (company.product_lines_bilingual || []).map(item => item.status_en).filter(Boolean)))];
  const makerClasses = [...new Set(makers.map(company => company.maker_class_en))];
  const countries = [...new Set(makers.map(company => company.country))];
  check(makerClasses.every(value => maps.MAKER_CLASS_AR[value]),
    'all manufacturer classes have an Arabic mapping');
  check(statuses.every(value => maps.STATUS_AR[value]),
    'all nine product-line statuses have Arabic mappings');
  check(countries.every(value => maps.COUNTRY_AR[value]),
    'all manufacturer countries have Arabic labels');
}

const copyMap = context && context.window.__arabicMaps && context.window.__arabicMaps.SATMAKER_AR_COPY;
function isArabicCopy(value) {
  return typeof value === 'string' && arabic.test(value) && !persianOnly.test(value);
}
check(Boolean(copyMap) && makers.every(company => {
  const copy = copyMap[company.id];
  const products = company.product_lines_bilingual || [];
  const milestones = company.milestones_en || [];
  return copy && isArabicCopy(copy.history) && isArabicCopy(copy.productHistory) &&
    Object.keys(copy.customers || {}).length === (company.customers_en || []).length &&
    (company.customers_en || []).every(source => isArabicCopy(copy.customers[source])) &&
    Object.keys(copy.missions || {}).length === (company.notable_missions_en || []).length &&
    (company.notable_missions_en || []).every(source => isArabicCopy(copy.missions[source])) &&
    Object.keys(copy.plans || {}).length === (company.future_plans_en || []).length &&
    (company.future_plans_en || []).every(source => isArabicCopy(copy.plans[source])) &&
    Object.keys(copy.products || {}).length === products.length && products.every(product => {
      const row = copy.products[product.name_en];
      return row && row.length === 5 && row.every(isArabicCopy);
    }) &&
    Object.keys(copy.milestones || {}).length === milestones.length && milestones.every(milestone => {
      const key = String(milestone.year || '') + '|' + String(milestone.title_en || milestone.title || '');
      const row = copy.milestones[key];
      return row && row.length === 2 && row.every(isArabicCopy);
    });
}), 'Arabic copy covers all 26 histories, product lines, customers, missions, plans, and 150 milestones');
check(Boolean(renderer) && makers.every(company => {
  const copy = copyMap && copyMap[company.id];
  if (!copy) return false;
  const output = renderer({ o: company, cat: 'satmaker' });
  const strings = [copy.history, copy.productHistory, ...Object.values(copy.customers),
    ...Object.values(copy.missions), ...Object.values(copy.plans),
    ...Object.values(copy.products).flat(), ...Object.values(copy.milestones).flat()];
  return strings.every(value => output.includes(value));
}), 'the complete Arabic content is rendered in the real Arabic dossier for every manufacturer');
check(makers.every(company => {
  const output = renderer({ o: company, cat: 'satmaker' });
  return !output.includes(company.history_en || '\u0000') &&
    !output.includes(company.product_history_en || '\u0000') &&
    (company.product_lines_bilingual || []).every(product =>
      !output.includes(product.used_on_en || '\u0000') && !output.includes(product.engineering_desc_en || '\u0000')) &&
    (company.milestones_en || []).every(milestone => !output.includes(milestone.desc || '\u0000')) &&
    (company.notable_missions_en || []).every(text => !output.includes(text)) &&
    (company.future_plans_en || []).every(text => !output.includes(text));
}), 'English narrative source text is not exposed in Arabic history, product, or timeline sections');

// Exercise openDetail() itself, then compare its real output with the Persian route.
function makeRoutedRenderer(lang) {
  const sourceStart = lang === 'ar' ? start : detailStart;
  const openStart = app.indexOf('  function openDetail(p) {');
  const openEnd = app.indexOf('\n  function openSide(focus) {', openStart);
  if (sourceStart < 0 || detailEnd <= sourceStart || openStart < 0 || openEnd <= openStart) return null;
  const routeContext = contextFor(lang);
  let output = '';
  const detail = { setAttribute() {}, classList: { add() {} }, scrollTop: 0 };
  const detailBody = {};
  Object.defineProperty(detailBody, 'innerHTML', {
    get: () => output,
    set: value => { output = value; }
  });
  routeContext.document = { getElementById: () => detail };
  routeContext.$ = selector => selector === '#detailBody' ? detailBody : detail;
  routeContext.on = () => {};
  try {
    const source = app.slice(sourceStart, detailEnd) + app.slice(openStart, openEnd);
    const openDetail = vm.runInNewContext(source + '\nopenDetail;', routeContext);
    return profile => {
      output = '';
      openDetail(profile);
      return output;
    };
  } catch (error) {
    console.error(`${lang} openDetail route error:`, error);
    return null;
  }
}
const routedArabic = makeRoutedRenderer('ar');
const routedPersian = makeRoutedRenderer('fa');
const routedEnglish = makeRoutedRenderer('en');
check(Boolean(routedArabic) && Boolean(routedPersian) && Boolean(routedEnglish) &&
  makers.every(company => routedArabic({ o: company, cat: 'satmaker' }).includes(company.ar)),
  'the actual openDetail() path renders Arabic, Persian, and English satmaker profiles');
function tabIds(markup) {
  return [...markup.matchAll(/onclick="switchCompTab\('([^']+)'/g)].map(match => match[1]);
}
check(Boolean(routedArabic) && Boolean(routedPersian) &&
  JSON.stringify(tabIds(routedArabic({ o: makers[0], cat: 'satmaker' }))) === JSON.stringify(['overview', 'products', 'timeline']) &&
  JSON.stringify(tabIds(routedPersian({ o: makers[0], cat: 'satmaker' }))) === JSON.stringify(['overview', 'products', 'timeline']),
  'Arabic and Persian satellite-maker profiles use the same three tabs in the same order');

function structuralSignature(markup) {
  const tags = markup.match(/<\/?[a-zA-Z][^>]*>/g) || [];
  return tags.map(token => {
    const closing = /^<\//.test(token);
    const tag = token.match(/^<\/?([a-zA-Z][\w:-]*)/)[1].toLowerCase();
    if (closing) return `/${tag}`;
    const stable = ['class', 'id', 'style', 'type'].map(attribute => {
      const match = token.match(new RegExp('(?:^|\\s)' + attribute + '="([^"]*)"'));
      return match ? `${attribute}=${match[1].replace(/\s+/g, ' ').trim()}` : '';
    }).filter(Boolean);
    const hasOpen = /(?:^|\s)open(?:\s|>)/.test(token);
    if (hasOpen) stable.push('open');
    return `<${tag}${stable.length ? ' ' + stable.join(' ') : ''}>`;
  }).join('');
}
let parity = Boolean(routedArabic && routedPersian);
let parityId = '';
if (parity) {
  for (const company of makers) {
    const arShape = structuralSignature(routedArabic({ o: company, cat: 'satmaker' }));
    const faShape = structuralSignature(routedPersian({ o: company, cat: 'satmaker' }));
    if (arShape !== faShape) {
      parity = false;
      parityId = company.id;
      break;
    }
  }
}
if (!parity) console.error('First Arabic/Persian structural mismatch:', parityId || '(renderer unavailable)');
check(parity,
  'the production Arabic and Persian satellite-maker dossiers share the same DOM structure across all 26 records');

const sharedDetail = app.slice(detailStart, detailEnd);
const sharedDetailHash = crypto.createHash('sha256').update(sharedDetail).digest('hex');
check(sharedDetailHash === '2ec1033b3e74e41a28d7eeed096da9beea0e7e88f5130e40c6f7f3b94b9b6952',
  'the shared Persian/English satellite-maker renderer remains unchanged');

if (renderer) {
  const synthetic = {
    ...makers[0],
    id: 'fallback-synthetic',
    ar: 'اسم عربي', ar_d: 'وصف عربي', en: 'Fallback Space Company',
    city: 'مدينة فارسی', country: 'دولة فارسی',
    maker_class_ar: '', maker_class_en: 'صنف فارسی', specialty_ar: '', specialty_en: 'تخصص فارسی',
    flagship_product_ar: 'منتج رئيس عربي', flagship_product_en: 'منتج فارسی',
    flagship_product_status_en: 'حالة فارسی', flagship_product_app_ar: 'استخدام عربي',
    flagship_product_app_en: 'تطبيق فارسی', satellites_built_ar: 'سجل بناء عربي',
    satellites_built_en: 'سجل فارسی', history_en: 'History فارسی', product_history_en: 'Products فارسی',
    customers_en: ['عميل فارسی'], notable_missions_en: ['مهمة فارسی'], future_plans_en: ['خطة فارسی'],
    product_lines_bilingual: [{ name_en: 'Product Alpha', type_en: 'نوع فارسی', class_en: 'فئة فارسی',
      status_en: 'حالة فارسی', used_on_en: 'مهمة فارسی', engineering_desc_en: 'شرح فارسی' }],
    milestones_en: [{ year: '۲۰۲۶', title: 'حدث فارسی', desc: 'تفصيل فارسی' }]
  };
  try {
    const output = renderer({ o: synthetic, cat: 'satmaker' });
    const text = output.replace(/<[^>]*>/g, ' ');
    check(!persianOnly.test(text) && text.includes('Fallback Space Company') && text.includes('2026') &&
      text.includes('غير محدد') && text.includes('وصف هندسي عربي') &&
      text.includes('معلومات الاستخدام غير متاحة بالعربية حالياً'),
      'untranslated source fields use safe Arabic fallbacks and Latin technical digits');
  } catch (error) {
    console.error('Synthetic manufacturer fallback test error:', error);
    check(false, 'untranslated source fields use safe Arabic fallbacks');
  }
}

console.log(`${passed} PASS / ${failed} FAIL`);
process.exitCode = failed ? 1 : 0;

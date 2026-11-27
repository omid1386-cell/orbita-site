'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root,'assets/js/app.js'),'utf8');
const fast = JSON.parse(fs.readFileSync(path.join(root,'data/country_profile_fast_v1.json'),'utf8'));
const categories = 'launch propulsion agency satmaker components payloads ground_services inspace_services university_space test_facility ground_station mission_control'.split(' ');
const byId = new Map();
for (const cat of categories) {
  for (const row of JSON.parse(fs.readFileSync(path.join(root,'data',`companies_${cat}.json`),'utf8'))) {
    const key = String(row.id);
    if (!byId.has(key) || (byId.get(key).__orbita_fast_summary && !row.__orbita_fast_summary)) byId.set(key,row);
  }
}
const original = {
  companies: [...byId.values()].filter(x=>!x.alias_of_id),
  sites: JSON.parse(fs.readFileSync(path.join(root,'data/sites.json'),'utf8')),
  recoveries: JSON.parse(fs.readFileSync(path.join(root,'data/recovery_sites.json'),'utf8')).sites
};
assert.equal(fast.schema_version,1);
for (const t of ['companies','sites','recoveries']) {
  assert.equal(fast[t].length,original[t].length,`same canonical ${t} count`);
  assert.deepEqual(fast[t].map(r=>String(r.id)),original[t].map(r=>String(r.id)),`same ${t} IDs and order`);
}
const selectedFields = 'id cat secondary_categories country country_fa country_ar en fa ar en_d fa_d ar_d city city_fa city_ar location location_fa location_ar loc loc_fa loc_ar lat lon org_type_en org_type_fa org_type_ar maker_class_fa maker_class_en maker_class_ar specialty_fa specialty_en specialty_ar propulsion_category_fa propulsion_category_en propulsion_category_ar recovery_type_fa recovery_type_en recovery_type_ar status logo logo_bg website website_url site official_website contacts linkedin linkedin_url'.split(' ');
for (const type of ['companies','sites','recoveries']) {
  original[type].forEach((row,i)=> {
    const preview=fast[type][i];
    for (const key of selectedFields) assert.deepEqual(preview[key],row[key],`${type} ${row.id}.${key}`);
    if (row.logo_data) {
      assert.ok(/^assets\/img\/country-profile-fast\//.test(preview.logo_data), 'local projected image URL');
      const file=path.join(root,preview.logo_data);
      assert.ok(fs.existsSync(file),'projected image exists');
      const base64=row.logo_data.slice(row.logo_data.indexOf(',')+1);
      assert.equal(fs.readFileSync(file).toString('base64'),Buffer.from(base64,'base64').toString('base64'),'embedded bytes unchanged');
    }
  });
}
// Preserve 14 category counts and totals for every country in the geo dataset;
// compare the original matching function, not a simplified ISO-only substitute.
const matchStart=app.indexOf('  function isEntityInCountry(entity, targetEn, targetFa) {');
const matchEnd=app.indexOf('\n  function extractEntityLinks(',matchStart);
assert.ok(matchStart>0 && matchEnd>matchStart);
const matching={};
vm.runInNewContext(app.slice(matchStart,matchEnd)+'\nthis.match = isEntityInCountry;',matching);
const includes=(row,category)=>[row.cat,...(row.secondary_categories||[])].includes(category);
const categoryBreakdown=(p, en, fa)=> {
  const cats=categories.map(k=>p.companies.filter(c=>matching.match(c,en,fa)&&includes(c,k)));
  const unique = new Set(cats.flat().map(c=>String(c.id)));
  const nSites=p.sites.filter(s=>matching.match(s,en,fa)).length;
  const nRecoveries=p.recoveries.filter(s=>matching.match(s,en,fa)).length;
  return [...cats.map(r=>r.length),nSites,nRecoveries,unique.size+nSites+nRecoveries];
};
const countries=JSON.parse(fs.readFileSync(path.join(root,'assets/geo/countries_simplified.json'),'utf8')).features;
for (const feature of countries) {
  const props=feature.properties || {};
  const en=props.NAME,fa=props.NAME_FA||en;
  assert.deepEqual(categoryBreakdown(fast,en,fa),categoryBreakdown(original,en,fa),`country counts match for ${en}`);
}
const renderStart=app.indexOf('  function renderCountryProfile(p) {');
const renderEnd=app.indexOf('  window.isEntityInCountry = isEntityInCountry;',renderStart);
assert.ok(renderStart>0&&renderEnd>renderStart);
const sandbox={
  LANG:'fa', DATA:{companies:original.companies,sites:original.sites,recoveries:original.recoveries},
  canonicalCompanyRecords:()=>original.companies,
  isEntityInCountry:matching.match,
  companyBelongsToCategory:includes,
  name:(r)=>sandbox.LANG==='fa'?(r.fa||r.en||''):sandbox.LANG==='ar'?(r.ar||r.en||r.fa||''):(r.en||r.fa||''),
  desc:(r)=>sandbox.LANG==='fa'?(r.fa_d||r.en_d||''):sandbox.LANG==='ar'?(r.ar_d||(r.live?'':(r.en_d||''))):(r.en_d||r.fa_d||''),
  layerName:(k)=>k,
  countryOf:(en)=>en,
  countryNameAr:(en)=>en,
  countryNameKey:(name)=>String(name||'').toLowerCase(),
  flagCodesFor:()=>['globe'],
  fallbackLogoDataUri:()=>'',
  fallbackImageErrorAttribute:()=>'',
  logoZoomAttrs:()=>'',
  extractEntityLinks:(r)=>({ webUrl:r.site||r.website||null,displayWeb:null,linkedinUrl:r.linkedin||null,displayLinkedin:null }),
  esc:(value)=>String(value==null?'':value).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])),
  countryProfileDeferredTabs:Object.create(null)
};
vm.runInNewContext(app.slice(renderStart,renderEnd)+'\nthis.render = renderCountryProfile;',sandbox);
const countrySamples=[['United States','ایالات متحده'],['China','چین'],['Germany','آلمان'],['Algeria','الجزایر'],['India','هند']];
for (const lang of ['fa','en','ar']) {
  sandbox.LANG=lang;
  for (const [en,fa] of countrySamples) {
    sandbox.countryProfileFastData=null;
    const normal=sandbox.render({country_en:en,country_fa:fa});
    sandbox.countryProfileFastData=fast;
    const compact=sandbox.render({country_en:en,country_fa:fa});
    const norm=x=>x.replace(/<img [^>]+>/g,'<img>');
    assert.equal(norm(compact),norm(normal),`unchanged initially visible country output for ${lang}/${en}`);
  }
}
assert.match(app,/loadCountryProfileFastData\(\)\.then/);
assert.match(app,/ensureCountryProfileData\(\)\.then/);
assert.match(app,/countryProfileDeferredTabs\[tabId\]/);
console.log('PASS: V19 14-category counts for every geometry country, five sample profiles in fa/en/ar, image bytes, lazy tabs, original fallback.');

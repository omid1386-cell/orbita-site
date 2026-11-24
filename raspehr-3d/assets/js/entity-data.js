/* RASPEHR Stage 02 — Map entity adapter.
 * Uses the 2026-11-21 canonical data files already in the main RASPEHR repo.
 * Never synthesizes coordinates; one marker per canonical entity ID.
 */
(function (global) {
  'use strict';
  const COMPANY_CATEGORIES = Object.freeze([
    'launch','propulsion','agency','satmaker','components','payloads',
    'ground_services','inspace_services','university_space','test_facility',
    'ground_station','mission_control'
  ]);
  const CATEGORIES = Object.freeze({
    launch: {fa:'شرکت‌های پرتاب',color:0xe8b65d},
    propulsion: {fa:'شرکت‌های پیشران',color:0xe38954},
    agency: {fa:'سازمان‌های فضایی',color:0x51d4c8},
    satmaker: {fa:'سازندگان ماهواره',color:0x8aabf2},
    components: {fa:'قطعات و زیرسامانه‌ها',color:0x9fbf79},
    payloads: {fa:'محموله‌ها و ابزارها',color:0xd2a1e9},
    ground_services: {fa:'خدمات زمینی و داده',color:0x70bacc},
    inspace_services: {fa:'خدمات مداری',color:0xd3a1a8},
    university_space: {fa:'دانشگاه‌ها و آزمایشگاه‌ها',color:0x7f9def},
    test_facility: {fa:'تأسیسات آزمون فضایی',color:0xffb67d},
    ground_station: {fa:'ایستگاه‌های زمینی',color:0x7ac3b1},
    mission_control: {fa:'مراکز کنترل مأموریت',color:0xb08fe0},
    site: {fa:'پایگاه‌های پرتاب',color:0xf6cb76},
    recovery: {fa:'محل‌های فرود و بازیابی',color:0x56c9ef}
  });
  const SOURCES = Object.freeze([
    {kind:'company',url:'../data/companies.json'},
    {kind:'site',url:'../data/sites.json'},
    {kind:'recovery',url:'../data/recovery_sites.json'}
  ]);
  function validCoord(value,limit) {
    return typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= limit;
  }
  function normalizedRoles(row,kind) {
    if (kind === 'site') return ['site'];
    if (kind === 'recovery') return ['recovery'];
    const input=[row.cat].concat(Array.isArray(row.secondary_categories) ? row.secondary_categories : []);
    return [...new Set(input.filter(x=>COMPANY_CATEGORIES.includes(x)))];
  }
  function label(row,field) {
    return typeof row[field]==='string' ? row[field].trim() : '';
  }
  function buildRecords(groups) {
    const all=[], markers=[], missing=[], ids=new Set(), errors=[];
    const roles={};
    Object.keys(CATEGORIES).forEach(key=>{roles[key]=0;});
    for (const source of SOURCES) {
      const items=groups[source.kind];
      if (!Array.isArray(items)) {
        errors.push('منبع ' + source.kind + ' فهرست معتبر نیست');
        continue;
      }
      for (const row of items) {
        if (!row || typeof row!=='object' || typeof row.id!=='string' || !row.id.trim()) {
          errors.push('شناسه نامعتبر در ' + source.kind);
          continue;
        }
        const key=source.kind + ':' + row.id;
        if (ids.has(key)) { errors.push('شناسه تکراری: '+ key);continue; }
        ids.add(key);
        const categories=normalizedRoles(row,source.kind);
        if (!categories.length) {errors.push('دسته نامعتبر: '+key);continue;}
        categories.forEach(cat=>roles[cat]++);
        const entry={
          key,id:row.id,kind:source.kind,category:categories[0],categories,
          fa:label(row,'fa')||label(row,'en')||row.id,
          en:label(row,'en')||label(row,'fa')||row.id,
          country:label(row,'country'),countryFa:label(row,'country')==='Israel' ? 'فلسطین اشغالی' : label(row,'country_fa'),
          city:label(row,'city'),cityFa:label(row,'city_fa'),
          lat:row.lat,lon:row.lon,
          precision:label(row,'coordinates_precision')||label(row,'coordinate_precision'),
          coordinateNote:label(row,'coordinate_note_fa'),
          // No profile body is copied. Open the original dossier in stage 4.
          source:source.url
        };
        all.push(entry);
        if(validCoord(entry.lat,90)&&validCoord(entry.lon,180)) markers.push(entry);
        else missing.push({key:entry.key,id:entry.id,kind:entry.kind,category:entry.category,
          fa:entry.fa,en:entry.en,country:entry.country,city:entry.city,
          issue:'missing_or_invalid_coordinates'});
      }
    }
    return {all,markers,missing,roles,errors,counts:{total:all.length,markers:markers.length,missing:missing.length,company:all.filter(x=>x.kind==='company').length,site:all.filter(x=>x.kind==='site').length,recovery:all.filter(x=>x.kind==='recovery').length}};
  }
  async function load(options) {
    const fetcher=(options&&options.fetch) || global.fetch.bind(global);
    const result=await Promise.allSettled(SOURCES.map(async source=>{
      const r=await fetcher(source.url,{cache:'no-cache'});
      if(!r.ok) throw new Error(source.kind+': HTTP '+r.status);
      const data=await r.json();
      const items=source.kind==='recovery' ? (data&&data.sites) : data;
      if(!Array.isArray(items)) throw new Error(source.kind+': incompatible JSON structure');
      return {kind:source.kind,items};
    }));
    const failed=result.filter(x=>x.status==='rejected');
    // Do not silently display a truncated global map as a complete catalog.
    if (failed.length) throw new Error('دریافت همه منابع نقشه موفق نبود: '+failed.map(x=>x.reason.message).join('؛ '));
    const groups={};
    result.forEach(x=>{groups[x.value.kind]=x.value.items;});
    const built=buildRecords(groups);
    if(built.errors.length) throw new Error('خطای ساختار داده مکان‌ها: '+built.errors.slice(0,4).join('؛ '));
    return built;
  }
  global.RaspehrEntityData={CATEGORIES,COMPANY_CATEGORIES,SOURCES,validCoord,buildRecords,load};
})(window);

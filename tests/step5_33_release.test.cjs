'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const load=(f)=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const all=load('data/companies.json');
const new33=all.filter(x=>x.orbita_release_note?.status==='RESEARCH_PREVIEW');
const baseHashes=load('qa/step5_baseline_274_sha256.json');
const crypto=require('node:crypto');
const h=(x)=>crypto.createHash('sha256').update(JSON.stringify(Object.fromEntries(Object.entries(x).sort()))).digest('hex');
const files=['components','payloads','ground_services','inspace_services','test_facility','ground_station','mission_control','university_space'];
const app=fs.readFileSync(path.join(root,'assets/js/app.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
function canonicalize(v){return JSON.stringify(v,Object.keys(v).sort());}
// Hashes are computed in the Python deploy manifest using recursive sorted keys.
function stable(obj){
  if(Array.isArray(obj))return obj.map(stable);
  if(obj && typeof obj==='object')return Object.fromEntries(Object.keys(obj).sort().map(k=>[k,stable(obj[k])]));
  return obj;
}
const hash=(x)=>crypto.createHash('sha256').update(JSON.stringify(stable(x))).digest('hex');

test('33 candidate profiles are added with stable unique ids; 274 prior profiles retained',()=>{
 assert.equal(new33.length,33);
 assert.equal(all.length,307);
 assert.equal(new Set(all.map(x=>x.id)).size,307);
 assert.equal(all.slice(0,274).length,274);
 const ref=all.slice(0,274);
 assert.equal(Object.keys(baseHashes.records).length,274);
 for(let i=0;i<274;i++)assert.equal(hash(ref[i]),baseHashes.records[ref[i].id], 'unchanged original record '+ref[i].id);
 for(const id of baseHashes.protected_11) assert.ok(all.find(x=>x.id===id));
});

test('category slices preserve existing 11 and cover all 33 new profiles',()=>{
 let n=0;
 for(const cat of files){
  const data=load('data/companies_'+cat+'.json');
  assert.equal(new Set(data.map(x=>x.id)).size,data.length,'duplicate id in '+cat);
  const keys=data.filter(x=>x.orbita_release_note?.status==='RESEARCH_PREVIEW').map(x=>x.id);
  const expected=new33.filter(x=>x.cat===cat).map(x=>x.id);
  assert.deepEqual(keys,expected);
  n+=keys.length;
 }
 assert.equal(n,33);
 for(const row of new33){
  assert.ok(row.lat>=-90 && row.lat<=90 && row.lon>=-180 && row.lon<=180);
  assert.ok(fs.existsSync(path.join(root,row.logo)),'missing logo '+row.id);
  assert.equal(row.logo_kind,'orbita_editorial_nonofficial');
  assert.ok(row.coordinate_precision,'coordinate provenance absent '+row.id);
 }
});

test('each specialist profile has the original five tab ids, full FA sourced claims, EN/AR synopses and valid source ids',()=>{
 const tabCodes={components:['overview','products','heritage','network','timeline'],
  payloads:['overview','catalog','missions','readiness','development'],
  ground_services:['overview','services','network','capacity','clients'],
  inspace_services:['overview','fleet','missions','capabilities','roadmap'],
  test_facility:['overview','equipment','testing','standards','history'],
  ground_station:['overview','equipment','missions','coverage','history'],
  mission_control:['overview','missions','operations','network','history'],
  university_space:['overview','capabilities','missions','results','network']};
 let detailed=0, synopses=0;
 for(const row of new33){
  const pf=row.orbita_verified_profile;
  assert.deepEqual(pf.sections.map(s=>s.id),tabCodes[row.cat], row.id+' tab mismatch');
  assert.equal(pf.release_status,'RESEARCH_PREVIEW_EDITORIAL_NOT_FINAL_VERIFICATION');
  const sid=new Set(pf.sources.map(s=>s.id));
  for(const s of pf.sources)assert.ok(/^https:\/\//.test(s.url));
  for(const sec of pf.sections){
   assert.ok(sec.fa && sec.en && sec.ar);
   const enar=sec.items.filter(i=>i.show_langs.includes('en')&&i.show_langs.includes('ar'));
   assert.equal(enar.length,1);
   assert.ok(enar[0].en.length>25 && enar[0].ar.length>25);
   synopses+=1;
   const fas=sec.items.filter(i=>i.show_langs.length===1 && i.show_langs[0]==='fa');
   assert.ok(fas.length>0,'no detailed FA items '+row.id+':'+sec.id);
   for(const itm of sec.items) {
    assert.ok(itm.source_ids.length);
    assert.ok(itm.source_ids.every(x=>sid.has(x)));
   }
   detailed+=fas.length;
  }
 }
 assert.equal(synopses,165);
 assert.equal(detailed,377);
});

test('map pins, lazy-loading counts, and version tokens include all 33',()=>{
 for(const r of new33){
  assert.ok(app.includes('"'+r.id+'": { id: "orbita-personal-'+r.id+'"'), 'missing map pin '+r.id);
 }
 for(const [category,count] of Object.entries({components:15,inspace_services:3,test_facility:2,ground_station:15,mission_control:3,university_space:4})){
  assert.match(app,new RegExp('\\b'+category+': '+count+'(?:,|\\s)'));
 }
 assert.equal((html.match(/20261113-step5-33-release-v1/g)||[]).length,4);
 assert.match(app,/Array\.isArray\(item\.show_langs\) && item\.show_langs\.indexOf\(LANG\) < 0/);
});

test('legacy renderer outputs full Persian source claims but not Persian-only cards on EN/AR pages',()=>{
 const start=app.indexOf('  function renderVerifiedSpecialistProfile(p) {');
 const end=app.indexOf('  function bindVerifiedSpecialistTabs()',start);
 assert.ok(start>=0 && end>start);
 const code=app.slice(start,end);
 for(const lang of ['fa','en','ar']){
  const context={LANG:lang,
   layerName:(key)=>key,
   name:obj=>obj[lang]||obj.en,
   desc:obj=>obj[lang+'_d']||obj.en_d,
   verifiedText:obj=>typeof obj==='string'?obj:String(obj?.[lang]||obj?.en||obj?.fa||''),
   esc:obj=>String(obj==null?'':obj).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])),
   t:(label)=>label,
  };
  vm.createContext(context); vm.runInContext(code+'\nthis.render=renderVerifiedSpecialistProfile;',context);
  const row=new33.find(x=>x.id==='orbita-addnics');
  const out=context.render({o:row,cat:row.cat});
  assert.ok(out.includes(row[lang]),'missing name in '+lang);
  assert.equal((out.match(/class="site-tab-content verified-panel/g)||[]).length,5);
  assert.ok(out.includes('https://addnics.co.jp/'));
  if(lang==='fa'){
   const claim=row.orbita_verified_profile.sections[0].items.find(x=>x.show_langs[0]==='fa');
   assert.ok(out.includes(claim.fa.slice(0,30)), 'missing Persian detailed claim');
  }else{
   const faClaim=row.orbita_verified_profile.sections[0].items.find(x=>x.show_langs[0]==='fa');
   assert.ok(!out.includes(faClaim.fa.slice(0,30)),'Persian-only item leaked into '+lang);
  }
 }
});

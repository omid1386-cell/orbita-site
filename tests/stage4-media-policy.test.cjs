const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const root = path.resolve(__dirname, '..');
const catalog = JSON.parse(fs.readFileSync(path.join(root,'data/media/catalog.v1.json'),'utf8'));
const bankPath = fs.existsSync(path.join(root,'assets/js/media-bank.js'))
  ? path.join(root,'assets/js/media-bank.js')
  : '/mnt/data/ORBITA_MEDIA_STAGE3_WORK/assets/js/media-bank.js';
const bank = require(bankPath);
const agencies = catalog.entities.filter(row=>row.category==='agency');
const manifest = JSON.parse(fs.readFileSync(path.join(root,'docs/AGENCY_MEDIA_ROUND4_MANIFEST.json'),'utf8'));

test('96 agency keys preserved',()=>assert.equal(agencies.length,96));
test('verified assets visible for all covered agencies',()=>{
  const ids = agencies.filter(a=>bank.published(catalog,a.entity_key).length>0).map(a=>a.entity_id);
  assert.equal(ids.length,manifest.covered_agencies);
});
test('all currently approved assets visible',()=>{
  const n=agencies.reduce((n,a)=>n+bank.published(catalog,a.entity_key).length,0);
  assert.equal(n,manifest.approved_total);
});
test('candidate media remain unpublished, even when parent agency has verified videos',()=>{
  for(const id of ['dlr-germany','csa-canada','rosa']) {
    const e=agencies.find(a=>a.entity_id===id);
    const all=bank.published(catalog,e.entity_key);
    assert.ok(e.media.some(m=>m.verification.status==='candidate'));
    assert.ok(e.media.filter(m=>m.verification.status==='candidate').every(m=>!all.find(x=>x.media_id===m.media_id)));
  }
});
test('assets added after agency stage are individually gated by verification',()=>{
  for(const e of catalog.entities.filter(a=>a.category!=='agency')) {
    const published=bank.published(catalog,e.entity_key);
    for(const m of published) {
      assert.equal(m.verification.status,'verified');
      assert.equal(m.verification.source_verified,true);
      assert.ok(!['undetermined','restricted'].includes(m.rights.usage));
    }
  }
});
test('all clickable videos use link only',()=>{
  agencies.forEach(a=>bank.published(catalog,a.entity_key).forEach(m=>{
    if(m.kind==='video') assert.equal(m.rights.usage,'link_only');
  }));
});

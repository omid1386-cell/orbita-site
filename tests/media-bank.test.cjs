const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const registry = require('../assets/js/media-bank.js');
const catalog = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/media/catalog.v1.json'),'utf8'));

function demo(asset={}) {
  return Object.assign({
    media_id:'med-test-media-01',kind:'video',role:'operations',
    external_url:'https://www.youtube.com/watch?v=example',
    source:{url:'https://www.nasa.gov/', publisher:'NASA'},
    rights:{usage:'link_only',checked_on:'2026-11-21'},
    verification:{status:'verified', identity_match:'confirmed', source_verified:true, reviewed_on:'2026-11-21', reviewer:'Stage 2 test reviewer'}
  },asset);
}

test('420 records available in stage2 registry', () => {
  assert.equal(catalog.entities.length,420);
  assert.ok(registry.byKey(catalog, 'company_or_organization:agency:nasa'));
  assert.ok(registry.byKey(catalog, 'launch_site:launch_site:ksc39a'));
  assert.ok(registry.byKey(catalog, 'recovery_site:recovery_site:recovery-lz4'));
});
test('marker key mappings match existing app categories',()=>{
  assert.equal(registry.keyFor('site','ksc39a'),'launch_site:launch_site:ksc39a');
  assert.equal(registry.keyFor('recovery','recovery-lz4'),'recovery_site:recovery_site:recovery-lz4');
  assert.equal(registry.keyFor('agency','nasa'),'company_or_organization:agency:nasa');
  assert.equal(registry.keyFor('bad','nasa'),null);
});
test('legacy media never copied automatically into new catalog',()=>{
  assert.equal(registry.published(catalog,'company_or_organization:agency:nasa').length,3);
  assert.equal(registry.byKey(catalog,'company_or_organization:agency:nasa').legacy_media.gallery_count,3);
});
test('approved watch-only video is visible as link',()=>{
  const copy=JSON.parse(JSON.stringify(catalog));
  registry.byKey(copy,'company_or_organization:agency:nasa').media.push(demo());
  assert.equal(registry.published(copy,'company_or_organization:agency:nasa').length,4);
});
test('unverified or unlicensed assets are hidden',()=>{
  const copy=JSON.parse(JSON.stringify(catalog));
  const row=registry.byKey(copy,'company_or_organization:agency:nasa');
  row.media.push(demo({verification:{status:'candidate',identity_match:'unverified',source_verified:false}}));
  row.media.push(demo({rights:{usage:'restricted',checked_on:'2026-11-21'}}));
  row.media.push(demo({kind:'image'})); // link-only image may not be embedded
  assert.equal(registry.published(copy,row.entity_key).length,3);
});
test('retry after network failure and cache successful load',async()=>{
  registry.clearCache();
  let n=0;
  const fakeFetch=async()=>{n++; if(n===1) throw Error('offline'); return {ok:true,json:async()=>catalog};};
  await assert.rejects(registry.load('data/media/catalog.v1.json',fakeFetch));
  const result=await registry.load('data/media/catalog.v1.json',fakeFetch);
  assert.equal(result.entities.length,420);
  const cached=await registry.load('data/media/catalog.v1.json',fakeFetch);
  assert.equal(cached,result);
  assert.equal(n,2);
  registry.clearCache();
});
test('malformed catalog is rejected and retry possible',async()=>{
  registry.clearCache();
  await assert.rejects(registry.load('data/media/catalog.v1.json',async()=>({ok:true,json:async()=>({})})));
  const ok=await registry.load('data/media/catalog.v1.json',async()=>({ok:true,json:async()=>catalog}));
  assert.equal(ok.total_entities,420);
  registry.clearCache();
});

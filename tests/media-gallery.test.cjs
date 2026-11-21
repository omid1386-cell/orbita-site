const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const gallery = require('../assets/js/media-gallery.js');
const bank = require('../assets/js/media-bank.js');
const catalog = JSON.parse(fs.readFileSync(path.join(__dirname,'../data/media/catalog.v1.json')));
test('catalog has all 420 identifiers with no duplicate entity keys',()=>{
  assert.equal(catalog.total_entities,420);
  assert.equal(catalog.entities.length,420);
  assert.equal(new Set(catalog.entities.map(e=>e.entity_key)).size,420);
});
test('all 14 category types can derive a media key',()=>{
  const kinds = new Set();
  for(const e of catalog.entities){
    const c=e.category==='launch_site'?'site':e.category==='recovery_site'?'recovery':e.category;
    assert.equal(gallery.isSupported(c,e.entity_id,bank),e.entity_key);
    kinds.add(e.category);
  }
  assert.equal(kinds.size,14);
});
test('unsafe paths are rejected',()=>{
  for(const a of ['/images/a.jpg','assets/media/../secrets.jpg','assets/media//x.png','javascript:alert(1)', 'assets/media/./foo.jpg'])assert.equal(gallery.localPath(a),null);
  assert.equal(gallery.localPath('assets/media/profiles/photo-12.webp'),'assets/media/profiles/photo-12.webp');
});
test('insecure external URLs and protocols are rejected',()=>{
  for(const a of ['http://example.com','javascript:alert(1)','data:image/png;base64,bA==','https://'])assert.equal(gallery.httpsUrl(a),null);
  assert.equal(gallery.httpsUrl('https://www.nasa.gov/a.jpg'),'https://www.nasa.gov/a.jpg');
});
test('video playback requires verified direct media, never arbitrary watch pages',()=>{
  const v={kind:'video',rights:{usage:'permission_granted'},file_path:'assets/media/movie.mp4'};
  assert.equal(gallery.embeddableVideo(v),true);
  assert.equal(gallery.embeddableVideo({...v,rights:{usage:'link_only'}}),false);
  assert.equal(gallery.embeddableVideo({...v,file_path:undefined,external_url:'https://www.youtube.com/watch?v=123'}),false);
  assert.equal(gallery.embeddableVideo({...v,file_path:'assets/media/movie.mp4',kind:'image'}),false);
});
test('sort order deterministic with defaults',()=>{
  assert.deepEqual(gallery.sortedAssets([{media_id:'med-b',sort_order:2},{media_id:'med-a',sort_order:2},{media_id:'med-c',sort_order:1}]).map(e=>e.media_id),['med-c','med-a','med-b']);
});
test('production catalog publishes only specifically verified media',()=>{
  const approved=catalog.entities.flatMap(row=>bank.published(catalog,row.entity_key));
  const m=JSON.parse(fs.readFileSync(path.join(__dirname,'../docs/AGENCY_MEDIA_ROUND4_MANIFEST.json')));
  const countVisible=catalog.entities.reduce((n,e)=>n+e.media.filter(asset=>asset.verification.status==='verified' && !['undetermined','restricted'].includes(asset.rights.usage)).length,0);
  assert.equal(approved.length, countVisible);
  const agencyApproved=catalog.entities.filter(e=>e.category==='agency').flatMap(e=>bank.published(catalog,e.entity_key));
  assert.equal(agencyApproved.length, m.approved_total);
  const stage5Approved=catalog.entities.filter(e=>e.category==='launch'||e.category==='propulsion').flatMap(e=>bank.published(catalog,e.entity_key));
  const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'../docs/STAGE5_MANIFEST.json')));
  const round2=JSON.parse(fs.readFileSync(path.join(__dirname,'../docs/STAGE5_ROUND2_MANIFEST.json')));
  const increment=JSON.parse(fs.readFileSync(path.join(__dirname,'../docs/LAUNCH_MEDIA_INCREMENT_MANIFEST.json')));
  const cur=JSON.parse(fs.readFileSync(path.join(__dirname,'../RELEASE_DOCS/PROPULSION_STAGE5_FINAL/MANIFEST.json')));
  assert.equal(stage5Approved.length,cur.launch_visible_media+cur.propulsion_visible_media);
  assert.equal(catalog.entities.filter(e=>e.category==='launch'||e.category==='propulsion').filter(e=>bank.published(catalog,e.entity_key).length>0).length,cur.launch_covered+cur.propulsion_covered_after);
  assert.ok(approved.every(m=>m.verification.status==='verified'));
});

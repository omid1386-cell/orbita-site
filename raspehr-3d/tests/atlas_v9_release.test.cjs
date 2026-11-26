const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {spawnSync}=require('node:child_process');
const root = path.resolve(__dirname,'../..');
test('V9: byte-level lock protects imagery and data, including all 48 photos',()=>{
  const m = require('../RELEASE_V9_PROTECTED_SHA256.json');
  assert.equal(m.protected_site_photo_files,48);
  assert.ok(m.protected_images>=846);
  assert.ok(Object.keys(m.sha256).length>=880);
});
test('V9: offline release audit passes without claiming live approval',()=>{
  const run=spawnSync('python',['raspehr-3d/tools/atlas-v9-release-audit.py'],{cwd:root,encoding:'utf8',timeout:40000});
  assert.equal(run.status,0,run.stderr+'\n'+run.stdout.slice(0,1600));
  const report=JSON.parse(run.stdout);
  assert.equal(report.offline_audit_passed,true);
  assert.equal(report.release_approved,false);
  assert.ok(report.blocked_release_gates.length>=3);
});

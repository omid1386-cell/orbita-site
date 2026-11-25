'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const audit=require('../tools/release-audit.cjs').runAudit();
test('Priority6: canonical counts and dossier coordinate integrity',()=>{
 const ids=['all_420_dossiers_unique','all_coordinates_finite','all_23_representative_locations_disclosed','fourteen_categories'];
 assert.ok(audit.checks.filter(x=>ids.includes(x.id)).every(x=>x.passed),JSON.stringify(audit.checks));
});
test('Priority6: navigation resources and original 2D/3D profile routing are present',()=>{
 const ids=['all_local_3d_static_assets_resolve','three_state_mobile_and_original_dossier','two_dimensional_shell_intact','selection_focus_and_mobile_bridge_present'];
 assert.ok(audit.checks.filter(x=>ids.includes(x.id)).every(x=>x.passed),JSON.stringify(audit.checks));
});
test('Priority6: the local imagery code does not imply operational validation',()=>{
 assert.equal(audit.offline_status,'PASS',JSON.stringify(audit.checks));
 assert.notEqual(audit.public_release_status,'APPROVED');
 assert.ok(audit.warnings.some(x=>x.id==='external_imagery'));
 assert.ok(audit.warnings.some(x=>x.id==='physical_device'));
});

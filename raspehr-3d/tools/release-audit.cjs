#!/usr/bin/env node
'use strict';
/** RASPEHR offline release audit. Cannot certify the Render site or a physical phone. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
function json(relative){return JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));}
function runAudit(){
 const checks=[],warnings=[];
 function check(id,test){try{test();checks.push({id,passed:true});}catch(error){checks.push({id,passed:false,error:String(error&&error.message||error).slice(0,300)});}}
 const assert=require('node:assert/strict');
 const rows=[...json('data/companies.json'),...json('data/sites.json'),...json('data/recovery_sites.json').sites];
 check('all_420_dossiers_unique',()=>{assert.equal(rows.length,420);assert.equal(new Set(rows.map(x=>x.id)).size,420);});
 check('all_coordinates_finite',()=>{for(const r of rows){assert.equal(typeof r.lat,'number',r.id);assert.equal(typeof r.lon,'number',r.id);assert.ok(Number.isFinite(r.lat)&&Math.abs(r.lat)<=90,r.id);assert.ok(Number.isFinite(r.lon)&&Math.abs(r.lon)<=180,r.id);assert.ok(!(r.lat===0&&r.lon===0),r.id);}});
 const provenance=json('data/raspehr_coordinates_stage7_provenance.json');
 check('all_23_representative_locations_disclosed',()=>{assert.equal(provenance.entries.length,23);for(const a of provenance.entries){const r=rows.find(x=>x.id===a.id);assert.ok(r,a.id);assert.equal(r.lat,a.lat);assert.equal(r.lon,a.lon);assert.match(r.coordinates_precision,/^approximate_/);assert.equal(a.verification,'representative_only');assert.ok(a.uncertainty_km_estimate>0);}});
 const w={};vm.runInNewContext(fs.readFileSync(path.join(root,'raspehr-3d/assets/js/entity-data.js'),'utf8'),{window:w,console});
 check('fourteen_categories',()=>{assert.equal(Object.keys(w.RaspehrEntityData.CATEGORIES).length,14);assert.equal(w.RaspehrEntityData.buildRecords({company:json('data/companies.json'),site:json('data/sites.json'),recovery:json('data/recovery_sites.json').sites}).counts.markers,420);});
 const html=fs.readFileSync(path.join(root,'raspehr-3d/index.html'),'utf8');
 check('all_local_3d_static_assets_resolve',()=>{
  const re=/<(?:script|link)[^>]+(?:src|href)=["']([^"']+)["']/g;
  for(const match of html.matchAll(re)){
   const href=match[1].split('?')[0];if(/^https?:|^\/\//.test(href))continue;
   assert.ok(fs.existsSync(path.resolve(root,'raspehr-3d',href)),href);
  }
 });
 check('three_state_mobile_and_original_dossier',()=>{for(const id of ['mobileMainSheet','mobileSheetHandle','mobileSheetBody','dossierOverlay','dossierFrame','selectedLocationCard','selectedLocationFacility','entitySearch','entityCountry'])assert.ok(html.includes('id="'+id+'"'),id);for(const v of ['collapsed','half','full'])assert.ok(html.includes('data-mobile-snap="'+v+'"'),v);});
 check('two_dimensional_shell_intact',()=>{const shell=fs.readFileSync(path.join(root,'index.html'),'utf8');assert.ok(shell.includes('raspehrStage5Toggle'));assert.ok(shell.includes('raspehr3dOverlay'));assert.ok(shell.includes('raspehrStage5Frame'));});
 check('selection_focus_and_mobile_bridge_present',()=>{const script=fs.readFileSync(path.join(root,'raspehr-3d/assets/js/entity-markers.js'),'utf8');assert.ok(script.includes('nearestProjectedMarker'));assert.ok(script.includes('projectAnchor'));const mobile=fs.readFileSync(path.join(root,'raspehr-3d/assets/js/mobile-bottom-sheet.js'),'utf8');assert.ok(mobile.includes('mobileMainSheet'));const stage5=fs.readFileSync(path.join(root,'assets/js/raspehr-stage5-switch.js'),'utf8');assert.ok(stage5.includes('stage6-visibility'));});
 check('local_imagery_requires_explicit_interaction',()=>{const js=fs.readFileSync(path.join(root,'raspehr-3d/assets/js/local-facility-view.js'),'utf8');assert.ok(js.includes('openaerialmap'));assert.ok(js.includes('OpenStreetMap')||js.includes('Overpass'));assert.ok(js.includes('representative')||js.includes('approximate'));});
 check('no_included_dev_mock_images_in_production',()=>{const p=path.join(root,'raspehr-3d/assets/tex-tiles');assert.ok(fs.existsSync(p));});
 warnings.push({id:'physical_device',message:'رفتار روی گوشی واقعی Android/iOS هنوز بررسی نشده است.'});
 warnings.push({id:'live_render',message:'نسخه تجمیعی هنوز روی Render/GitHub منتشر و آزمایش نشده است.'});
 warnings.push({id:'external_imagery',message:'پوشش OpenAerialMap/Overpass برای مکان‌های واقعی هنوز در شبکه زنده تأیید نشده است.'});
 warnings.push({id:'approximate',message:'۲۳ پرونده مرحله هفتم دارای نقطه مرجع تقریبی‌اند؛ برای ساختمان دقیق استفاده نشوند.'});
 warnings.push({id:'legacy_tests',message:'برخی آزمون‌های قدیمی سورس دوبعدی هنوز ناموفق‌اند؛ در گزارش جداگانه بررسی شود.'});
 return {project:'RASPEHR',phase:'priority6',scope:'local_offline_only',checks,check_passed:checks.filter(x=>x.passed).length,check_failed:checks.filter(x=>!x.passed).length,warnings,offline_status:checks.every(x=>x.passed)?'PASS':'FAIL',public_release_status:'NOT_APPROVED_UNTIL_LIVE_AND_PHONE_VALIDATION'};
}
if(require.main===module){const out=runAudit();process.stdout.write(JSON.stringify(out,null,2)+'\n');process.exitCode=out.check_failed?1:0;}
module.exports={runAudit};

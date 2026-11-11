const assert = require('assert');
const fs = require('fs');const path=require('path');
const root=path.join(__dirname,'..');
const launch=JSON.parse(fs.readFileSync(path.join(root,'data/companies_launch.json'),'utf8'));
const main=JSON.parse(fs.readFileSync(path.join(root,'data/companies.json'),'utf8'));
const app=fs.readFileSync(path.join(root,'assets/js/app.js'),'utf8');
const dict=Object.fromEntries(main.map(v=>[v.id,v]));
assert.equal(launch.length,68);
for(const x of launch){
 assert(dict[x.id], 'missing company '+x.id);
 for(const field of ['stats','rockets_fleet','timeline_fa','fleet_scope_fa']) assert.deepStrictEqual(dict[x.id][field],x[field],x.id+' '+field);
 assert(x.stats.scope_fa && x.stats.scope_en,x.id+' missing scope');
 assert(Array.isArray(x.rockets_fleet) && Array.isArray(x.timeline_fa),x.id+' missing arrays');
 assert(!x.rockets_fleet.some(r=>/^Rocket .+ Gen-1$/.test(r.name)),x.id+' fabricated launcher');
 for(const r of x.rockets_fleet){
  assert(!/Chamran-1/.test(r.last_launch_en||''),x.id+' contaminated last flight');
  assert(!/Hybrid \/ Liquid Propellant \(Liquid Stage 1 \+ Solid Salman Stage 2\)/.test(r.propellant_en||''),x.id+' contaminated propellant');
 }
 const st=x.stats;for(const k of ['total_launches','success_launches','failed_launches'])assert(st[k]==null||(Number.isInteger(st[k]) && st[k]>=0),x.id+' '+k);
 if(st.total_launches!=null && st.success_launches!=null && st.failed_launches!=null)assert.equal(st.total_launches,st.success_launches+st.failed_launches,x.id+' metrics mismatch');
}
const spacex=launch.find(x=>x.id==='spacex');assert(spacex.rockets_fleet.some(x=>x.name==='Falcon 1'));
const blue=launch.find(x=>x.id==='blueorigin');assert(blue.rockets_fleet.some(x=>x.name==='New Glenn'));
const rocketlab=launch.find(x=>x.id==='rocketlab');assert(rocketlab.rockets_fleet.some(x=>x.name==='Neutron'));
const expo=launch.find(x=>x.id==='exolaunch');assert(!expo.rockets_fleet.length);
assert(app.includes('launch_sources') && app.includes('fleet_scope_fa') && app.includes('منبع مشخصات پرتابگر'));
console.log('PASS restored 68 launch profiles, structured provenance and no fabricated Gen-1 vehicles');

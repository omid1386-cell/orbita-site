#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function parse(raw){
 if(typeof raw!=='string'||raw.length>2048)return {ok:false,reason:'invalid_length_or_type'};
 let u;try{u=new URL(raw)}catch{return {ok:false,reason:'invalid_url'}};
 if(u.protocol!=='https:'||u.hostname!=='earth.google.com'||u.port||u.username||u.password||u.search||u.hash)return {ok:false,reason:'unsafe_host_or_url_parts'};
 const m=u.pathname.match(/^\/web\/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)a,(\d+(?:\.\d+)?)d,(\d+(?:\.\d+)?)y,(-?\d+(?:\.\d+)?)h,(-?\d+(?:\.\d+)?)t,(-?\d+(?:\.\d+)?)r$/);
 if(!m)return {ok:false,reason:'unsupported_earth_view_path'};
 const [lat,lon,alt,range,fov,heading,tilt,roll]=m.slice(1).map(Number);
 if(![lat,lon,alt,range,fov,heading,tilt,roll].every(Number.isFinite)||Math.abs(lat)>90||Math.abs(lon)>180||range<=0||fov<=0||fov>180||tilt<0||tilt>180)return {ok:false,reason:'camera_or_coordinate_out_of_range'};
 return {ok:true,lat,lon,altitude_m:alt,range_m:range,fov_deg:fov,heading_deg:heading,tilt_deg:tilt,roll_deg:roll};
}
function validate(payload){
 if(payload?.schema!=='raspehr-direct-earth-pilot-v1'||!Array.isArray(payload.records)||payload.records.length!==5)throw Error('Expected exactly five pilot records');
 const seen=new Set(),results=[];
 for(const r of payload.records){const key=r.kind+':'+r.id;if(seen.has(key))throw Error('duplicate '+key);seen.add(key);const p=parse(r.earth_candidate_url);if(!p.ok)throw Error(key+': '+p.reason);if(p.lat!==r.lat||p.lon!==r.lon)throw Error(key+': coordinate center mismatch');results.push({key,url_valid:true,center_matches:true,range_m:p.range_m,tilt_deg:p.tilt_deg});}
 return {records:results.length,valid_urls:results.filter(x=>x.url_valid).length,coordinate_matches:results.filter(x=>x.center_matches).length,live_open_verified:0,notice:'Offline structural validation only; does not test Google Earth rendering or imagery.'};
}
if(require.main===module){const p=process.argv[2]||path.join(__dirname,'RASPEHR_DIRECT_EARTH_LINK_PILOT_5.json');const out=validate(JSON.parse(fs.readFileSync(p,'utf8')));console.log(JSON.stringify(out,null,2));}
module.exports={parse,validate};

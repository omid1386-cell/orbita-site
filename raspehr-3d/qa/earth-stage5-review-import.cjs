'use strict';
/* RASPEHR Stage 5 — manual-review ingestion. NEVER writes the deployed registry.
   Approved candidate links require user-submitted live evidence and an explicit
   independent human approval flag on the command line. No network access. */
const fs=require('node:fs'),path=require('node:path');
const DEFAULT_REGISTRY=path.resolve(__dirname,'../data/external-links-v1.json');
function checkEarthURL(raw){
  if(typeof raw!=='string'||!raw||raw.length>2048)return {ok:false,reason:'missing_url'};
  try{
    const u=new URL(raw);
    if(u.protocol!=='https:'||u.hostname!=='earth.google.com'||u.port||u.username||u.password||!u.pathname.startsWith('/web/'))return {ok:false,reason:'unauthorized_host_or_path'};
    if(/(?:^|[?&])(?:url|redirect|dest|next)=/i.test(u.search))return {ok:false,reason:'redirect_param'};
    return {ok:true,url:u.href};
  }catch(_){return {ok:false,reason:'invalid_url'};}
}
function earthViewCenter(link){
  const c=checkEarthURL(link);if(!c.ok)return null;
  const p=new URL(c.url).pathname;
  const m=p.match(/^\/web\/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)(?:,|$)/);
  if(!m)return null;
  const lat=Number(m[1]),lon=Number(m[2]);
  if(!Number.isFinite(lat)||Math.abs(lat)>90||!Number.isFinite(lon)||Math.abs(lon)>180)return null;
  return [lat,lon];
}
function distanceKM(a,b,c,d){
 const x=Math.PI/180,dl=(c-a)*x,do_=(d-b)*x;
 const y=Math.sin(dl/2)**2+Math.cos(a*x)*Math.cos(c*x)*Math.sin(do_/2)**2;
 return 12742*Math.asin(Math.min(1,Math.sqrt(y)));
}
function locationThresholdKM(kind){return kind==='company'?3:kind==='site'?15:100;}
function evaluate(record,review){
  if(!review||review.id!==record.id||review.kind!==record.kind||review.lat!==record.lat||review.lon!==record.lon)return {eligible:false,reason:'identity_or_coordinates_mismatch'};
  const check=checkEarthURL(review.earth_url);if(!check.ok)return {eligible:false,reason:check.reason};
  const center=earthViewCenter(check.url);
  const d=center?distanceKM(record.lat,record.lon,...center):null;
  if(d!==null&&d>locationThresholdKM(record.kind))return {eligible:false,reason:'view_center_too_far',distance_km:Number(d.toFixed(3))};
  if(review.earth_result!=='correct')return {eligible:false,reason:'not_confirmed_opened_correct'};
  if(review.approved!==true)return {eligible:false,reason:'not_human_approved'};
  if(typeof review.reviewer!=='string'||!review.reviewer.trim())return {eligible:false,reason:'no_reviewer'};
  if(typeof review.evidence!=='string'||!review.evidence.trim())return {eligible:false,reason:'no_evidence'};
  if(typeof review.reviewed_at!=='string'||Number.isNaN(Date.parse(review.reviewed_at)))return {eligible:false,reason:'no_review_date'};
  if(d===null)return {eligible:false,reason:'view_center_unreadable_requires_independent_geographic_validation'};
  return {eligible:true,reason:'live_review_candidate',link:check.url,distance_km:Number(d.toFixed(3))};
}
function merge(registry,submission,independentApproval){
  if(!registry||!Array.isArray(registry.records)||registry.records.length!==420)throw Error('Expected 420 registry records');
  if(!submission||submission.format!=='raspehr-earth-stage5-review-v1'||!Array.isArray(submission.records)||submission.records.length!==420)throw Error('Unexpected review export format or count');
  const supplied=new Map();for(const review of submission.records){const k=review.kind+':'+review.id;if(supplied.has(k))throw Error('Duplicate review '+k);supplied.set(k,review);}
  const results=[],rejections=[],proposed=structuredClone(registry);
  for(const rec of proposed.records){
    const key=rec.kind+':'+rec.id,entry=supplied.get(key);
    const candidate=evaluate(rec,entry);
    if(candidate.eligible){
      results.push({key,url:candidate.link,reviewer:entry.reviewer,reviewed_at:entry.reviewed_at,evidence:entry.evidence,distance_km:candidate.distance_km});
      if(independentApproval){rec.google_earth_share_url=candidate.link;rec.google_earth_status='verified';rec.google_earth_live_checked=true;}
    }else if(entry?.earth_url){rejections.push({key,reason:candidate.reason,distance_km:candidate.distance_km||null});}
  }
  if(supplied.size!==420)throw Error('One or more review IDs do not match registry');
  proposed.stage5_earth_approval='Candidate proposal only. Not part of deployed V13 source.';
  return {proposed,accepted:results,rejected:rejections,approved_count:independentApproval?results.length:0};
}
function run(argv){
  const args={};for(let i=0;i<argv.length;i++){const a=argv[i];if(a.startsWith('--')){if(a==='--confirm-human-approval')args.confirm=true;else args[a.slice(2)]=argv[++i];}}
  if(!args.input||!args.output){throw Error('Usage: node earth-stage5-review-import.cjs --input reviews.json --output proposed.json [--reviewer independent_name --confirm-human-approval]');}
  const output=path.resolve(args.output);
  if(output===DEFAULT_REGISTRY)throw Error('Refusing to overwrite deployed registry');
  if(args.confirm&&(!args.reviewer||!String(args.reviewer).trim()))throw Error('Independent reviewer is required');
  const submission=JSON.parse(fs.readFileSync(args.input,'utf8'));
  const registry=JSON.parse(fs.readFileSync(DEFAULT_REGISTRY,'utf8'));
  const result=merge(registry,submission,!!args.confirm);
  fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(result.proposed,null,2)+'\n');
  const manifest={source:'RASPEHR Stage 5 Earth evidence',independent_reviewer:args.confirm?args.reviewer:null,confirmed:!!args.confirm,accepted_candidates:result.accepted.length,approved_for_proposal:result.approved_count,rejections:result.rejected,accepted:result.accepted,notice:'Proposed output is NOT deployed, and source registry is unchanged.'};
  fs.writeFileSync(output+'.review.json',JSON.stringify(manifest,null,2)+'\n');
  return {output,accepted_candidates:result.accepted.length,approved_for_proposal:result.approved_count,rejected:result.rejected.length};
}
if(require.main===module){try{process.stdout.write(JSON.stringify(run(process.argv.slice(2)))+'\n')}catch(e){console.error(e.message);process.exitCode=1;}}
module.exports={checkEarthURL,earthViewCenter,distanceKM,evaluate,merge,run};

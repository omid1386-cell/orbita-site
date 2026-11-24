/* RASPEHR Stage 06: device-aware render policy. No external dependency. */
(function(global){
 'use strict';
 const MODES=['auto','economy','balanced','detail'];
 function policy(info,mode){
  info=info||{};mode=MODES.includes(mode)?mode:'auto';
  const width=Number(info.width)||1280;
  const mobile=width<=700||!!info.coarse;
  const memory=Number(info.memory)||0;
  const cores=Number(info.cores)||0;
  const constrained=!!info.saveData||(memory>0&&memory<=2)||(cores>0&&cores<=2);
  const moderate=constrained||(mobile&&((memory>0&&memory<=4)||(cores>0&&cores<=4)));
  const selected=mode==='auto'?(moderate?'economy':'balanced'):mode;
  const options={
    economy:{fps:30,pixelCap:1,quality:'low',prefetch:false},
    balanced:{fps:45,pixelCap:1.35,quality:'balanced',prefetch:!moderate},
    detail:{fps:60,pixelCap:1.8,quality:'high',prefetch:true}
  };
  const result=Object.assign({mode:selected,requestedMode:mode,constrained,moderate,mobile},options[selected]);
  if(result.quality==='high'&&(moderate||mobile))result.quality='balanced';
  if(moderate)result.prefetch=false;
  return result;
 }
 function hints(){
  const nav=global.navigator||{};
  let coarse=false;
  try{coarse=!!(global.matchMedia&&global.matchMedia('(pointer: coarse)').matches);}catch(_){}
  return {width:Number(global.innerWidth)||1280,coarse,memory:Number(nav.deviceMemory)||0,
   cores:Number(nav.hardwareConcurrency)||0,saveData:!!(nav.connection&&nav.connection.saveData)};
 }
 global.RaspehrStage6Performance={policy,hints,MODES};
})(window);

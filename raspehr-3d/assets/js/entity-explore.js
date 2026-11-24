/* RASPEHR Stage 03 — search, canonical country/category filters and screen-space clusters.
 * Pure data functions: do not change canonical records and never synthesize missing locations.
 */
(function (global) {
  'use strict';
  function normalize(value) {
    return String(value == null ? '' : value)
      .normalize('NFKC')
      .replace(/[يى]/g,'ی').replace(/ك/g,'ک')
      .replace(/[\u064B-\u065F\u0670\u200C\u200D\u0640]/g,'')
      .replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-0x06F0))
      .replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-0x0660))
      .toLocaleLowerCase('en-US')
      .replace(/[^\p{L}\p{N}]+/gu,' ').trim().replace(/\s+/g,' ');
  }
  function searchText(record) {
    return normalize([record.key, record.id, record.fa, record.en,
      record.country, record.countryFa, record.city, record.cityFa,
      ...(record.categories || [])].filter(Boolean).join(' '));
  }
  function filter(records, options) {
    const settings=options||{};
    const query=normalize(settings.query||'');
    const tokens=query ? query.split(' ').filter(Boolean) : [];
    const selected=new Set(settings.categories || []);
    const country=settings.country||'';
    return records.filter(row=>{
      if (country && row.country!==country) return false;
      if (selected.size && !(row.categories||[]).some(category=>selected.has(category)))return false;
      // An explicit empty category selection must mean no items, not all items.
      if (settings.categories && !selected.size) return false;
      if (tokens.length) {
        const haystack=searchText(row);
        if (!tokens.every(t=>haystack.includes(t)))return false;
      }
      return true;
    });
  }
  function countries(records) {
    const map=new Map();
    records.forEach(row=>{
      if (!row.country)return;
      const display=row.country==='Israel' ? 'فلسطین اشغالی' : (row.countryFa||row.country);
      if (!map.has(row.country))map.set(row.country,{value:row.country,label:display});
    });
    return [...map.values()].sort((a,b)=>a.label.localeCompare(b.label,'fa'));
  }
  function centralGeo(rows) {
    // Average unit vectors instead of geographic angles, handling the date line correctly.
    let x=0,y=0,z=0;
    for (const row of rows) {
      const p=row.lat*Math.PI/180,l=row.lon*Math.PI/180;
      x+=Math.cos(p)*Math.cos(l);y+=Math.sin(p);z-=Math.cos(p)*Math.sin(l);
    }
    const length=Math.hypot(x,y,z);
    if(length<1e-8)return {lat:rows[0].lat,lon:rows[0].lon};
    x/=length;y/=length;z/=length;
    return {lat:Math.atan2(y,Math.hypot(x,z))*180/Math.PI,lon:Math.atan2(-z,x)*180/Math.PI};
  }
  function cluster(records, project, radius) {
    const r=Math.max(16,Number(radius)||48), cell=r;
    const grid=new Map(), clusters=[], singles=[], visible=[], positions=new Map();
    const cellKey=(a,b)=>a+','+b;
    for(const row of records){
      const at=project(row);
      if(!at || !Number.isFinite(at.x) || !Number.isFinite(at.y) || at.visible===false)continue;
      visible.push(row);
      positions.set(row.key,at);
      const gx=Math.floor(at.x/cell), gy=Math.floor(at.y/cell);
      let best=null, bestDist=r*r;
      for(let ix=gx-1;ix<=gx+1;ix++)for(let iy=gy-1;iy<=gy+1;iy++){
        for(const group of grid.get(cellKey(ix,iy))||[]){
          const distance=(at.x-group.x)**2+(at.y-group.y)**2;
          if(distance<bestDist){bestDist=distance;best=group;}
        }
      }
      if(best){
        best.rows.push(row);
        const n=best.rows.length;
        const nx=best.x+(at.x-best.x)/n, ny=best.y+(at.y-best.y)/n;
        const ngX=Math.floor(nx/cell), ngY=Math.floor(ny/cell);
        if(best.gx!==ngX || best.gy!==ngY){
          const old=grid.get(cellKey(best.gx,best.gy));old.splice(old.indexOf(best),1);
          if(!grid.has(cellKey(ngX,ngY)))grid.set(cellKey(ngX,ngY),[]);
          grid.get(cellKey(ngX,ngY)).push(best);best.gx=ngX;best.gy=ngY;
        }
        best.x=nx;best.y=ny;
      }else{
        const group={x:at.x,y:at.y,gx,gy,rows:[row]};
        if(!grid.has(cellKey(gx,gy)))grid.set(cellKey(gx,gy),[]);
        grid.get(cellKey(gx,gy)).push(group);clusters.push(group);
      }
    }
    const grouped=[];
    for (const group of clusters) {
      if (group.rows.length===1){singles.push(group.rows[0]);continue;}
      const center=centralGeo(group.rows);
      // A cluster must be anchored to an ACTUAL member location, not a
      // synthesized geographic centroid. Pick the screen-space medoid.
      let anchor=group.rows[0],bestDistance=Infinity;
      for(const row of group.rows){
        const pos=positions.get(row.key);
        if(!pos)continue;
        const distance=(pos.x-group.x)**2+(pos.y-group.y)**2;
        if(distance<bestDistance){bestDistance=distance;anchor=row;}
      }
      grouped.push({
        key:'cluster:'+group.rows.map(row=>row.key).sort().join('|'),
        id:'',kind:'cluster',category:'cluster',categories:[...new Set(group.rows.flatMap(row=>row.categories||[]))],
        isCluster:true,count:group.rows.length,members:group.rows.slice(),
        lat:center.lat,lon:center.lon,anchor:{lat:anchor.lat,lon:anchor.lon,key:anchor.key},x:group.x,y:group.y
      });
    }
    return {singles,clusters:grouped,visibleCount:visible.length};
  }
  global.RaspehrEntityExplore={normalize,searchText,filter,countries,centralGeo,cluster};
})(window);

#!/usr/bin/env python3
"""RASPEHR: offline verification of external Google Maps URLs against canonical data.
No Google request is made; no claim of live map availability, accuracy, imagery, or 3D.
"""
import argparse
from collections import Counter, defaultdict
from pathlib import Path
import csv, hashlib, json, math, sys
from urllib.parse import urlparse, parse_qs

ROOT = Path(__file__).resolve().parent.parent.parent
APP = ROOT/'raspehr-3d'


def pairs():
    sources=[('data/companies.json','company',None),('data/sites.json','site',None),('data/recovery_sites.json','recovery','sites')]
    entries={}
    for rel,kind,field in sources:
        obj=json.loads((ROOT/rel).read_text(encoding='utf-8'))
        for item in obj[field] if field else obj:
            key=f"{kind}:{item['id']}"
            if key in entries: raise ValueError('canonical ID duplicated: '+key)
            entries[key]=item
    return entries


def expected_maps(lat,lon):
    from urllib.parse import quote
    return 'https://www.google.com/maps/search/?api=1&query='+quote(f'{lat:g},{lon:g}',safe='')


def expected_sat(lat,lon,kind):
    from urllib.parse import quote
    zoom={'company':16,'site':15,'recovery':11}[kind]
    return 'https://www.google.com/maps/@?api=1&map_action=map&center='+quote(f'{lat:g},{lon:g}',safe='')+f'&zoom={zoom}&basemap=satellite'


def canonical(value):
    # JavaScript number-to-string and Python :g differ for values like 0.0000123.
    # Prefer semantically parsed coordinates, not byte equality with a fixed format.
    return abs(value)


def parse_maps(url,kind):
    if not isinstance(url,str) or len(url)>2048: return None
    try:
        u=urlparse(url)
        if u.scheme!='https' or u.netloc!='www.google.com' or u.username or u.password or u.port: return None
        if u.fragment:return None
        q=parse_qs(u.query,keep_blank_values=True,strict_parsing=True)
        if any(len(v)!=1 for v in q.values()):return None
        if q.get('api')!=['1']:return None
        if kind=='position':
            if u.path!='/maps/search/' or set(q)!={'api','query'}:return None
            coord=q['query'][0]
            return tuple(float(x) for x in coord.split(',')) if coord.count(',')==1 else None
        if u.path!='/maps/@' or set(q)!={'api','map_action','center','zoom','basemap'}:return None
        if q['map_action']!=['map'] or q['basemap']!=['satellite']:return None
        zoom=int(q['zoom'][0]);
        if not 0<=zoom<=21:return None
        coord=q['center'][0]
        latlon=tuple(float(x) for x in coord.split(',')) if coord.count(',')==1 else None
        return (latlon,zoom)
    except (ValueError,KeyError,TypeError,OverflowError):return None


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--json-out',type=Path)
    parser.add_argument('--csv-out',type=Path)
    opt=parser.parse_args()
    catalog=pairs()
    data=json.loads((APP/'data/external-links-v1.json').read_text(encoding='utf-8'))
    records=data['records']
    by_coordinate=defaultdict(list)
    for r in records:by_coordinate[(r['lat'],r['lon'])].append(f"{r['kind']}:{r['id']}")
    warnings=[];failures=[];rows=[];seen=set()
    counts=Counter()
    for r in records:
        key=f"{r['kind']}:{r['id']}"
        if key in seen:failures.append(f'duplicate id: {key}')
        seen.add(key)
        source=catalog.get(key)
        if not source:
            failures.append('missing canonical source '+key);continue
        if not all(isinstance(r.get(v),(int,float)) and not isinstance(r.get(v),bool) and math.isfinite(r[v]) for v in ('lat','lon')):
            failures.append('invalid coordinate '+key);continue
        if not -90<=r['lat']<=90 or not -180<=r['lon']<=180:failures.append('out of range '+key)
        if r['lat']!=source['lat'] or r['lon']!=source['lon']:failures.append('coordinate mismatch '+key)
        coords=(r['lat'],r['lon'])
        p=parse_maps(r.get('google_maps_url'),'position')
        s=parse_maps(r.get('google_maps_satellite_url'),'satellite')
        if p!=coords:failures.append('invalid position URL '+key)
        if s!=(coords,{'company':16,'site':15,'recovery':11}.get(r['kind'])):failures.append('invalid satellite URL '+key)
        if r.get('google_maps_live_checked') is not False or r.get('google_maps_satellite_live_checked') is not False:
            warnings.append('live check flag set; must be accompanied by separate evidence: '+key)
        if r.get('google_earth_status')=='verified' or r.get('google_earth_live_checked') is True:
            warnings.append('Earth verified flag requires independent review: '+key)
        group=by_coordinate[coords]
        precision=r.get('coordinate_accuracy_label_fa','')
        note=r.get('geo_review_note_fa','')
        if r['kind']=='recovery':risk='zone/reference'
        elif r['id']=='sea-launch':risk='mobile/historical'
        elif 'مرجع' in precision or 'تقریبی' in precision:risk='reference/approximate'
        elif 'دقت ثبت نشده' in precision:risk='unverified precision'
        else:risk='has provenance; not externally verified'
        if len(group)>1:counts['shared_coordinate_records']+=1
        if note:counts['special_review_notes']+=1
        counts['kind_'+r['kind']]+=1
        counts['risk_'+risk]+=1
        rows.append({
            'id':r['id'],'kind':r['kind'],'fa':source.get('fa',''),
            'lat':r['lat'],'lon':r['lon'],'coordinate_accuracy':precision,
            'coordinate_role':r.get('coordinate_role_fa',''),
            'review_priority':risk,'review_note':note,
            'shared_coordinate_count':len(group),
            'shared_with':'; '.join(k for k in group if k!=key),
            'maps_url':r.get('google_maps_url',''),
            'satellite_url':r.get('google_maps_satellite_url',''),
            'maps_live_verified':bool(r.get('google_maps_live_checked')),
            'satellite_live_verified':bool(r.get('google_maps_satellite_live_checked')),
            'earth_share_verified':bool(r.get('google_earth_live_checked')),
        })
    if len(records)!=420:failures.append('registry not 420: '+str(len(records)))
    if len(catalog)!=420:failures.append('canonical not 420: '+str(len(catalog)))
    if seen!=set(catalog):failures.append('registry/source ID sets mismatch')
    if [counts.get('kind_'+kind) for kind in ('company','site','recovery')]!=[321,79,20]:failures.append('kind counts mismatch')
    if sum(bool(r['maps_live_verified']) for r in rows)>0:
        warnings.append('live verified flags present; check per-entry evidence')
    grouped={f'{lat},{lon}':v for (lat,lon),v in by_coordinate.items() if len(v)>1}
    result={
      'project':'RASPEHR','stage':'DIRECT_LINKS_STAGE1_V14','date':'2026-11-26',
      'offline_structural_pass':not failures,'location_count':len(records),
      'maps_position_urls':sum(bool(r.get('google_maps_url')) for r in records),
      'maps_satellite_urls':sum(bool(r.get('google_maps_satellite_url')) for r in records),
      'source_breakdown':{kind:counts.get('kind_'+kind,0) for kind in ('company','site','recovery')},
      'shared_coordinate_groups':len(grouped),'shared_coordinate_records':counts['shared_coordinate_records'],
      'shared_coordinate_details':grouped,
      'special_geo_review_notes':counts['special_review_notes'],
      'coordinate_review_groups':{k[5:]:v for k,v in sorted(counts.items()) if k.startswith('risk_')},
      'google_maps_live_verified':sum(r['maps_live_verified'] for r in rows),
      'google_satellite_live_verified':sum(r['satellite_live_verified'] for r in rows),
      'google_earth_live_verified':sum(r['earth_share_verified'] for r in rows),
      'warnings':warnings,'failures':failures,
      'real_browser_tested':False,'google_remote_map_content_tested':False,
      'images_modified':False,'release_approved':False,
      'note':'Valid URL shape and canonical coordinates do not certify a physical building, image freshness, Street View, or 3D coverage.'}
    if opt.json_out:
        opt.json_out.parent.mkdir(parents=True,exist_ok=True)
        opt.json_out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    if opt.csv_out:
        opt.csv_out.parent.mkdir(parents=True,exist_ok=True)
        with opt.csv_out.open('w',encoding='utf-8-sig',newline='') as file:
            writer=csv.DictWriter(file,fieldnames=list(rows[0]))
            writer.writeheader();writer.writerows(rows)
    print(json.dumps(result,ensure_ascii=False,indent=2))
    return 1 if failures else 0

if __name__=='__main__':sys.exit(main())

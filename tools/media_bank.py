#!/usr/bin/env python3
"""ORBITA Media Bank v1 — offline, stdlib-only registry management.

This module never modifies original profile data or downloads third-party media.
"""
import argparse
import csv
import datetime as dt
import json
import os
from pathlib import Path
import re
import sys
import tempfile
from collections import Counter

ENTITY_TYPES = {'company_or_organization', 'launch_site', 'recovery_site'}
CATEGORIES = {
    'agency', 'launch', 'propulsion', 'satmaker', 'components', 'ground_station',
    'university_space', 'inspace_services', 'test_facility', 'mission_control',
    'ground_services', 'payloads', 'launch_site', 'recovery_site',
}
MEDIA_KINDS = {'image', 'video'}
MEDIA_ROLES = {'facility', 'operations', 'product', 'mission', 'launch', 'landing',
               'equipment', 'historical', 'overview', 'other'}
MEDIA_STATES = {'candidate', 'verified', 'rejected'}
IDENTITY_STATES = {'unverified', 'confirmed', 'rejected'}
RIGHTS_STATES = {'undetermined', 'public_domain', 'permission_granted',
                 'attribution_required', 'link_only', 'restricted'}
SAFE_RIGHTS = {'public_domain', 'permission_granted', 'attribution_required', 'link_only'}
DATE = re.compile(r'^\d{4}-\d{2}-\d{2}$')
MEDIA_ID = re.compile(r'^med-[a-z0-9][a-z0-9-]{3,79}$')
MEDIA_EXT = re.compile(r'\.(?:jpg|jpeg|png|webp|avif|mp4|webm)$', re.IGNORECASE)
SHA256 = re.compile(r'^[a-f0-9]{64}$')
ENTITY_ID = re.compile(r'^[^:/\\\s][^:/\\]*$')
DEFAULT_CATALOG = Path(__file__).resolve().parents[1] / 'data/media/catalog.v1.json'


class ValidationError(ValueError):
    pass


def check_date(value, ctx, errors, *, required=False):
    if not value:
        if required:
            errors.append(f'{ctx}: تاریخ لازم است')
        return
    if not isinstance(value, str) or not DATE.fullmatch(value):
        errors.append(f'{ctx}: قالب تاریخ YYYY-MM-DD لازم است')
        return
    try:
        dt.date.fromisoformat(value)
    except ValueError:
        errors.append(f'{ctx}: تاریخ واقعی نیست')


def safe_https(value):
    if not isinstance(value, str):
        return False
    from urllib.parse import urlsplit
    try:
        u = urlsplit(value)
        return (u.scheme == 'https' and bool(u.hostname) and
                not u.username and not u.password and not any(c.isspace() for c in value))
    except ValueError:
        return False


def safe_media_path(value):
    if not isinstance(value, str):
        return False
    if not value.startswith('assets/media/') or '\\' in value or '\x00' in value:
        return False
    parts = value.split('/')
    return all(p not in ('.', '..', '') for p in parts) and not value.startswith('/')


def key_for(entity_type, category, entity_id):
    return f'{entity_type}:{category}:{entity_id}'


def validate_media(asset, ctx):
    errors = []
    if not isinstance(asset, dict):
        return [f'{ctx}: رسانه باید شیء باشد']
    mid = asset.get('media_id')
    if not isinstance(mid, str) or not MEDIA_ID.fullmatch(mid):
        errors.append(f'{ctx}: media_id باید با med- شروع شود و یکتا باشد')
    kind = asset.get('kind')
    if kind not in MEDIA_KINDS:
        errors.append(f'{ctx}: kind نامعتبر')
    if asset.get('role') not in MEDIA_ROLES:
        errors.append(f'{ctx}: role نامعتبر')
    filepath = asset.get('file_path')
    external = asset.get('external_url')
    if bool(filepath) == bool(external):
        errors.append(f'{ctx}: دقیقاً یکی از file_path یا external_url لازم است')
    if filepath and not safe_media_path(filepath):
        errors.append(f'{ctx}: مسیر فایل فقط زیر assets/media/ مجاز است')
    if filepath and (not MEDIA_EXT.search(filepath) or
                     (kind == 'image' and not re.search(r'\.(jpg|jpeg|png|webp|avif)$',filepath,re.I)) or
                     (kind == 'video' and not re.search(r'\.(mp4|webm)$',filepath,re.I))):
        errors.append(f'{ctx}: فرمت فایل رسانه با نوع آن سازگار نیست')
    if asset.get('thumbnail_path') and (not safe_media_path(asset['thumbnail_path']) or
            not re.search(r'\.(jpg|jpeg|png|webp|avif)$',asset['thumbnail_path'],re.I)):
        errors.append(f'{ctx}: thumbnail_path باید تصویر امن در assets/media باشد')
    for dim in ('width','height','duration_seconds','sort_order'):
        if dim in asset and (type(asset[dim]) not in (int,float) or asset[dim] < 0):
            errors.append(f'{ctx}: مقدار {dim} باید عدد غیرمنفی باشد')
    if asset.get('file_sha256') and not SHA256.fullmatch(asset['file_sha256']):
        errors.append(f'{ctx}: هش فایل SHA-256 نامعتبر')
    check_date(asset.get('captured_on'), ctx+'.captured_on', errors)
    if external and not safe_https(external):
        errors.append(f'{ctx}: external_url فقط HTTPS معتبر')
    captions = asset.get('caption')
    if not isinstance(captions, dict) or not any(
            isinstance(captions.get(k), str) and captions.get(k).strip()
            for k in ('fa', 'en', 'ar')):
        errors.append(f'{ctx}: دست‌کم یک عنوان فارسی/انگلیسی/عربی لازم است')
    source = asset.get('source')
    if not isinstance(source, dict) or not safe_https(source.get('url')):
        errors.append(f'{ctx}: آدرس HTTPS منبع اصلی لازم است')
    elif not isinstance(source.get('publisher'), str) or not source['publisher'].strip():
        errors.append(f'{ctx}: ناشر منبع لازم است')
    rights = asset.get('rights')
    if not isinstance(rights, dict) or rights.get('usage') not in RIGHTS_STATES:
        errors.append(f'{ctx}: وضعیت مجوز حقوقی نامعتبر')
        rights = {}
    if rights.get('proof_url') and not safe_https(rights['proof_url']):
        errors.append(f'{ctx}: proof_url باید HTTPS باشد')
    if rights.get('usage') == 'attribution_required' and not rights.get('credit'):
        errors.append(f'{ctx}: ثبت نام صاحب اثر برای انتساب الزامی است')
    if rights.get('usage') == 'attribution_required' and not rights.get('license'):
        errors.append(f'{ctx}: نوع مجوز استفاده با انتساب لازم است')
    if rights.get('usage') == 'public_domain' and not (rights.get('proof_url') or rights.get('license')):
        errors.append(f'{ctx}: دلیل/نوع وضعیت عمومی بودن اثر لازم است')
    if rights.get('usage') == 'permission_granted' and not rights.get('proof_url'):
        errors.append(f'{ctx}: سند مجوز باید در proof_url ثبت شود')
    if rights.get('usage') == 'link_only' and not external:
        errors.append(f'{ctx}: رسانه link_only باید external_url داشته باشد')
    check_date(rights.get('checked_on'), ctx+'.rights.checked_on', errors)
    verification = asset.get('verification')
    if not isinstance(verification, dict) or verification.get('status') not in MEDIA_STATES:
        errors.append(f'{ctx}: وضعیت بررسی رسانه نامعتبر')
        verification = {}
    if verification.get('identity_match') not in IDENTITY_STATES:
        errors.append(f'{ctx}: تطبیق هویت رسانه نامعتبر')
    if not isinstance(verification.get('source_verified'), bool):
        errors.append(f'{ctx}: source_verified باید مقدار بولی باشد')
    check_date(verification.get('reviewed_on'), ctx+'.reviewed_on', errors,
               required=(verification.get('status') == 'verified'))
    if verification.get('status') == 'verified':
        if verification.get('identity_match') != 'confirmed' or not verification.get('source_verified'):
            errors.append(f'{ctx}: انتشار بدون تأیید هویت و منبع مجاز نیست')
        if rights.get('usage') not in SAFE_RIGHTS:
            errors.append(f'{ctx}: مجوز نشر بررسی نشده یا محدود است')
        if kind == 'image' and rights.get('usage') == 'link_only':
            errors.append(f'{ctx}: تصویر link_only نباید در گالری داخلی منتشر شود')
        if not rights.get('checked_on'):
            errors.append(f'{ctx}: تاریخ بررسی مجوز لازم است')
        if not isinstance(verification.get('reviewer'),str) or not verification['reviewer'].strip():
            errors.append(f'{ctx}: ثبت نام بررسی‌کننده برای رسانه تأییدشده لازم است')
    check_date(asset.get('added_on'), ctx+'.added_on', errors, required=True)
    return errors


def validate_catalog(catalog, *, expected_total=None):
    errors = []
    if not isinstance(catalog, dict):
        return ['کاتالوگ باید شیء JSON باشد']
    if catalog.get('schema_version') != '1.0.0':
        errors.append('schema_version باید 1.0.0 باشد')
    entities = catalog.get('entities')
    if not isinstance(entities, list):
        return errors + ['entities باید آرایه باشد']
    if expected_total is not None and len(entities) != expected_total:
        errors.append(f'تعداد المان‌ها باید {expected_total} باشد، نه {len(entities)}')
    if catalog.get('total_entities') != len(entities):
        errors.append('total_entities با شمار رکوردها مطابقت ندارد')
    seen_keys, seen_media_ids = set(), set()
    for i, row in enumerate(entities):
        ctx = f'entities[{i}]'
        if not isinstance(row, dict):
            errors.append(ctx+': شیء لازم است')
            continue
        typ, cat, eid, key = (row.get(x) for x in
                               ('entity_type', 'category', 'entity_id', 'entity_key'))
        if typ not in ENTITY_TYPES or cat not in CATEGORIES:
            errors.append(ctx+': نوع یا دسته نامعتبر')
        if typ == 'launch_site' and cat != 'launch_site':
            errors.append(ctx+': دسته پایگاه پرتاب نادرست است')
        if typ == 'recovery_site' and cat != 'recovery_site':
            errors.append(ctx+': دسته محل فرود نادرست است')
        if typ == 'company_or_organization' and cat in ('launch_site', 'recovery_site'):
            errors.append(ctx+': دسته سازمان/شرکت نادرست است')
        if not isinstance(eid, str) or not ENTITY_ID.fullmatch(eid):
            errors.append(ctx+': شناسه المان نامعتبر')
        elif key != key_for(typ, cat, eid):
            errors.append(ctx+': کلید مرکب نادرست است')
        if key in seen_keys:
            errors.append(ctx+': کلید المان تکراری است')
        seen_keys.add(key)
        if not isinstance(row.get('names'), dict) or not row['names'].get('en'):
            errors.append(ctx+': نام انگلیسی لازم است')
        if not isinstance(row.get('source_data_file'), str) or not row['source_data_file'].startswith('data/'):
            errors.append(ctx+': فایل مرجع نادرست است')
        if row.get('review_status') not in ('pending', 'in_progress', 'reviewed'):
            errors.append(ctx+': review_status نامعتبر')
        if row.get('preserve_current_hero_photo') is not None and not isinstance(row.get('preserve_current_hero_photo'), bool):
            errors.append(ctx+': preserve_current_hero_photo باید بولی باشد')
        if not isinstance(row.get('legacy_media'), dict):
            errors.append(ctx+': legacy_media باید شیء باشد')
        assets = row.get('media')
        if not isinstance(assets, list):
            errors.append(ctx+': media باید آرایه باشد')
            continue
        for j, item in enumerate(assets):
            errors.extend(validate_media(item, f'{ctx}.media[{j}]'))
            if isinstance(item, dict):
                mid = item.get('media_id')
                if mid in seen_media_ids:
                    errors.append(ctx+': شناسه رسانه در سراسر بانک تکراری است')
                seen_media_ids.add(mid)
    return errors


def read_catalog(path):
    with Path(path).open(encoding='utf-8') as f:
        return json.load(f)


def atomic_write(path, catalog):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temp = tempfile.mkstemp(dir=str(path.parent), prefix='.media-catalog-', suffix='.tmp')
    try:
        with os.fdopen(fd, 'w', encoding='utf-8') as file:
            json.dump(catalog, file, ensure_ascii=False, indent=2)
            file.write('\n')
            file.flush()
            os.fsync(file.fileno())
        os.replace(temp, path)
    finally:
        if os.path.exists(temp):
            os.unlink(temp)


def add_media(catalog, entity_key, media):
    rows = [r for r in catalog['entities'] if r['entity_key'] == entity_key]
    if len(rows) != 1:
        raise ValidationError(f'کلید المان ناشناخته یا تکراری: {entity_key}')
    # Append safely, then validate the ENTIRE catalog including global media uniqueness.
    rows[0]['media'].append(media)
    errors = validate_catalog(catalog)
    if errors:
        rows[0]['media'].pop()
        raise ValidationError('\n'.join(errors[:30]))
    return catalog



def replace_media(catalog, media_id, item):
    found = [(row, j) for row in catalog['entities']
             for j, old in enumerate(row['media']) if old.get('media_id') == media_id]
    if len(found) != 1:
        raise ValidationError(f'شناسه رسانه برای اصلاح پیدا نشد: {media_id}')
    if item.get('media_id') != media_id:
        raise ValidationError('در عملیات اصلاح نمی‌توان شناسه رسانه را تغییر داد')
    row, i = found[0]
    old = row['media'][i]
    row['media'][i] = item
    errors=validate_catalog(catalog)
    if errors:
        row['media'][i]=old
        raise ValidationError('\n'.join(errors[:30]))
    return catalog


def remove_media(catalog, media_id):
    found = [(row,j) for row in catalog['entities']
             for j,old in enumerate(row['media']) if old.get('media_id') == media_id]
    if len(found)!=1:
        raise ValidationError(f'شناسه رسانه برای حذف پیدا نشد: {media_id}')
    row,i=found[0]
    row['media'].pop(i)
    return catalog


def verify_local_files(catalog, repository_root):
    errors=[]
    root=Path(repository_root)
    for row in catalog['entities']:
        for asset in row['media']:
            paths=[p for p in (asset.get('file_path'),asset.get('thumbnail_path')) if p]
            if asset['verification']['status'] != 'verified':
                continue
            for path in paths:
                if not safe_media_path(path):
                    errors.append(f'مسیر نامعتبر: {path}')
                    continue
                file=root.joinpath(*path.split('/'))
                if not file.is_file() or file.is_symlink():
                    errors.append(f'فایل تأییدشده موجود نیست: {path}')
    return errors



def audit_source_entities(catalog, repo_root):
    root=Path(repo_root)
    try:
        companies=json.loads((root/'data/companies.json').read_text(encoding='utf-8'))
        sites=json.loads((root/'data/sites.json').read_text(encoding='utf-8'))
        recoveries=json.loads((root/'data/recovery_sites.json').read_text(encoding='utf-8'))['sites']
    except (OSError, KeyError, json.JSONDecodeError) as e:
        return [f'خواندن فایل‌های مرجع ناموفق: {e}']
    real={key_for('company_or_organization',r['cat'],r['id']) for r in companies}
    real.update(key_for('launch_site','launch_site',r['id']) for r in sites)
    real.update(key_for('recovery_site','recovery_site',r['id']) for r in recoveries)
    existing={r['entity_key'] for r in catalog['entities']}
    errs=[]
    for key in sorted(real-existing): errs.append(f'در کاتالوگ نیست: {key}')
    for key in sorted(existing-real): errs.append(f'در داده اصلی نیست: {key}')
    return errs


def count_stats(catalog):
    counts = Counter()
    for entity in catalog['entities']:
        counts['entities'] += 1
        counts[f"category:{entity['category']}"] += 1
        if entity['media']:
            counts['with_media_candidate'] += 1
        for item in entity['media']:
            counts['media_total'] += 1
            counts[f"kind:{item['kind']}"] += 1
            counts[f"status:{item['verification']['status']}"] += 1
    return counts


def export_coverage(catalog, output):
    p = Path(output)
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('w', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['entity_key','entity_type','category','name_en','name_fa',
                         'media_total','images','videos','verified_media','legacy_photo',
                         'legacy_gallery_count','legacy_event_video_links','review_status'])
        for e in catalog['entities']:
            items = e['media']; legacy=e['legacy_media']
            writer.writerow([e['entity_key'],e['entity_type'],e['category'],
                             e['names'].get('en',''),e['names'].get('fa',''),len(items),
                             sum(i['kind']=='image' for i in items),
                             sum(i['kind']=='video' for i in items),
                             sum(i['verification']['status']=='verified' for i in items),
                             legacy.get('profile_photo') or '',
                             legacy.get('gallery_count',0),legacy.get('event_video_link_count',0),
                             e['review_status']])


def main(argv=None):
    parser=argparse.ArgumentParser(description='ORBITA Stage 2 Media Bank; no network operations')
    parser.add_argument('--catalog',type=Path,default=DEFAULT_CATALOG)
    sp=parser.add_subparsers(dest='command',required=True)
    sub_val=sp.add_parser('validate')
    sub_val.add_argument('--check-files',action='store_true',help='Check verified local media files exist')
    sub_audit=sp.add_parser('audit-entities',help='Compare registry IDs against actual profile datasets')
    sub_audit.add_argument('--repo-root',type=Path,required=True)
    sp.add_parser('stats')
    sub_add=sp.add_parser('add',help='Register one media JSON record (catalog only)')
    sub_add.add_argument('--entity-key',required=True)
    sub_add.add_argument('--item-json',type=Path,required=True)
    sub_add.add_argument('--dry-run',action='store_true')
    sub_rep=sp.add_parser('replace',help='Replace one media record after review')
    sub_rep.add_argument('--media-id',required=True)
    sub_rep.add_argument('--item-json',type=Path,required=True)
    sub_rep.add_argument('--dry-run',action='store_true')
    sub_rm=sp.add_parser('remove',help='Remove one media record (catalog only)')
    sub_rm.add_argument('--media-id',required=True)
    sub_rm.add_argument('--dry-run',action='store_true')
    sub_csv=sp.add_parser('export-coverage')
    sub_csv.add_argument('--output',type=Path,required=True)
    args=parser.parse_args(argv)
    cat=read_catalog(args.catalog)
    errors=validate_catalog(cat)
    if errors:
        print('\n'.join(errors[:40]),file=sys.stderr)
        return 2
    if args.command=='validate':
        if args.check_files:
            errors=verify_local_files(cat,args.catalog.resolve().parents[2])
            if errors:
                print('\n'.join(errors[:40]),file=sys.stderr)
                return 2
        print(f"OK: {len(cat['entities'])} entities; schema={cat['schema_version']}")
    elif args.command=='audit-entities':
        errors=audit_source_entities(cat,args.repo_root)
        if errors:
            print('\n'.join(errors[:70]),file=sys.stderr)
            return 2
        print(f'OK: {len(cat["entities"])} registry entity keys match source records')
    elif args.command=='stats':
        for k,v in sorted(count_stats(cat).items()):
            print(f'{k}: {v}')
    elif args.command=='add':
        with args.item_json.open(encoding='utf-8') as f:
            item=json.load(f)
        try:
            add_media(cat,args.entity_key,item)
        except ValidationError as e:
            print(str(e),file=sys.stderr)
            return 2
        if not args.dry_run:
            atomic_write(args.catalog,cat)
            print(f'ADDED: {item["media_id"]} -> {args.entity_key}')
        else:
            print('DRY RUN OK — no file written')
    elif args.command=='replace':
        with args.item_json.open(encoding='utf-8') as f: item=json.load(f)
        try: replace_media(cat,args.media_id,item)
        except ValidationError as e:
            print(str(e),file=sys.stderr); return 2
        if not args.dry_run:
            atomic_write(args.catalog,cat)
        print('REPLACE OK' + (' (dry run)' if args.dry_run else ''))
    elif args.command=='remove':
        try: remove_media(cat,args.media_id)
        except ValidationError as e:
            print(str(e),file=sys.stderr); return 2
        if not args.dry_run:
            atomic_write(args.catalog,cat)
        print('REMOVE OK' + (' (dry run)' if args.dry_run else ''))
    else:
        export_coverage(cat,args.output)
        print(f'CSV written: {args.output}')
    return 0

if __name__=='__main__':
    sys.exit(main())

/* ORBITA Media Gallery, stage 3 (v1). Read-only, safe, lazily loaded.
   New media appear only when the Stage 2 registry approves them.
   No old hero photo or old gallery is overwritten. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ORBITA_MEDIA_GALLERY = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  var translations = {
    fa: {eyebrow:'آرشیو بصری رسهپه', title:'گالری تصاویر و ویدئوها', ready:'رسانهٔ تأییدشده', all:'همه', images:'تصاویر', videos:'ویدئوها', emptyTitle:'گالری این شناسنامه در حال تکمیل است', emptyText:'تصاویر و ویدئوهای معتبر پس از بررسی منبع، هویت و حق استفاده در این بخش نمایش داده می‌شوند.', none:'در این دسته رسانه‌ای ثبت نشده است.', loading:'در حال دریافت اطلاعات رسانه‌ها…', offline:'دریافت بانک رسانه انجام نشد.', retry:'تلاش دوباره', source:'مشاهده منبع', open:'مشاهده', watch:'مشاهده ویدئو', previous:'قبلی', next:'بعدی', close:'بستن', copy:'منبع و حقوق انتشار', publicDomain:'مالکیت عمومی', permitted:'استفاده با مجوز', attribution:'با ذکر منبع', linkOnly:'فقط پیوند', image:'تصویر', video:'ویدئو', navigation:'مرور تصاویر', back:'بازگشت به شناسنامه'},
    en: {eyebrow:'ORBITA VISUAL ARCHIVE', title:'Photos & videos', ready:'Verified media', all:'All', images:'Images', videos:'Videos', emptyTitle:'Media collection in progress', emptyText:'Authentic media will appear here once the source, subject and usage rights are verified.', none:'No approved media in this category.', loading:'Loading media registry…', offline:'Media registry could not be loaded.', retry:'Retry', source:'View source', open:'View', watch:'Watch video', previous:'Previous', next:'Next', close:'Close', copy:'Source and usage rights', publicDomain:'Public domain', permitted:'Used with permission', attribution:'Attribution required', linkOnly:'Link only', image:'Image', video:'Video', navigation:'Browse images', back:'Return to profile'},
    ar: {eyebrow:'الأرشيف المرئي لرسهپه', title:'الصور ومقاطع الفيديو', ready:'وسائط موثّقة', all:'الكل', images:'الصور', videos:'الفيديو', emptyTitle:'يجري استكمال معرض هذا الملف', emptyText:'تُعرض الوسائط بعد التحقق من المصدر والهوية وحقوق الاستخدام.', none:'لا توجد وسائط موثقة في هذه الفئة.', loading:'جارٍ تحميل سجل الوسائط…', offline:'تعذر تحميل سجل الوسائط.', retry:'إعادة المحاولة', source:'عرض المصدر', open:'عرض', watch:'مشاهدة الفيديو', previous:'السابق', next:'التالي', close:'إغلاق', copy:'المصدر وحقوق الاستخدام', publicDomain:'ملك عام', permitted:'بإذن', attribution:'مع ذكر المصدر', linkOnly:'رابط فقط', image:'صورة', video:'فيديو', navigation:'تصفح الصور', back:'العودة إلى الملف'}
  };
  var state = {key:null, name:'', lang:'fa', request:0, filter:'all', items:[], status:'idle', selected:0, lastFocus:null, catalog:null};
  var observer = null, dialog = null, rootPanel = null, scheduled = false;
  var dataUrl = 'data/media/catalog.v1.json';

  function tr(k) {return (translations[state.lang] || translations.fa)[k] || k;}
  function langValid(lang) {return lang === 'en' || lang === 'ar' ? lang : 'fa';}
  function text(tag, cls, value) {var e=document.createElement(tag); if (cls) e.className=cls; if (value !== undefined && value !== null) e.textContent=String(value); return e;}
  function localized(obj) {
    if (!obj || typeof obj !== 'object') return '';
    return String(obj[state.lang] || obj.en || obj.fa || obj.ar || '');
  }
  function localPath(p) {
    return typeof p === 'string' && /^assets\/media\/[\w./-]+$/i.test(p) && !/(?:^|\/)\.\.?\//.test(p) && !p.includes('//') ? p : null;
  }
  function httpsUrl(u) {
    if (typeof u !== 'string') return null;
    try {var x=new URL(u); return x.protocol === 'https:' && x.hostname ? x.href : null;} catch (e) {return null;}
  }
  function mediaUrl(media) {return localPath(media.file_path) || httpsUrl(media.external_url);}
  function imageThumbnail(media) {return localPath(media.thumbnail_path) || (media.kind === 'image' ? mediaUrl(media) : null);}
  function embeddableVideo(media) {
    if (!media || media.kind !== 'video' || media.rights.usage === 'link_only') return false;
    var u=mediaUrl(media);
    if (!u) return false;
    // Never put arbitrary video watch pages into a player or iframe.
    return /\.(?:mp4|webm|ogg)(?:\?.*)?$/i.test(u);
  }
  function sortedAssets(list) {
    return list.slice().sort(function(a,b){return (a.sort_order||0)-(b.sort_order||0) || String(a.media_id||'').localeCompare(String(b.media_id||''));});
  }
  function isSupported(cat,id,registry) {return registry && registry.keyFor && registry.keyFor(cat,id);}
  function title(asset){return localized(asset.caption) || (asset.kind === 'video' ? tr('video') : tr('image'));}
  function aria(button, str) {button.setAttribute('aria-label',str); button.title=str;}
  function button(cls,label){var e=text('button',cls,label);e.type='button';return e;}
  function mkLink(href,label,cls){var link=text('a',cls,label);link.href=href;link.target='_blank';link.rel='noopener noreferrer';return link;}

  function createDialog() {
    if (dialog && dialog.isConnected) return dialog;
    dialog=document.createElement('dialog');dialog.className='orbita-media-lightbox';dialog.id='orbitaMediaLightbox';
    dialog.setAttribute('aria-label',tr('title'));
    document.body.appendChild(dialog);
    dialog.addEventListener('click',function(e){if(e.target===dialog) closeViewer();});
    dialog.addEventListener('close',function(){dialog.replaceChildren(); if(state.lastFocus && state.lastFocus.isConnected) state.lastFocus.focus(); state.lastFocus=null;});
    dialog.addEventListener('keydown',function(e){
      if(e.key==='ArrowRight'){e.preventDefault();moveViewer(state.lang==='en'?1:-1);}
      if(e.key==='ArrowLeft'){e.preventDefault();moveViewer(state.lang==='en'?-1:1);}
    });
    return dialog;
  }
  function closeViewer(){if(dialog && dialog.open) dialog.close();}
  function close(){closeViewer(); state.request++;state.key=null;state.status='idle';if(rootPanel){rootPanel.remove();rootPanel=null;}}
  function currentAssets() {return state.filter==='all'?state.items:state.items.filter(function(a){return a.kind===(state.filter==='images'?'image':'video');});}
  function moveViewer(step) {
    var all=state.items.filter(function(a){return a.kind==='image' || embeddableVideo(a);});
    if(!all.length) return;
    var current=state.items[state.selected];var i=all.indexOf(current);
    var next=all[(Math.max(i,0)+step+all.length)%all.length];
    var nextIndex=state.items.indexOf(next);
    if(nextIndex>=0) {state.selected=nextIndex;renderViewer();}
  }
  function renderViewer() {
    var m=state.items[state.selected];if(!m)return;
    var d=createDialog();d.replaceChildren();d.lang=state.lang;d.dir=state.lang==='en'?'ltr':'rtl';
    var shell=text('div','orbita-media-viewer');
    var bar=text('header','orbita-media-viewer-bar');
    var label=text('div','orbita-media-viewer-heading');
    label.append(text('span','orbita-media-eyebrow',tr('eyebrow')),text('strong','',state.name));
    var x=button('orbita-media-close','×');aria(x,tr('close'));x.addEventListener('click',closeViewer);
    bar.append(label,x);shell.append(bar);
    var frame=text('div','orbita-media-viewer-stage');
    var src=mediaUrl(m);
    if(m.kind==='image' && src){
      var pic=document.createElement('img');pic.src=src;pic.alt=localized(m.alt)||title(m);pic.decoding='async';pic.referrerPolicy='no-referrer';frame.append(pic);
    } else if(embeddableVideo(m)) {
      var vid=document.createElement('video');vid.src=src;vid.controls=true;vid.preload='metadata';vid.playsInline=true;frame.append(vid);
    }
    shell.append(frame);
    var cap=text('div','orbita-media-viewer-caption');
    cap.append(text('strong','',title(m)));
    var rights=m.rights || {};
    var summary=[m.source && m.source.publisher || '', rights.credit || '', rights.license || ''].filter(Boolean).join(' · ');
    if(summary)cap.append(text('p','',summary));
    var proof=httpsUrl(m.source && m.source.url);
    if(proof)cap.append(mkLink(proof,tr('source')+' ↗','orbita-media-source'));
    shell.append(cap);
    if(state.items.filter(function(a){return a.kind==='image'||embeddableVideo(a);}).length>1){
      var nav=text('div','orbita-media-viewer-nav');nav.setAttribute('aria-label',tr('navigation'));
      var prev=button('orbita-media-nav',tr('previous'));prev.addEventListener('click',function(){moveViewer(-1);});
      var next=button('orbita-media-nav',tr('next'));next.addEventListener('click',function(){moveViewer(1);});
      nav.append(prev,next);shell.append(nav);
    }
    d.append(shell);
  }
  function openViewer(index, initiator) {
    state.selected=index;state.lastFocus=initiator||document.activeElement;
    var d=createDialog();renderViewer();if(!d.open)d.showModal();
  }
  function renderCard(m,index) {
    var card=text('article','orbita-media-card');
    var cover=text('div','orbita-media-card-cover');
    var url=mediaUrl(m);var thumb=imageThumbnail(m);
    var isVideo=m.kind==='video';
    var preview;
    if (thumb) {
      preview=document.createElement('img');preview.src=thumb;preview.alt=localized(m.alt)||title(m);
      preview.loading='lazy';preview.decoding='async';preview.referrerPolicy='no-referrer';
      cover.append(preview);
    } else {
      cover.append(text('div','orbita-media-placeholder',isVideo?'▶':'✦'));
    }
    cover.append(text('span','orbita-media-type',isVideo?tr('video'):tr('image')));
    if(isVideo && !embeddableVideo(m)){
      var link=mkLink(url,tr('watch')+' ↗','orbita-media-card-action');cover.append(link);
    } else {
      var trigger=button('orbita-media-card-action',isVideo?tr('watch'):'⤢ '+tr('open'));
      trigger.addEventListener('click',function(){openViewer(index,trigger);});cover.append(trigger);
    }
    card.append(cover);
    var info=text('div','orbita-media-card-info');info.append(text('strong','',title(m)));
    var org=text('span','',m.source && m.source.publisher || '');info.append(org);
    var source=httpsUrl(m.source && m.source.url);
    if(source)info.append(mkLink(source,tr('source')+' ↗','orbita-media-inline-link'));
    card.append(info);return card;
  }
  function renderPanel() {
    if(!rootPanel || !rootPanel.isConnected)return;
    var p=rootPanel;p.replaceChildren();p.lang=state.lang;p.dir=state.lang==='en'?'ltr':'rtl';
    var head=text('div','orbita-media-heading');
    var icon=text('div','orbita-media-heading-mark');icon.innerHTML='<svg viewBox="0 0 32 32" role="img" aria-hidden="true"><rect x="3" y="7" width="26" height="19" rx="4" stroke="currentColor" fill="none" stroke-width="1.5"/><circle cx="12" cy="14" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="m6 24 8-7 6 5 4-4 4 5" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M16 3v4m-2-2h4" stroke="currentColor" stroke-width="1.2"/></svg>';
    var heading=text('div','orbita-media-heading-copy');heading.append(text('span','orbita-media-eyebrow',tr('eyebrow')),text('h3','',tr('title')));
    var tally=text('span','orbita-media-count',state.status==='ready'?String(state.items.length)+' '+tr('ready'):'');
    head.append(icon,heading,tally);p.append(head);
    if(state.status==='loading'){
      p.append(text('div','orbita-media-msg',tr('loading')));return;
    }
    if(state.status==='error'){
      var alert=text('div','orbita-media-msg orbita-media-error',tr('offline'));alert.setAttribute('role','status');
      var retry=button('orbita-media-retry',tr('retry'));retry.addEventListener('click',function(){loadAssets(true);});alert.append(retry);p.append(alert);return;
    }
    if(!state.items.length){
      var empty=text('div','orbita-media-empty');
      empty.append(text('span','orbita-media-empty-glyph','✧'),text('strong','',tr('emptyTitle')),text('p','',tr('emptyText')));
      p.append(empty);return;
    }
    var filters=text('div','orbita-media-filters');filters.setAttribute('role','group');filters.setAttribute('aria-label',tr('title'));
    [['all','all'],['images','images'],['videos','videos']].forEach(function(row){
      var kind=row[0], count=kind==='all'?state.items.length:state.items.filter(function(a){return a.kind===(kind==='images'?'image':'video');}).length;
      var btn=button('orbita-media-filter'+(state.filter===kind?' is-active':''),tr(row[1])+' '+count);
      btn.setAttribute('aria-pressed',state.filter===kind?'true':'false');btn.addEventListener('click',function(){state.filter=kind;renderPanel();});filters.append(btn);
    });p.append(filters);
    var selected=currentAssets();
    if(!selected.length){p.append(text('div','orbita-media-msg',tr('none')));return;}
    var grid=text('div','orbita-media-grid');selected.forEach(function(asset){grid.append(renderCard(asset,state.items.indexOf(asset)));});p.append(grid);
  }
  function installPanel(){
    if(!state.key)return;
    var d=document.getElementById('detail'),body=document.getElementById('detailBody');
    if(!d || !body || !d.classList.contains('open'))return;
    if(rootPanel && rootPanel.isConnected && rootPanel.dataset.key===state.key) return;
    if(rootPanel)rootPanel.remove();
    var p=text('section','orbita-media-section');p.dataset.key=state.key;p.setAttribute('aria-label',tr('title'));
    // Position below the identity header without replacing existing hero photographs or legacy tabs.
    var header=body.querySelector('.d-head, .site-detail-head, .verified-profile .verified-head, .recovery-head');
    if(header && header.parentElement===body)header.insertAdjacentElement('afterend',p);
    else body.insertBefore(p,body.firstChild);
    rootPanel=p;renderPanel();
  }
  function scheduleInstall(){if(scheduled)return;scheduled=true;Promise.resolve().then(function(){scheduled=false;installPanel();});}
  function observe(){
    if(observer || typeof MutationObserver==='undefined')return;
    var b=document.getElementById('detailBody');if(!b)return;
    observer=new MutationObserver(function(){if(state.key && (!rootPanel || !rootPanel.isConnected))scheduleInstall();});
    observer.observe(b,{childList:true});
  }
  function loadAssets(retry){
    var registry=(typeof window!=='undefined'?window.ORBITA_MEDIA_BANK:null);
    if(!registry || !registry.load){state.status='error';renderPanel();return Promise.resolve(false);}
    if(retry)registry.clearCache();
    var req=state.request;state.status='loading';renderPanel();
    return registry.load(dataUrl).then(function(catalog){
      if(req!==state.request)return false;
      state.items=sortedAssets(registry.published(catalog,state.key) || []);
      state.catalog=catalog;state.status='ready';renderPanel();return true;
    }).catch(function(){if(req===state.request){state.status='error';renderPanel();}return false;});
  }
  function onProfileOpen(p,lang){
    if(!p || !p.o || !p.o.id){close();return false;}
    var registry=(typeof window!=='undefined'?window.ORBITA_MEDIA_BANK:null);
    var cat=p.cat||p.o.cat||p.kind||'';
    var key=isSupported(cat,String(p.o.id),registry);
    if(!key){close();return false;}
    closeViewer();state.request++;state.key=key;state.name=String((lang==='fa'?p.o.fa:p.o.en)||p.o.en||p.o.fa||p.o.id);
    state.lang=langValid(lang);state.items=[];state.filter='all';state.status='loading';
    scheduleInstall();observe();loadAssets();return true;
  }
  // Integration point is the existing openDetail() in app.js.
  // Call before the synchronous profile renderer; the panel mounts on the next microtask.
  return Object.freeze({onProfileOpen:onProfileOpen,onPanelClose:close,openViewer:openViewer,closeViewer:closeViewer,
    isSupported:isSupported,localPath:localPath,httpsUrl:httpsUrl,embeddableVideo:embeddableVideo,
    sortedAssets:sortedAssets,getState:function(){return {key:state.key,status:state.status,count:state.items.length,lang:state.lang};}});
}));

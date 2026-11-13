const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {JSDOM} = require('jsdom');
const site = path.join(__dirname, '../assignment-1');
function boot(t, route='#browse') {
  const dom = new JSDOM(fs.readFileSync(path.join(site,'index.html'),'utf8'), {url:'http://localhost/'+route,runScripts:'outside-only',pretendToBeVisual:true});
  const w = dom.window; w.scrollTo=()=>{}; w.confirm=()=>true;
  w.HTMLElement.prototype.scrollIntoView=()=>{};
  const ctx=dom.getInternalVMContext();
  for(const file of ['app.js','edition.js','themes.js','navigation.js']) vm.runInContext(fs.readFileSync(path.join(site,file),'utf8'),ctx,{filename:file});
  t.after(()=>w.close());
  return {w,d:w.document,run:code=>vm.runInContext(code,ctx),go:async hash=>{w.location.hash=hash;await new Promise(resolve=>w.setTimeout(resolve,15));}};
}
function submit(w,form){form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));}
function fill(d,values){for(const [name,value] of Object.entries(values)){const el=d.querySelector(`#listing-form [name="${name}"]`);assert(el,name);el.value=value;}}
test('browser validation remains enabled with bounded text and amount fields',t=>{
  const {d}=boot(t,'#post'),f=d.querySelector('#listing-form');
  assert.equal(f.noValidate,false);
  assert.equal(d.querySelector('#title').minLength,5); assert.equal(d.querySelector('#title').maxLength,80);
  assert.equal(d.querySelector('#description').minLength,20); assert.equal(d.querySelector('#description').maxLength,1500);
  assert.equal(f.checkValidity(),false);
  const amount=d.querySelector('#amount'); amount.value='-1'; assert.equal(amount.validity.rangeUnderflow,true);
});
test('search, type and amount filtering handle no matches and invalid ranges',t=>{
  const {w,d}=boot(t); assert.equal(d.querySelectorAll('#results [data-listing-id]').length,6);
  d.querySelector('#search').value='no such listing';submit(w,d.querySelector('#search-form'));
  assert.equal(d.querySelectorAll('#results [data-listing-id]').length,0);assert.match(d.querySelector('#results').textContent,/No finds/);
  d.querySelector('[data-empty-clear]').click();d.querySelector('[data-kind="service"]').click();
  assert.equal(d.querySelectorAll('#results .kind-service').length,1);
  d.querySelector('#min').value='100';d.querySelector('#max').value='10';submit(w,d.querySelector('#filter-panel'));
  assert.match(d.querySelector('#range-error').textContent,/Minimum must not exceed/);
});
test('create, edit and delete affect only the demo owner and retain pending visibility',async t=>{
  const {w,d,run,go}=boot(t,'#post');
  fill(d,{title:'Desk for the hostel',description:'A solid wood desk with light marks and all four legs.',category:'Room essentials',amount:'2500'});
  submit(w,d.querySelector('#listing-form'));await new Promise(r=>w.setTimeout(r,15));
  const id=run('listings.at(-1).id');assert.equal(run('listings.at(-1).status'),'pending');
  await go('#browse');assert(!d.querySelector(`[data-listing-id="${id}"]`));
  await go('#edit/'+id);d.querySelector('#title').value='Updated hostel desk';submit(w,d.querySelector('#listing-form'));await new Promise(r=>w.setTimeout(r,15));
  assert.equal(run(`listings.find(l=>l.id===${JSON.stringify(id)}).title`),'Updated hostel desk');
  const del=d.querySelector(`[data-delete="${id}"]`);assert(del,'owned listing has a delete control');del.click();
  assert.equal(run(`listings.some(l=>l.id===${JSON.stringify(id)})`),false);
});
test('invalid custom submission creates no record and safe text stays literal',async t=>{
  const {w,d,run,go}=boot(t,'#post');const count=run('listings.length');
  submit(w,d.querySelector('#listing-form'));assert.equal(run('listings.length'),count);assert(d.querySelector('[aria-invalid="true"]'));
  fill(d,{title:'<script>alert(1)</script>',description:'A fictional item description longer than twenty characters.',category:'Electronics',amount:'100'});
  submit(w,d.querySelector('#listing-form'));await new Promise(r=>w.setTimeout(r,15));
  assert(d.querySelector('#main').textContent.includes('<script>alert(1)</script>'));assert.equal(d.querySelector('#main script'),null);
  await go('#edit/laptop');assert.equal(d.querySelector('#listing-form'),null);
});
test('save and unsave update the saved view without persistent browser storage',async t=>{
  const {d,go,w}=boot(t);d.querySelector('[data-save="laptop"]').click();assert.equal(d.querySelector('.saved-count').textContent,'1');
  await go('#saved');assert(d.querySelector('[data-listing-id="laptop"]'));d.querySelector('[data-save="laptop"]').click();
  assert.equal(d.querySelector('.saved-count').textContent,'0');assert.equal(w.localStorage.length,0);assert.equal(w.sessionStorage.length,0);
});
test('packing math reserves spacing without inheriting a taller neighboring card',t=>{
  const {run}=boot(t);assert.equal(run('newspaperSpan(280,4,2,30)'),52);assert.equal(run('newspaperSpan(500,4,2,30)'),89);
  assert.equal(52*6-280,32);
});

test('delete cancellation and a non-owned target leave records intact',async t=>{
  const {w,d,run,go}=boot(t,'#mine'); const count=run('listings.length');
  run('deleteOwnedListing("laptop")');assert.equal(run('listings.length'),count);
  w.confirm=()=>false; const button=d.querySelector('[data-delete]');assert(button);button.click();assert.equal(run('listings.length'),count);
});
test('service units and flexible wanted budgets use distinct validated fields',async t=>{
  const {w,d,run,go}=boot(t,'#post');
  const service=d.querySelector('[name="kind"][value="service"]');service.checked=true;service.dispatchEvent(new w.Event('change',{bubbles:true}));
  assert(d.querySelector('[name="unit"]'));assert.equal(d.querySelector('[name="condition"]'),null);
  await go('#post/wanted');const flexible=d.querySelector('[name="flexible"]');flexible.checked=true;flexible.dispatchEvent(new w.Event('change',{bubbles:true}));
  assert(d.querySelector('#amount').disabled);assert.equal(d.querySelector('#amount').required,false);
  fill(d,{title:'Wanted study chair',description:'Looking for a stable chair suitable for a small hostel desk.',category:'Room essentials'});
  submit(w,d.querySelector('#listing-form'));await new Promise(r=>w.setTimeout(r,15));assert.equal(run('listings.at(-1).kind'),'wanted');assert.equal(run('listings.at(-1).amount'),null);
});

test('slide-over menu opens and closes without rerendering or losing form data',t=>{
  const {w,d}=boot(t,'#post');
  const button=d.querySelector('#menu-toggle');assert(button,'menu toggle exists');
  const drawer=d.querySelector('#site-menu'),backdrop=d.querySelector('.menu-backdrop');
  const title=d.querySelector('#title');title.value='Keep this unsent listing';
  assert.equal(button.getAttribute('aria-expanded'),'false');assert(drawer.hasAttribute('inert'));
  button.click();
  assert.equal(button.getAttribute('aria-expanded'),'true');assert(drawer.classList.contains('is-open'));
  assert(!drawer.hasAttribute('inert'));assert.equal(backdrop.hidden,false);
  assert.equal(d.querySelector('#title'),title);assert.equal(title.value,'Keep this unsent listing');
  d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape'}));
  assert.equal(button.getAttribute('aria-expanded'),'false');assert(!drawer.classList.contains('is-open'));
  assert(drawer.hasAttribute('inert'));assert.equal(title.value,'Keep this unsent listing');
  button.click();backdrop.click();assert.equal(button.getAttribute('aria-expanded'),'false');
});
test('filters drawer consolidates type tabs, sort and layout controls and omits goods badge',t=>{
  const {d}=boot(t);
  assert.equal(d.querySelector('[data-spotlight]'),null,'spotlight button removed');
  assert.equal(d.querySelector('.kind-goods .listing-type-label'),null,'goods badge removed');
  assert(d.querySelector('.kind-service .listing-type-label'),'services badge kept');
  const panel=d.querySelector('#filter-panel');
  assert(panel.querySelector('[data-kind="service"]'),'type tabs inside filters drawer');
  assert(panel.querySelector('#sort'),'sort control inside filters drawer');
  assert(panel.querySelector('[data-layout="list"]'),'view toggle inside filters drawer');
});

test('removes demo and placeholder disclaimers across routes and upgrades status badges',t=>{
  const {d}=boot(t);
  const w=d.defaultView;
  for(const route of ['#browse','#mine','#saved','#post','#listing/laptop']){
    w.location.hash=route;
    w.dispatchEvent(new w.Event('hashchange'));
    assert.doesNotMatch(
      d.body.textContent,
      /\b(demo|fictional|dummy|prototype|illustrative)\b|resets on refresh/i,
      `unexpected placeholder copy on ${route}`
    );
  }
  w.location.hash='#mine';
  w.dispatchEvent(new w.Event('hashchange'));
  const badges=[...d.querySelectorAll('.status-badge')];
  assert(badges.length>=1,'expected status badges on #mine');
  assert.equal(d.querySelector('.status-dot'),null,'legacy status dot removed');
  for(const b of badges)assert(b.querySelector('svg.icon'),'status badge renders icon');
});

test('custom select menus sync bidirectionally with underlying select elements',async t=>{
  const {d}=boot(t);
  const w=d.defaultView;
  const sortSel=d.querySelector('#sort');
  const sortWrap=sortSel.closest('.custom-select');
  assert(sortWrap,'#sort enhanced with .custom-select');
  sortWrap.querySelector('.select-trigger').click();
  assert(sortWrap.classList.contains('is-open'),'clicking trigger opens dropdown menu');
  sortWrap.querySelector('.select-option[data-value="amount_asc"]').click();
  assert.equal(sortSel.value,'amount_asc','option click updates select value');
  assert(!sortWrap.classList.contains('is-open'),'selecting option closes dropdown menu');

  const catSel=d.querySelector('#category');
  const catWrap=catSel.closest('.custom-select');
  assert(catWrap,'#category enhanced with .custom-select');
  catSel.value='Books & stationery';
  catSel.dispatchEvent(new w.Event('change',{bubbles:true}));
  assert.match(catWrap.querySelector('.select-label').textContent,/Books & stationery/);

  w.location.hash='#post';
  w.dispatchEvent(new w.Event('hashchange'));
  const kindRadio=d.querySelector('input[name="kind"][value="service"]');
  kindRadio.checked=true;
  kindRadio.dispatchEvent(new w.Event('change',{bubbles:true}));
  await new Promise(r=>setTimeout(r,30));
  const formCatSel=d.querySelector('#form-category');
  const formCatWrap=formCatSel.closest('.custom-select');
  assert(formCatWrap,'#form-category enhanced after switching kind');
  const firstVal=[...formCatSel.options].find(o=>o.value)?.value;
  assert(firstVal&&formCatWrap.querySelector(`.select-option[data-value="${firstVal}"]`),'service category options synced');
});

test('photo upload supports any listing kind, updates live preview, and renders on submitted card',async t=>{
  const {d}=boot(t);
  const w=d.defaultView;
  w.location.hash='#post';
  w.dispatchEvent(new w.Event('hashchange'));

  const wantedRadio=d.querySelector('input[name="kind"][value="wanted"]');
  wantedRadio.checked=true;
  wantedRadio.dispatchEvent(new w.Event('change',{bubbles:true}));
  await new Promise(r=>setTimeout(r,30));

  const uploadInput=d.querySelector('#photo-upload');
  const dropzone=d.querySelector('.upload-dropzone');
  assert(uploadInput&&dropzone,'photo upload input and dropzone rendered for wanted listing');

  const sampleFile=new w.File([new Uint8Array([137,80,78,71,13,10,26,10])],'stand-photo.png',{type:'image/png'});
  Object.defineProperty(uploadInput,'files',{configurable:true,value:[sampleFile]});
  uploadInput.dispatchEvent(new w.Event('change',{bubbles:true}));
  await new Promise(r=>setTimeout(r,80));

  assert(d.querySelector('#photo-url').value.startsWith('data:image/png'),'uploaded file encoded to data URL');
  assert(dropzone.classList.contains('has-photo'),'dropzone enters has-photo state');
  assert(d.querySelector('#photo-preview-img').src.startsWith('data:image/png'),'dropzone thumbnail populated');
  assert(d.querySelector('#live-listing .card-media.has-photo img'),'live preview card renders uploaded photo');

  d.querySelector('#title').value='Need Adjustable Desk Lamp for Studio';
  d.querySelector('#amount').value='4500';
  const cat=d.querySelector('#form-category');
  const wantedCat=[...cat.options].find(o=>o.value)?.value;
  cat.value=wantedCat;
  cat.dispatchEvent(new w.Event('change',{bubbles:true}));
  d.querySelector('#description').value='Looking for a warm LED desk lamp near hostels.';
  d.querySelector('#listing-form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  await new Promise(r=>setTimeout(r,30));
  if(!d.querySelector('.mine-grid'))w.dispatchEvent(new w.Event('hashchange'));

  assert.equal(w.location.hash,'#mine','submitted listing redirects to My listings');
  const cards=[...d.querySelectorAll('.mine-grid .listing-card')];
  const created=cards.find(c=>/Need Adjustable Desk Lamp/.test(c.textContent));
  assert(created&&created.querySelector('.card-media.has-photo img[src^="data:image/png"]'),'my listings renders uploaded photo on pending wanted card');

  const link=created.querySelector('h3 a');
  assert(link&&/^#listing\//.test(link.getAttribute('href')),'card heading links to listing detail');
  w.location.hash=link.getAttribute('href');
  w.dispatchEvent(new w.Event('hashchange'));
  assert(d.querySelector('img.detail-image[src^="data:image/png"]'),'detail view displays uploaded photo');
});

test('endnote CTA morphs reversibly from wanted rail and hides wanted tag inside wanted sections',async t=>{
  const {d}=boot(t);
  const w=d.defaultView;
  Object.defineProperty(w,'innerWidth',{configurable:true,value:1366});
  Object.defineProperty(w,'innerHeight',{configurable:true,value:768});
  Object.defineProperty(d.documentElement,'scrollHeight',{configurable:true,value:1750});

  const stage=d.querySelector('.endnote-stage');
  const rail=d.querySelector('.classifieds-block');
  const placeSlot=rail?.querySelector('.classifieds-cta-slot');
  const placeBtn=rail?.querySelector('.classifieds-place');
  const endCta=stage?.querySelector('.endnote-cta');
  assert(stage&&stage.querySelector('.endnote-copy')&&endCta,'endnote stage structure present');
  assert(rail&&placeSlot&&placeBtn,'wanted rail, CTA slot, and CTA present');
  assert.equal(rail.querySelector('.listing-type-label'),null,'wanted rail cards omit redundant Wanted tag');
  assert(d.querySelector('.kind-service .listing-type-label'),'services tag remains present');

  rail.getBoundingClientRect=()=>({width:290,height:492,top:234,bottom:726,left:994,right:1284});
  placeSlot.getBoundingClientRect=()=>({width:248,height:42,top:666,bottom:708,left:1015,right:1263});
  endCta.getBoundingClientRect=()=>({width:214,height:46,top:786,bottom:832,left:1049,right:1263});
  let currentY=0;
  Object.defineProperty(w,'scrollY',{configurable:true,get:()=>currentY});

  w.dispatchEvent(new w.Event('scroll'));
  await new Promise(r=>setTimeout(r,30));
  assert(stage.classList.contains('is-morph-active'),'desktop browse activates morph stage');
  assert.equal(Number(stage.style.getPropertyValue('--p-morph')),0,'top of page starts before morph');
  assert(!stage.classList.contains('is-landed'),'button has not landed before bottom');
  assert.equal(placeBtn.getAttribute('aria-hidden'),null,'rail CTA stays accessible before end');
  assert.equal(endCta.getAttribute('aria-hidden'),'true','endnote CTA stays hidden while button glided in');

  currentY=1750-768;
  w.dispatchEvent(new w.Event('scroll'));
  await new Promise(r=>setTimeout(r,30));
  assert(stage.classList.contains('is-landed'),'reaching end lands morphed button inside black bar');
  assert.equal(Number(stage.style.getPropertyValue('--p-morph')),1,'morph factor reaches 1 at page bottom');
  assert.equal(Number(stage.style.getPropertyValue('--p-land')),1,'land factor reaches 1 at page bottom');
  assert.equal(Number(rail.style.getPropertyValue('--p-out')),0,'original label is fully faded out at page bottom');
  assert.equal(Number(rail.style.getPropertyValue('--p-in')),1,'target label is fully faded in at page bottom');
  assert(rail.classList.contains('is-landed'),'rail marks CTA landed at page bottom');
  assert.equal(placeBtn.getAttribute('aria-hidden'),'true','floating CTA removed from accessibility tree when landed');
  assert.equal(placeBtn.tabIndex,-1,'floating CTA removed from tab order when landed');
  assert.equal(endCta.getAttribute('aria-hidden'),null,'native endnote CTA takes over accessibility focus');
  assert.equal(endCta.tabIndex,0,'native endnote CTA restored to tab order when landed');
  assert.notEqual(rail.style.getPropertyValue('--btn-dy'),'0px','button delta tracks vertical travel into black bar');

  currentY=100;
  w.dispatchEvent(new w.Event('scroll'));
  await new Promise(r=>setTimeout(r,30));
  assert(!stage.classList.contains('is-landed'),'scrolling up reverses landed state');
  assert.equal(Number(stage.style.getPropertyValue('--p-morph')),0,'morph factor reverses smoothly back to 0');
  assert(!rail.classList.contains('is-landed'),'rail CTA restores when scrolling back up');
  assert.equal(placeBtn.getAttribute('aria-hidden'),null,'rail CTA accessible again after scrolling back');

  const wantedChip=d.querySelector('[data-kind="wanted"]');
  wantedChip.click();
  await new Promise(r=>setTimeout(r,15));
  assert(d.querySelector('.classifieds-only'),'filtered Wanted view renders classifieds-only section');
  assert.equal(d.querySelector('.classifieds-only .listing-type-label'),null,'wanted section omits Wanted tag');
});

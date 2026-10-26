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
  for(const file of ['app.js','edition.js','themes.js']) vm.runInContext(fs.readFileSync(path.join(site,file),'utf8'),ctx,{filename:file});
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

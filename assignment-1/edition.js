'use strict';
// A single chosen visual direction; saved/recent records are session-only demo state.
const savedFinds = new Set();
let recentlyViewed = [];
let resultLayout = 'board';
let quickPick = '';
let toastTimer;
const bookmark = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 3.5h12v17l-6-4-6 4z"/></svg>';
const titles = {laptop:'14-inch laptop · 8 GB / 256 GB',books:'First-year engineering textbooks',lamp:'Adjustable LED desk lamp',tutoring:'First-year calculus tutoring',headphones:'Wireless headphones · unopened',wanted:'Wanted: a study chair'};
listings.forEach(l=>{if(titles[l.id])l.title=titles[l.id];});
toast=function(message){clearTimeout(toastTimer);$('#announcement').textContent=message;toastTimer=setTimeout(()=>{$('#announcement').textContent='';},4000);};
function saveButton(l, text=false){if(l.id==='preview'||l.status!=='active'||l.mine)return '';const saved=savedFinds.has(l.id);return `<button type="button" class="save-find ${saved?'is-saved':''} ${text?'save-wide':''}" data-save="${esc(l.id)}" aria-pressed="${saved}" aria-label="${saved?'Unsave':'Save'} ${esc(l.title)}">${bookmark}${text?`<span>${saved?'Saved to your finds':'Save for later'}</span>`:''}</button>`;}
function syncSaves(){document.querySelectorAll('.saved-count').forEach(el=>{el.textContent=savedFinds.size;});document.querySelectorAll('[data-save]').forEach(b=>{const l=listings.find(x=>x.id===b.dataset.save);if(!l)return;const yes=savedFinds.has(l.id);b.setAttribute('aria-pressed',String(yes));b.setAttribute('aria-label',`${yes?'Unsave':'Save'} ${l.title}`);b.classList.toggle('is-saved',yes);if(b.querySelector('span'))b.querySelector('span').textContent=yes?'Saved to your finds':'Save for later';});}
card=function(l,owner=false){const sentence=l.description.replace(/\bfictional\s*/gi,'').replace(/^A adjustable/,'An adjustable').replace(/^one-to-one/,'One-to-one').slice(0,116).replace(/\s+\S*$/,'');return `<article class="listing-card kind-${l.kind}" data-listing-id="${esc(l.id)}"><div class="card-rubric"><span class="listing-type-label">${kindName[l.kind]}</span>${saveButton(l)}</div>${l.kind==='goods'?`<a class="card-image" href="#listing/${esc(l.id)}" tabindex="-1" aria-hidden="true"><img src="assets/${esc(l.image)}.svg" alt="" loading="lazy"><span class="image-label">${conditions[l.condition]||'Goods'}</span></a>`:`<div class="type-art" aria-hidden="true">${l.kind==='service'?'<em>Tutoring & student services</em>':'<em>Looking to buy</em>'}</div>`}<div class="card-content"><div class="card-meta"><span class="kind-tag">${esc(l.category)}</span><span>·</span><span>${esc(l.age)}</span></div><h3><a href="#listing/${esc(l.id)}">${esc(l.title)}</a></h3><p class="card-excerpt">${esc(sentence)}${l.description.length>116?'…':''}</p><p class="card-price">${price(l)}</p><div class="card-bottom"><span>${icon('pin')}${zones[l.zone]}</span><a href="#listing/${esc(l.id)}" class="read-listing" aria-label="View ${esc(l.title)}">Take a look <span aria-hidden="true">↗</span></a></div>${owner?`<div class="owner-actions">${status(l)}<a href="#edit/${esc(l.id)}">Edit listing ↗</a><button type="button" class="text-button" data-delete="${esc(l.id)}">Delete</button></div>${l.status==='rejected'?`<p class="rejection-note">${esc(l.reason)}</p>`:''}`:''}</div></article>`;};

function deleteOwnedListing(id) {
  const listing = listings.find(item => item.id === id && item.mine);
  if (!listing || !confirm('Delete this demo listing?')) return;
  listings = listings.filter(item => item.id !== id);
  savedFinds.delete(id);
  recentlyViewed = recentlyViewed.filter(item => item !== id);
  mine();
  syncSaves();
  main.querySelector('h1')?.focus({preventScroll:true});
  toast('Listing deleted.');
}

function matchingListings(){return listings.filter(l=>l.status==='active'&&(query.kind==='all'||l.kind===query.kind)&&(query.category==='all'||l.category===query.category)&&(`${l.title} ${l.description}`.toLowerCase().includes(query.q.toLowerCase()))&&(query.min===''||(l.amount!==null&&l.amount>=Number(query.min)))&&(query.max===''||(l.amount!==null&&l.amount<=Number(query.max)))).sort((a,b)=>query.sort==='newest'?b.order-a.order:a.amount===null?b.amount===null?a.id.localeCompare(b.id):1:b.amount===null?-1:(query.sort==='amount_asc'?a.amount-b.amount:b.amount-a.amount)||a.id.localeCompare(b.id));}
function recentSection(){const rows=recentlyViewed.map(id=>listings.find(l=>l.id===id&&l.status==='active')).filter(Boolean).slice(0,4);return rows.length?`<section class="recent-section" aria-labelledby="recent-heading"><div class="section-label"><h2 id="recent-heading">Recently viewed</h2><button type="button" class="text-button" data-clear-recent>Clear history</button></div><div class="recent-grid">${rows.map(l=>`<a href="#listing/${esc(l.id)}" class="recent-item"><img src="assets/${esc(l.image)}.svg" alt=""><span><small>${kindName[l.kind]}</small><strong>${esc(l.title)}</strong><span>${esc(money(l))}${l.kind==='service'?` / ${l.unit}`:''}</span></span><span aria-hidden="true">↗</span></a>`).join('')}</div></section>`:'';}
browse=function(){main.innerHTML=`<h1 class="sr-only" tabindex="-1">Marketplace listings</h1><form class="search-form" id="search-form" role="search">${icon('search')}<label class="sr-only" for="search">Search listings</label><input id="search" type="search" maxlength="100" placeholder="Search goods, services or wanted posts" value="${esc(query.q)}"><button class="button primary" type="submit">Search</button></form><div class="quick-picks" aria-label="Browse collections">${[['budget','Under PKR 3,000'],['room','Room refresh'],['study','Study essentials'],['skills','Find a skill']].map(([k,label])=>`<button type="button" data-quick="${k}" aria-pressed="${quickPick===k}">${label} <span aria-hidden="true">↗</span></button>`).join('')}</div><div class="browse-navigation"><div class="type-tabs" aria-label="Listing type">${['all','goods','service','wanted'].map(k=>`<button type="button" class="type-tab ${query.kind===k?'active':''}" data-kind="${k}" aria-pressed="${query.kind===k}">${k==='all'?'All listings':kindName[k]}<span class="type-count">${listings.filter(l=>l.status==='active'&&(k==='all'||l.kind===k)).length}</span></button>`).join('')}</div><button type="button" class="filter-toggle" aria-expanded="false" aria-controls="filter-panel">${icon('filter')} Refine</button></div><form id="filter-panel" class="filter-panel" hidden><div class="field"><label for="category">Category</label><select id="category">${categoryOptions(query.kind,query.category,true)}</select></div><div class="field"><label for="min">Minimum (PKR)</label><input id="min" type="number" min="0" step="0.01" placeholder="0" value="${esc(query.min)}"></div><div class="field"><label for="max">Maximum (PKR)</label><input id="max" type="number" min="0" step="0.01" placeholder="Any" value="${esc(query.max)}"></div><button class="button" type="submit">Apply filters</button><button class="text-button" type="button" data-clear>Reset all</button><p id="range-error" role="alert"></p></form><div id="active-filters" class="active-filters" aria-label="Active filters"></div><div class="result-header"><p id="result-count" role="status"></p><div class="result-controls"><label for="sort" class="sort-control"><span>Sort</span><select id="sort">${option('newest','Newest first',query.sort)}${option('amount_asc','Price: low to high',query.sort)}${option('amount_desc','Price: high to low',query.sort)}</select></label><div class="view-toggle" role="group" aria-label="Listing layout"><button type="button" data-layout="board" aria-pressed="${resultLayout==='board'}">Grid</button><button type="button" data-layout="list" aria-pressed="${resultLayout==='list'}">List</button></div></div></div><div class="listing-grid edition-grid" id="results"></div><div id="pagination" class="pagination"></div><div class="endnote"><div><h2>Can’t find it?</h2></div><a class="button" href="#post/wanted">Post a wanted listing <span aria-hidden="true">↗</span></a></div>${recentSection()}`;
$('#search-form').onsubmit=e=>{e.preventDefault();query.q=$('#search').value.trim();query.page=1;quickPick='';results();};
main.querySelectorAll('[data-kind]').forEach(b=>b.onclick=()=>{query.kind=b.dataset.kind;query.category='all';query.page=1;quickPick='';browse();});
$('.filter-toggle').onclick=e=>{const b=e.currentTarget,open=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',String(open));$('#filter-panel').hidden=!open;};
$('#filter-panel').onsubmit=e=>{e.preventDefault();const min=$('#min').value,max=$('#max').value;if(min!==''&&max!==''&&Number(min)>Number(max)){$('#range-error').textContent='Minimum must not exceed maximum.';$('#min').focus();return;}$('#range-error').textContent='';Object.assign(query,{category:$('#category').value,min,max,page:1});quickPick='';results();};
$('#sort').onchange=()=>{query.sort=$('#sort').value;query.page=1;results();};$('[data-clear]').onclick=clearFilters;
main.querySelectorAll('[data-layout]').forEach(b=>b.onclick=()=>{resultLayout=b.dataset.layout;document.body.dataset.layout=resultLayout;main.querySelectorAll('[data-layout]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.layout===resultLayout)));results();});
main.querySelectorAll('[data-quick]').forEach(b=>b.onclick=()=>{const k=b.dataset.quick;Object.assign(query,{q:'',kind:k==='skills'?'service':'goods',category:k==='room'?'Room essentials':k==='study'?'Books & stationery':'all',min:'',max:k==='budget'?'3000':'',sort:'newest',page:1});quickPick=k;browse();});
if($('[data-clear-recent]'))$('[data-clear-recent]').onclick=()=>{recentlyViewed=[];$('.recent-section').remove();toast('Recently viewed cleared.');};results();};
clearFilters=function(){Object.assign(query,{q:'',kind:'all',category:'all',min:'',max:'',sort:'newest',page:1});quickPick='';browse();};
// Size each grid item from its own content instead of sharing a whole row height.
let newspaperObserver;
let newspaperFrame = 0;
let newspaperLayout = () => {};
function newspaperSpan(height, row, gap, spacing) {
  return Math.max(1, Math.ceil((height + spacing) / (row + gap)));
}
function arrangeNewspaper() {
  newspaperObserver?.disconnect();
  cancelAnimationFrame(newspaperFrame);
  newspaperFrame = 0;
  newspaperLayout = () => {};
  const grid = main.querySelector('.editorial-mosaic');
  if (!grid) return;
  grid.classList.add('masonry-ready');
  const slots = Array.from(grid.children);
  const fit = () => {
    newspaperFrame = 0;
    if (!grid.isConnected) return;
    const style = getComputedStyle(grid);
    const row = parseFloat(style.gridAutoRows);
    const gap = parseFloat(style.rowGap) || 0;
    const spacing = parseFloat(style.getPropertyValue('--edition-spacing')) || 30;
    // Measure natural card heights before writing any grid spans.
    const spans = slots.map(slot => Number.isFinite(row) ? newspaperSpan(slot.firstElementChild.getBoundingClientRect().height, row, gap, spacing) : null);
    slots.forEach((slot,i) => {
      if (spans[i] === null) slot.style.removeProperty('grid-row-end');
      else slot.style.gridRowEnd = `span ${spans[i]}`;
    });
  };
  newspaperLayout = () => {
    if (!newspaperFrame && grid.isConnected) newspaperFrame = requestAnimationFrame(fit);
  };
  if (typeof ResizeObserver !== 'undefined') {
    newspaperObserver = new ResizeObserver(newspaperLayout);
    slots.forEach(slot => newspaperObserver.observe(slot.firstElementChild));
  }
  newspaperLayout();
  document.fonts?.ready.then(() => { if (grid.isConnected) newspaperLayout(); });
}
addEventListener('resize', () => newspaperLayout());

// Newspaper composition is presentation only: filters and pagination own the rows.
function newspaperRows(rows, layout, sort) {
  if (layout === 'list' || sort !== 'newest') return rows.map(l => card(l)).join('');
  const wanted = rows.filter(l => l.kind === 'wanted');
  const offers = rows.filter(l => l.kind !== 'wanted');
  if (!offers.length) return `<section class="classifieds-only"><div class="edition-section-heading"><h2>Wanted classifieds</h2><a href="#post/wanted">Place a request ↗</a></div><div class="classifieds-grid">${wanted.map(l => card(l)).join('')}</div></section>`;
  // Occasional features span two columns and one row, in result order.
  const candidates = offers.map((listing,index) => ({listing,index}))
    .filter(({listing}) => listing.kind === 'goods')
    .sort((a,b) => (b.listing.amount ?? 0) - (a.listing.amount ?? 0));
  const featured = [];
  const limit = offers.length >= 4 ? Math.max(1,Math.floor(offers.length / 6)) : 0;
  for (const candidate of candidates) {
    if (featured.length >= limit) break;
    if (featured.every(story => Math.abs(story.index - candidate.index) >= 3)) featured.push(candidate);
  }
  const featuredIds = new Set(featured.map(({listing}) => listing.id));
  return `<div class="editorial-spread ${wanted.length ? 'has-classifieds' : ''}"><div class="editorial-mosaic">${offers.map(l => `<div class="editorial-slot ${featuredIds.has(l.id) ? 'story-featured' : ''}">${card(l)}</div>`).join('')}</div>${wanted.length ? `<aside class="classifieds-block" aria-label="Wanted classifieds"><div class="classifieds-masthead"><span>CLASSIFIEDS</span><h2>Wanted</h2><p>Student requests</p></div>${wanted.map(l => card(l)).join('')}<a class="classifieds-place" href="#post/wanted">Place a wanted listing ↗</a></aside>` : ''}</div>`;
}

results=function(){main.querySelectorAll('[data-quick]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.quick===quickPick)));const rows=matchingListings();$('#results').classList.toggle('newspaper-results',resultLayout==='board'&&query.sort==='newest'&&rows.length>0);$('#result-count').innerHTML=`<strong>${rows.length}</strong> ${rows.length===1?'listing':'listings'} ${query.q?'for your search':'available'}`;$('#results').innerHTML=rows.length?newspaperRows(rows.slice((query.page-1)*6,query.page*6),resultLayout,query.sort):'<div class="empty-state"><span class="empty-mark" aria-hidden="true">?</span><h2>No finds this time.</h2><p>Try a wider search, or post what you need.</p><button type="button" class="button" data-empty-clear>Clear filters</button><a class="text-link" href="#post/wanted">Create a wanted post ↗</a></div>';const pages=Math.ceil(rows.length/6);$('#pagination').innerHTML=pages>1?Array.from({length:pages},(_,i)=>`<button type="button" class="button" data-page="${i+1}" ${query.page===i+1?'aria-current="page"':''}>${i+1}</button>`).join(''):'';main.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{query.page=+b.dataset.page;results();$('#result-count').scrollIntoView({block:'center'});});if($('[data-empty-clear]'))$('[data-empty-clear]').onclick=clearFilters;const chips=[];if(query.q)chips.push(['q',`“${query.q}”`]);if(query.category!=='all')chips.push(['category',query.category]);if(query.min!==''||query.max!=='')chips.push(['amount',`PKR ${query.min||'0'}–${query.max||'any'}`]);$('#active-filters').innerHTML=chips.map(([k,v])=>`<button type="button" data-remove-filter="${k}" aria-label="Remove filter ${esc(v)}">${esc(v)} <span aria-hidden="true">×</span></button>`).join('');main.querySelectorAll('[data-remove-filter]').forEach(b=>b.onclick=()=>{const k=b.dataset.removeFilter;if(k==='q')query.q='';if(k==='category')query.category='all';if(k==='amount'){query.min='';query.max='';}query.page=1;quickPick='';browse();});syncSaves();arrangeNewspaper();};

function savedView(){const rows=listings.filter(l=>savedFinds.has(l.id));main.innerHTML=`<div class="collection-heading"><h1 tabindex="-1">Saved listings</h1><p>Saved for this demo session.</p></div><div class="listing-grid saved-grid">${rows.length?rows.map(l=>l.status==='active'?card(l):`<article class="unavailable-card"><h2>This listing is unavailable</h2><p>The owner may have edited or closed it.</p><button class="text-button" type="button" data-unsave-unavailable="${esc(l.id)}">Remove from saved</button></article>`).join(''):'<div class="empty-state"><span class="empty-mark" aria-hidden="true">'+bookmark+'</span><h2>No saved listings yet.</h2><p>Use the bookmark on a listing to keep it here.<br>No account needed in this preview.</p><a href="#browse" class="button primary">Browse listings ↗</a></div>'}</div>`;syncSaves();}
document.addEventListener('click',e=>{const b=e.target.closest('[data-save],[data-unsave-unavailable]');if(!b)return;const id=b.dataset.save||b.dataset.unsaveUnavailable,l=listings.find(x=>x.id===id);if(!l)return;if(savedFinds.has(id)){savedFinds.delete(id);toast('Removed from saved finds.');}else if(l.status==='active'){savedFinds.add(id);toast('Saved for another look. Find it in Saved finds.');}syncSaves();if(location.hash==='#saved')savedView();});
const editionDetail=detail;
detail=function(id){editionDetail(id);const l=listings.find(x=>x.id===id);if(!l||!$('.detail-facts'))return;if(l.status==='active'){recentlyViewed=[id,...recentlyViewed.filter(x=>x!==id)].slice(0,4);$('.detail-facts').insertAdjacentHTML('beforeend',`<div class="detail-save">${saveButton(l,true)}</div>`);}const related=listings.filter(x=>x.status==='active'&&x.id!==id&&x.kind===l.kind).slice(0,3);if(related.length)main.insertAdjacentHTML('beforeend',`<section class="related-section"><div class="section-label"><h2>Related listings</h2><a href="#browse">Browse listings ↗</a></div><div class="listing-grid related-grid">${related.map(x=>card(x)).join('')}</div></section>`);syncSaves();};
const editionForm=formView;
formView=function(id){editionForm(id);const f=$('#listing-form');if(!f)return;if(!id){$('h1').textContent='Post a listing';}$('.page-eyebrow')?.remove();$('.form-aside').innerHTML='<div class="preview-caption"><span></span> LISTING PREVIEW</div><div id="live-listing"></div><p class="preview-private">A live preview · New posts stay pending review.</p>';function update(){const d=Object.fromEntries(new FormData(f));const item={id:'preview',kind:d.kind,title:d.title?.trim()||'Listing title',category:d.category||'Your category',description:d.description?.trim()||'Add a description.',amount:d.kind==='wanted'&&d.flexible==='on'?null:d.amount===''||d.amount===undefined?0:Number(d.amount),condition:d.condition||'good',unit:d.unit||'hour',zone:d.zone||'main_campus',image:d.image||'laptop',age:'Just now',status:'pending'};$('#live-listing').innerHTML=card(item);$('#live-listing').querySelectorAll('a').forEach(a=>a.removeAttribute('href'));if((!d.amount&&d.amount!=='0')&&!(d.kind==='wanted'&&d.flexible==='on'))$('#live-listing .card-price').textContent='Price';}function clearCorrectedErrors(){const d=Object.fromEntries(new FormData(f));const n=v=>Array.from((v||'').trim()).length;const valid={title:n(d.title)>=5&&n(d.title)<=80,description:n(d.description)>=20&&n(d.description)<=1500,category:(categories[d.kind]||[]).includes(d.category),amount:d.kind==='wanted'&&d.flexible==='on'||d.amount!==''&&d.amount!==undefined&&Number.isFinite(Number(d.amount))&&Number(d.amount)>=0&&Number(d.amount)<=1000000&&Math.abs(Number(d.amount)*100-Math.round(Number(d.amount)*100))<.00001};for(const [key,ok]of Object.entries(valid)){const el=key==='category'?$('#form-category'):$('#'+key);if(ok&&el?.hasAttribute('aria-invalid')){el.removeAttribute('aria-invalid');$('#'+key+'-error').textContent='';}}const count=f.querySelectorAll('[aria-invalid=true]').length;if(!count)$('#form-errors').textContent='';else if($('#form-errors').textContent)$('#form-errors').innerHTML='<p class="error-summary">Please check '+count+' highlighted '+(count===1?'field':'fields')+' before submitting.</p>';}
f.addEventListener('input',()=>{update();clearCorrectedErrors();});f.addEventListener('change',()=>{update();clearCorrectedErrors();});update();};
removeEventListener('hashchange',route);
route=function(){newspaperObserver?.disconnect();cancelAnimationFrame(newspaperFrame);newspaperFrame=0;newspaperLayout=()=>{};let hash=location.hash||'#browse';if(!/^#(browse|saved|mine|post(?:\/wanted)?|listing\/[\w-]+|edit\/[\w-]+)$/.test(hash)){hash='#browse';history.replaceState(null,'',location.pathname+location.search+hash);}const [view,id]=hash.slice(1).split('/');if(view==='browse')browse();else if(view==='saved')savedView();else if(view==='mine')mine();else if(view==='listing')detail(id);else{formView(view==='edit'?id:null);if(view==='post'&&id==='wanted'){const r=$('[name=kind][value=wanted]');r.checked=true;r.dispatchEvent(new Event('change',{bubbles:true}));formSnapshot=serializeForm();}}document.title=`${{browse:'The campus edition',saved:'Saved finds',mine:'My listings',listing:'Listing details',post:'Post a listing',edit:'Edit listing'}[view]} · Student Marketplace`;document.querySelectorAll('[data-nav]').forEach(a=>{if(a.dataset.nav===view)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});document.body.dataset.view=view;syncSaves();$('h1')?.focus({preventScroll:true});scrollTo({top:0,behavior:'instant'});lastHash=hash;};
addEventListener('hashchange',route);
// Both old preview URLs now resolve to the chosen refined newspaper edition.
document.body.dataset.direction='newspaper';document.body.dataset.layout=resultLayout;route();

document.addEventListener('click',e=>{const link=e.target.closest('a[href^="#"]');if(!link||link.hasAttribute('data-cancel')||link.getAttribute('href')==='#main'||link.getAttribute('href')===location.hash||!$('#listing-form'))return;if(serializeForm()!==formSnapshot&&!confirm('Leave this page and discard your unsent listing?')){e.preventDefault();e.stopPropagation();}},true);

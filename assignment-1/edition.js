'use strict';
// Premium edition visual composition and interactive controls.
const savedFinds = new Set();
let recentlyViewed = [];
let resultLayout = 'board';
let quickPick = '';
let filtersOpen = false;
let toastTimer;
const bookmark = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 3.5h12v17l-6-4-6 4z"/></svg>';
const viewArrow = '<svg class="view-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const selectChev = '<svg class="select-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
const selectCheck = '<svg class="select-check" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
const titles = {laptop:'14-inch laptop · 8 GB / 256 GB',books:'First-year engineering textbooks',lamp:'Adjustable LED desk lamp',tutoring:'First-year calculus tutoring',headphones:'Wireless headphones · unopened',wanted:'Wanted: a study chair'};
listings.forEach(l=>{if(titles[l.id])l.title=titles[l.id];});
toast=function(message){clearTimeout(toastTimer);$('#announcement').textContent=message;if(!message)return;toastTimer=setTimeout(()=>{$('#announcement').textContent='';},4000);};

let openSelectWrap = null;
function closeAllSelects(restoreFocus = false) {
  if (!openSelectWrap) return;
  const wrap = openSelectWrap;
  openSelectWrap = null;
  wrap.classList.remove('is-open', 'is-up');
  const trigger = wrap.querySelector('.select-trigger');
  if (trigger) {
    trigger.setAttribute('aria-expanded', 'false');
    if (restoreFocus) trigger.focus({preventScroll: true});
  }
}
function syncCustomSelect(select) {
  const wrap = select.closest('.custom-select');
  if (!wrap) return;
  const trigger = wrap.querySelector('.select-trigger');
  const menu = wrap.querySelector('.select-menu');
  const opts = [...select.options];
  const current = opts[select.selectedIndex] || opts[0];
  if (trigger) {
    const labelEl = trigger.querySelector('.select-label');
    if (labelEl) labelEl.textContent = current ? current.textContent : '';
    trigger.classList.toggle('is-placeholder', Boolean(current && current.value === ''));
  }
  if (menu) {
    menu.innerHTML = opts.map((o, idx) =>
      `<button type="button" role="option" class="select-option ${o.selected ? 'is-selected' : ''} ${o.value === '' ? 'is-empty' : ''}" data-value="${esc(o.value)}" data-index="${idx}" aria-selected="${o.selected}">` +
      `<span>${esc(o.textContent)}</span>${o.selected ? selectCheck : ''}</button>`
    ).join('');
  }
}
function enhanceSelects(root = main) {
  if (!root) return;
  root.querySelectorAll('select').forEach(select => {
    if (select.closest('.custom-select')) {
      syncCustomSelect(select);
      return;
    }
    const wrap = document.createElement('div');
    wrap.className = 'custom-select';
    if (select.id === 'sort') wrap.classList.add('is-pill');
    select.parentNode.insertBefore(wrap, select);
    wrap.appendChild(select);
    select.tabIndex = -1;
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'select-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    const lbl = select.id ? document.querySelector(`label[for="${select.id}"]`) : null;
    if (lbl && !select.closest('.sort-control')) {
      if (!lbl.id) lbl.id = `${select.id}-label`;
      trigger.setAttribute('aria-labelledby', lbl.id);
    } else if (select.id === 'sort') {
      trigger.setAttribute('aria-label', 'Sort listings');
    }
    trigger.innerHTML = `${select.id === 'sort' ? '<span class="select-prefix">Sort</span>' : ''}<span class="select-label"></span>${selectChev}`;
    const menu = document.createElement('div');
    menu.className = 'select-menu';
    menu.id = select.id ? `${select.id}-menu` : `select-menu-${Math.random().toString(36).slice(2, 7)}`;
    menu.setAttribute('role', 'listbox');
    trigger.setAttribute('aria-controls', menu.id);
    if (lbl && !lbl.id) lbl.id = `${select.id || 'select'}-label`;
    if (lbl && !trigger.getAttribute('aria-labelledby')) trigger.setAttribute('aria-labelledby', lbl.id);
    wrap.appendChild(trigger);
    wrap.appendChild(menu);
    syncCustomSelect(select);

    const setSelectInvalid = (invalid, message = '') => {
      wrap.classList.toggle('is-invalid', invalid);
      if (invalid) trigger.setAttribute('aria-invalid', 'true');
      else trigger.removeAttribute('aria-invalid');
      const err = select.id === 'form-category' ? $('#category-error') : null;
      if (err && (message || !invalid)) err.textContent = invalid ? message : '';
    };

    select.addEventListener('invalid', () => {
      setSelectInvalid(true, select.id === 'form-category' ? 'Choose a category for this listing type.' : '');
      requestAnimationFrame(() => trigger.focus({preventScroll: true}));
    });

    trigger.addEventListener('click', e => {
      e.stopPropagation();
      const willOpen = !wrap.classList.contains('is-open');
      closeAllSelects(false);
      if (!willOpen) return;
      syncCustomSelect(select);
      const rect = wrap.getBoundingClientRect();
      const spaceBelow = (typeof innerHeight === 'number' ? innerHeight : 800) - rect.bottom;
      wrap.classList.toggle('is-up', spaceBelow < 240 && rect.top > 240);
      wrap.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      openSelectWrap = wrap;
      const active = menu.querySelector('.select-option.is-selected') || menu.querySelector('.select-option');
      active?.scrollIntoView?.({block: 'nearest'});
    });

    menu.addEventListener('click', e => {
      const opt = e.target.closest('.select-option');
      if (!opt) return;
      e.stopPropagation();
      const nextVal = opt.dataset.value;
      if (select.value !== nextVal) {
        select.value = nextVal;
        select.dispatchEvent(new Event('change', {bubbles: true}));
      }
      syncCustomSelect(select);
      closeAllSelects(true);
    });

    trigger.addEventListener('keydown', e => {
      const opts = [...menu.querySelectorAll('.select-option')];
      if (!opts.length) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!wrap.classList.contains('is-open')) trigger.click();
        const cur = opts.findIndex(o => o.classList.contains('is-selected'));
        const next = e.key === 'ArrowDown' ? Math.min(opts.length - 1, cur + 1) : Math.max(0, cur - 1);
        opts[next]?.focus();
      } else if (e.key === 'Escape' && wrap.classList.contains('is-open')) {
        e.preventDefault();
        closeAllSelects(true);
      }
    });

    menu.addEventListener('keydown', e => {
      const opts = [...menu.querySelectorAll('.select-option')];
      const idx = opts.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); opts[Math.min(opts.length - 1, idx + 1)]?.focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); opts[Math.max(0, idx - 1)]?.focus(); }
      else if (e.key === 'Home') { e.preventDefault(); opts[0]?.focus(); }
      else if (e.key === 'End') { e.preventDefault(); opts[opts.length - 1]?.focus(); }
      else if (e.key === 'Escape') { e.preventDefault(); closeAllSelects(true); }
    });

    select.addEventListener('change', () => {
      syncCustomSelect(select);
      if (select.validity?.valid) setSelectInvalid(false);
    });
    if (typeof MutationObserver !== 'undefined') {
      new MutationObserver(() => syncCustomSelect(select)).observe(select, {childList: true, subtree: true});
    }
  });
}
document.addEventListener('click', e => { if (openSelectWrap && !openSelectWrap.contains(e.target)) closeAllSelects(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && openSelectWrap) closeAllSelects(true); });

function saveButton(l, text=false){
  if(l.id==='preview'||l.status!=='active'||l.mine)return '';
  const saved=savedFinds.has(l.id);
  return `<button type="button" class="save-find ${saved?'is-saved':''} ${text?'save-wide':''}" data-save="${esc(l.id)}" aria-pressed="${saved}" aria-label="${saved?'Unsave':'Save'} ${esc(l.title)}">${bookmark}${text?`<span>${saved?'Saved to your finds':'Save for later'}</span>`:''}</button>`;
}
function syncSaves(){
  document.querySelectorAll('.saved-count').forEach(el=>{el.textContent=savedFinds.size;el.classList.toggle('has-saves',savedFinds.size>0);});
  document.querySelectorAll('[data-save]').forEach(b=>{const l=listings.find(x=>x.id===b.dataset.save);if(!l)return;const yes=savedFinds.has(l.id);b.setAttribute('aria-pressed',String(yes));b.setAttribute('aria-label',`${yes?'Unsave':'Save'} ${l.title}`);b.classList.toggle('is-saved',yes);if(b.querySelector('span'))b.querySelector('span').textContent=yes?'Saved to your finds':'Save for later';});
}
function excerpt(l){
  const clean=l.description.trim().replace(/^A adjustable/,'An adjustable').replace(/^one-to-one/,'One-to-one');
  if(clean.length<=116)return clean;
  return `${clean.slice(0,116).replace(/\s+\S*$/,'').replace(/[.,;:]+$/,'')}…`;
}
card=function(l,owner=false,opts={}){
  const hasPhoto=Boolean(l.photoUrl);
  const useImage=l.kind==='goods'||hasPhoto;
  const src=l.photoUrl||`assets/${esc(l.image)}.svg`;
  const media=useImage
    ?`<img src="${esc(src)}" alt="" loading="lazy">${l.kind==='goods'?`<span class="image-label">${conditions[l.condition]||'Goods'}</span>`:''}`
    :`<span class="type-art-word">${l.kind==='service'?'Skills &amp; services':'Wanted'}</span><span class="type-art-sub">${esc(l.category)}</span>`;
  const hideTypePill=l.kind==='goods'||(l.kind==='wanted'&&opts.inWantedColumn);
  const typeBadge=hideTypePill?'':`<span class="listing-type-label">${kindName[l.kind]}</span>`;
  const ownerBits=owner?`<div class="owner-actions">${status(l)}<a href="#edit/${esc(l.id)}">Edit</a><button type="button" class="text-button" data-delete="${esc(l.id)}">Delete</button></div>${l.status==='rejected'?`<p class="rejection-note">${esc(l.reason)}</p>`:''}`:'';
  return `<article class="listing-card kind-${l.kind}" data-listing-id="${esc(l.id)}">`+
    `<a class="card-media ${useImage?'card-image':'type-art'} ${hasPhoto?'has-photo':''}" href="#listing/${esc(l.id)}" tabindex="-1" aria-hidden="true">${media}</a>`+
    `${typeBadge}${saveButton(l)}`+
    `<div class="card-content"><div class="card-meta"><span class="kind-tag">${esc(l.category)}</span><span class="meta-dot" aria-hidden="true"></span><span>${esc(l.age)}</span></div>`+
    `<h3><a href="#listing/${esc(l.id)}">${esc(l.title)}</a></h3><p class="card-excerpt">${esc(excerpt(l))}</p>`+
    `<div class="card-foot"><p class="card-price">${price(l)}</p><a href="#listing/${esc(l.id)}" class="read-listing" aria-label="View ${esc(l.title)}"><span>View</span>${viewArrow}</a></div>`+
    `<div class="card-bottom">${icon('pin')}<span>${zones[l.zone]}</span></div>${ownerBits}</div></article>`;
};

function deleteOwnedListing(id) {
  const listing = listings.find(item => item.id === id && item.mine);
  if (!listing || !confirm('Delete this listing?')) return;
  listings = listings.filter(item => item.id !== id);
  savedFinds.delete(id);
  recentlyViewed = recentlyViewed.filter(item => item !== id);
  mine();
  syncSaves();
  main.querySelector('h1')?.focus({preventScroll:true});
  toast('Listing deleted.');
}

function matchingListings(){return listings.filter(l=>l.status==='active'&&(query.kind==='all'||l.kind===query.kind)&&(query.category==='all'||l.category===query.category)&&(`${l.title} ${l.description}`.toLowerCase().includes(query.q.toLowerCase()))&&(query.min===''||(l.amount!==null&&l.amount>=Number(query.min)))&&(query.max===''||(l.amount!==null&&l.amount<=Number(query.max)))).sort((a,b)=>query.sort==='newest'?b.order-a.order:a.amount===null?b.amount===null?a.id.localeCompare(b.id):1:b.amount===null?-1:(query.sort==='amount_asc'?a.amount-b.amount:b.amount-a.amount)||a.id.localeCompare(b.id));}
function recentSection(){
  const rows=recentlyViewed.map(id=>listings.find(l=>l.id===id&&l.status==='active')).filter(Boolean).slice(0,4);
  return rows.length?`<section class="recent-section" aria-labelledby="recent-heading"><div class="section-label"><h2 id="recent-heading">Recently viewed</h2><button type="button" class="text-button" data-clear-recent>Clear history</button></div><div class="recent-grid">${rows.map(l=>`<a href="#listing/${esc(l.id)}" class="recent-item"><img src="${esc(l.photoUrl||`assets/${l.image}.svg`)}" alt=""><span><small>${kindName[l.kind]}</small><strong>${esc(l.title)}</strong><span>${esc(money(l))}${l.kind==='service'?` / ${l.unit}`:''}</span></span>${viewArrow}</a>`).join('')}</div></section>`:'';
}
function activeFilterCount(){return (query.kind!=='all')+(query.category!=='all')+(query.min!==''||query.max!=='')+(query.sort!=='newest');}
function setFiltersOpen(open){
  filtersOpen=open;const b=$('.filter-toggle'),panel=$('.filter-drawer');if(!b||!panel)return;
  if(!open)closeAllSelects(false);
  b.setAttribute('aria-expanded',String(open));panel.classList.toggle('is-open',open);
  if(open)panel.removeAttribute('inert');else panel.setAttribute('inert','');
}
browse=function(){
  const tabs=['all','goods','service','wanted'].map(k=>`<button type="button" class="type-tab ${query.kind===k?'active':''}" data-kind="${k}" aria-pressed="${query.kind===k}">${k==='all'?'All':kindName[k]}<span class="type-count">${listings.filter(l=>l.status==='active'&&(k==='all'||l.kind===k)).length}</span></button>`).join('');
  const picks=[['budget','Under PKR 3,000'],['room','Room refresh'],['study','Study essentials'],['skills','Find a skill']].map(([k,label])=>`<button type="button" class="chip" data-quick="${k}" aria-pressed="${quickPick===k}">${label}</button>`).join('');
  const count=activeFilterCount();
  main.innerHTML=`<section class="hero">`+
    `<div class="hero-copy"><p class="eyebrow">The campus edition</p><h1 tabindex="-1">Good finds, <em>right here</em> on campus.</h1></div>`+
    `<div class="search-row"><form class="search-form" id="search-form" role="search">${icon('search')}<label class="sr-only" for="search">Search listings</label><input id="search" type="search" maxlength="100" placeholder="Search goods, services or wanted posts" value="${esc(query.q)}"><button class="button primary" type="submit">Search</button></form>`+
    `<button type="button" class="filter-toggle" aria-expanded="false" aria-controls="filter-panel">${icon('filter')}<span>Filters</span>${count?`<b class="filter-badge">${count}</b>`:''}</button></div>`+
    `</section>`+
    `<div class="filter-drawer" inert><div class="filter-drawer-inner"><form id="filter-panel" class="filter-panel">`+
    `<div class="filter-head">`+
    `<div class="type-tabs" aria-label="Listing type">${tabs}</div>`+
    `<div class="result-controls"><p id="result-count" role="status"></p>`+
    `<div class="sort-control"><label for="sort" id="sort-label" class="sr-only">Sort listings</label><select id="sort">${option('newest','Newest first',query.sort)}${option('amount_asc','Price: low to high',query.sort)}${option('amount_desc','Price: high to low',query.sort)}</select></div>`+
    `<div class="view-toggle" role="group" aria-label="Listing layout"><button type="button" data-layout="board" aria-pressed="${resultLayout==='board'}" aria-label="Grid view" title="Grid view">${icon('grid')}</button><button type="button" data-layout="list" aria-pressed="${resultLayout==='list'}" aria-label="List view" title="List view"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button></div>`+
    `</div></div>`+
    `<div class="filter-group filter-collections"><span class="filter-label">Collections</span><div class="chip-row" aria-label="Browse collections">${picks}</div></div>`+
    `<div class="field"><label for="category">Category</label><select id="category">${categoryOptions(query.kind,query.category,true)}</select></div>`+
    `<div class="field"><label for="min">Min (PKR)</label><input id="min" type="number" min="0" step="0.01" placeholder="0" value="${esc(query.min)}"></div>`+
    `<div class="field"><label for="max">Max (PKR)</label><input id="max" type="number" min="0" step="0.01" placeholder="Any" value="${esc(query.max)}"></div>`+
    `<div class="filter-actions"><button class="button primary" type="submit">Apply</button><button class="text-button" type="button" data-clear>Reset all</button></div>`+
    `<p id="range-error" role="alert"></p></form></div></div>`+
    `<div id="active-filters" class="active-filters" aria-label="Active filters"></div>`+
    `<div class="listing-grid edition-grid" id="results"></div><div id="pagination" class="pagination"></div>`+
    `<div class="endnote-stage"><div class="endnote"><div class="endnote-copy"><p class="eyebrow">Still looking?</p><h2>Can’t find it? Ask the campus.</h2></div><a class="button light endnote-cta" href="#post/wanted">Post a wanted listing ${viewArrow}</a></div></div>${recentSection()}`;
  $('#search-form').onsubmit=e=>{e.preventDefault();query.q=$('#search').value.trim();query.page=1;quickPick='';results();};
  main.querySelectorAll('[data-kind]').forEach(b=>b.onclick=()=>{query.kind=b.dataset.kind;query.category='all';query.page=1;quickPick='';browse();});
  $('.filter-toggle').onclick=()=>setFiltersOpen(!filtersOpen);
  setFiltersOpen(filtersOpen);
  $('#filter-panel').onsubmit=e=>{e.preventDefault();const min=$('#min').value,max=$('#max').value;if(min!==''&&max!==''&&Number(min)>Number(max)){$('#range-error').textContent='Minimum must not exceed maximum.';$('#min').focus();return;}$('#range-error').textContent='';Object.assign(query,{category:$('#category').value,min,max,page:1});quickPick='';results();};
  $('#sort').onchange=()=>{query.sort=$('#sort').value;query.page=1;results();};$('[data-clear]').onclick=clearFilters;
  main.querySelectorAll('[data-layout]').forEach(b=>b.onclick=()=>{resultLayout=b.dataset.layout;document.body.dataset.layout=resultLayout;main.querySelectorAll('[data-layout]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.layout===resultLayout)));results();});
  main.querySelectorAll('[data-quick]').forEach(b=>b.onclick=()=>{const k=b.dataset.quick;Object.assign(query,{q:'',kind:k==='skills'?'service':'goods',category:k==='room'?'Room essentials':k==='study'?'Books & stationery':'all',min:'',max:k==='budget'?'3000':'',sort:'newest',page:1});quickPick=k;browse();});
  if($('[data-clear-recent]'))$('[data-clear-recent]').onclick=()=>{recentlyViewed=[];$('.recent-section').remove();toast('Recently viewed cleared.');};
  enhanceSelects(main);
  results();
};
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
    syncEndnoteMorph();
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

let endnoteMorphFrame = 0;
function syncEndnoteMorph() {
  endnoteMorphFrame = 0;
  const stage = main.querySelector('.endnote-stage');
  const spread = main.querySelector('.editorial-spread.has-classifieds');
  const rail = spread?.querySelector('.classifieds-block');
  if (!stage) return;
  const placeSlot = rail?.querySelector('.classifieds-cta-slot');
  const placeBtn = rail?.querySelector('.classifieds-place');
  const endCta = stage.querySelector('.endnote-cta');
  const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const railW = rail ? Math.round(rail.getBoundingClientRect().width) : 0;
  const vh = typeof innerHeight === 'number' ? innerHeight : 800;
  const curY = typeof scrollY === 'number' ? scrollY : 0;
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - vh);
  if (!rail || railW <= 0 || (typeof innerWidth === 'number' && innerWidth <= 1120) || reduced || maxScroll <= 80) {
    stage.classList.remove('is-morph-active', 'is-landed');
    ['--p-morph', '--p-land'].forEach(v => stage.style.removeProperty(v));
    if (rail) {
      rail.classList.remove('is-morphed', 'is-landed');
      ['--p-morph', '--p-out', '--p-in', '--p-land', '--btn-dx', '--btn-dy', '--slot-w', '--target-w'].forEach(v => rail.style.removeProperty(v));
    }
    if (placeBtn) {
      placeBtn.removeAttribute('tabindex');
      placeBtn.removeAttribute('aria-hidden');
    }
    if (endCta) {
      endCta.removeAttribute('tabindex');
      endCta.removeAttribute('aria-hidden');
    }
    return;
  }

  const ENDNOTE_LIFT = 22;
  const spreadRect = spread.getBoundingClientRect();
  const railH = rail.offsetHeight || Math.round(rail.getBoundingClientRect().height);
  const hasRealLayout = spreadRect.height > 0 && railH > 0;
  const dockScroll = hasRealLayout ? Math.max(0, (spreadRect.bottom + curY) - (84 + railH)) : 0;
  const startY = Math.min(Math.max(0, maxScroll - 120), Math.max(dockScroll, Math.max(0, maxScroll - 220)));
  const endY = Math.max(startY + 40, maxScroll - Math.min(24, maxScroll * 0.05));
  const raw = Math.max(0, Math.min(1, (curY - startY) / Math.max(1, endY - startY)));
  const p = raw * raw * (3 - 2 * raw);
  const pOut = Math.max(0, Math.min(1, 1 - (p - 0.16) / 0.24));
  const pIn = Math.max(0, Math.min(1, (p - 0.44) / 0.24));
  const pLand = Math.max(0, Math.min(1, (p - 0.88) / 0.12));

  let dx = 0, dy = 0, slotW = railW - 44, targetW = railW - 44;
  if (placeSlot && endCta) {
    const endnote = stage.querySelector('.endnote');
    const trStyle = endnote && typeof getComputedStyle === 'function' ? getComputedStyle(endnote).transform : '';
    const m = trStyle && trStyle !== 'none' ? trStyle.match(/matrix\([^,]+,[^,]+,[^,]+,[^,]+,[^,]+,\s*([-\d.]+)\)/) : null;
    const curShift = m ? Number(m[1]) : 0;
    const sr = placeSlot.getBoundingClientRect();
    const tr = endCta.getBoundingClientRect();
    if (sr.width > 0 && tr.width > 0) {
      dx = (tr.left + tr.width / 2) - (sr.left + sr.width / 2);
      // Measure against endCta's final (-ENDNOTE_LIFT) resting position so transforms never lag a frame.
      dy = ((tr.top - curShift) - ENDNOTE_LIFT + tr.height / 2) - (sr.top + sr.height / 2);
      slotW = sr.width;
      targetW = tr.width;
    }
  }

  const landed = p >= 0.88;
  stage.classList.add('is-morph-active');
  stage.classList.toggle('is-landed', landed);
  stage.style.setProperty('--p-morph', p.toFixed(4));
  stage.style.setProperty('--p-land', pLand.toFixed(4));

  rail.classList.toggle('is-morphed', p > 0.02);
  rail.classList.toggle('is-landed', landed);
  rail.style.setProperty('--p-morph', p.toFixed(4));
  rail.style.setProperty('--p-out', pOut.toFixed(4));
  rail.style.setProperty('--p-in', pIn.toFixed(4));
  rail.style.setProperty('--p-land', pLand.toFixed(4));
  rail.style.setProperty('--btn-dx', `${dx.toFixed(2)}px`);
  rail.style.setProperty('--btn-dy', `${dy.toFixed(2)}px`);
  rail.style.setProperty('--slot-w', `${slotW.toFixed(1)}px`);
  rail.style.setProperty('--target-w', `${targetW.toFixed(1)}px`);

  if (placeBtn) {
    if (landed) {
      placeBtn.tabIndex = -1;
      placeBtn.setAttribute('aria-hidden', 'true');
    } else {
      placeBtn.removeAttribute('tabindex');
      placeBtn.removeAttribute('aria-hidden');
    }
  }
  if (endCta) {
    if (landed) {
      endCta.removeAttribute('tabindex');
      endCta.removeAttribute('aria-hidden');
    } else {
      endCta.tabIndex = -1;
      endCta.setAttribute('aria-hidden', 'true');
    }
  }
}
function scheduleEndnoteMorph() {
  if (!endnoteMorphFrame && main.querySelector('.endnote-stage')) {
    endnoteMorphFrame = requestAnimationFrame(syncEndnoteMorph);
  }
}
addEventListener('scroll', scheduleEndnoteMorph, {passive: true});
addEventListener('resize', () => { closeAllSelects(false); newspaperLayout(); scheduleEndnoteMorph(); });

// Composition is presentation only: filters and pagination own the rows.
function newspaperRows(rows, layout, sort) {
  if (layout === 'list' || sort !== 'newest') return `<h2 class="sr-only">Browse listings</h2>${rows.map(l => card(l)).join('')}`;
  const wanted = rows.filter(l => l.kind === 'wanted');
  const offers = rows.filter(l => l.kind !== 'wanted');
  if (!offers.length) return `<section class="classifieds-only"><div class="edition-section-heading"><h2>Wanted</h2><a href="#post/wanted">Place a request ${viewArrow}</a></div><div class="classifieds-grid">${wanted.map(l => card(l, false, {inWantedColumn: true})).join('')}</div></section>`;
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
  return `<section class="editorial-spread ${wanted.length ? 'has-classifieds' : ''}" aria-labelledby="offers-heading"><h2 id="offers-heading" class="sr-only">Available listings</h2><div class="editorial-mosaic">${offers.map(l => `<div class="editorial-slot ${featuredIds.has(l.id) ? 'story-featured' : ''}">${card(l)}</div>`).join('')}</div>${wanted.length ? `<aside class="classifieds-block" aria-label="Wanted requests"><div class="classifieds-masthead"><span>Requests</span><h2>Wanted</h2><p>What students are looking for</p></div>${wanted.map(l => card(l, false, {inWantedColumn: true})).join('')}<div class="classifieds-cta-slot"><a class="classifieds-place" href="#post/wanted"><span class="place-copy"><span class="place-text-out">Place a wanted listing</span><span class="place-text-in" aria-hidden="true">Post a wanted listing</span></span> ${viewArrow}</a></div></aside>` : ''}</section>`;
}

results=function(){
  main.querySelectorAll('[data-quick]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.quick===quickPick)));
  const rows=matchingListings();
  $('#results').classList.toggle('newspaper-results',resultLayout==='board'&&query.sort==='newest'&&rows.length>0);
  $('#result-count').innerHTML=`<strong>${rows.length}</strong> ${rows.length===1?'listing':'listings'}${query.q?' found':''}`;
  $('#results').innerHTML=rows.length?newspaperRows(rows.slice((query.page-1)*6,query.page*6),resultLayout,query.sort):`<div class="empty-state"><span class="empty-mark" aria-hidden="true">${icon('search')}</span><h2>No finds this time.</h2><p>Try a wider search, or post what you need.</p><button type="button" class="button primary" data-empty-clear>Clear filters</button><a class="text-link" href="#post/wanted">Create a wanted post ${viewArrow}</a></div>`;
  const pages=Math.ceil(rows.length/6);
  $('#pagination').innerHTML=pages>1?Array.from({length:pages},(_,i)=>`<button type="button" class="button" data-page="${i+1}" ${query.page===i+1?'aria-current="page"':''}>${i+1}</button>`).join(''):'';
  main.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{query.page=+b.dataset.page;results();$('#result-count').scrollIntoView({block:'center'});});
  if($('[data-empty-clear]'))$('[data-empty-clear]').onclick=clearFilters;
  const chips=[];if(query.q)chips.push(['q',`“${query.q}”`]);if(query.kind!=='all')chips.push(['kind',kindName[query.kind]]);if(query.category!=='all')chips.push(['category',query.category]);if(query.min!==''||query.max!=='')chips.push(['amount',`PKR ${query.min||'0'}–${query.max||'any'}`]);
  $('#active-filters').innerHTML=chips.map(([k,v])=>`<button type="button" class="chip is-removable" data-remove-filter="${k}" aria-label="Remove filter ${esc(v)}">${esc(v)} <span aria-hidden="true">×</span></button>`).join('');
  main.querySelectorAll('[data-remove-filter]').forEach(b=>b.onclick=()=>{const k=b.dataset.removeFilter;if(k==='q')query.q='';if(k==='kind')query.kind='all';if(k==='category')query.category='all';if(k==='amount'){query.min='';query.max='';}query.page=1;quickPick='';browse();});
  const badgeCount=activeFilterCount(),toggle=$('.filter-toggle');
  if(toggle){toggle.querySelector('.filter-badge')?.remove();if(badgeCount)toggle.insertAdjacentHTML('beforeend',`<b class="filter-badge">${badgeCount}</b>`);}
  syncSaves();arrangeNewspaper();syncEndnoteMorph();scheduleEndnoteMorph();
};

function savedView(){
  const rows=listings.filter(l=>savedFinds.has(l.id));
  main.innerHTML=`<div class="collection-heading"><p class="eyebrow">Your collection</p><h1 tabindex="-1">Saved listings</h1><p>Bookmarked listings from around campus.</p></div><div class="listing-grid saved-grid">${rows.length?rows.map(l=>l.status==='active'?card(l):`<article class="unavailable-card"><h2>This listing is unavailable</h2><p>The owner may have edited or closed it.</p><button class="text-button" type="button" data-unsave-unavailable="${esc(l.id)}">Remove from saved</button></article>`).join(''):`<div class="empty-state"><span class="empty-mark" aria-hidden="true">${bookmark}</span><h2>No saved listings yet.</h2><p>Bookmark any listing while browsing to keep track of it here.</p><a href="#browse" class="button primary">Browse listings ${viewArrow}</a></div>`}</div>`;
  syncSaves();
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-save],[data-unsave-unavailable]');if(!b)return;const id=b.dataset.save||b.dataset.unsaveUnavailable,l=listings.find(x=>x.id===id);if(!l)return;if(savedFinds.has(id)){savedFinds.delete(id);toast('Removed from saved finds.');}else if(l.status==='active'){savedFinds.add(id);toast('Saved for another look. Find it in Saved finds.');}syncSaves();if(location.hash==='#saved')savedView();});
const editionDetail=detail;
detail=function(id){
  editionDetail(id);const l=listings.find(x=>x.id===id);if(!l||!$('.detail-facts'))return;
  if(l.status==='active'){recentlyViewed=[id,...recentlyViewed.filter(x=>x!==id)].slice(0,4);$('.detail-facts').insertAdjacentHTML('beforeend',`<div class="detail-save">${saveButton(l,true)}</div>`);}
  const related=listings.filter(x=>x.status==='active'&&x.id!==id&&x.kind===l.kind).slice(0,3);
  if(related.length)main.insertAdjacentHTML('beforeend',`<section class="related-section"><div class="section-label"><h2>Related listings</h2><a href="#browse">Browse listings ${viewArrow}</a></div><div class="listing-grid related-grid">${related.map(x=>card(x)).join('')}</div></section>`);
  syncSaves();
};
const editionSpecificFields=specificFields;
specificFields=function(kind,l){
  editionSpecificFields(kind,l);
  enhanceSelects($('#listing-form'));
};
const editionForm=formView;
formView=function(id){
  editionForm(id);const f=$('#listing-form');if(!f)return;
  if(!id){$('h1').textContent='Post a listing';}
  $('.page-eyebrow')?.remove();
  $('.form-aside').innerHTML='<div class="preview-caption"><span></span> Live preview</div><div id="live-listing"></div><p class="preview-private">Listings are reviewed briefly before appearing on the campus board.</p>';
  enhanceSelects(f);
  function update(){
    const d=Object.fromEntries(new FormData(f));
    const item={id:'preview',kind:d.kind,title:d.title?.trim()||'Listing title',category:d.category||'Your category',description:d.description?.trim()||'Add a description.',amount:d.kind==='wanted'&&d.flexible==='on'?null:d.amount===''||d.amount===undefined?0:Number(d.amount),condition:d.condition||'good',unit:d.unit||'hour',zone:d.zone||'main_campus',image:d.image||'laptop',photoUrl:d.photoUrl||'',age:'Just now',status:'pending'};
    $('#live-listing').innerHTML=card(item);
    $('#live-listing').querySelectorAll('a').forEach(a=>a.removeAttribute('href'));
    if((!d.amount&&d.amount!=='0')&&!(d.kind==='wanted'&&d.flexible==='on'))$('#live-listing .card-price').textContent='Price';
  }
  function clearCorrectedErrors(){
    const d=Object.fromEntries(new FormData(f));const n=v=>Array.from((v||'').trim()).length;
    const valid={title:n(d.title)>=5&&n(d.title)<=80,description:n(d.description)>=20&&n(d.description)<=1500,category:(categories[d.kind]||[]).includes(d.category),amount:d.kind==='wanted'&&d.flexible==='on'||d.amount!==''&&d.amount!==undefined&&Number.isFinite(Number(d.amount))&&Number(d.amount)>=0&&Number(d.amount)<=1000000&&Math.abs(Number(d.amount)*100-Math.round(Number(d.amount)*100))<.00001};
    for(const [key,ok]of Object.entries(valid)){const el=key==='category'?$('#form-category'):$('#'+key);if(ok&&el?.hasAttribute('aria-invalid')){el.removeAttribute('aria-invalid');$('#'+key+'-error').textContent='';}}
    const count=f.querySelectorAll('[aria-invalid=true]').length;
    if(!count)$('#form-errors').textContent='';else if($('#form-errors').textContent)$('#form-errors').innerHTML='<p class="error-summary">Please check '+count+' highlighted '+(count===1?'field':'fields')+' before submitting.</p>';
  }
  f.addEventListener('input',()=>{update();clearCorrectedErrors();});
  f.addEventListener('change',()=>{update();clearCorrectedErrors();enhanceSelects(f);});
  update();
};
removeEventListener('hashchange',route);
route=function(){closeAllSelects(false);toast('');newspaperObserver?.disconnect();cancelAnimationFrame(newspaperFrame);newspaperFrame=0;cancelAnimationFrame(endnoteMorphFrame);endnoteMorphFrame=0;newspaperLayout=()=>{};let hash=location.hash||'#browse';if(!/^#(browse|saved|mine|post(?:\/wanted)?|listing\/[\w-]+|edit\/[\w-]+)$/.test(hash)){hash='#browse';history.replaceState(null,'',location.pathname+location.search+hash);}const [view,id]=hash.slice(1).split('/');if(view==='browse')browse();else if(view==='saved')savedView();else if(view==='mine')mine();else if(view==='listing')detail(id);else{formView(view==='edit'?id:null);if(view==='post'&&id==='wanted'){const r=$('[name=kind][value=wanted]');r.checked=true;r.dispatchEvent(new Event('change',{bubbles:true}));formSnapshot=serializeForm();}}document.title=`${{browse:'The campus edition',saved:'Saved finds',mine:'My listings',listing:'Listing details',post:'Post a listing',edit:'Edit listing'}[view]} · Student Marketplace`;document.querySelectorAll('[data-nav]').forEach(a=>{if(a.dataset.nav===view)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});document.body.dataset.view=view;syncSaves();$('h1')?.focus({preventScroll:true});scrollTo({top:0,behavior:'instant'});lastHash=hash;};
addEventListener('hashchange',route);
document.body.dataset.direction='newspaper';document.body.dataset.layout=resultLayout;route();

document.addEventListener('click',e=>{const link=e.target.closest('a[href^="#"]');if(!link||link.hasAttribute('data-cancel')||link.getAttribute('href')==='#main'||link.getAttribute('href')===location.hash||!$('#listing-form'))return;if(serializeForm()!==formSnapshot&&!confirm('Leave this page and discard your unsaved listing?')){e.preventDefault();e.stopPropagation();}},true);

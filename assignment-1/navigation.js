'use strict';
// Slide-over site menu. Presentation state only: opening never rerenders a view or stores user data.
(() => {
  const button = document.querySelector('#menu-toggle');
  const drawer = document.querySelector('#site-menu');
  const backdrop = document.querySelector('.menu-backdrop');
  if (!button || !drawer || !backdrop) return;
  let open = false, hideTimer = 0;
  function setOpen(next, {restoreFocus = true} = {}) {
    if (next === open) return;
    open = next;
    clearTimeout(hideTimer);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.documentElement.classList.toggle('menu-open', open);
    if (open) {
      backdrop.hidden = false;
      drawer.removeAttribute('inert');
      // Let the backdrop paint before fading it in.
      requestAnimationFrame(() => backdrop.classList.add('is-visible'));
      drawer.classList.add('is-open');
      drawer.querySelector('[aria-current="page"], .drawer-nav a')?.focus({preventScroll: true});
    } else {
      drawer.classList.remove('is-open');
      drawer.setAttribute('inert', '');
      backdrop.classList.remove('is-visible');
      hideTimer = setTimeout(() => { backdrop.hidden = true; }, 320);
      if (restoreFocus) button.focus({preventScroll: true});
    }
  }
  button.addEventListener('click', () => setOpen(!open));
  document.querySelectorAll('[data-menu-close]').forEach(el => el.addEventListener('click', () => setOpen(false)));
  drawer.querySelectorAll('.drawer-nav a').forEach(a => a.addEventListener('click', () => setOpen(false, {restoreFocus: false})));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && open) setOpen(false); });
  addEventListener('hashchange', () => setOpen(false, {restoreFocus: false}));
})();

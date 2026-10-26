'use strict';
// Presentation state only; collapsing never rerenders a view or stores user data.
(() => {
  const shell = document.querySelector('.app-shell');
  const button = document.querySelector('#sidebar-toggle');
  const content = document.querySelector('#sidebar-content');
  if (!shell || !button || !content) return;
  let collapsed = false;
  function update() {
    const desktop = innerWidth > 850;
    button.hidden = !desktop;
    content.hidden = desktop && collapsed;
    shell.classList.toggle('sidebar-collapsed', content.hidden);
    button.setAttribute('aria-expanded', String(!content.hidden));
    button.textContent = content.hidden ? 'Menu' : 'Hide menu';
    if (content.hidden && content.contains(document.activeElement)) button.focus({preventScroll:true});
  }
  button.addEventListener('click', () => {
    collapsed = !collapsed;
    update();
    // Let the responsive card-packing fallback recalculate the wider content area.
    dispatchEvent(new Event('resize'));
  });
  addEventListener('resize', update);
  update();
})();

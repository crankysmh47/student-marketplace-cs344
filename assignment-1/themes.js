'use strict';
// Change presentation only: no rerender, navigation or storage of user data.
(() => {
  const buttons = [...document.querySelectorAll('[data-theme-choice]')];
  function readTheme() {
    return new URLSearchParams(location.search).get('theme') === 'mist' ? 'mist' : 'forest';
  }
  function applyTheme(theme, updateUrl = false) {
    document.body.dataset.theme = theme;
    document.documentElement.dataset.theme = theme;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.themeChoice === theme)));
    document.querySelector('meta[name="theme-color"]').content = theme === 'forest' ? '#ffffff' : '#e9f0ed';
    if (updateUrl) {
      const url = new URL(location.href);
      url.searchParams.set('theme', theme);
      history.replaceState(history.state, '', url);
    }
  }
  buttons.forEach(button => button.addEventListener('click', () => applyTheme(button.dataset.themeChoice, true)));
  addEventListener('popstate', () => applyTheme(readTheme()));
  applyTheme(readTheme());
})();

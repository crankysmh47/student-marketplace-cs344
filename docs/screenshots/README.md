# Browser evidence

Captured from the running static app served from `assignment-1/` at `http://127.0.0.1:8137`.

- **Desktop (`1440x900`, `1366x768`, `1280x800`)**: Zero horizontal overflow (`scrollWidth <= clientWidth`), full-viewport `skyline.svg` backdrop, slide-over hamburger menu (`drawer-menu.jpg`), collapsible Filters drawer (`filters-drawer.jpg`), scroll-end Wanted CTA morph into `.endnote` (`endnote-morph.jpg`), Saved finds (`saved-listings.jpg`), My listings status filters (`my-listings.jpg`), and Post form with live preview and inline error validation (`listing-form.jpg`, `form-validation.jpg`).
- **Tablet (`768x1024`)**: Verified zero horizontal overflow (`scrollW: 753 <= clientW: 768`) with Wanted cards stacked below the 2-column listing grid (`tablet-browse.jpg`).
- **Mobile (`390x844`)**: Verified zero horizontal overflow (`scrollW: 375 <= clientW: 390`) with compact header, unclipped search + filter button row, and single-column cards (`mobile-browse.jpg`).
- **Console checks**: Empty `pageerror` and console error log across all inspected routes and viewports.

Wireframes are stored separately in [../wireframes](../wireframes). Automated unit/DOM tests covering delete confirmation and cancel paths live in [../../tests/assignment-1.test.cjs](../../tests/assignment-1.test.cjs).

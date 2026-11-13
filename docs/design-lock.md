# Finalized Frontend Design Contract

Student: Annan Khan (`CMS 506644`, `BESE15-B`) · Course: CS344 Web Engineering (Assignment 1, Idea #16).
(Note: The earlier v1.0/v1.3 newspaper-sidebar baseline remains preserved in git tag `assignment-1-v1.3` and commit history; `assignment-1/` now locks the finalized monochrome editorial UI.)

## Visual System & Typography
- **Surface & Ink Palette (`premium.css`)**: Warm off-white ground (`#faf9f6`) layered over a subtle fixed campus skyline (`assets/skyline.svg`), pure white elevated cards (`#ffffff`), soft stone canvas (`#f5f4f0`) with frosted glass panels, deep ink monochrome chrome (`#0b0b0c`), and restrained accent tokens (`#e0472b` accent badge, `#2b4c7e` services card, `#9a5b22` wanted highlight).
- **Fonts (bundled locally in `assignment-1/assets/fonts/`)**: Variable `Fraunces` serif for display wordmarks, page headings, and editorial card titles; `DM Sans` for featured card headlines, controls, metadata, and form UI. No third-party font CDN is required.

## Layout & Interactions
- **Header & Slide-over Menu**: Sticky 64px dark `.site-header` with hamburger `#menu-toggle` controlling `#site-menu` (`inert` when closed, keyboard `Escape` + focus return, never clears unsent form inputs), centered brand wordmark, live saved counter link (`#saved`), primary `#post` pill, and `#mine` avatar shortcut.
- **Hero & Collapsible Filters Drawer**: Frosted `.hero` header paired with search form and `Filters` button toggling `.filter-drawer` (listing type tabs `All`/`Goods`/`Services`/`Wanted` with counts, custom accessible `Sort` listbox, Grid/List toggle, Quick Collections chips, Category custom dropdown, and `Min`/`Max` PKR validation).
- **Mosaic Spread & Docked Wanted Morph**: Desktop 3-column `.editorial-mosaic` (featured goods spanning two columns with `Featured` pill, boxed cards, sleek translucent `SERVICES` pill on service listings, no badge on Goods) beside a sticky `Wanted` classifieds rail whose cards omit the redundant `Wanted` pill. When scrolling docks the rail above the bottom `.endnote` bar, `.classifieds-place` glides smoothly into `.endnote-cta` (`Can't find it? Ask the campus. / Post a wanted listing ->`) and reverses cleanly on scroll-up.
- **Breakpoints**: Responsive Grid and Flexbox adjustments at `max-width: 1120px` (Wanted stacks below mosaic), `max-width: 960px` (2-column mosaic and single-column detail/form aside), and `max-width: 720px` (mobile 1-column cards, compact search/filter controls), plus `prefers-reduced-motion`.

## Forms, Ownership & A2/A3 Boundaries
- Native HTML constraints (`required`, `minlength`, `maxlength`, `min`, `max`, `step`) paired with JS validation, HTML entity escaping (`esc()`), optional in-memory photo upload (`FileReader`, `<= 5 MB`), custom keyboard-accessible `<select>` wrappers with `invalid` focus forwarding, and a real-time Live preview card.
- In-memory state (`listings`, `savedFinds`, `recentlyViewed`) resets on refresh. No payments, server auth, database persistence, real contact requests, automated expiry, or abuse moderation resolution exist in Assignment 1; those extend cleanly onto this record schema in Assignments 2 (PHP/PDO) and 3 (MERN).

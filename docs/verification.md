# Assignment 1 Verification

Student: **Annan Khan** (`CMS 506644`, `BESE15-B`) · Assigned Idea #16: *Student Marketplace Listings*.

## Automated DOM Test Suite
- **Command**: `node --test tests/assignment-1.test.cjs` (`15/15` passed, `0` failed; TAP log stored in [test-results.tap](test-results.tap)).
- **Coverage**:
  - Native browser validation attributes & bounds (`title` `5–80`, `description` `20–1500`, `amount` `0–1,000,000` with 2-decimal precision).
  - Combined keyword search, type tabs, category filtering, empty results handling, and invalid `min > max` range guard.
  - Owner CRUD (`create`, `edit`, `delete`, cancel confirmation, non-owner guard) keeping newly posted/edited entries in `Pending review`.
  - HTML escaping (`<script>` stays literal) and route safety (`#edit/<non-owned>`).
  - Save / unsave bookmarks updating header/drawer counters without writing `localStorage` or `sessionStorage`.
  - Masonry span packing geometry (`newspaperSpan`), service rate units, and flexible wanted budgets.
  - Slide-over menu drawer (`aria-expanded`, `inert`, `Escape`) preserving unsent form state.
  - Filters drawer controls, removal of stale demo disclaimers across routes, custom `<select>` bidirectional sync + keyboard navigation, listing photo upload & preview rendering, docked scroll-end Wanted CTA morph & reversal (with omitted `Wanted` badge inside Wanted sections), semantic `H1 -> H2 -> H3` order, zero nested interactive controls inside `<label>`, and invalid Category trigger focus highlighting.

## Headless Chromium & Accessibility Checks
- Verified in headless Chrome across **`1440x900`**, **`1366x768`**, **`1280x800`**, **`768x1024`**, and **`390x844`**:
  - Zero horizontal document overflow (`scrollW <= clientW` at desktop `1425 <= 1440`, tablet `753 <= 768`, mobile `375 <= 390`).
  - Empty `pageerror` and console error logs across `#browse`, `#saved`, `#mine`, `#post`, `#listing/laptop`, filters drawer, slide-over menu drawer, and bottom scroll morph.
  - Verified live constraint-validation focus recovery when submitting `#post` with an unselected required `Category` (`.select-trigger` receives focus and error outline, `#category-error` populates, and `aria-invalid` clears when selected).
- **Manual interactive note**: While in-memory delete & cancel flows pass automated `jsdom` tests cleanly, verify clicking `Delete` (`window.confirm`) interactively in Chrome before live grading walkthroughs.

## Public Deployment Check
- Verified live Vercel production deployment [https://student-marketplace-cs344.vercel.app](https://student-marketplace-cs344.vercel.app) serves the latest static assets with HTTP `200`, matching layout behavior, and zero console errors. See [deployment.md](deployment.md).

## Next Before Submission Doc
- Rebuild [submission/Annan_Khan_506644_Assignment_1.docx](../submission/Annan_Khan_506644_Assignment_1.docx) & `.pdf` so the submitted report matches this finalized monochrome editorial build, refined tests, wireframes, and verification scope.

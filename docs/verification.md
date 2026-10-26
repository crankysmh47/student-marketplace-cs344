# Assignment 1 verification

Date: 26 October 2026. Student: Annan Khan, CMS 506644, BESE15-B.

## Automated evidence

Command: pnpm test (equivalent: node --test tests/assignment-1.test.cjs). Eight tests passed, zero failed. Tests execute the actual app scripts in jsdom and exercise native constraints, combined filters, empty results, invalid ranges, listing create/edit/delete, pending visibility, output escaping, save/unsave, deletion cancellation and non-owned targets, service units, flexible budgets and packing math.

Tests were written first for the newly added native constraints and delete control. The baseline run failed those two cases; the corrected run passed. This does not establish test-first development of the earlier generated preview.

## Browser evidence

The actual app was inspected at 1280x800, 768x1024 and 390x844. No horizontal document overflow was found. Page and main backgrounds resolve to rgb(255,255,255). Desktop DOM geometry showed subsequent small listings beginning beneath the short featured laptop while the taller adjacent book card continued beside them. Native validation rejected an empty form, focused title and showed Please fill out this field. A fictional desk was created as pending and edited successfully. Search with no matches, clearing filters, saving and the saved-items view passed browser checks. Tab from the main heading focused search. Console error log for the clean preview was empty.

The Delete confirmation caused the browser automation channel to stall. No browser-level delete completion is claimed. Automated DOM tests verify delete, cancellation and non-owned targets. The source requires confirmation before removing the in-memory record. Confirm this final UI action during the student's walkthrough. A complete screen-reader audit and independent-user usability test were not performed.

## Rubric coverage

- Working app and interactions (10): active client-only browse/search/filter, details, create/edit/delete and saved views; automated and selected browser evidence above.
- Semantic HTML/forms/accessibility (5): headings, navigation, main, articles, labeled inputs, fieldsets, required/min/max/step/text constraints, skip link and visible focus styles; one keyboard focus step checked.
- CSS responsive layout (7): Grid, Flexbox, box model and multiple breakpoints; screenshots at three sizes.
- JavaScript/DOM/edge cases (5): arrays, sets, functions, branches, events, rendering, empty/invalid/safe text tests.
- GitHub/README/design note/walkthrough (3): repository, run instructions, screenshots, wireframes and WDLC report included. Student AI statement, grader access and live explanation/change remain student actions.

Marks are rubric weights, not predicted scores.

## Before LMS submission

1. Add the final AI assistance statement as agreed with the instructor.
2. Give the assessor access to the private repository, or change its visibility yourself if required.
3. Open the app locally; confirm Delete and cancel in the browser, then refresh to restore demo records.
4. Practise explaining filtering, rendering, validation and pending-state behavior, and changing one field rule or CSS value live.
5. Upload the report in the format accepted by LMS; the source ZIP is also supplied as a backup. The brief still requires GitHub source or a permitted demonstration, so the report alone is not the whole assignment.


## Navigation refinement

The left desktop rail and hidden browse h1 reduce the top stack. At 1280x800 the search begins at y=140 and results at y=400, versus y=579 in the earlier capture. CSS retains pure-white surfaces. Eight DOM tests still pass after the structure change. Screenshots and wireframes are refreshed for this revision.


## Collapsible sidebar

Nine tests pass after a new failing regression test was added for the sidebar. It covers collapse/expand, preserved unsent form data, mobile visibility and restoring the desktop state. In-browser clicking Hide menu hid its content and widened main from 1029px to 1137px at a 1280px viewport, without overflow. Enter reopened the Menu button. At 390px the toggle is hidden and navigation remains available. Screenshot: screenshots/sidebar-collapsed.jpg.

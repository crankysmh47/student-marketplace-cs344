# Approved frontend design

Approved by Annan Khan on 26 October 2026. The immutable reference is ../approved-design-2026-10-26 outside this repository, with hashes and a ZIP alongside it.

## Navigation refinement

The user approved another refinement on 26 October 2026: desktop navigation moves into a compact left rail, the redundant visible browse heading is removed, and the reset notice moves into the rail. Browse retains an accessible visually hidden h1. At 850px and below navigation is horizontal; the core newspaper listings and Wanted rail keep their existing behavior.

## Visual contract

Keep the page and card surfaces pure white (#FFFFFF). Use the locally bundled Unifraktur Cook blackletter face for the masthead, Roboto Slab for compact listing titles, and Arial for controls and description copy. The masthead reaches 52px on desktop, listing titles remain 21px, and prices remain 20px. Use the sizes already encoded in newspaper.css as the authority at each breakpoint.

Goods use #215441 with a solid rule and filled text label. Services use #305C86, double rules and an outlined text label. Wanted posts use #86532F and dashed classified notices. Listing-type icons, leaf decorations and marketing slogans are excluded.

The main spread has narrow equal tracks and occasional higher-priced goods spanning two columns. Features stay in result order. Content-height packing places subsequent narrow entries beneath a shorter horizontal feature, with about 30px vertical and 24px horizontal space. Wanted occupies a separate ruled side column, moving below the offers on narrower screens. Mobile uses a single column. Price sorts and list view retain direct ordered results.

Use the same visual language for details, saved listings, My listings and the listing form. Native constraints and per-field errors support form validation. No payments or real authentication exist in Assignment 1. Demo ownership and review status are browser simulations, not security controls.

## Future continuity

Assignment 2 requires PHP/PDO persistence, Fetch, server validation and session/CSRF protections. Assignment 3 requires React, Express and MongoDB. Preserve fields, rules, fixtures, CSS classes and tests where useful; framework and server transitions require some replacement code. Real university-email restrictions await the supplied address template. Real moderation, contact requests, expiry and report resolution belong to later server-backed stages.


## Sidebar collapse

The desktop rail has a text toggle with aria-expanded and aria-controls. Collapse reduces its width from 164px to 56px and hides the links without rerendering the view. Menu remains reachable to reopen it. The choice lasts for the current page session; mobile always shows navigation and hides the toggle.

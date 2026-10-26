# Continuity after Assignment 1

Assignment 1 is the vanilla HTML/CSS/JavaScript client in assignment-1. Keep its tagged checkpoint. The user-approved visual contract is docs/design-lock.md; keep listing fields, type rules, validation boundaries and CSS classes consistent as later stages evolve.

Assignment 2 is due 20 November 2026 and requires PHP 8.5 with PDO and SQLite/MySQL. Add persistence, CRUD endpoints, JSON Fetch with async/await, loading/error/empty/success UI, server validation, prepared statements, sessions and CSRF. Use the later course scaffold when supplied. Introduce the configured university-email policy only after its exact template is provided. Real saved ownership, contact requests and moderation can extend the same records.

Assignment 3 is due 11 December 2026 and requires React, Express and MongoDB. Port the UI into reusable components, map the PHP schema to collections, document REST methods/status codes, add authenticated ownership/roles and one new feature, and test normal and unauthorized operations. Preserve all three stages in folders, branches or tags.

The final project extends Assignment 3 with the complete idea-16 flows: moderation, categories, saved items, contact requests, expiry and report abuse, demo data and no real payments. Its separate due date and rubric are pending. The client-side ownership simulation does not enforce real security.

Reuse is planned around stable data and behavior, not a promise that every source file will remain unchanged. Keep domain rules independent from DOM or server frameworks when extracting them for later stages; avoid a speculative architecture rewrite during the Assignment 1 deadline.

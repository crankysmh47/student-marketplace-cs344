# Production deployment

Deployed 26 October 2026 to the authenticated Vercel account crankysmh47, scope crankysmh47s-projects.

Production URL: https://student-marketplace-cs344.vercel.app

Project: student-marketplace-cs344

Deployment URL: https://student-marketplace-cs344-1oejjefv4-crankysmh47s-projects.vercel.app

Only assignment-1 is uploaded. It is a static HTML/CSS/JavaScript deployment with no build command, API, database or environment secrets. Reports, student-identification documents, tests and other repository files are outside the deployed directory. The GitHub repository remains private.

The production alias was verified with unauthenticated HTTP requests: root HTML, app.js, edition.js, navigation.js, newspaper.css, the masthead font and laptop SVG all returned 200 and matched the local files byte for byte. The live app rendered in the browser, its sidebar collapsed and reopened, no horizontal overflow was reported at the inspected desktop viewport, and the browser error log was empty. Screenshot: screenshots/vercel-production.jpg.

The local .vercel link is intentionally ignored. To deploy a later revision, follow the CLI commands in the root README. GitHub pushes alone have not been configured as an automatic deployment workflow.

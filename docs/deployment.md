# Production Deployment

Project: **student-marketplace-cs344** (scope `crankysmh47s-projects`, owner `crankysmh47`).
Production URL: **https://student-marketplace-cs344.vercel.app**

## Scope
Only `assignment-1/` is deployed to Vercel as a pure static site (`assignment-1/vercel.json`: `"framework": null`, `"outputDirectory": "."`, no build step, backend API, database, or environment secrets). Documentation, wireframes, screenshots, tests, and submission reports remain outside the deployed bundle.

## Redeploy Commands
GitHub pushes alone do not automatically trigger Vercel builds for this project; publish frontend updates under `assignment-1/` using the Vercel CLI:

```bash
vercel link --yes --project student-marketplace-cs344 --scope crankysmh47s-projects --cwd assignment-1
vercel deploy --prod --yes --scope crankysmh47s-projects --cwd assignment-1
```

Keeping `assignment-1/.vercel/` untracked in `.gitignore` avoids leaking local project metadata. Live HTTP status (`200`), asset loading, interactive DOM state, and empty browser console logs are verified against `https://student-marketplace-cs344.vercel.app` after deploying.

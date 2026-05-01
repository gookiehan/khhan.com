# Astro Migration Checklist

This document tracks the planned migration from the current static `index.html` + `data.js` site to an Astro-based content-managed static site.

## Working Branch

- Target branch: `feature/astro-migration`
- Current rule for this checkpoint: do not write Astro code yet.
- Preserve the current source files until the migration implementation starts:
  - `index.html`
  - `data.js`
  - `style.css`

## Current Checkpoint

- Baseline source: `data.js`
- Total content items: 227
- `files[]` link entries: 177
- Unique `files[]` URLs: 146
- Missing referenced local assets: 0
- Restored local assets verified: 8
  - `assets/images/KAIST_stereo.jpg`
  - `assets/images/gui.jpg`
  - `assets/images/hublan1.jpg`
  - `assets/images/ino.jpg`
  - `assets/images/mybot.bmp`
  - `assets/images/sample320.jpg`
  - `assets/images/sample640.jpg`
  - `assets/images/smt.jpg`

## Pre-Migration Backup Tag

Create a stable restore point before replacing the current site structure.

```powershell
git switch main
git status --short
git tag -a before-astro-migration -m "Backup before Astro migration"
git push origin before-astro-migration
git switch feature/astro-migration
```

If the tag already exists, verify it before reusing or replacing it:

```powershell
git show before-astro-migration
```

## Phase 0: Baseline Freeze

- [ ] Confirm the current site runs locally:

  ```powershell
  python -m http.server 8000
  ```

- [ ] Confirm the current production custom domain still resolves to the expected GitHub Pages site.
- [ ] Create the `before-astro-migration` tag.
- [ ] Capture before screenshots for desktop and mobile viewport comparison.
- [ ] Keep `CONTENT_INVENTORY.md` as the baseline content count and link inventory.

## Phase 1: Astro Project Scaffold

- [x] Add Astro project files without changing content semantics.
- [x] Keep GitHub Pages compatibility.
- [x] Preserve custom domain handling by keeping `CNAME` in the published output.
- [x] Move or expose static assets under Astro's public asset path.
- [x] Add local commands:
  - `npm run dev`
  - `npm run build`
  - `npm run preview`

Local Astro commands:

```powershell
npm install
npm run dev
npm run build
npm run preview
```

The custom domain is preserved by keeping `khhan.com` in `public/CNAME`; Astro copies files from `public/` into `dist/` during build.

Build verification:

- `npm run build` passed with Astro 5.18.1.
- Generated output includes `dist/CNAME`.

Current static site reproduction:

- `src/pages/index.astro` mirrors the current `index.html` structure.
- `data.js`, `style.css`, `CNAME`, and `assets/` remain source files at the repository root.
- `npm run dev` and `npm run build` run `scripts/sync-static.mjs` first, copying those root static files into `public/` so Astro serves and builds the existing relative paths.

Content migration verification:

- `CONTENT_MIGRATION_REPORT.md` confirms the Astro-rendered structure matches the current `data.js` baseline.
- Total content items: 227 expected / 227 rendered.
- `files[]` link entries: 177.
- Unique `files[]` URLs: 146.
- Local asset URLs in `dist/`: 109 checked, 0 missing.
- `npm run build` passed after the content migration comparison.

YAML rendering migration:

- `src/pages/index.astro` now renders from `src/data/*.yml` (server-side) instead of client-side section population from `data.js`.
- Content parity checks remain matched: total 227, `files[]` links 177, unique URLs 146.
- `public/data.js` is now a cleanup candidate for rendering flow, but retained for the legacy admin-panel helper path.
- Final YAML rendering verification passed: section totals, link counts, and `dist` asset checks all match baseline values.

Componentization pass 1:

- Added minimal common components only: `Section.astro`, `FileLinks.astro`, `ListSection.astro`.
- Kept section order, content meaning, and layout unchanged.
- Validation remained matched: total 227, `files[]` 177, unique URLs 146, local asset URLs 109, `dist` missing 0.

Content validation script:

- Added `scripts/validate-content.mjs` and npm commands `validate:content` / `validate`.
- Current validation status: pass (total 227, `files[]` 177, unique URLs 146, local assets 109, missing in `dist` 0).
- `npm run build` remains passing after validator integration.

Link validation script:

- Added `scripts/validate-links.mjs` and npm command `validate:links`.
- `validate` now runs `validate:content` + `validate:links`.
- Link validation status: pass (`files[]` 177, unique URLs 146, local assets 109, missing local assets 0).

Legacy data.js runtime cleanup (pass 1):

- Removed `?edit` runtime `fetch('data.js')` dependency in `src/pages/index.astro`.
- Legacy editor entry is now disabled with YAML migration guidance (`src/data/*.yml` editing path).
- `scripts/sync-static.mjs` no longer copies root `data.js` to `public/data.js`, and removes stale `public/data.js`.
- Verification: `npm run validate` pass, `npm run build` pass, `dist/data.js` not generated, `dist/style.css`/`dist/assets/`/`dist/CNAME` preserved.
- Rollback: restore previous behavior by reverting `src/pages/index.astro` and `scripts/sync-static.mjs` to the commit before this cleanup.

## Final pre-PR checklist

Final verification run completed on `feature/astro-migration` before PR creation.

- [x] `git status` checked.
- [x] `npm run validate:content` passed.
- [x] `npm run validate:links` passed.
- [x] `npm run validate` passed.
- [x] `npm run build` passed.
- [x] `dist/CNAME` confirmed as `khhan.com`.
- [x] Total content items: 227 (maintained).
- [x] `files[]` link entries: 177 (maintained).
- [x] Unique URLs: 146 (maintained).
- [x] Unique local asset URLs: 109 (maintained).
- [x] Missing local assets in `dist`: 0 (maintained).
- [x] GitHub Pages workflow confirmed:
  - PR: validate/build only, no deploy.
  - `main` push: validate/build + artifact upload + deploy.
- [x] `README.md` reflects current YAML/Astro structure and commands.
- [x] `MIGRATION.md`, `CONTENT_MIGRATION_REPORT.md`, `LINK_VALIDATION_REPORT.md` are updated and consistent with current baseline.

## Phase 2: Content Model

- [ ] Split `data.js` into section-specific content files.
- [ ] Prefer structured data files for repeated records:
  - profile
  - education
  - career
  - research
  - qea
  - awards
  - activities
  - publications
  - patents
  - honors
  - ta
  - clubs
- [ ] Define schemas for required fields, optional descriptions, dates, links, and local file references.
- [ ] Preserve existing HTML-rich citation fields or replace them with a safer structured citation model.
- [ ] Decide whether QEA entries duplicated in Publications should remain duplicated or become shared references.

## Phase 3: Component Migration

- [ ] Convert the current page skeleton into Astro layout and components.
- [ ] Create reusable components:
  - section wrapper
  - item card
  - citation card
  - file links
  - collapsible section
  - navigation
- [ ] Preserve current anchor IDs so existing links keep working.
- [ ] Preserve the current visual style before attempting design improvements.

## Phase 4: Validation

- [ ] Match section item counts against `CONTENT_INVENTORY.md`.
- [ ] Match `files[]` links against `CONTENT_INVENTORY.md`.
- [ ] Check all local asset references exist.
- [ ] Resolve or intentionally document the missing local assets listed in `CONTENT_INVENTORY.md`.
- [ ] Verify external links are preserved.
- [ ] Build successfully with no schema errors.
- [ ] Test desktop and mobile layouts.

## Phase 5: Deployment

- [x] Add GitHub Actions workflow for Astro build and GitHub Pages deploy.
- [ ] Confirm GitHub Pages source is set to GitHub Actions.
- [ ] Confirm custom domain `khhan.com` remains configured.
- [ ] Confirm generated output contains `CNAME`.
- [ ] Deploy from `feature/astro-migration` to a preview path or test branch first if possible.

Workflow added:

- `.github/workflows/deploy.yml`
- PR: runs `npm ci`, `npm run validate`, `npm run build` only (no deploy).
- `main` push: runs validate/build, verifies `dist/CNAME == khhan.com`, uploads Pages artifact, then deploys.

## Phase 6: Cutover

- [ ] Compare before and after pages against the baseline screenshots.
- [ ] Confirm content counts, links, and assets.
- [ ] Confirm production domain after merge.
- [ ] Keep `before-astro-migration` tag as a rollback point.
- [ ] Document the new content editing workflow in `README.md`.

## Known Risks Before Implementation

- Previously missing `files[]` local image references have been restored and verified in `assets/images`.
- Several content fields contain inline HTML; schemas and renderers must handle this deliberately.
- Some external links use old `http://` URLs and may be unstable.
- Large media files should remain static assets and should not be imported into bundled client code.
- The current admin panel in `index.html?edit` is preview/download only; replacing it is not part of the first Astro migration unless explicitly scoped.

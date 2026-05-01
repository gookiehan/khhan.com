# Link Validation Report

## Scope

- Target files: `src/data/*.yml`
- Target field: every `files[].url`
- Network access: not used (format-only check for external URLs)

## Validation Rules

- Local links:
  - `assets/...`
  - `/assets/...`
  - Must exist in repository root or `public/` (same relative asset path).
- External links:
  - Must start with `http://` or `https://`.
  - No runtime fetch/check is performed.
- Special links:
  - `mailto:...`, `tel:...` are treated as valid special links.
- `files[]` entry:
  - `file.url` is required.
  - `file.label` is optional.

## Results

| Metric | Expected | Actual | Result |
| --- | ---: | ---: | --- |
| `files[]` link entries | 177 | 177 | Pass |
| Unique URLs | 146 | 146 | Pass |
| Unique local asset URLs | 109 | 109 | Pass |
| Missing local assets | 0 | 0 | Pass |

Classification summary:

- Local unique URLs: 109
- External unique URLs: 37
- Special unique URLs (`mailto:`, `tel:`): 0
- Unsupported/other schemes: 0

## Command Checks

- `npm run validate:links`: passed
- `npm run validate`: passed (`validate:content` + `validate:links`)
- `npm run build`: passed

## Operations-mode policy update

- `validate:links` now treats baseline link counts as informational only.
- Growth in link counts during normal content updates does not fail validation by itself:
  - `files[]` entries
  - unique URLs
  - unique local asset URLs
- Baseline values and deltas are printed in script output for monitoring.
- Fail conditions remain strict for:
  - missing/empty `files[].url`
  - unsupported URL scheme/format
  - missing local file for `assets/...` and `/assets/...` URLs

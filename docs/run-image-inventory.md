# Run Image Inventory

Generated on 2026-04-04T21:22:54.621Z by `node scripts/generate-run-image-derivatives.mjs`.

## Summary

- Total referenced run images: 461
- Remote R2-backed references: 461
- Legacy local references: 0
- Originals migrated to `assets/photo-originals`: 0
- Oversized legacy originals (> 1.5 MB): 0
- Duplicate legacy binaries detected: 0

## Largest Legacy Originals

- None

## Duplicate Legacy Files

- No byte-identical duplicates detected in the current legacy run-image set.

## Delivery Policy

- Legacy source masters live under `assets/photo-originals/pictures/`.
- Legacy public delivery uses generated derivatives under `public/derived/runs/`.
- R2-backed assets use canonical `/media/runs/<asset-id>` references in content and public manifests under `https://cdn.macojaune.com/manifests/runs/`.
- Series and product pages should consume the generated manifest helpers from `utils/runs.ts`, not raw `/pictures/` URLs.

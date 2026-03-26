# Run Image Inventory

Generated on 2026-03-26T08:34:20.743Z by `node scripts/generate-run-image-derivatives.mjs --migrate`.

## Summary

- Referenced run images: 30
- Originals migrated to `assets/photo-originals`: 30
- Oversized originals (> 1.5 MB): 4
- Duplicate binaries detected: 0

## Largest Originals

- `/pictures/joraniebeach1-1.png` - 5.24 MB - 2480x1748
- `/pictures/dsc01798.jpg` - 1.89 MB - 2850x3563
- `/pictures/dsc01807.jpg` - 1.87 MB - 2800x3500
- `/pictures/insta_dsc07643.jpg` - 1.59 MB - 2048x2048

## Duplicate Files

- No byte-identical duplicates detected in the current run-image set.

## Delivery Policy

- Source masters live under `assets/photo-originals/pictures/`.
- Public delivery uses generated derivatives under `public/derived/runs/`.
- Series and product pages should consume the generated manifest helpers from `utils/runs.ts`, not raw `/pictures/` URLs.

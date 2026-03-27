# Macojaune Series Content Model

This document defines the editorial shape for `content/runs/*.md` and the migration path from the legacy front matter.

## Goals

- Keep the current Nuxt 3 + TinaCMS workflow.
- Preserve backward compatibility with existing templates during rollout.
- Give each series enough structure for immersive layouts, social previews, and future asset automation.

## Canonical Run Shape

Each run should contain:

- `title`, `slug`, `description`, `date`
- `status`: `draft`, `scheduled`, `published`, or `archived`
- `coverImage`: listing thumbnail and fallback social image
- `heroImage`: lead visual for the series page
- `gallery`: ordered series-level images with metadata
- `storyBlocks`: optional immersive editorial sections
- `products`: sellable works, each with:
  - `sku`, `title`, `slug`, `description`, `price`, `stock`
  - `heroImage`
  - `gallery`: ordered product images with `src`, `alt`, `caption`, `orientation`
  - `images`: legacy string array kept for backward compatibility

## Asset Organization

Use this folder strategy for all new series work:

- Original masters outside the public tree in `assets/photo-originals/pictures/`.
- Public derivatives inside `public/derived/runs/`.
- Derivative lookups generated into `generated/run-image-manifest.ts` and `public/derived/runs/manifest.json`.

The run-image pipeline now migrates series originals out of `public/pictures/` and generates responsive AVIF/WebP derivatives with a branded watermark for public delivery. Legacy non-run content can stay in `public/pictures/` until it is migrated separately.

## Migration Workflow

Run the normalization script from the repo root:

```bash
node scripts/sync-runs-content-model.mjs --write
```

What it does:

- lifts legacy `cover` into `coverImage`
- derives `heroImage` from the first available image when missing
- converts product `images` arrays into structured `gallery` entries
- backfills `status` with `published` for existing live series
- normalizes `price` and `stock` as numbers
- validates that referenced images exist in `public/pictures`

Then build the public derivatives:

```bash
node scripts/generate-run-image-derivatives.mjs --migrate
```

What it does:

- moves run-only source masters into `assets/photo-originals/pictures/`
- generates responsive `thumb`, `card`, `detail`, and `social` derivatives
- writes AVIF + WebP assets to `public/derived/runs/`
- emits an inventory report to `docs/run-image-inventory.md`
- updates the generated manifest consumed by `RunImage.vue` and `utils/runs.ts`

Validation-only mode:

```bash
node scripts/sync-runs-content-model.mjs
```

## Editorial Guidance

- `coverImage` should be the clearest listing thumbnail, not necessarily the widest image.
- `heroImage` should be the strongest mood-setter for the series page.
- `gallery` order matters. Put the intended reading/viewing sequence first.
- `alt` should describe what is visible, not the emotional interpretation.
- `caption` is optional and can carry context, technique, or exhibition notes.
- Use `storyBlocks` only when the series needs editorial rhythm beyond the main markdown body.

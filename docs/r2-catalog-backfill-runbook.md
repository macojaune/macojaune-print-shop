# Macojaune R2 Catalog Backfill Runbook

Prepared on 2026-03-26 for the current 7-series Macojaune catalog.

## Scope

- 7 published runs in `content/runs/`
- 19 products
- 30 unique image references currently modeled as `/pictures/*`
- Existing derivative manifest generated for the same 30 image refs in `public/derived/runs/manifest.json`

This runbook is the delivery handoff for the R2/Tina cutover tracked in `YEL-4`. It defines what is already ready, what must change at cutover time, and the exact execution order for the catalog backfill.

## Current Catalog Inventory

| Run file | Run slug | Products | Series gallery images | Cover image |
| --- | --- | ---: | ---: | --- |
| `content/runs/1.lancement.md` | `lancement` | 2 | 4 | `/pictures/dsc08950.jpg` |
| `content/runs/2.le-rituel.md` | `le-rituel` | 3 | 3 | `/pictures/insta_dsc09720-4.jpg` |
| `content/runs/3.jardins-de-balata.md` | `jardins-de-balata` | 5 | 5 | `/pictures/dsc01798.jpg` |
| `content/runs/4.vol-au-vent.md` | `vol-au-vent` | 3 | 3 | `/pictures/dsc06261.jpg` |
| `content/runs/5.dorures-salon-francais.md` | `dorures` | 3 | 3 | `/pictures/insta_dsc07780.jpg` |
| `content/runs/6.amer.md` | `amer` | 2 | 2 | `/pictures/MCO09875.jpg` |
| `content/runs/7.petit-cadre-sexy.md` | `petit-cadre-sexy` | 1 | 10 | `/pictures/ptiCadreSexy.jpg` |

## Ready Before Cutover

- The Tina run schema already supports structured `coverImage`, `heroImage`, `gallery`, `storyBlocks`, and product galleries.
- The catalog is normalized to 7 published runs with product-level hero and gallery metadata.
- The current derivative prototype already inventories all 30 referenced run images and proves responsive variant generation.
- The largest current originals are already identified in `docs/run-image-inventory.md`.

## Blocking Dependencies From R2 Path

- `YEL-4` must define the canonical R2 object-key and public delivery model used by Tina uploads and runtime rendering.
- `scripts/sync-runs-content-model.mjs` still validates images against `public/pictures`. In the current state it fails for all 30 run images because those sources were migrated out of the public tree. That validator must be updated to accept the new R2-backed source of truth before cutover validation can be considered green.
- Runtime image resolution must stop assuming local `/pictures/*` or local derivative-only paths once the R2/CDN contract is finalized.

## Canonical Backfill Contract

Each current `/pictures/<filename>` reference in run content should map to:

- a stable R2 master object key for the original asset
- a stable public delivery base for derivative assets under `pictures/runs/<asset-id>/` unless the runtime contract is explicitly changed
- runtime-resolvable URLs for at least `thumb`, `card`, `detail`, and `social`

Minimum metadata to preserve during backfill:

- run slug
- product slug when the image belongs to a product gallery
- original filename
- alt text
- caption
- orientation
- whether the image is used as `coverImage`, `heroImage`, gallery media, or product hero

## Execution Sequence

1. Freeze the contract from `YEL-4`.
   Confirm the final R2 key pattern, CDN/public base URL, Tina upload path, and manifest shape.

2. Export the source mapping for the current catalog.
   Build a one-pass map from every run and product image reference to its owning run slug and product slug.

3. Upload masters to R2.
   Push the 30 current run-image masters from `assets/photo-originals/pictures/` into the agreed R2 master prefix.

4. Generate and publish delivery variants.
   Produce the public derivative set for each source image using the final variant policy from `YEL-4`.

5. Write the runtime manifest.
   Replace or adapt the local manifest so `utils/runs.ts` resolves final CDN/R2 URLs rather than local files.

6. Backfill content references.
   Update `content/runs/*.md` only if the final contract requires non-legacy references in front matter. If runtime resolution keeps `/pictures/*` as logical source keys, preserve the current front matter and backfill the manifest only.

7. Run catalog validation.
   Verify all 7 run files still have valid `coverImage`, `heroImage`, gallery order, and product hero/gallery coverage after the manifest switch.

8. Hand off to QA.
   Once the backfill is green, execute `YEL-9` against homepage, shop, series pages, product pages, social previews, and structured data.

## Validation Checklist

- Every run still renders a valid listing thumbnail and hero image.
- Every product still resolves a hero image and at least one detail image.
- No run or product page emits raw original asset URLs in page HTML.
- Open Graph and Twitter images resolve from the final public delivery path.
- Structured data image fields resolve to public URLs, not local/private paths.
- Mobile and desktop pages load derived assets without broken `srcset` entries.
- The `petit-cadre-sexy` run keeps all 10 gallery images in order because it is the densest backfill case.

## Highest-Risk Cases

- `petit-cadre-sexy`: 10-image gallery on a single product, most likely to expose ordering or manifest gaps.
- `jardins-de-balata`: largest product count at 5, most likely to expose per-product mapping errors.
- Oversized originals already identified in `docs/run-image-inventory.md`: these should be watched for upload timeouts or unexpectedly large derivative output.

## Recommended Done Definition For Backfill

- All 30 current run-image refs exist in the final R2/CDN manifest.
- All 7 runs render correctly in the storefront using final delivery URLs.
- No catalog page exposes the original masters directly.
- The validator path is updated so a normal content-model validation pass succeeds under the R2-backed image model.

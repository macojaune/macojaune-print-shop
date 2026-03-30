# Run Image R2 Pipeline

This repo now uses a Cloudflare R2-backed run-image flow for Tina uploads and run-catalog delivery. Canonical run-image references are `/media/runs/*`; legacy `/pictures/*` run refs are migration input only, not a supported runtime fallback.

## Canonical Asset Model

- Tina stores run images as canonical references under `/media/runs/<asset-id>`.
- Uploaded masters go to the private R2 prefix `masters/runs/<asset-id>/`.
- Public derivatives go to the public R2/CDN prefix `pictures/runs/<asset-id>/` by default.
- A public manifest is written to `manifests/runs/<asset-id>.json`.

## Runtime Flow

1. Tina uploads through the custom media store in [`tina/r2-media-store.ts`](/Users/marvinl/Documents/DEV/macojaune-web/tina/r2-media-store.ts).
2. Nuxt receives the file through:
   - [`server/api/media/upload.post.ts`](/Users/marvinl/Documents/DEV/macojaune-web/server/api/media/upload.post.ts)
   - [`server/api/media/list.get.ts`](/Users/marvinl/Documents/DEV/macojaune-web/server/api/media/list.get.ts)
   - [`server/api/media/delete.delete.ts`](/Users/marvinl/Documents/DEV/macojaune-web/server/api/media/delete.delete.ts)
3. The R2 utility in [`server/utils/r2-images.ts`](/Users/marvinl/Documents/DEV/macojaune-web/server/utils/r2-images.ts) uploads the master, generates derivatives, uploads the derivative set, and writes the manifest.
4. The canonical route [`server/routes/media/runs/[...assetId].ts`](/Users/marvinl/Documents/DEV/macojaune-web/server/routes/media/runs/[...assetId].ts) redirects `/media/runs/<asset-id>` to the best preview derivative.

## Build Flow

- [`scripts/backfill-run-images-to-r2.mjs`](/Users/marvinl/Documents/DEV/macojaune-web/scripts/backfill-run-images-to-r2.mjs) performs the catalog cutover by uploading legacy run masters directly to R2 with stable asset ids and rewriting `content/runs/*.md` to canonical `/media/runs/*` refs.
- [`scripts/generate-run-image-derivatives.mjs`](/Users/marvinl/Documents/DEV/macojaune-web/scripts/generate-run-image-derivatives.mjs) now treats `/media/runs/*` as the source of truth and rebuilds the local helper manifest from public R2 manifests.
- The same script now resolves `/media/runs/*` refs by fetching their public R2 manifests from `NUXT_PUBLIC_MEDIA_BASE_URL/manifests/runs/...`.
- The generated TypeScript manifest remains the source for responsive image rendering in the frontend.

## Required Environment

Set these for deploy and for any environment that needs Tina upload or R2-backed image resolution:

```bash
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
# or
R2_BUCKET_NAME=
NUXT_PUBLIC_MEDIA_BASE_URL=
# or
R2_PUBLIC_BASE_URL=
```

Optional overrides:

```bash
R2_MASTERS_PREFIX=masters/runs
R2_PUBLIC_PREFIX=pictures/runs
R2_MANIFEST_PREFIX=manifests/runs
```

## Migration Status

- The 7-series run catalog was backfilled to canonical `/media/runs/*` refs on 2026-03-27.
- Existing run content should now validate only against `/media/runs/*`; local `/pictures/*` run refs are considered invalid after cutover.
- New Tina uploads continue to use the same R2 manifest contract.

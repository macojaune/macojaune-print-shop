# Series Drop Launch Checklist

Prepared during `YEL-9` for post-cutover storefront QA.

## Before Publishing

- Confirm the new run uses canonical `/media/runs/<asset-id>` references in `content/runs/*.md`.
- Confirm every product has a `slug`, `title`, `price`, `stock`, `heroImage`, and at least one gallery image.
- Confirm `coverImage` and `heroImage` exist at the run level.
- Confirm the densest gallery still preserves image order after content edits.

## Storefront QA

- Homepage: verify the page loads without runtime errors and links into the shop and editorial surfaces still work.
- Shop: verify each run card links to `/series/<run-slug>` and each preview image links to `/series/<run-slug>/<product-slug>`.
- Series page: verify every product CTA points to the fully qualified product route, not a relative `/series/<product-slug>` path.
- Product page: verify price, stock state, buy CTA state, gallery, and "Revoir la serie complete" navigation.

## Asset Delivery QA

- Inspect shipped HTML and confirm run images render through CDN derivatives under `https://cdn.macojaune.com/pictures/runs/...`.
- Confirm Open Graph and Twitter images resolve to `social-*` derivatives, not `/media/runs/*` or raw originals.
- Confirm responsive image markup emits `srcset` entries for `card`, `detail`, or `social` variants where expected.
- Confirm no launch surface exposes legacy raw `/pictures/<original>` assets for run/product media.

## Metadata QA

- Shop page: verify `og:url` and `twitter:url` point to `/shop`.
- Series page: verify breadcrumb JSON-LD includes homepage, shop, and the current series.
- Product page: verify breadcrumb JSON-LD includes homepage, series, and the current product.
- Validate that JSON-LD blobs are serialized JSON strings, not raw JS arrays/objects injected incorrectly.

## Release Gate

- Run a production build with `npx nuxi build`.
- Spot-check `/shop`, one dense series page, and one product page against built output.
- Record any manual-browser gaps separately if live viewport automation is unavailable.

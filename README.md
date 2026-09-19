# Macojaune

Macojaune is a Nuxt storefront and publishing site for Marvin's photo work. The current product combines an editorial site, a series-driven print shop, project pages, a blog, and a small direct-commerce flow for prints and the photozine.

## Current Stack

- Nuxt application code, currently running on `nuxt` `^4.4.2`
- TinaCMS for content editing and schema management
- Nuxt Content for markdown-backed content
- Stripe for checkout and payment collection
- Turso/libSQL for small runtime configuration such as the photozine price
- Cloudflare R2 plus `cdn.macojaune.com` for run and project media delivery
- Tailwind CSS for styling

## Product Model

The main commerce surface is the photo series catalog:

- `content/runs/*.md` defines a photo series
- each series can contain structured gallery content, story blocks, and sellable products
- product checkout is handled through Stripe-backed server routes
- the site also includes blog content, project pages, legal pages, and the standalone photozine flow

Relevant routes in the current app:

- `/`
- `/galerie`
- `/series/:slug`
- `/series/:slug/:productSlug`
- `/projets`
- `/blog`
- `/photozine`

## Local Setup

### Prerequisites

- Node.js 20.x
- npm
- native build tooling for packages like `sharp` (`python3`, `make`, `g++`, `pkg-config`)

The repo also ships a `nixpacks.toml` with the same system dependencies for deployment environments.

### Install

```bash
npm install
```

### Environment

Start from the template:

```bash
cp .env.dist .env
```

Core variables:

- `NUXT_PUBLIC_SITE_URL`
- `NUXT_PUBLIC_ASSET_BASE_URL`
- `NUXT_PUBLIC_MEDIA_BASE_URL`
- `NUXT_PUBLIC_STRIPE_KEY`
- `NUXT_STRIPE_KEY`
- `NUXT_STRIPE_WEBHOOK_SECRET`
- `NUXT_TURSO_URL`
- `NUXT_TURSO_AUTH_TOKEN`

TinaCMS variables are needed for the admin/editor workflow and Tina build steps:

- `TINA_CLIENT_ID`
- `TINA_TOKEN`
- `TINA_SEARCH_TOKEN`
- `BRANCH`

R2 variables are required for any environment that needs Tina media upload or canonical run-image resolution:

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET` or `R2_BUCKET_NAME`
- `R2_ENDPOINT`
- `R2_PUBLIC_BASE_URL`

## Development

Run the local dev stack with:

```bash
npm run dev
```

That command currently does three things:

1. regenerates image manifests before startup
2. starts TinaCMS in dev mode
3. starts Nuxt with `.env`

Useful supporting commands:

```bash
npm run images:sync
npm run project-media:sync
npm run lint
```

## Build And Deployment

Production build:

```bash
npm run build
```

This runs:

1. `tinacms build --skip-cloud-checks`
2. `nuxi build`

For builds that must refresh generated media artifacts first:

```bash
npm run build:with-images
```

Static generation is available with:

```bash
npm run generate
```

Local preview of the production build:

```bash
npm run preview
```

Deployment notes:

- provide the Stripe, Turso, Tina, and R2 environment variables in the target environment
- keep Node pinned to 20.x
- preserve the generated Nuxt output produced by `nuxi build`
- if media uploads are expected in production, the R2 credentials and public base URL must be configured

## Image Pipeline Status

The repo no longer uses the old local `public/pictures` model for run images as the runtime source of truth.

Current state:

- canonical run-image refs are `/media/runs/<asset-id>`
- Tina uploads for runs go through the custom R2 media store
- masters are stored in a private R2 prefix
- public derivatives and manifests are delivered from the CDN-backed R2 public prefixes
- the 7-series run catalog was backfilled to the canonical R2-backed model on 2026-03-27

Important nuance:

- legacy `/pictures/*` references still exist in older content outside the run catalog
- current run content should use `/media/runs/*`
- future contributors should treat Cloudflare R2 as the intended source of truth for run media, not the old local public tree

More detail lives in:

- `docs/run-image-r2-pipeline.md`
- `docs/r2-catalog-backfill-runbook.md`
- `docs/series-content-model.md`

## Repo Notes

- `content/runs` contains the structured photo-series catalog
- `content/projects` contains project case-study style entries
- `content/blog` contains editorial content
- `tina/config.ts` defines the content schema used by the editor
- `server/api` contains Stripe checkout endpoints and media APIs
- `scripts/` contains migration, import, and media-sync utilities

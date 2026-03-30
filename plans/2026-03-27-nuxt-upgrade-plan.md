# Nuxt Upgrade Plan

Date: 2026-03-27
Source issue: [YEL-18](/YEL/issues/YEL-18)

## Current State

- Runtime floor is behind target: `.nvmrc` is `19.8.1`, while current Nuxt 4 declares Node `^20.19.0 || >=22.12.0`.
- Core framework is behind: `nuxt` is `^3.11.2`; current stable Nuxt 3 is `3.20.2` and current stable Nuxt 4 is `4.4.2`.
- Content is the main migration surface: the codebase uses `@nuxt/content ^2.13.1`, `queryContent`, `ContentList`, and `ContentDoc` across pages/components.
- Module drift exists: `@unlok-co/nuxt-stripe` is `^3.0.0` while current published version is `6.0.2`; `@nuxt/image` is declared as `latest`, which makes upgrades less deterministic.
- The repo has custom server-side content rewriting in `server/plugins/content-assets.ts`, so content parsing behavior must be revalidated during the module migration.

## Recommendation

Do this in two controlled upgrade steps, not one jump:

1. Move the project to the latest stable Nuxt 3 line on a supported Node version.
2. Migrate the blocking modules and content API usage.
3. Only then cut over to Nuxt 4 on a dedicated branch with explicit regression testing.

This reduces blast radius, makes breakage attribution clearer, and avoids mixing framework, runtime, and content-system failures in one pass.

## Execution Plan

### Phase 1: Stabilize on current supported foundations

- Upgrade Node to `20.19.x` minimum and align local/CI/runtime environments.
- Upgrade Nuxt to `3.20.x` using the Nuxt 3 channel.
- Replace floating dependency declarations such as `@nuxt/image: latest` with explicit versions.
- Regenerate and commit a clean lockfile after dedupe.
- Run build and lint to establish a clean pre-migration baseline.

### Phase 2: Remove known Nuxt 4 blockers

- Upgrade `@nuxt/content` from v2 to v3.
- Replace `queryContent` usage with the v3 collection APIs.
- Replace deprecated `ContentList` / `ContentDoc` patterns with the supported data-fetching/rendering approach.
- Add any required content collection configuration and validate frontmatter/body parsing.
- Upgrade `@unlok-co/nuxt-stripe` to the Nuxt 4 compatible line and re-test checkout/payment flows.
- Revalidate the `content:file:afterParse` hook behavior or rewrite it if the hook contract changed.

### Phase 3: Cut over to Nuxt 4

- Upgrade Nuxt core to `4.x`.
- Run the official Nuxt 4 migration codemod where it helps.
- Keep the existing directory layout initially; do not combine the framework upgrade with an `app/` directory restructure.
- Re-test `useAsyncData` paths and page-level SEO/head output.
- Fix any type-checking or module compatibility regressions surfaced by the new toolchain.

### Phase 4: Validation and rollout prep

- Smoke test key routes: homepage, blog index/detail, project index/detail, runs/series pages, links page, checkout, and media APIs.
- Verify TinaCMS build/dev behavior still works with the upgraded stack.
- Produce a release checklist and preview signoff before scheduling the eventual production rollout.

## Execution Controls

- Do not execute this migration directly on the main working tree.
- Each implementation stream must run in its own dedicated git worktree so Nuxt core, content migration, and server/integration validation can move independently without contaminating each other.
- Each child issue should produce a scoped PR with build/lint evidence and a short regression note before merge.
- Merge order should follow dependency order: platform prerequisites first, content migration second, server/integration validation third, rollout checklist last.
- Skill search found a strong reusable baseline for the worktree workflow: `obra/superpowers@using-git-worktrees` (`https://skills.sh/obra/superpowers/using-git-worktrees`). Treat that as the leading candidate if we decide to install a dedicated skill for the team workflow.

## Proposed Backlog Split

- CTO Platform: environment baseline, dependency strategy, server/module compatibility, Stripe/media/API validation.
- Frontend Experience: Nuxt Content v3 migration across pages/components and UX regression checks on content-heavy routes.
- CTO Delivery: execution sequencing, worktree/PR discipline, acceptance checklist, and release-readiness coordination once implementation starts.

## Key Risks

- Nuxt Content is not a small patch here; it is a code-level migration across multiple pages and sections.
- The current Node version is below target, so local dev, CI, and hosting need to move together.
- Floating dependency declarations make reproducibility weaker during a major upgrade.
- Payment and media flows need explicit regression coverage because they mix runtime config, server routes, and external services.

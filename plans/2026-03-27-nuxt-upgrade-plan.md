# Nuxt Upgrade Plan

Date: 2026-03-27
Last reviewed: 2026-04-04
Source issue: [YEL-18](/YEL/issues/YEL-18)

## Current State

- Runtime floor is still behind target: `.nvmrc` is `19.8.1`, while Nuxt `4.4.2` declares Node `^20.19.0 || >=22.12.0`.
- The framework was still on Nuxt `^3.19.3` at the start of this stream, but the repo is no longer in the pre-migration state assumed by the original plan.
- `@nuxt/content` is already on v3 and the repo already has `content.config.ts`, so the v2 to v3 migration is no longer a prerequisite.
- `@unlok-co/nuxt-stripe` is already on `^6.0.2`, which removes one of the previously assumed Nuxt 4 blockers.
- The remaining content debt is local compatibility code: `composables/queryContent.ts`, `components/ContentList.vue`, and `components/ContentDoc.vue` emulate older patterns on top of Content v3.
- The repo still has one dependency hygiene issue: `@nuxt/image` was declared as `latest`, which makes upgrades and worktree installs less deterministic.
- The repo has custom server-side content rewriting in `server/plugins/content-assets.ts`, so content parsing and asset rewriting still need explicit regression coverage.

## Recommendation

The original phased plan is no longer the right plan for this repo state.

Do a direct Nuxt 4 upgrade in a dedicated worktree, with runtime alignment first and validation split by concern:

1. Align the repo to Node `20.19.3` locally and in CI/runtime.
2. Upgrade Nuxt directly to the latest stable Nuxt 4 line.
3. Replace floating dependency declarations such as `@nuxt/image: latest`.
4. Validate `nuxi build` first to isolate Nuxt issues from TinaCMS issues.
5. Treat any TinaCMS breakage discovered during `npm run build` as a separate follow-up unless it is proven to be caused by the Nuxt upgrade itself.

Why this is the right plan now:

- Official Nuxt guidance recommends upgrading directly with `npx nuxt upgrade --dedupe`.
- Official Nuxt 4 guidance explicitly says the old top-level folder structure can remain and will be auto-detected.
- The large content migration stream assumed by the original plan has already partially happened, so keeping it as a gating phase would create artificial delay and duplicate work.

## Execution Plan

### Phase 1: Runtime and dependency baseline

- Set `.nvmrc` to `20.19.3`.
- Upgrade Nuxt with the official CLI flow: `npx nuxi@latest upgrade --dedupe --channel=v4 --force`.
- Replace `@nuxt/image: latest` with an explicit semver range.
- Regenerate and commit the Bun lockfile in the format produced by the installed Bun version.
- If Bun blocks native lifecycle scripts during install, rebuild or trust the affected dependency before validating the app.

### Phase 2: Nuxt 4 application validation

- Run `nuxi prepare`, then `npm run lint`.
- Run `nuxi build` separately from TinaCMS to confirm the Nuxt application itself still builds.
- Keep the existing directory layout; do not combine this stream with an `app/` directory restructure.
- Re-test `useAsyncData` paths and page-level SEO/head output.
- Re-test content-heavy routes, media routes, and Stripe server entrypoints.
- Fix type or module compatibility regressions surfaced by the new toolchain.

### Phase 3: Follow-up streams

- If `tinacms build` fails, split that work into a Tina-specific validation stream instead of folding it into the Nuxt core bump without evidence.
- After Nuxt 4 is stable, remove the remaining local content compatibility shims and move pages/components to first-class Content v3 collection APIs where it reduces complexity.
- Produce a release checklist and preview signoff before scheduling the production rollout.

## Execution Controls

- Do not execute this migration directly on the main working tree.
- Each implementation stream must run in its own dedicated git worktree so Nuxt core, content migration, and server/integration validation can move independently without contaminating each other.
- Each child issue should produce a scoped PR with build/lint evidence and a short regression note before merge.
- Merge order should follow dependency order: platform prerequisites first, content migration second, server/integration validation third, rollout checklist last.
- Skill search found a strong reusable baseline for the worktree workflow: `obra/superpowers@using-git-worktrees` (`https://skills.sh/obra/superpowers/using-git-worktrees`). Treat that as the leading candidate if we decide to install a dedicated skill for the team workflow.

## Proposed Backlog Split

- CTO Platform: runtime baseline, lockfile strategy, native dependency install reliability, Stripe/media/API validation.
- Frontend Experience: Nuxt 4 route validation, content-heavy route regression checks, and later cleanup of the local content compatibility layer.
- CTO Delivery: execution sequencing, worktree/PR discipline, acceptance checklist, and release-readiness coordination.

## Key Risks

- TinaCMS build validity is still an open risk because `npm run build` can fail before `nuxi build` if Tina config loading breaks.
- The current Node version is below target, so local dev, CI, and hosting need to move together.
- Floating dependency declarations make reproducibility weaker during a major upgrade.
- Bun v1 migrates the repo from `bun.lockb` to `bun.lock`, which should be treated as an intentional lockfile format change in the same PR.
- Payment and media flows need explicit regression coverage because they mix runtime config, server routes, and external services.

## Validation Notes

- Under Node `20.19.3`, `nuxi build` succeeds on Nuxt `4.4.2`.
- `npm run build` is still blocked by `tinacms build` failing with `TypeError: fn is not a function` while loading Tina config. That requires separate investigation unless it is traced back to the Nuxt upgrade.
- `npm run lint` passes without errors and still surfaces only style warnings.

## Reviewed References

- Nuxt upgrade guide: https://nuxt.com/docs/3.x/getting-started/upgrade
- Nuxt 4 release post: https://nuxt.com/blog/v4
- npm package metadata for `nuxt`: https://www.npmjs.com/package/nuxt

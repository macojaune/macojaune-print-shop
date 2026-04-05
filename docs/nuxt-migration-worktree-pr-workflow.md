# Nuxt Migration Worktree and PR Workflow

Date: 2026-03-27
Parent issue: [YEL-18](/YEL/issues/YEL-18)
Delivery issue: [YEL-51](/YEL/issues/YEL-51)

## Purpose

This runbook defines the execution controls for the Nuxt migration so the parallel streams can move without contaminating each other or shipping unreviewed regressions.

It applies to:

- [YEL-19](/YEL/issues/YEL-19) `Poser les prérequis techniques pour la montée de version Nuxt`
- [YEL-20](/YEL/issues/YEL-20) `Migrer la surface éditoriale vers Nuxt Content v3`
- [YEL-21](/YEL/issues/YEL-21) `Valider les intégrations serveur avant le passage à Nuxt 4`
- [YEL-22](/YEL/issues/YEL-22) `Préparer la séquence d'exécution et la checklist de validation`

## Decision

- Each migration issue must use its own dedicated git worktree.
- No migration implementation happens on the main working tree.
- Each issue must land through a scoped pull request.
- Every pull request must include lint/build evidence and a short regression note.

## Worktree Standard

Preferred location:

- `.worktrees/` at the repository root

Required setup before the first worktree:

- Ensure `.worktrees/` is ignored by git.
- If `.worktrees/` is not ignored yet, add it to `.gitignore` in a small housekeeping change before creating worktrees.

Naming convention:

- `.worktrees/yel-19-platform`
- `.worktrees/yel-20-content`
- `.worktrees/yel-21-server`

Branch convention:

- `feat/yel-19-nuxt-foundations`
- `feat/yel-20-content-v3`
- `feat/yel-21-server-validation`

Creation flow:

```bash
git fetch origin
git switch main
git pull --ff-only origin main

git worktree add .worktrees/yel-19-platform -b feat/yel-19-nuxt-foundations
git worktree add .worktrees/yel-20-content -b feat/yel-20-content-v3
git worktree add .worktrees/yel-21-server -b feat/yel-21-server-validation
```

Within each worktree:

```bash
npm install
npm run lint
npm run build
```

Rules:

- One worktree maps to one issue only.
- Do not reuse a worktree for a second ticket.
- Rebase or recreate the worktree from updated `main` before starting if another migration stream landed first.
- Keep commits scoped to the ticket. Do not mix platform, content, and server validation changes in the same branch.

## PR Standard

Each migration issue opens its own PR against `main`.

PR body must contain:

- issue link
- what changed
- commands run
- result of `npm run lint`
- result of `npm run build`
- regression note covering impacted routes and integrations

Minimum regression note format:

```md
## Regression note

- Routes checked: `/`, `/blog`, `/projets`, `/series/[slug]`, `/shop`, `/payer`
- Integrations checked: TinaCMS dev/build, Stripe checkout entrypoints, media asset routes
- Known gaps: <explicitly list anything not validated>
```

PRs are not ready for merge if they are missing:

- passing lint evidence
- passing build evidence
- a regression note
- a clear rollback or follow-up note when scope is intentionally partial

## Merge Order

Required merge sequence:

1. [YEL-19](/YEL/issues/YEL-19) first
2. [YEL-20](/YEL/issues/YEL-20) second
3. [YEL-21](/YEL/issues/YEL-21) third
4. [YEL-22](/YEL/issues/YEL-22) stays as the release-readiness checklist and is refreshed after the three technical streams move

Reasoning:

- [YEL-19](/YEL/issues/YEL-19) establishes the runtime floor, Nuxt baseline, and deterministic dependency state.
- [YEL-20](/YEL/issues/YEL-20) depends on that baseline because the Content v3 migration should not be mixed with unresolved runtime drift.
- [YEL-21](/YEL/issues/YEL-21) validates Stripe, media, and server/plugin behavior after the dependency and content changes are in place, especially `server/plugins/content-assets.ts`.

Execution rule:

- [YEL-20](/YEL/issues/YEL-20) may start in parallel in its own worktree, but it must rebase onto the merged output of [YEL-19](/YEL/issues/YEL-19) before final review.
- [YEL-21](/YEL/issues/YEL-21) may investigate in parallel, but the final validation pass must happen after [YEL-20](/YEL/issues/YEL-20) is merged or at minimum against its latest branch tip.

## Candidate Skill Evaluation

Reviewed baseline:

- `obra/superpowers@using-git-worktrees`
- Source: https://skills.sh/obra/superpowers/using-git-worktrees

What is useful from that skill:

- dedicated worktree per branch
- verify the worktree directory is ignored before use
- run project setup inside the worktree
- establish a clean baseline before feature execution

What must be added locally for this repo:

- fixed `.worktrees/` location at repo root
- ticket-based naming for worktrees and branches
- mandatory PR evidence with `npm run lint` and `npm run build`
- merge dependency rules between [YEL-19](/YEL/issues/YEL-19), [YEL-20](/YEL/issues/YEL-20), and [YEL-21](/YEL/issues/YEL-21)
- regression notes covering TinaCMS, Stripe, and media routes

Recommendation:

- Use `obra/superpowers@using-git-worktrees` as the conceptual base for isolation discipline.
- Do not use it as the full process definition without this repo-specific overlay.

## Exit Criteria Per Stream

Each issue is ready to merge only when:

- the branch was developed in its dedicated worktree
- the PR is scoped to one issue
- `npm run lint` passes
- `npm run build` passes
- the PR includes a regression note
- any unresolved follow-up is split into a new linked issue instead of being hidden in comments

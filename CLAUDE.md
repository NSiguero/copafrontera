# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Next.js 16)
npm run build    # Production build
npm run lint     # ESLint
```

No test framework is configured.

## Pre-Push Checklist (MANDATORY)

Before every `git push`, run these commands IN ORDER and verify they pass:

```bash
npm ci                # Verify lock file is in sync (same command CI uses)
npm run lint          # Must have 0 errors (warnings OK)
npm run build         # Must succeed with 0 errors
```

If `npm ci` fails with "lock file out of sync", run `rm -rf node_modules package-lock.json && npm install` to regenerate, then re-test all three commands.

## Deployment

- **Hosting:** Vercel (https://copafrontera.vercel.app)
- **CI/CD:** GitHub Actions (`.github/workflows/deploy.yml`) — runs lint+build on push, deploys to Vercel on master
- **Repo:** https://github.com/NSiguero/copafrontera
- **Manual deploy:** `npx vercel --prod --yes`

### Environment Variables

Required in both Vercel and GitHub Secrets:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
- GitHub Actions also needs: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

## Security Rules

- **NEVER commit `.mcp.json`** — it may contain API keys. It is gitignored.
- **NEVER commit `.env*` files** — they are gitignored.
- **Check `git diff --cached` before committing** to catch accidental secret exposure.
- Files that should NEVER be in git: `.mcp.json`, `.env*`, `.agent/`, `.agents/`, `.claude/`, `.playwright-mcp/`

## Architecture

**Copa Frontera** — bilingual (ES/EN) tournament management platform for a 16-team soccer cup.

**Stack:** Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind CSS v4 (inline theme), Supabase (PostgreSQL + Auth + Storage), next-intl v4, deployed to Vercel.

### Routing & i18n

- All pages under `src/app/[locale]/`. Spanish is the default locale with clean URLs; English uses `/en/` prefix.
- Localized pathnames: `/equipos` ↔ `/en/teams`, `/calendario` ↔ `/en/calendar`, `/posiciones` ↔ `/en/standings`.
- Routing config in `src/i18n/routing.ts`. Use exports from `src/i18n/navigation.ts` (`Link`, `redirect`, `usePathname`, `useRouter`) instead of next/link or next/navigation.
- Translation files in `messages/es.json` and `messages/en.json`, namespaced by feature.

### Data Layer

- **Supabase clients:** `src/lib/supabase/server.ts` (Server Components/Actions), `client.ts` (browser), `admin.ts` (service role).
- **Queries** (`src/lib/queries/`): typed read functions. Supabase relation queries return `{}` types — use `as unknown as Type` cast to work around inference issues.
- **Server Actions** (`src/lib/actions/`): mutations with `revalidatePath()` for ISR invalidation. All public pages use `revalidate = 60`.
- **Database:** 5 tables (groups, teams, players, matches, player_match_stats) + 3 computed views (group_standings, top_scorers, top_assists). Migrations in `supabase/migrations/`.
- **Generated types:** `src/lib/supabase/types.ts` — regenerate with Supabase CLI when schema changes.

### Database Views

The 3 computed views (`group_standings`, `top_scorers`, `top_assists`) must exist in Supabase. If missing, run the SQL from `supabase/migrations/002_computed_views.sql` in the Supabase SQL editor.

### Components

- No component library — all custom UI in `src/components/ui/` (Button, Card, Input, Badge, Table, Select, Dialog, Toast, Skeleton).
- Layout components in `src/components/layout/` (Header, Footer, LocaleSwitcher, MobileNav, AdminSidebar).
- Feature components in `src/components/` subdirectories (standings/, matches/, teams/).
- `cn()` utility from `src/lib/utils/cn.ts` (clsx + tailwind-merge) for class merging.

### Styling

- Tailwind v4 with `@theme inline` in `globals.css` — no tailwind.config.js.
- Theme tokens: `--color-accent` (#2D7DD2 blue), `--color-gold` (#D4A017 gold, scarce), `--color-bg-dark` (#0C1829 navy), `--color-bg-primary` (#F5F7FA light).
- **Broadcast design system:** diagonal stripes (`diagonal-cut-bottom/top`), `broadcast-card`, `broadcast-tab`, `text-gradient-gold`, `scoreboard-card`, `live-dot`, `accent-stripe-gold`, `tabular-nums`.
- Gold is 10% of accents — only for CTAs, countdown, LIVE badges, scores, PTS column. Blue is 90%.
- Display font: Oswald (variable, condensed, uppercase). Body: Inter.
- Path alias: `@/*` maps to `./src/*`.

### Auth

- **Clerk** for authentication (replaces Supabase Auth). Login page uses catch-all route: `src/app/[locale]/login/[[...rest]]/page.tsx`.
- Middleware (`src/middleware.ts`) guards `/admin/*` routes.
- Admin pages under `src/app/[locale]/(admin)/admin/`.

### Key Patterns

- Pages are async Server Components; `"use client"` only for interactive components (forms, filters, modals).
- Dynamic route params arrive as `Promise` in Next.js 16 — await them in page components.
- Enums and constants defined in `src/lib/utils/constants.ts` (match stages, statuses, player positions).
- `src/lib/utils/format.ts` has locale-aware date/time formatters.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Next.js 16)
npm run build    # Production build
npm run lint     # ESLint
```

No test framework is configured.

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

### Auth

- Supabase Auth with email/password. Admin role via `user_metadata.role === 'admin'`.
- Middleware (`src/middleware.ts`) refreshes sessions and guards `/admin/*` routes.
- Admin pages under `src/app/[locale]/(admin)/admin/`.

### Components

- No component library — all custom UI in `src/components/ui/` (Button, Card, Input, Badge, Table, Select, Dialog, Toast, Skeleton).
- Layout components in `src/components/layout/` (Header, Footer, LocaleSwitcher, MobileNav, AdminSidebar).
- Feature components in `src/components/` subdirectories (standings/, matches/, teams/).
- `cn()` utility from `src/lib/utils/cn.ts` (clsx + tailwind-merge) for class merging.

### Styling

- Tailwind v4 with `@theme inline` in `globals.css` — no tailwind.config.js.
- Theme tokens: `--color-accent` (#2D7DD2 blue), `--color-bg-dark` (#0C1829 navy), `--color-bg-primary` (#F5F7FA light).
- Display font: Oswald (variable, condensed, uppercase). Body: Inter.
- Path alias: `@/*` maps to `./src/*`.

### Key Patterns

- Pages are async Server Components; `"use client"` only for interactive components (forms, filters, modals).
- Dynamic route params arrive as `Promise` in Next.js 16 — await them in page components.
- Enums and constants defined in `src/lib/utils/constants.ts` (match stages, statuses, player positions).
- `src/lib/utils/format.ts` has locale-aware date/time formatters.

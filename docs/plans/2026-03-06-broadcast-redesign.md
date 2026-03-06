# Broadcast Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign Copa Frontera's UI to feel like a live ESPN/Fox Sports broadcast — dark, cinematic, data-rich with diagonal stripes as signature element.

**Architecture:** CSS-first approach — update theme tokens and utility classes in globals.css first (foundation), then update components bottom-up (UI primitives -> layout -> features -> pages). No new dependencies needed.

**Tech Stack:** Next.js 16, Tailwind CSS v4 (@theme inline), Oswald + Inter fonts, existing Supabase backend unchanged.

**No test framework configured** — verify each task with `npm run build` and visual inspection via `npm run dev`.

---

## Task 1: Theme Tokens — Add Gold + Broadcast Variables

**Files:**
- Modify: `src/app/globals.css:3-47` (theme tokens block)

**Step 1: Add gold color tokens and broadcast variables to the @theme inline block**

Add after the existing accent colors (around line 18):

```css
/* Gold accent — SCARCE: only CTAs, countdown, LIVE badge, scores, PTS */
--color-gold: #D4A017;
--color-gold-light: #E8B828;
--color-gold-dark: #8B6914;
--color-gold-muted: rgba(212, 160, 23, 0.15);

/* Broadcast diagonal angle */
--angle-broadcast: 4deg;
```

**Step 2: Run build to verify**

Run: `npm run build`
Expected: Build passes, no errors.

**Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add gold color tokens and broadcast variables to theme"
```

---

## Task 2: Broadcast Utility Classes — Diagonals, Gold Gradient, Animations

**Files:**
- Modify: `src/app/globals.css:96-356` (utility classes + animations sections)

**Step 1: Add broadcast utility classes after existing utilities (after line ~285, before animations)**

```css
/* === BROADCAST UTILITIES === */

/* Diagonal stripe — signature broadcast element */
.diagonal-cut-bottom {
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - 3rem), 0 100%);
}

.diagonal-cut-top {
  clip-path: polygon(0 3rem, 100% 0, 100% 100%, 0 100%);
}

.diagonal-stripe-bg {
  position: relative;
}
.diagonal-stripe-bg::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--color-accent) 20%,
    var(--color-gold) 80%,
    transparent 100%
  );
  transform: skewY(calc(var(--angle-broadcast) * -1));
}

/* Gold text gradient */
.text-gradient-gold {
  background: linear-gradient(135deg, var(--color-gold-light) 0%, var(--color-gold) 50%, var(--color-gold-dark) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Left accent border (broadcast data card) */
.broadcast-card {
  border-left: 3px solid var(--color-accent);
  background: rgba(12, 24, 41, 0.8);
  backdrop-filter: blur(8px);
}
.broadcast-card:hover {
  border-left-color: var(--color-gold);
  box-shadow: 0 0 20px rgba(45, 125, 210, 0.15);
}

/* Live pulse dot */
.live-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #EF4444;
  animation: pulse-live 1.5s ease-in-out infinite;
}

/* Score flash */
.score-highlight {
  animation: score-flash 0.6s ease-out;
}

/* Broadcast tab (for group headers) */
.broadcast-tab {
  background: linear-gradient(135deg, var(--color-accent-dark) 0%, var(--color-accent) 100%);
  clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%);
  padding: 0.5rem 2rem 0.5rem 1rem;
}

/* Gold accent stripe (replaces blue-only) */
.accent-stripe-gold {
  height: 4px;
  background: linear-gradient(90deg, var(--color-accent), var(--color-gold), var(--color-accent));
}

/* Scoreboard card */
.scoreboard-card {
  border-left: 3px solid var(--color-border);
  transition: all 200ms var(--ease-cinematic);
}
.scoreboard-card:hover {
  border-left-color: var(--color-accent);
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(45, 125, 210, 0.1);
}

/* Tabular numbers for stats/scores */
.tabular-nums {
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum';
}
```

**Step 2: Add new keyframe animations (append to the existing @keyframes section around line 288)**

```css
@keyframes pulse-live {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
}

@keyframes score-flash {
  0% { background-color: rgba(212, 160, 23, 0.3); }
  100% { background-color: transparent; }
}

@keyframes count-up-fade {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes wipe-in {
  0% { clip-path: inset(0 100% 0 0); }
  100% { clip-path: inset(0 0 0 0); }
}

@keyframes slide-in-horizontal {
  0% { opacity: 0; transform: translateX(-40px); }
  100% { opacity: 1; transform: translateX(0); }
}
```

Add utility classes for new animations:

```css
.animate-wipe-in {
  animation: wipe-in 0.8s var(--ease-cinematic) forwards;
}
.animate-slide-horizontal {
  animation: slide-in-horizontal 0.7s var(--ease-cinematic) forwards;
}
.animate-count-up {
  animation: count-up-fade 0.6s var(--ease-cinematic) forwards;
}
```

**Step 3: Reduce grain overlay opacity (line ~99)**

Change `.grain-overlay::before` opacity from `0.035` to `0.02`.

**Step 4: Run build**

Run: `npm run build`
Expected: Build passes.

**Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add broadcast utility classes, gold gradients, diagonal stripes, new animations"
```

---

## Task 3: Badge — Add Gold Variant

**Files:**
- Modify: `src/components/ui/badge.tsx:11-19` (variant styles)

**Step 1: Add "gold" and "live" variants to the variants object**

Add to the variants record:

```typescript
gold: 'border-[var(--color-gold)] text-[var(--color-gold)] bg-[var(--color-gold-muted)]',
live: 'border-red-500 text-red-500 bg-red-500/10',
```

Update the BadgeProps type to include `'gold' | 'live'` in the variant union.

**Step 2: Run build**

Run: `npm run build`

**Step 3: Commit**

```bash
git add src/components/ui/badge.tsx
git commit -m "feat: add gold and live badge variants for broadcast style"
```

---

## Task 4: Button — Add Gold Variant

**Files:**
- Modify: `src/components/ui/button.tsx:12-21` (variant styles)

**Step 1: Add "gold" variant to the variants record**

```typescript
gold: 'bg-[var(--color-gold)] text-[#0C1829] hover:bg-[var(--color-gold-light)] shadow-md hover:shadow-lg hover:shadow-[var(--color-gold)]/20 hover:-translate-y-0.5',
```

Update ButtonProps variant union to include `'gold'`.

**Step 2: Run build**

Run: `npm run build`

**Step 3: Commit**

```bash
git add src/components/ui/button.tsx
git commit -m "feat: add gold button variant for broadcast CTA style"
```

---

## Task 5: Header — Broadcast Bar with Top Ticker

**Files:**
- Modify: `src/components/layout/header.tsx` (full rewrite of JSX, keep logic)

**Step 1: Read the current header.tsx file completely**

**Step 2: Redesign the header structure**

The new header has two bars:
1. **Top ticker** (28px): dark navy strip with scrolling text (next match info, tournament name)
2. **Main nav**: logo + links + gold CTA + locale switcher + mobile nav
3. **Bottom diagonal accent** instead of straight line

Key changes:
- Add a top ticker bar before the main nav (reuse `ticker-ribbon` CSS but smaller, darker)
- Change the CTA button from blue (`bg-accent`) to gold variant (`variant="gold"`)
- Change the bottom accent line from straight gradient to `accent-stripe-gold` class
- Keep all existing nav logic (active states, mobile nav, locale switcher)

**Step 3: Run build + visual check**

Run: `npm run build && npm run dev`
Visual: Header should show thin ticker on top, main nav below, gold "Registro" button, gold-blue gradient bottom line.

**Step 4: Commit**

```bash
git add src/components/layout/header.tsx
git commit -m "feat: redesign header as broadcast bar with top ticker and gold CTA"
```

---

## Task 6: Hero — Matchday Graphic with Countdown

**Files:**
- Modify: `src/app/[locale]/page.tsx:21-69` (hero section)
- Modify: `messages/es.json` (add countdown keys)
- Modify: `messages/en.json` (add countdown keys)

**Step 1: Create a Countdown client component**

Create: `src/components/ui/countdown.tsx`

A "use client" component that:
- Receives a `targetDate: string` prop
- Calculates days/hours/minutes/seconds remaining
- Updates every second with useEffect + setInterval
- Displays in broadcast style: large Oswald numbers, gold gradient, with labels below
- If no target date or past date, shows nothing

**Step 2: Redesign the hero section in page.tsx**

New layout (asymmetric):
- LEFT side: "Next Match" card (glass overlay, team badges, VS, date/time) — only if there's a next match, otherwise just the countdown
- RIGHT side: "COPA" on one line, "FRONTERA" massive below, year "2026", location subtitle
- BOTTOM: Countdown component (gold numbers, large)
- VERY BOTTOM: diagonal cut (`diagonal-cut-bottom` class on the hero container)

Keep: background image, gradient overlays, grain overlay, watermark
Change: layout from centered to asymmetric (flex-row on desktop, flex-col on mobile)
Add: `diagonal-cut-bottom` on the hero wrapper
Add: countdown section at bottom of hero

**Step 3: Add translation keys to both locale files**

In `home.hero` namespace, add:
```json
"countdown": {
  "days": "DIAS",
  "hours": "HRS",
  "minutes": "MIN",
  "seconds": "SEG"
}
```

(English: "DAYS", "HRS", "MIN", "SEC")

**Step 4: Run build + visual check**

Run: `npm run build && npm run dev`
Visual: Hero should be asymmetric with title right, diagonal bottom cut, countdown at bottom in gold.

**Step 5: Commit**

```bash
git add src/app/[locale]/page.tsx src/components/ui/countdown.tsx messages/es.json messages/en.json
git commit -m "feat: redesign hero as matchday graphic with countdown and diagonal cut"
```

---

## Task 7: Ticker Ribbon — ESPN Score Ticker

**Files:**
- Modify: `src/app/[locale]/page.tsx:74-93` (ticker section)
- Modify: `src/app/globals.css` (ticker styles around line 173)

**Step 1: Update ticker CSS to be darker and more broadcast-like**

Change `.ticker-ribbon` background from bright blue gradient to:
```css
background: linear-gradient(90deg, #0a1628 0%, var(--color-bg-dark-secondary) 50%, #0a1628 100%);
```

Add a gold "label" badge style within the ticker.

**Step 2: Update ticker content in page.tsx**

Instead of generic text, show:
- A gold badge "EN VIVO" or "RESULTADOS" at the start
- Separator `|` between items
- Content: "16 EQUIPOS · 4 GRUPOS · 24 PARTIDOS · 1 CAMPEON" (when no live data)
- Vertical white/20 dividers between items

**Step 3: Run build + visual check**

Run: `npm run build && npm run dev`

**Step 4: Commit**

```bash
git add src/app/[locale]/page.tsx src/app/globals.css
git commit -m "feat: redesign ticker as ESPN-style dark score ribbon with gold badge"
```

---

## Task 8: Stats Section — Broadcast Data Cards

**Files:**
- Modify: `src/app/[locale]/page.tsx:98-126` (stats section)

**Step 1: Redesign stats section**

Each stat becomes a `broadcast-card`:
- 3px left border (blue, gold on hover)
- Dark glass background
- Number: Oswald 800, 4rem, `text-gradient-gold` class
- Label: Oswald 500, uppercase, white/60, tracking-wider
- Subtle diagonal decoration at bottom of each card
- `tabular-nums` on numbers

Keep: dark section background, radial glow, staggered reveal-up animations
Add: `broadcast-card` class on each stat card
Change: `text-gradient-blue` to `text-gradient-gold` on numbers

**Step 2: Run build + visual check**

Run: `npm run build && npm run dev`

**Step 3: Commit**

```bash
git add src/app/[locale]/page.tsx
git commit -m "feat: redesign stats as broadcast data cards with gold numbers and left accent"
```

---

## Task 9: Match Card — Scoreboard Layout

**Files:**
- Modify: `src/components/matches/match-card.tsx` (full redesign of JSX)

**Step 1: Redesign match card as horizontal scoreboard**

New structure:
```
┌─────────────────────────────────────────┐
│ GRUPO A              15 MAR · 19:00     │ ← header bar (bg-bg-dark/5)
├─────────────────────────────────────────┤
│ [Badge] BORDER CITY FC              2   │ ← team row
│ [Badge] DEPORTIVO LAREDO            1   │ ← team row
├─────────────────────────────────────────┤
│ ▌FT                       Cancha #1    │ ← footer bar
└─────────────────────────────────────────┘
```

Key changes:
- Horizontal layout (not vertical)
- `scoreboard-card` class on container
- Header bar: group name (left) + date/time (right), small text, bg-dark/5
- Team rows: badge (24px) + name (flex-1) + score (right-aligned, Oswald bold, tabular-nums)
- LIVE score: gold color + `live-dot` before status badge
- FT score: white, normal
- PROX: show "VS" centered instead of scores
- Status badge in footer: use `live`, `accent`, or `default` badge variant
- Left border: 3px, color matches group color or accent

**Step 2: Run build + visual check**

Run: `npm run build && npm run dev`

**Step 3: Commit**

```bash
git add src/components/matches/match-card.tsx
git commit -m "feat: redesign match card as broadcast scoreboard with horizontal layout"
```

---

## Task 10: Group Table — Broadcast Standings Board

**Files:**
- Modify: `src/components/standings/group-table.tsx` (redesign header + row styling)

**Step 1: Redesign group table**

Key changes:
- Group header: use `broadcast-tab` class (angled clip-path) instead of regular rounded header
- PTS column: `text-gradient-gold` + bold (was accent blue)
- Top 2 rows: subtle `bg-accent/5` background (qualification zone)
- Add a thicker divider line between row 2 and row 3 (qualification line)
- Position number: small circular badge (w-6 h-6 rounded-full bg-accent/10 text-accent)
- All number columns: `tabular-nums` class
- Team name: add mini badge/crest if available (20px)
- Hover row: `bg-accent/5`, cursor-pointer

**Step 2: Run build + visual check**

Run: `npm run build && npm run dev`

**Step 3: Commit**

```bash
git add src/components/standings/group-table.tsx
git commit -m "feat: redesign group table as broadcast standings with gold PTS and qualification zones"
```

---

## Task 11: Leaderboard — Broadcast Style

**Files:**
- Modify: `src/components/standings/leaderboard.tsx` (header + stat column styling)

**Step 1: Redesign leaderboard**

Key changes:
- Header: `broadcast-tab` class (angled, like group table)
- Stat number column (goals/assists): `text-gradient-gold` + bold (was accent blue)
- Top 3 positions: gold/silver/bronze circular badges for position
  - #1: bg-gold/20, text-gold
  - #2: bg-gray-300/20, text-gray-400
  - #3: bg-amber-700/20, text-amber-700
- Rest: default numbered badge
- `tabular-nums` on stat columns

**Step 2: Run build + visual check**

Run: `npm run build && npm run dev`

**Step 3: Commit**

```bash
git add src/components/standings/leaderboard.tsx
git commit -m "feat: redesign leaderboard with broadcast tab header and gold stats"
```

---

## Task 12: Team Card — Broadcast Nameplate

**Files:**
- Modify: `src/components/teams/team-card.tsx` (redesign card layout)

**Step 1: Redesign team card as broadcast nameplate**

Key changes:
- Larger badge: 80px (was ~48px)
- Add gold separator line below badge (1px, gradient from transparent -> gold -> transparent)
- Team name: Oswald 700, centered, larger
- Group badge: pill with left-border colored by group
- Add diagonal stripe decoration at card bottom (tiny, subtle)
- Hover: badge `scale(1.05)`, card gets `glow-accent` shadow
- Locked teams: `grayscale filter`, `blur(2px)`, lock icon overlay centered
- Remove `img-grayscale` hover effect (was grayscale-to-color, now keep badge always colored for revealed teams)

**Step 2: Run build + visual check**

Run: `npm run build && npm run dev`

**Step 3: Commit**

```bash
git add src/components/teams/team-card.tsx
git commit -m "feat: redesign team card as broadcast nameplate with large badge and gold separator"
```

---

## Task 13: Page Banner — Diagonal Treatment

**Files:**
- Modify: `src/components/ui/page-banner.tsx` (add diagonal elements)

**Step 1: Redesign page banner**

Key changes:
- Add `diagonal-cut-bottom` to the banner container (creates angled bottom edge)
- Change the left accent border on title to a `broadcast-tab` style treatment
- Replace bottom `accent-stripe` with `accent-stripe-gold`
- Add subtle watermark text (page title repeated, very low opacity, large, behind content)
- Increase min-height slightly for more drama: `min-h-[260px]`

**Step 2: Run build + visual check**

Run: `npm run build && npm run dev`

**Step 3: Commit**

```bash
git add src/components/ui/page-banner.tsx
git commit -m "feat: redesign page banner with diagonal cut and gold accent stripe"
```

---

## Task 14: Footer — Broadcast Credits Style

**Files:**
- Modify: `src/components/layout/footer.tsx` (subtle refinements)

**Step 1: Update footer**

Key changes:
- Replace top `accent-stripe` with `accent-stripe-gold`
- Add `diagonal-cut-top` to the footer container (creates angled top edge matching hero bottom)
- Keep everything else (logo, branding, copyright)

**Step 2: Run build + visual check**

Run: `npm run build && npm run dev`

**Step 3: Commit**

```bash
git add src/components/layout/footer.tsx
git commit -m "feat: update footer with diagonal cut top and gold accent stripe"
```

---

## Task 15: Standings Page — Broadcast Layout

**Files:**
- Modify: `src/app/[locale]/posiciones/page.tsx:48-104` (section styling)

**Step 1: Update standings page layout**

Key changes:
- Group standings section: keep dark bg, update to use new broadcast-styled GroupTable
- Add horizontal group tabs at top (buttons for "GRUPO A | GRUPO B | GRUPO C | GRUPO D") — broadcast switcher style
  - OR keep all groups visible in grid (simpler, still broadcast-feeling)
- Leaderboards section: keep 2-column grid, components already updated
- Ensure `animate-slide-horizontal` is used for entrance animations (replacing some reveal-ups)

**Step 2: Run build + visual check**

Run: `npm run build && npm run dev`

**Step 3: Commit**

```bash
git add src/app/[locale]/posiciones/page.tsx
git commit -m "feat: update standings page with broadcast layout and animations"
```

---

## Task 16: Home Page — Next Matches Section

**Files:**
- Modify: `src/app/[locale]/page.tsx:131-149` (next matches section)

**Step 1: Update next matches section**

Key changes:
- Section heading: keep `section-heading` but ensure it uses `animate-slide-horizontal`
- Display 3 next matches in horizontal row using new scoreboard MatchCard
- If no matches: show broadcast-style "PROXIMAMENTE" card (dark glass, gold text, diagonal stripe)
- Add a "Ver calendario completo" link button below (secondary variant)

**Step 2: Run build + visual check**

Run: `npm run build && npm run dev`

**Step 3: Commit**

```bash
git add src/app/[locale]/page.tsx
git commit -m "feat: update next matches section with broadcast scoreboard cards"
```

---

## Task 17: Final Build Verification + Visual Polish

**Files:**
- All modified files

**Step 1: Full production build**

Run: `npm run build`
Expected: 0 errors, all pages build successfully.

**Step 2: Run lint**

Run: `npm run lint`
Expected: No new errors.

**Step 3: Visual inspection checklist (run dev server)**

Run: `npm run dev`

Check each page:
- [ ] Home: hero asymmetric, countdown gold, ticker dark, stats gold numbers, diagonal cuts
- [ ] Teams: nameplate cards with large badges, gold separator
- [ ] Standings: broadcast tabs, gold PTS, qualification zones
- [ ] Calendar: scoreboard match cards, broadcast banners
- [ ] Mobile (375px): everything stacks properly, no horizontal scroll
- [ ] No emojis as icons anywhere
- [ ] All clickable elements have cursor-pointer
- [ ] Transitions smooth (150-300ms)
- [ ] Diagonal stripes visible as consistent signature element

**Step 4: Fix any visual issues found**

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat: broadcast redesign polish and visual fixes"
```

---

## Execution Order Summary

| Task | Component | Depends On | Estimated Complexity |
|------|-----------|------------|---------------------|
| 1 | Theme tokens | — | Low |
| 2 | CSS utilities + animations | Task 1 | Medium |
| 3 | Badge gold variant | Task 1 | Low |
| 4 | Button gold variant | Task 1 | Low |
| 5 | Header broadcast bar | Tasks 1-4 | Medium |
| 6 | Hero matchday graphic | Tasks 1-2 | High |
| 7 | Ticker ESPN style | Tasks 1-2 | Low |
| 8 | Stats broadcast cards | Tasks 1-2 | Low |
| 9 | Match card scoreboard | Tasks 1-3 | Medium |
| 10 | Group table broadcast | Tasks 1-2 | Medium |
| 11 | Leaderboard broadcast | Tasks 1-2 | Low |
| 12 | Team card nameplate | Tasks 1-3 | Medium |
| 13 | Page banner diagonal | Tasks 1-2 | Low |
| 14 | Footer update | Tasks 1-2 | Low |
| 15 | Standings page layout | Tasks 10-11 | Low |
| 16 | Home next matches | Tasks 8-9 | Low |
| 17 | Final verification | All | Low |

Tasks 1-2 are sequential (foundation).
Tasks 3-4 can be parallel.
Tasks 5-14 can be mostly parallel (each modifies a different file).
Tasks 15-16 depend on component tasks.
Task 17 is last.

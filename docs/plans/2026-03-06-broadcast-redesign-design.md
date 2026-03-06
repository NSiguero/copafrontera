# Copa Frontera — "BROADCAST" UI Redesign

## Concept
The website feels like a live sports broadcast (ESPN/Fox Sports/UEFA graphics). Every element uses broadcast visual language — diagonal stripes, scoreboard cards, TV-style transitions, data-rich layouts.

## Color Palette

### Existing (keep)
- Navy dark: #0C1829 (primary dark bg, header, hero, footer)
- Blue accent: #2D7DD2 (primary accent)
- Blue light: #4A9BD9 (hover, gradients)
- Blue dark: #1A5FA0 (pressed, gradients)
- Light bg: #F5F7FA (light sections)
- Card bg: #FFFFFF

### New additions
- Gold CTA: #D4A017 (ONLY for: register button, countdown, LIVE badge, scores, PTS column)
- Gold hover: #E8B828
- Gold muted: #8B6914 (gold text on dark)

### Rule: 90% blue, 10% gold. Gold is scarce = special.

## Typography

No font changes. Oswald + Inter are perfect for broadcast.

### Usage changes
- Hero title: Oswald 800, 8-12rem, letter-spacing: -0.03em (NEGATIVE, tight)
- Section title: Oswald 700, 3-4rem, tracking normal
- Score/numbers: Oswald 700, tabular-nums, font-feature-settings
- Labels/badges: Oswald 600, 0.75rem, letter-spacing: 0.15em (wide)
- Body: Inter 400, 1rem, line-height 1.6
- Stats numbers: Oswald 800, 4-6rem, text-gradient-gold (new)

## Signature Element: Diagonal Stripes

Diagonal cuts appear throughout — hero bottom, section separators, card decorations, header accent, page banners. Implemented with clip-path polygon. This is what makes it NOT look like "another Tailwind site."

## Components

### Header — "Broadcast Bar"
- Top ticker bar (28px): scrolling info (next match, scores)
- Main nav: logo + links + gold CTA "Registro"
- Diagonal accent stripe at bottom (clip-path skewX)

### Hero — "Matchday Graphic"
- Asymmetric layout: "next match" card left, title right
- Next match card: glass overlay, team badges vs, time/date
- Countdown: large gold numbers (Oswald 800) with separators
- Diagonal stripe cut at bottom
- Background: photo + gradients + subtle blue radial glow

### Ticker — "Score Ticker"
- ESPN-style bottom bar with scores
- Dark gradient bg (not bright blue)
- Vertical separators between results
- Gold "RESULTADOS" or "EN VIVO" badge
- Fallback: "16 EQUIPOS . 4 GRUPOS . 1 CAMPEON"

### Stats Section — "Broadcast Data Cards"
- Individual cards with 3px left blue border
- Numbers: Oswald 800, 4rem, GOLD gradient
- Labels: Oswald 500, uppercase, white/60
- Diagonal stripe decoration at card bottom
- Dark glass bg (navy/80 + backdrop-blur)
- Count-up animation on numbers

### Match Cards — "Scoreboard"
- Horizontal layout (scoreboard aspect ratio)
- Header bar: group + date (blue/10 bg)
- Team rows: badge (32px) + name + score (right-aligned)
- Score: Oswald 700, LIVE = gold pulsing
- Status badges: LIVE (red + animated dot), FT (white/10), PROX (blue/20)
- 3px left border in group color

### Group Tables — "Standings Board"
- Group header: blue bg tab with white text
- PTS column: GOLD and bold
- Top 2 rows: subtle blue bg (qualification zone)
- Thick divider between qualified/eliminated
- Position: small circular badge
- Mini badge (20px) next to team name
- tabular-nums for all numbers

### Team Cards — "Broadcast Nameplate"
- Larger badge (80px vs 48px)
- Gold separator line (1px gradient)
- Team name: Oswald 700, centered
- Group badge: pill with left-border color
- Diagonal stripe at bottom
- Hover: badge scale(1.05), card glow
- Locked: grayscale + blur(2px) + lock overlay

### Page Banners
- Dark bg with image + gradients
- Title with diagonal accent treatment
- Broadcast-style subtitle bar

## Animations

### Keep (existing)
- fade-in, reveal-up, slide-in-left

### Add
- slide-in-horizontal: broadcast graphics entering from side
- count-up: numbers animate 0 to value with easing
- pulse-live: red dot pulsing for LIVE badges
- wipe-reveal: clip-path expanding horizontally (TV wipe)
- score-flash: brief gold flash on score display

### Modify
- grain-overlay: reduce opacity 0.035 -> 0.02
- watermark: reduce to 0.015 opacity

## Pages

### Home
Header -> Hero (matchday) -> Ticker -> Stats -> Next Matches (3) -> CTA Registro -> Footer

### Teams (/equipos)
Banner -> Filters -> 4-col nameplate grid -> Locked (grayscale)

### Calendar (/calendario)
Banner -> Filter tabs (broadcast style) -> Matches grouped by date
Date headers: "JORNADA 1 -- 15 MARZO 2026" TV style

### Standings (/posiciones)
Banner -> Group tabs (horizontal broadcast switcher) -> Active table
+ Sidebar: Top Scorers + Top Assists (vertical leaderboard)

### Team Detail (/equipos/[slug])
Dark hero with large badge + name -> Roster -> Team matches

## Responsive

### Mobile (375px)
- Hero: smaller title (4rem), next match card below (not beside)
- Stats: 2x2 grid
- Match cards: full width vertical
- Tables: horizontal scroll, sticky first column

### Tablet (768px)
- Hero: 2 columns
- Stats: 4 columns
- Match cards: 2 columns

### Desktop (1024px+)
- Full layout as wireframed

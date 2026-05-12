# Sera — Premium UX/UI Polish Pass

**Date:** 2026-05-12
**Approach:** B — Design studio transformation
**Scope:** Both host (dashboard) and guest (/invite) experiences
**Stack:** Next.js App Router + SCSS Modules, no backend changes

---

## Context

Core functionality is correct. This pass elevates the product from "functional customization tool" to "premium invitation builder." Four surfaces are touched: the design token layer, the InvitePreview component, the EventCustomization panel, and the guest invite page.

No DB migrations. No API changes. No new features. Props interfaces are unchanged.

---

## Section 1: Design system foundations

### 1a. Theme token differentiation

Five presets, updated in `globals.css` (CSS tokens) and `themeConfig.js` (JS mirror):

| Key | Hero bg (before → after) | Accent (before → after) | Why |
|---|---|---|---|
| `elegant_minimal` | `#FAFAF8` → unchanged | `#1A1A1A` → unchanged | Clean neutral anchor |
| `editorial_chic` | `#F5F3EE` → `#E8E2D5` (warm sand) | `#3D3530` → `#5C3A2E` (walnut) | Too close to elegant_minimal; push warmer/earthier |
| `feminine_luxe` | `#FDF6F0` → `#FAF0EB` (deeper blush) | `#C8857A` → unchanged | Minor deepening for better swatch contrast |
| `luxury_party` | `#18181B` → `#1C1408` (warm amber-dark) | `#C9A84C` → unchanged | Differentiates from bold_celebration's pure black |
| `bold_celebration` | `#0E0E0E` → unchanged | `#7C3AED` → `#8B5CF6` (brighter violet) | More vivid, better swatch readability |

All other token values (`--invite-text`, `--invite-text-muted`, `--invite-border`, etc.) stay the same unless they reference the changed hero bg.

### 1b. COVER_GRADIENTS centralization

Currently duplicated with slightly different values across three files:
- `frontend/components/EventCustomization.js` — uses CSS vars (`var(--mint)`)
- `frontend/components/InvitePreview.js` — uses hex
- `frontend/app/invite/[slug]/page.js` — uses hex

**Fix:** Export one canonical hex-based `COVER_GRADIENTS` object and `GRADIENT_OPTIONS` array from `frontend/lib/themeConfig.js`. All three files import from there. Local definitions removed.

```js
export const COVER_GRADIENTS = {
  mint_default:   'linear-gradient(135deg, #34d399, #a78bfa88)',
  violet_default: 'linear-gradient(135deg, #a78bfa, #fb7185)',
  rose_default:   'linear-gradient(135deg, #fb7185, #fbbf24)',
  gold_default:   'linear-gradient(135deg, #fbbf24, #fb7185)',
};

export const GRADIENT_OPTIONS = [
  { value: 'mint_default',   name: 'Menthe',  key: 'mint' },
  { value: 'violet_default', name: 'Violet',  key: 'violet' },
  { value: 'rose_default',   name: 'Rose',    key: 'rose' },
  { value: 'gold_default',   name: 'Or',      key: 'gold' },
];
```

---

## Section 2: InvitePreview — rich card

**File:** `frontend/components/InvitePreview.js` + `frontend/styles/invitePreview.module.scss`

### Layout

```
┌─────────────────────────────────────┐
│ HERO (170px)                        │
│  [cover image or gradient fill]     │
│  + dark overlay gradient at bottom  │
│  "Invitation" kicker (10px upper)   │
│  [Title in display font, 22px]      │
│  [Date pill — "14 juin 2026"]       │
└─────────────────────────────────────┘
│ BODY (config.cardBg)                │
│  ▎ "Custom message" (italic)        │  ← only if set; left accent border
│  ─────────────────────────────────  │
│  · 14 juin 2026 · Paris, 75001      │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ ✓  Je serai là                │  │  ← accent filled
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │    Peut-être                  │  │  ← ghost outline
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │    Je ne pourrai pas          │  │  ← ghost outline
│  └───────────────────────────────┘  │
│                             Sera   │
└─────────────────────────────────────┘
```

### Theming
- Hero title color: `config.isDark ? '#ffffff' : config.text`
- Body background: `config.cardBg`
- Text: `config.text`, muted: `config.textMuted`
- Active RSVP button: `background: config.accent`, `color: '#ffffff'` (light theme) or `config.cardBg` (dark)
- Ghost buttons: `border: 1.5px solid config.accent + '30'`, transparent bg, `color: config.textMuted`
- Pull-quote border: `3px solid config.accent + '50'`

### Overlay
- **Image covers only:** `linear-gradient(to top, rgba(0,0,0,0.55), transparent 55%)` — always, since we can't predict image contrast
- **Gradient covers:** no overlay — title color is already set to `config.isDark ? '#ffffff' : config.text`, which is legible against the theme hero bg by design

### Date pill (in hero)
- Small rounded pill: `background: rgba(255,255,255,0.20)`, `backdrop-filter: blur(6px)`, white text
- Shows: `14 juin 2026` (short format)
- Positioned below title, centered

### Brand watermark
- "Sera" — 10px, `config.textMuted`, bottom-right of body

### Max width: 400px

---

## Section 3: EventCustomization — design studio feel

**File:** `frontend/components/EventCustomization.js` + `frontend/styles/eventCustomization.module.scss`

### Theme selector changes
- Remove the "Design de l'invitation" title from inside the component (accordion already labels the section)
- Theme swatch: replace single-color circle with a **split rectangle** (44×22px, radius 6px):
  - Left half: `config.heroBg`
  - Right half: `config.accent`
  - `border: 1.5px solid rgba(255,255,255,0.12)`
- All 5 themes now visually distinct at a glance

### Font selector changes
- Each button shows two lines:
  - Large sample (18px, in the button's font): `"Soirée"`
  - Small label (10px, system font, muted): `Classique` / `Script` / `Moderne`
- Update `FONT_OPTIONS` in `themeConfig.js` to add a `sublabel` field

### Section structure
- Remove `sectionTitle` ("Design de l'invitation") from the component markup
- Add thin `1px` dividers between subsections using `var(--glass-border)`
- Increase subsection padding slightly: `margin-bottom: 24px` (was 20px)
- Labels renamed:
  - "Ambiance" → stays (clear and short)
  - "Typographie" → stays
  - "Couverture de l'événement" → "Couverture"
  - "Message personnalisé" → "Message d'accueil"

### No prop/state changes

---

## Section 4: Guest page improvements

**Files:** `frontend/app/invite/[slug]/page.js` + `frontend/styles/invite.module.scss`

### Hero composition
- Title: `36px` → `42px`, `font-weight: 700` → `800`, `letter-spacing: -0.03em`

### Card overlap
- `.card`: add `margin-top: -28px`, `position: relative`, `z-index: 1`
- `.hero`: add `padding-bottom: 28px` to accommodate the overlap
- Creates a layered depth — card appears to float up from the hero

### Custom message pull-quote
- Add `border-left: 3px solid var(--invite-accent)` at 30% opacity
- `padding-left: 14px`
- Feels like a typeset quote block

### Date + location
- Date: `font-weight: 600` (was normal)
- If both date and location are present: show inline with a `·` separator instead of stacked
- Keeps the meta row compact

### Confirmation state
- Confirmation message: `font-size: 16px` → `18px`
- Add a `✦` prefix character for dark themes, nothing for light
- Guest page already imports `getFontFamily` from `themeConfig` — also import `getThemeConfig` and derive `isDark` from `getThemeConfig(themeKey).isDark`

### No changes to
- RSVP button logic
- Form layout or inputs
- Verification flow
- API calls

---

## Out of scope

- Dress code field (new feature, requires DB migration)
- Animated theme transitions
- Custom color picker
- Dashboard dark mode toggle
- Email sending

---

## Files changed

| File | Change |
|---|---|
| `frontend/lib/themeConfig.js` | Add `COVER_GRADIENTS`, `GRADIENT_OPTIONS`, `sublabel` to FONT_OPTIONS |
| `frontend/app/globals.css` | Update 4 theme token values |
| `frontend/components/InvitePreview.js` | Full redesign — rich card layout |
| `frontend/styles/invitePreview.module.scss` | Full redesign — rich card styles |
| `frontend/components/EventCustomization.js` | Split swatch, font sample text, section cleanup |
| `frontend/styles/eventCustomization.module.scss` | Split swatch, dividers, label spacing |
| `frontend/app/invite/[slug]/page.js` | Import centralized gradients, minor markup for pull-quote |
| `frontend/styles/invite.module.scss` | Card overlap, title size, pull-quote, confirmation size |

Total: 8 files. No backend changes. No new dependencies.

# Sera — Premium Invitation Redesign

**Date:** 2026-05-11  
**Scope:** Full product direction shift — from functional event organizer to premium digital invitation platform  
**Stack:** Next.js App Router + SCSS Modules / Express + Sequelize + PostgreSQL

---

## Context

Sera's current guest page feels like a form, not an invitation. The redesign repositions the product as a premium digital invitation tool targeting private celebration hosts (birthdays, parties, dinners) who want something emotionally expressive and aesthetically intentional.

The dashboard (host side) stays dark/glass. Only the guest-facing pages shift to a light editorial aesthetic.

---

## Section 1: Data Model

### `theme` field
- Change from PostgreSQL `ENUM` to `VARCHAR` (avoids painful ALTER TYPE migrations on Postgres)
- New valid values: `elegant_minimal`, `luxury_party`, `editorial_chic`, `feminine_luxe`, `bold_celebration`
- Default: `elegant_minimal`
- Legacy values (e.g. `minimal`, `neon`, `garden`) fall back silently to `elegant_minimal` on the frontend — no migration of existing data needed

### `font_style` field (new)
- New `VARCHAR` column on the `events` table
- Valid values: `classic`, `script`, `modern`
- Default: `classic`
- Controls the display font on the guest page headline only

### Migration
One Sequelize migration handles both: alters `theme` column type and adds `font_style` column.

---

## Section 2: Theme System

Five presets define the full visual identity of the guest page. The `isDark` flag is frontend-only (no DB field).

| Key | Hero bg | Card bg | Accent | isDark |
|---|---|---|---|---|
| `elegant_minimal` | `#FAFAF8` (warm white) | `#FFFFFF` | `#1A1A1A` (black) | false |
| `luxury_party` | `#18181B` (charcoal) | `#1C1C22` | `#C9A84C` (gold) | true |
| `editorial_chic` | `#F5F3EE` (off-white) | `#FFFFFF` | `#3D3530` (deep taupe) | false |
| `feminine_luxe` | `#FDF6F0` (blush) | `#FFFFFF` | `#C8857A` (dusty rose) | false |
| `bold_celebration` | `#0E0E0E` (ink black) | `#1A1A1A` | `#7C3AED` (violet) | true |

Color tokens are scoped to the guest page via a `data-theme="[value]"` attribute on the root wrapper div. This prevents any bleed into the dashboard.

All themes share the same guest page layout — only CSS custom properties swap.

---

## Section 3: Typography System

Three font presets, host-selectable from the dashboard customization panel.

| Key | Font | Style |
|---|---|---|
| `classic` | Playfair Display | Serif — timeless, elegant (default) |
| `script` | Allura | Cursive — romantic, handwritten |
| `modern` | Inter Bold | Sans-serif — clean, contemporary |

**Scope:** The display font applies to the event title and any styled heading on the guest page only. Body text (date, location, RSVP copy, form labels) always uses Inter for legibility.

**Loading:** All three fonts are loaded via `next/font/google` at the app level with `display: 'swap'`. Each injects a CSS variable (`--font-playfair`, `--font-allura`, `--font-inter`). The guest page applies `font-family: var(--font-display)` to headings, where `--font-display` is set dynamically based on the event's `font_style` value.

---

## Section 4: Guest Page Redesign

**File:** `frontend/app/invite/[slug]/page.js`

### Layout
- **Hero block** (220px): full-width, theme hero background color (or cover image). Event title centered vertically in the display font.
- **Floating card**: white/dark (per theme), rounded corners (`border-radius: 24px`), soft drop shadow, max-width `480px`, centered. Contains: date/time/location, custom message (if set), then name verification form or RSVP buttons.
- **Page background**: theme hero color — the card floats on top of it.

### Visual treatment
- No glass morphism — flat card, clean borders
- No backdrop-filter
- Light themes: white card, dark text
- Dark themes: dark card, light text, accent color on interactive elements
- Color tokens scoped via `data-theme` on root div (see Section 2)

### Responsive
- Mobile: card fills width with `16px` horizontal padding
- Desktop: card centered at `480px` max-width

---

## Section 5: RSVP Styling

### Buttons
- Large pill buttons (`border-radius: 999px`), stacked vertically, full-width within the card
- Generous vertical spacing between buttons (`gap: 12px`)
- **Default state:** Light fill + theme accent border
- **Selected state:** Solid theme accent fill, white text, `scale(1.02)` transform
- **Hover:** `translateY(-1px)`, shadow deepens

### Copy (French)
- Yes → "Je serai là"
- Maybe → "Peut-être"
- No → "Je ne pourrai pas"

### Post-submit confirmation
After submitting, buttons collapse. A single confirmation line appears in the display font:
- Yes → *"À bientôt !"*
- Maybe → *"On espère vous voir !"*
- No → *"Pas de souci !"*

### Name verification step
- Submit button uses same pill style
- Input field: underline style on light themes, soft-bordered on dark themes

---

## Section 6: Customization UI (Dashboard)

**File:** `frontend/components/EventCustomization.js`

### Changes
- Section title: "Personnalisation" → "Design de l'invitation"
- **Theme grid:** Replace emoji+label cards with color swatches showing actual theme hero color + a tiny text sample in the preset's display font. 5 cards (down from 8).
- **Font selector:** New row below theme grid. Three pill buttons, each rendering a sample word in the corresponding font ("Élégant" in Playfair / "Élégant" in Allura / "Élégant" in Inter). Host sees exactly what they're choosing.
- Cover section, custom message, live preview strip, save button: unchanged.

### Props API — no breaking changes
`value`, `onChange`, `onSave`, `saving`, `feedback` remain identical.

---

## Out of Scope (Post-MVP)

- Animated transitions between themes
- Custom color picker (beyond presets)
- Per-theme default font pairing
- Dark mode toggle for the dashboard
- Email invitation sending

---

## Implementation Order

1. DB migration — `theme` VARCHAR + `font_style` column
2. Backend — expose `font_style` in `getEventBySlug` attributes list
3. Frontend tokens — add theme color tokens to `globals.css`, scoped via `data-theme`
4. Guest page — layout rewrite + theme scoping + font application
5. RSVP buttons — new pill style + French copy + confirmation state
6. Customization UI — theme swatches + font selector row
7. Font loading — `next/font/google` setup for all three fonts

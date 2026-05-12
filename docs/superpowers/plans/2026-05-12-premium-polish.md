# Premium Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate Sera from a functional invitation builder to a premium product by refining the design token layer, InvitePreview card, EventCustomization panel, and guest page.

**Architecture:** All changes are purely visual — no backend, no DB, no new props/state. The foundation is `themeConfig.js` (updated first, imported by all other files). InvitePreview and EventCustomization are rewritten in place; guest page gets targeted style/markup tweaks.

**Tech Stack:** Next.js App Router, SCSS Modules, CSS custom properties (`data-theme` scoping for guest page)

---

## File Map

| File | What changes |
|---|---|
| `frontend/lib/themeConfig.js` | Export `COVER_GRADIENTS` + `GRADIENT_OPTIONS`; add `sublabel` to `FONT_OPTIONS`; update 4 theme values |
| `frontend/app/globals.css` | Sync 4 `--invite-*` CSS tokens to match the JS changes |
| `frontend/components/InvitePreview.js` | Full redesign: 170px hero, date pill, dark overlay for images only, 3 RSVP buttons, pull-quote, watermark |
| `frontend/styles/invitePreview.module.scss` | Full redesign styles to match the new JSX |
| `frontend/components/EventCustomization.js` | Split swatch, 2-line font buttons, remove section title, rename 2 labels, import gradients from themeConfig |
| `frontend/styles/eventCustomization.module.scss` | Split swatch styles, subsection dividers, font sublabel, spacing bump |
| `frontend/app/invite/[slug]/page.js` | Import centralized `COVER_GRADIENTS`, derive `isDark`, inline meta, pull-quote class, confirmation `✦` |
| `frontend/styles/invite.module.scss` | Card overlap, title 42px, pull-quote border-left, confirmation 18px |

---

## Task 1: Update themeConfig.js

**Files:**
- Modify: `frontend/lib/themeConfig.js`

This is the foundation. All other tasks import from here, so do this first.

- [ ] **Step 1: Update 4 theme values in THEME_CONFIGS**

Replace the entire `THEME_CONFIGS` block:

```js
export const THEME_CONFIGS = {
  elegant_minimal: {
    label: 'Élégant Minimal',
    heroBg: '#FAFAF8',
    cardBg: '#FFFFFF',
    accent: '#1A1A1A',
    text: '#1A1A1A',
    textMuted: '#6B6B6B',
    isDark: false,
  },
  luxury_party: {
    label: 'Luxury Party',
    heroBg: '#1C1408',
    cardBg: '#1C1C22',
    accent: '#C9A84C',
    text: '#FFFFFF',
    textMuted: 'rgba(255,255,255,0.6)',
    isDark: true,
  },
  editorial_chic: {
    label: 'Editorial Chic',
    heroBg: '#E8E2D5',
    cardBg: '#FFFFFF',
    accent: '#5C3A2E',
    text: '#1A1A1A',
    textMuted: '#6B6B6B',
    isDark: false,
  },
  feminine_luxe: {
    label: 'Feminine Luxe',
    heroBg: '#FAF0EB',
    cardBg: '#FFFFFF',
    accent: '#C8857A',
    text: '#1A1A1A',
    textMuted: '#7A5F5B',
    isDark: false,
  },
  bold_celebration: {
    label: 'Bold Celebration',
    heroBg: '#0E0E0E',
    cardBg: '#1A1A1A',
    accent: '#8B5CF6',
    text: '#FFFFFF',
    textMuted: 'rgba(255,255,255,0.6)',
    isDark: true,
  },
};
```

- [ ] **Step 2: Add `sublabel` to FONT_OPTIONS**

Replace the `FONT_OPTIONS` array:

```js
export const FONT_OPTIONS = [
  { value: 'classic', label: 'Playfair', sublabel: 'Classique', cssVar: 'var(--font-playfair)' },
  { value: 'script', label: 'Allura', sublabel: 'Script', cssVar: 'var(--font-allura)' },
  { value: 'modern', label: 'Inter', sublabel: 'Moderne', cssVar: 'Inter, ui-sans-serif, system-ui, sans-serif' },
];
```

- [ ] **Step 3: Export COVER_GRADIENTS and GRADIENT_OPTIONS**

Add these exports after `getFontFamily`:

```js
export const COVER_GRADIENTS = {
  mint_default:   'linear-gradient(135deg, #34d399, rgba(167,139,250,0.5))',
  violet_default: 'linear-gradient(135deg, #a78bfa, #fb7185)',
  rose_default:   'linear-gradient(135deg, #fb7185, #fbbf24)',
  gold_default:   'linear-gradient(135deg, #fbbf24, #fb7185)',
};

export const GRADIENT_OPTIONS = [
  { value: 'mint_default',   name: 'Menthe', key: 'mint' },
  { value: 'violet_default', name: 'Violet', key: 'violet' },
  { value: 'rose_default',   name: 'Rose',   key: 'rose' },
  { value: 'gold_default',   name: 'Or',     key: 'gold' },
];
```

- [ ] **Step 4: Commit**

```bash
git add frontend/lib/themeConfig.js
git commit -m "refactor: centralize COVER_GRADIENTS, add GRADIENT_OPTIONS, sublabels; update 4 theme values"
```

---

## Task 2: Sync CSS tokens in globals.css

**Files:**
- Modify: `frontend/app/globals.css`

Four `data-theme` blocks need to match the JS changes made in Task 1.

- [ ] **Step 1: Update editorial_chic block**

In `[data-theme="editorial_chic"]`, change:
```css
--invite-hero-bg: #F5F3EE;
--invite-accent: #3D3530;
```
to:
```css
--invite-hero-bg: #E8E2D5;
--invite-accent: #5C3A2E;
```

- [ ] **Step 2: Update feminine_luxe block**

In `[data-theme="feminine_luxe"]`, change:
```css
--invite-hero-bg: #FDF6F0;
```
to:
```css
--invite-hero-bg: #FAF0EB;
```

- [ ] **Step 3: Update luxury_party block**

In `[data-theme="luxury_party"]`, change:
```css
--invite-hero-bg: #18181B;
```
to:
```css
--invite-hero-bg: #1C1408;
```

- [ ] **Step 4: Update bold_celebration block**

In `[data-theme="bold_celebration"]`, change all 3 lines that reference the old `#7C3AED` violet:
```css
--invite-accent: #7C3AED;
--invite-border: rgba(124, 58, 237, 0.20);
--invite-input-focus-border: rgba(124, 58, 237, 0.6);
--invite-shadow: 0 8px 32px rgba(124, 58, 237, 0.20);
```
to:
```css
--invite-accent: #8B5CF6;
--invite-border: rgba(139, 92, 246, 0.20);
--invite-input-focus-border: rgba(139, 92, 246, 0.6);
--invite-shadow: 0 8px 32px rgba(139, 92, 246, 0.20);
```

- [ ] **Step 5: Commit**

```bash
git add frontend/app/globals.css
git commit -m "style: sync guest page theme CSS tokens with updated themeConfig values"
```

---

## Task 3: Redesign InvitePreview component

**Files:**
- Modify: `frontend/components/InvitePreview.js`
- Modify: `frontend/styles/invitePreview.module.scss`

Full replacement of both files. Do the SCSS first so JSX can reference class names that exist.

- [ ] **Step 1: Replace invitePreview.module.scss**

```scss
.wrapper {
  margin-top: 20px;
}

.label {
  font-size: 12px;
  font-weight: 850;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 10px;
}

.card {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--shadow);
  border: 1px solid var(--glass-border);
  max-width: 400px;
}

// Hero strip
.hero {
  position: relative;
  height: 170px;
  overflow: hidden;
}

.heroImg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.heroOverlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.55), transparent 55%);
  pointer-events: none;
}

.heroContent {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 14px 16px;
}

.kicker {
  font-size: 10px;
  font-weight: 850;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.75);
  margin-bottom: 3px;
}

.title {
  font-size: 22px;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin: 0 0 8px;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.35);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.datePill {
  display: inline-flex;
  align-self: flex-start;
  align-items: center;
  background: rgba(255, 255, 255, 0.20);
  backdrop-filter: blur(6px);
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  color: #ffffff;
  white-space: nowrap;
}

// Card body
.body {
  padding: 14px 16px 16px;
  position: relative;
}

.pullQuote {
  font-size: 13px;
  font-style: italic;
  margin: 0 0 10px;
  line-height: 1.4;
  padding-left: 10px;
  border-left: 3px solid;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.divider {
  height: 0;
  border: none;
  border-top: 1px solid;
  margin: 10px 0;
}

.meta {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 12px;
}

.rsvpButtons {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rsvpPrimary {
  font-size: 12px;
  font-weight: 700;
  padding: 9px 16px;
  border-radius: 999px;
  border: none;
  cursor: default;
  text-align: center;
}

.rsvpGhost {
  font-size: 12px;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 999px;
  border: 1.5px solid;
  background: transparent;
  cursor: default;
  text-align: center;
}

.watermark {
  font-size: 10px;
  font-weight: 700;
  text-align: right;
  margin-top: 10px;
  opacity: 0.6;
  letter-spacing: 0.05em;
}
```

- [ ] **Step 2: Replace InvitePreview.js**

```jsx
'use client';

import { THEME_CONFIGS, getFontFamily, COVER_GRADIENTS } from '@/lib/themeConfig';
import { getMediaUrl } from '@/lib/api';
import s from '@/styles/invitePreview.module.scss';

export default function InvitePreview({ customization = {}, event }) {
  const {
    theme = 'elegant_minimal',
    cover_type = 'gradient',
    cover_value = 'mint_default',
    custom_message = '',
    font_style = 'classic',
  } = customization;

  const config = THEME_CONFIGS[theme] ?? THEME_CONFIGS.elegant_minimal;
  const fontFamily = getFontFamily(font_style);

  const isCustomImage = cover_type === 'image' && cover_value && !COVER_GRADIENTS[cover_value];
  const heroImg = isCustomImage ? getMediaUrl(cover_value) : null;
  const heroBg = !isCustomImage
    ? (COVER_GRADIENTS[cover_value] ?? `linear-gradient(135deg, ${config.heroBg}, ${config.accent}22)`)
    : undefined;

  const titleColor = config.isDark ? '#ffffff' : config.text;

  const dateShort = event?.date
    ? new Date(event.date).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : null;

  return (
    <div className={s.wrapper}>
      <p className={s.label}>Aperçu de l'invitation</p>
      <div className={s.card}>
        {/* Hero */}
        <div className={s.hero} style={{ background: heroBg }}>
          {heroImg && <img src={heroImg} alt="" className={s.heroImg} />}
          {isCustomImage && <div className={s.heroOverlay} />}
          <div className={s.heroContent}>
            <span className={s.kicker}>Invitation</span>
            <h3 className={s.title} style={{ fontFamily, color: titleColor }}>
              {event?.title || 'Votre événement'}
            </h3>
            {dateShort && <span className={s.datePill}>{dateShort}</span>}
          </div>
        </div>

        {/* Body */}
        <div className={s.body} style={{ background: config.cardBg }}>
          {custom_message && (
            <p
              className={s.pullQuote}
              style={{ fontFamily, color: config.textMuted, borderLeftColor: config.accent + '50' }}
            >
              "{custom_message}"
            </p>
          )}
          <div className={s.divider} style={{ borderColor: config.accent + '18' }} />
          {(dateShort || event?.location) && (
            <p className={s.meta} style={{ color: config.textMuted }}>
              {[dateShort, event?.location].filter(Boolean).join(' · ')}
            </p>
          )}
          <div className={s.rsvpButtons}>
            <button
              className={s.rsvpPrimary}
              style={{ background: config.accent, color: config.isDark ? config.cardBg : '#ffffff' }}
              disabled tabIndex={-1}
            >
              ✓ Je serai là
            </button>
            <button
              className={s.rsvpGhost}
              style={{ borderColor: config.accent + '30', color: config.textMuted }}
              disabled tabIndex={-1}
            >
              Peut-être
            </button>
            <button
              className={s.rsvpGhost}
              style={{ borderColor: config.accent + '30', color: config.textMuted }}
              disabled tabIndex={-1}
            >
              Je ne pourrai pas
            </button>
          </div>
          <p className={s.watermark} style={{ color: config.textMuted }}>Sera</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify the preview renders in the dashboard**

Open `http://localhost:3000/dashboard` → click any event → confirm the InvitePreview card shows:
- 170px hero with title and date pill
- 3 RSVP buttons (filled + 2 ghost)
- "Sera" watermark bottom-right
- Correct colors when switching themes

- [ ] **Step 4: Commit**

```bash
git add frontend/components/InvitePreview.js frontend/styles/invitePreview.module.scss
git commit -m "feat: InvitePreview rich card — 170px hero, date pill, 3 RSVP buttons, pull-quote, watermark"
```

---

## Task 4: Redesign EventCustomization panel

**Files:**
- Modify: `frontend/components/EventCustomization.js`
- Modify: `frontend/styles/eventCustomization.module.scss`

- [ ] **Step 1: Update EventCustomization.js**

Five targeted changes (do not alter any state, props, or handler logic):

**4a. Replace local COVER_GRADIENTS + GRADIENT_OPTIONS with imports from themeConfig:**

Remove the two local `const` blocks at the top and update the import:
```js
import { THEME_CONFIGS, FONT_OPTIONS, getThemeConfig, COVER_GRADIENTS, GRADIENT_OPTIONS } from '@/lib/themeConfig';
```

**4b. Remove the section title element:**

Delete this line from the JSX:
```jsx
<span className={s.sectionTitle}>Design de l'invitation</span>
```

**4c. Replace the theme swatch with a split rectangle:**

Change:
```jsx
<span
  className={s.themeSwatch}
  style={{ background: config.heroBg, borderColor: config.accent + '40' }}
/>
```
to:
```jsx
<span
  className={s.themeSwatch}
  style={{
    background: `linear-gradient(90deg, ${config.heroBg} 50%, ${config.accent} 50%)`,
    borderColor: 'rgba(255,255,255,0.12)',
  }}
/>
```

**4d. Replace font option button content with 2-line sample:**

Change:
```jsx
<button
  key={opt.value}
  type="button"
  className={`${s.fontOption} ${font_style === opt.value ? s.active : ''}`}
  onClick={() => handleFontChange(opt.value)}
  style={{ fontFamily: opt.cssVar }}
>
  {opt.label}
</button>
```
to:
```jsx
<button
  key={opt.value}
  type="button"
  className={`${s.fontOption} ${font_style === opt.value ? s.active : ''}`}
  onClick={() => handleFontChange(opt.value)}
>
  <span className={s.fontSample} style={{ fontFamily: opt.cssVar }}>{opt.label}</span>
  <span className={s.fontSublabel}>{opt.sublabel}</span>
</button>
```

**4e. Rename two labels in the JSX:**

Change `Couverture de l'événement` → `Couverture`:
```jsx
<label className={s.subsectionLabel}>Couverture</label>
```

Change `Message personnalisé` inside `messageField`:
```jsx
<label htmlFor="custom-message">Message d'accueil</label>
```

- [ ] **Step 2: Update eventCustomization.module.scss**

**4f. Update `.themeSwatch` from circle to rectangle:**

Replace:
```scss
.themeSwatch {
  display: block;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1.5px solid;
  flex-shrink: 0;
}
```
with:
```scss
.themeSwatch {
  display: block;
  width: 44px;
  height: 22px;
  border-radius: 6px;
  border: 1.5px solid;
  flex-shrink: 0;
}
```

**4g. Add dividers between subsections and bump spacing:**

Replace `.subsection` rule:
```scss
.subsection {
  margin-bottom: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--glass-border);

  &:first-of-type {
    padding-top: 0;
    border-top: none;
  }

  &:last-child {
    margin-bottom: 0;
  }
}
```

**4h. Add font sample and sublabel classes (append to file):**

```scss
.fontSample {
  display: block;
  font-size: 18px;
  line-height: 1.2;
}

.fontSublabel {
  display: block;
  font-size: 10px;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  color: var(--text-muted);
  margin-top: 2px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
```

**4i. Update `.fontOption` to use column layout for two lines:**

Replace `.fontOption`:
```scss
.fontOption {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  padding: 10px 8px;
  border: 2px solid var(--glass-border);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: center;
  color: var(--text-muted);

  &:hover {
    border-color: var(--glass-border-strong);
    background: rgba(255, 255, 255, 0.08);
  }

  &.active {
    border-color: #ffffff;
    background: rgba(255, 255, 255, 0.12);
    color: var(--text);

    .fontSublabel {
      color: var(--text-muted);
    }
  }
}
```

- [ ] **Step 3: Verify in dashboard**

Open the design accordion on any event → confirm:
- Section opens without the "Design de l'invitation" heading
- Theme swatches are split rectangles (heroBg left / accent right)
- Font buttons show large sample text with small sublabel underneath
- Dividers appear between Ambiance / Typographie / Couverture / Message d'accueil sections
- Labels read "Couverture" and "Message d'accueil"

- [ ] **Step 4: Commit**

```bash
git add frontend/components/EventCustomization.js frontend/styles/eventCustomization.module.scss
git commit -m "feat: EventCustomization design studio — split swatches, font samples, dividers, label cleanup"
```

---

## Task 5: Guest page improvements

**Files:**
- Modify: `frontend/app/invite/[slug]/page.js`
- Modify: `frontend/styles/invite.module.scss`

- [ ] **Step 1: Update invite/[slug]/page.js**

**5a. Replace local `COVER_GRADIENTS` with import from themeConfig; add `getThemeConfig` import:**

Remove the local `const COVER_GRADIENTS = { ... }` block (lines 8–13) and update the themeConfig import:
```js
import { getFontFamily, getThemeConfig, COVER_GRADIENTS } from '@/lib/themeConfig';
```

**5b. Derive `isDark` after `themeKey` is resolved:**

The two variables are already defined near the top of the render (after the loading check). Add one line after `const themeKey = ...`:
```js
const themeKey = event?.theme || 'elegant_minimal';
const isDark = getThemeConfig(themeKey).isDark;
```

**5c. Change meta block to inline with `·` separator:**

Replace:
```jsx
<div className={s.meta}>
  <span>{formattedDate}</span>
  <span>{event.location}</span>
</div>
```
with:
```jsx
<p className={s.meta}>
  {[formattedDate, event.location].filter(Boolean).join(' · ')}
</p>
```

**5d. Add pull-quote class to customMessage:**

Change:
```jsx
<p className={s.customMessage}>"{event.custom_message}"</p>
```
to:
```jsx
<p className={s.customMessage + ' ' + s.pullQuote}>"{event.custom_message}"</p>
```

Wait — that pattern is error-prone. Instead, rename: in the SCSS (step below) we'll update `.customMessage` directly to include the pull-quote border. No class change needed in the JSX.

**5d (revised). Keep JSX unchanged for customMessage; the style update is SCSS-only.**

**5e. Add `✦` prefix for dark themes in confirmation:**

Replace:
```jsx
<p className={s.confirmationMessage}>
  {CONFIRMATION_COPY[guest?.rsvp_status] || 'Ta réponse est bien enregistrée.'}
</p>
```
with:
```jsx
<p className={s.confirmationMessage}>
  {isDark ? '✦ ' : ''}{CONFIRMATION_COPY[guest?.rsvp_status] || 'Ta réponse est bien enregistrée.'}
</p>
```

Note: `isDark` is only defined after the loading check (inside the render for a loaded event). For the `step === 'done'` block which is inside the loaded-event render, `isDark` is in scope. ✓

- [ ] **Step 2: Update invite.module.scss**

**5f. Title: larger, heavier, tighter:**

Replace `.title` font properties:
```scss
.title {
  font-size: 42px;
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -0.03em;
  font-family: var(--font-display, var(--font-playfair, serif));
  color: var(--invite-text, #1A1A1A);
  text-align: center;
}
```

**5g. Card overlap — card floats up from hero:**

Add to `.card`:
```scss
.card {
  width: 100%;
  max-width: 480px;
  background: var(--invite-card-bg, #FFFFFF);
  border-radius: 24px;
  box-shadow: var(--invite-shadow, 0 8px 32px rgba(0, 0, 0, 0.10));
  padding: 28px 24px;
  margin: -28px 16px 0;
  position: relative;
  z-index: 1;
  animation: fadeUp 0.28s var(--ease, cubic-bezier(0.2, 0.8, 0.2, 1)) both;
}
```

**5h. Hero: add padding-bottom to accommodate overlap:**

Add `padding-bottom: 28px` to `.hero`:
```scss
.hero {
  width: 100%;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px 56px;
  position: relative;
  overflow: hidden;
}
```
(Was `padding: 40px 24px 32px` — increase bottom by 28px to 60px… actually 32+28=60, but the spec says `padding-bottom: 28px` as the accommodation. Let's set bottom to `60px` total: `padding: 40px 24px 60px`.)

**5i. Custom message as pull-quote:**

Replace `.customMessage`:
```scss
.customMessage {
  font-size: 15px;
  font-style: italic;
  color: var(--invite-accent, #1A1A1A);
  margin-bottom: 16px;
  line-height: 1.55;
  font-family: var(--font-display, inherit);
  padding-left: 14px;
  border-left: 3px solid color-mix(in srgb, var(--invite-accent, #1A1A1A) 30%, transparent);
}
```

**5j. Meta: remove flex column, add font-weight:**

Replace `.meta`:
```scss
.meta {
  font-size: 14px;
  font-weight: 600;
  color: var(--invite-text-muted, #6B6B6B);
  margin-bottom: 12px;
}
```

**5k. Confirmation message: larger:**

Replace `.confirmationMessage`:
```scss
.confirmationMessage {
  font-size: 18px;
  color: var(--invite-text-muted, #6B6B6B);
  font-style: italic;
}
```

**5l. Update mobile breakpoint for title and card:**

In the `@media (max-width: 520px)` block, update:
```scss
@media (max-width: 520px) {
  .hero {
    min-height: 180px;
    padding: 32px 20px 52px;
  }

  .title {
    font-size: 32px;
  }

  .card {
    margin: -28px 12px 0;
    padding: 22px 18px;
  }

  .grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Verify on the guest page**

Open `http://localhost:3000/invite/<any-slug>` → confirm:
- Title is 42px, bold, tight tracking
- Card overlaps the hero by ~28px (floats up from bottom of hero section)
- If event has a custom message: shows as italic pull-quote with left accent border
- Date and location appear inline: "14 mai 2026 · Paris"
- On a dark theme (luxury_party or bold_celebration), the confirmation screen shows "✦ À bientôt !"

- [ ] **Step 4: Commit**

```bash
git add frontend/app/invite/[slug]/page.js frontend/styles/invite.module.scss
git commit -m "feat: guest page polish — card overlap, 42px title, pull-quote, inline meta, dark confirmation ✦"
```

---

## Task 6: Final verification

- [ ] **Step 1: Run Next.js build**

```bash
cd frontend && npm run build
```

Expected: no errors. Warnings about `@webkit-box` are fine (vendor prefix).

- [ ] **Step 2: Smoke-test full flow**

1. Dashboard: cycle through all 5 themes in the accordion — swatches are visually distinct split rectangles
2. Dashboard: cycle through 3 fonts — see large sample + sublabel
3. Dashboard: InvitePreview shows date pill, 3 RSVP buttons, watermark
4. Guest page (light theme): card overlap, inline meta, pull-quote if message set
5. Guest page (dark theme `luxury_party`): confirmation shows `✦`
6. Upload a cover image → InvitePreview shows dark overlay; gradient cover → no overlay

- [ ] **Step 3: Commit if any last fixes made**

```bash
git add -p
git commit -m "fix: premium polish final adjustments"
```

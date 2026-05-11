# Premium Invitation Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposition Sera's guest page from a functional form into a premium digital invitation, with 5 curated theme presets, typography presets, and a redesigned customization UI.

**Architecture:** A shared `frontend/lib/themeConfig.js` constant file drives both the guest page rendering and the customization UI preview. Theme color tokens are scoped to the guest page via `[data-theme]` CSS attribute selectors in `globals.css`, preventing any bleed into the dark dashboard. Google Fonts (Playfair Display, Allura) are loaded at the app layout level via `next/font/google` and exposed as CSS variables.

**Tech Stack:** Next.js App Router, SCSS Modules, `next/font/google`, Express + Sequelize, PostgreSQL

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `backend/src/db/migrations/003_add_font_style.js` | Create | Add `font_style` VARCHAR column to events table |
| `backend/src/models/Event.js` | Modify | Add `font_style` field, update `theme` validation |
| `backend/src/controllers/guestFlowController.js` | Modify | Add `font_style` to `getEventBySlug` attributes list |
| `frontend/lib/themeConfig.js` | Create | Shared THEME_CONFIGS and FONT_MAP constants |
| `frontend/app/layout.js` | Modify | Load Google Fonts, inject CSS variables |
| `frontend/app/globals.css` | Modify | Add `[data-theme]` scoped CSS tokens |
| `frontend/app/invite/[slug]/page.js` | Modify | New layout: hero + floating card, theme/font application |
| `frontend/styles/invite.module.scss` | Modify | Full restyle: card layout, pill buttons, confirmation |
| `frontend/components/EventCustomization.js` | Modify | New theme presets, font selector row |
| `frontend/styles/eventCustomization.module.scss` | Modify | Font selector styles, theme swatch styles |
| `frontend/app/dashboard/[id]/page.js` | Modify | Initialize `font_style` in customization state |

---

## Task 1: DB Migration — Add `font_style` Column

**Files:**
- Create: `backend/src/db/migrations/003_add_font_style.js`

- [ ] **Step 1: Create the migration file**

```javascript
// backend/src/db/migrations/003_add_font_style.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('events', 'font_style', {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: 'classic',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('events', 'font_style');
  },
};
```

- [ ] **Step 2: Run the migration**

In the `backend/` directory:
```bash
node src/db/cli.js migrate
```

Expected output:
```
Running migrations...
✓ 001_add_event_type.js (already applied)
✓ 002_add_customization_columns.js (already applied)
→ Running 003_add_font_style.js...
✓ 003_add_font_style.js completed

✓ All migrations complete
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/db/migrations/003_add_font_style.js
git commit -m "feat: add font_style column to events"
```

---

## Task 2: Update Event Model

**Files:**
- Modify: `backend/src/models/Event.js`

- [ ] **Step 1: Replace the `theme` field and add `font_style`**

Replace the entire `theme` field definition (lines 36–45) and add `font_style` after `custom_message`:

```javascript
  theme: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'elegant_minimal',
    validate: {
      isIn: {
        args: [['elegant_minimal', 'luxury_party', 'editorial_chic', 'feminine_luxe', 'bold_celebration']],
        msg: 'Invalid theme',
      },
    },
  },
```

And after the `custom_message` field (after line 64), add:

```javascript
  font_style: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'classic',
    validate: {
      isIn: {
        args: [['classic', 'script', 'modern']],
        msg: 'font_style must be classic, script, or modern',
      },
    },
  },
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/models/Event.js
git commit -m "feat: update Event model for premium themes and font_style"
```

---

## Task 3: Expose `font_style` in Guest API

**Files:**
- Modify: `backend/src/controllers/guestFlowController.js:8-13`

- [ ] **Step 1: Add `font_style` to the attributes list**

In `getEventBySlug`, update the `attributes` array on line 10:

```javascript
attributes: ['id', 'title', 'description', 'date', 'location', 'slug', 'event_type', 'theme', 'cover_type', 'cover_value', 'custom_message', 'font_style'],
```

- [ ] **Step 2: Verify the endpoint returns the new field**

Start the backend, then run:
```bash
curl http://localhost:3001/api/invite/<any-valid-slug>
```

Expected: JSON response includes `"font_style": "classic"` (or whatever value is in DB).

- [ ] **Step 3: Commit**

```bash
git add backend/src/controllers/guestFlowController.js
git commit -m "feat: expose font_style in guest invite API"
```

---

## Task 4: Shared Theme Config

**Files:**
- Create: `frontend/lib/themeConfig.js`

- [ ] **Step 1: Create the shared constants file**

```javascript
// frontend/lib/themeConfig.js

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
    heroBg: '#18181B',
    cardBg: '#1C1C22',
    accent: '#C9A84C',
    text: '#FFFFFF',
    textMuted: 'rgba(255,255,255,0.6)',
    isDark: true,
  },
  editorial_chic: {
    label: 'Editorial Chic',
    heroBg: '#F5F3EE',
    cardBg: '#FFFFFF',
    accent: '#3D3530',
    text: '#1A1A1A',
    textMuted: '#6B6B6B',
    isDark: false,
  },
  feminine_luxe: {
    label: 'Feminine Luxe',
    heroBg: '#FDF6F0',
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
    accent: '#7C3AED',
    text: '#FFFFFF',
    textMuted: 'rgba(255,255,255,0.6)',
    isDark: true,
  },
};

export const FALLBACK_THEME_KEY = 'elegant_minimal';

export const getThemeConfig = (themeKey) =>
  THEME_CONFIGS[themeKey] ?? THEME_CONFIGS[FALLBACK_THEME_KEY];

export const FONT_OPTIONS = [
  { value: 'classic', label: 'Playfair', cssVar: 'var(--font-playfair)' },
  { value: 'script', label: 'Allura', cssVar: 'var(--font-allura)' },
  { value: 'modern', label: 'Inter', cssVar: 'Inter, ui-sans-serif, system-ui, sans-serif' },
];

export const getFontFamily = (fontStyle) => {
  const opt = FONT_OPTIONS.find((f) => f.value === fontStyle);
  return opt ? opt.cssVar : FONT_OPTIONS[0].cssVar;
};
```

- [ ] **Step 2: Commit**

```bash
git add frontend/lib/themeConfig.js
git commit -m "feat: add shared theme config constants"
```

---

## Task 5: Font Loading in Layout

**Files:**
- Modify: `frontend/app/layout.js`

- [ ] **Step 1: Load Google Fonts and inject CSS variables**

Replace the entire content of `frontend/app/layout.js`:

```javascript
import './globals.css';
import { Playfair_Display, Allura } from 'next/font/google';
import PwaInstallPrompt from '@/components/PwaInstallPrompt';

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

const allura = Allura({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-allura',
});

export const metadata = {
  title: 'Sera',
  description: "Gère tes invitations d'événements en un seul endroit.",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Sera',
    statusBarStyle: 'black-translucent',
  },
};

export const viewport = {
  themeColor: '#fff8ef',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${playfair.variable} ${allura.variable}`}>
      <body>
        {children}
        <PwaInstallPrompt />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Verify fonts load in dev**

Start `npm run dev` in the `frontend/` directory. Open any page in the browser. In DevTools → Elements, the `<html>` tag should have two CSS variable classes (e.g. `__variable_abc123 __variable_def456`). In Computed Styles, `--font-playfair` and `--font-allura` should appear with the correct font-family values.

- [ ] **Step 3: Commit**

```bash
git add frontend/app/layout.js
git commit -m "feat: load Playfair Display and Allura via next/font/google"
```

---

## Task 6: Theme CSS Tokens in globals.css

**Files:**
- Modify: `frontend/app/globals.css`

- [ ] **Step 1: Append theme token blocks at the end of globals.css**

Add after the last line of `globals.css`:

```css
/* ── Guest page theme tokens ────────────────────────────── */

[data-theme="elegant_minimal"] {
  --invite-hero-bg: #FAFAF8;
  --invite-card-bg: #FFFFFF;
  --invite-accent: #1A1A1A;
  --invite-text: #1A1A1A;
  --invite-text-muted: #6B6B6B;
  --invite-border: rgba(0, 0, 0, 0.08);
  --invite-input-bg: rgba(0, 0, 0, 0.04);
  --invite-input-border: rgba(0, 0, 0, 0.15);
  --invite-input-focus-border: rgba(0, 0, 0, 0.4);
  --invite-btn-text: #FFFFFF;
  --invite-shadow: 0 8px 32px rgba(0, 0, 0, 0.10);
}

[data-theme="luxury_party"] {
  --invite-hero-bg: #18181B;
  --invite-card-bg: #1C1C22;
  --invite-accent: #C9A84C;
  --invite-text: #FFFFFF;
  --invite-text-muted: rgba(255, 255, 255, 0.6);
  --invite-border: rgba(255, 255, 255, 0.10);
  --invite-input-bg: rgba(255, 255, 255, 0.06);
  --invite-input-border: rgba(255, 255, 255, 0.15);
  --invite-input-focus-border: rgba(255, 255, 255, 0.35);
  --invite-btn-text: #FFFFFF;
  --invite-shadow: 0 8px 32px rgba(0, 0, 0, 0.40);
}

[data-theme="editorial_chic"] {
  --invite-hero-bg: #F5F3EE;
  --invite-card-bg: #FFFFFF;
  --invite-accent: #3D3530;
  --invite-text: #1A1A1A;
  --invite-text-muted: #6B6B6B;
  --invite-border: rgba(0, 0, 0, 0.08);
  --invite-input-bg: rgba(0, 0, 0, 0.04);
  --invite-input-border: rgba(0, 0, 0, 0.15);
  --invite-input-focus-border: rgba(0, 0, 0, 0.4);
  --invite-btn-text: #FFFFFF;
  --invite-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

[data-theme="feminine_luxe"] {
  --invite-hero-bg: #FDF6F0;
  --invite-card-bg: #FFFFFF;
  --invite-accent: #C8857A;
  --invite-text: #1A1A1A;
  --invite-text-muted: #7A5F5B;
  --invite-border: rgba(200, 133, 122, 0.15);
  --invite-input-bg: rgba(200, 133, 122, 0.04);
  --invite-input-border: rgba(200, 133, 122, 0.2);
  --invite-input-focus-border: rgba(200, 133, 122, 0.5);
  --invite-btn-text: #FFFFFF;
  --invite-shadow: 0 8px 32px rgba(200, 133, 122, 0.15);
}

[data-theme="bold_celebration"] {
  --invite-hero-bg: #0E0E0E;
  --invite-card-bg: #1A1A1A;
  --invite-accent: #7C3AED;
  --invite-text: #FFFFFF;
  --invite-text-muted: rgba(255, 255, 255, 0.6);
  --invite-border: rgba(124, 58, 237, 0.20);
  --invite-input-bg: rgba(255, 255, 255, 0.06);
  --invite-input-border: rgba(255, 255, 255, 0.15);
  --invite-input-focus-border: rgba(124, 58, 237, 0.6);
  --invite-btn-text: #FFFFFF;
  --invite-shadow: 0 8px 32px rgba(124, 58, 237, 0.20);
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/globals.css
git commit -m "feat: add [data-theme] scoped CSS tokens for guest page"
```

---

## Task 7: Dashboard Page — Init `font_style`

**Files:**
- Modify: `frontend/app/dashboard/[id]/page.js`

- [ ] **Step 1: Add `font_style` to the customization state initializer**

In the `useEffect` at line 36, update the `setCustomization` call:

```javascript
setCustomization({
  theme: data.theme || 'elegant_minimal',
  cover_type: data.cover_type || 'gradient',
  cover_value: data.cover_value || 'mint_default',
  custom_message: data.custom_message || '',
  font_style: data.font_style || 'classic',
});
```

- [ ] **Step 2: Add `font_style` to the `handleUpdateCustomization` PATCH payload**

In `handleUpdateCustomization` at line 87, update the PATCH body:

```javascript
const { data } = await api.patch(`/events/${id}`, {
  theme: customization.theme,
  cover_type: customization.cover_type,
  cover_value: customization.cover_value,
  custom_message: customization.custom_message,
  font_style: customization.font_style,
});
```

- [ ] **Step 3: Commit**

```bash
git add frontend/app/dashboard/[id]/page.js
git commit -m "feat: include font_style in dashboard customization state and save"
```

---

## Task 8: Customization UI — New Themes + Font Selector

**Files:**
- Modify: `frontend/components/EventCustomization.js`
- Modify: `frontend/styles/eventCustomization.module.scss`

- [ ] **Step 1: Rewrite EventCustomization.js**

Replace the entire file content:

```javascript
'use client';

import { useState } from 'react';
import { THEME_CONFIGS, FONT_OPTIONS, getThemeConfig } from '@/lib/themeConfig';
import s from '@/styles/eventCustomization.module.scss';

const GRADIENT_OPTIONS = [
  { value: 'mint_default', name: 'Mint', key: 'mint' },
  { value: 'violet_default', name: 'Violet', key: 'violet' },
  { value: 'rose_default', name: 'Rose', key: 'rose' },
  { value: 'gold_default', name: 'Gold', key: 'gold' },
];

const COVER_GRADIENTS = {
  mint_default: 'linear-gradient(135deg, var(--mint), var(--violet-soft))',
  violet_default: 'linear-gradient(135deg, var(--violet), var(--rose))',
  rose_default: 'linear-gradient(135deg, var(--rose), var(--gold))',
  gold_default: 'linear-gradient(135deg, var(--gold), var(--rose))',
};

function getPreviewBackground(cover_type, cover_value, theme) {
  if (cover_type === 'image' && cover_value) return null;
  if (cover_value && COVER_GRADIENTS[cover_value]) return COVER_GRADIENTS[cover_value];
  const config = getThemeConfig(theme);
  return `linear-gradient(135deg, ${config.heroBg}, ${config.accent}22)`;
}

export default function EventCustomization({
  value = {},
  onChange,
  onImageUpload,
  canUploadImage = false,
  currentImageUrl = null,
  onSave,
  saving = false,
  feedback = '',
}) {
  const {
    theme = 'elegant_minimal',
    cover_type = 'gradient',
    cover_value = 'mint_default',
    custom_message = '',
    font_style = 'classic',
  } = value;

  const [imageLoading, setImageLoading] = useState(false);

  const handleThemeChange = (newTheme) => {
    onChange({ ...value, theme: newTheme });
  };

  const handleFontChange = (newFont) => {
    onChange({ ...value, font_style: newFont });
  };

  const handleCoverTypeChange = (newType) => {
    onChange({
      ...value,
      cover_type: newType,
      cover_value: newType === 'gradient' ? cover_value : (currentImageUrl || cover_value),
    });
  };

  const handleGradientSelect = (gradientValue) => {
    onChange({ ...value, cover_type: 'gradient', cover_value: gradientValue });
  };

  const handleMessageChange = (e) => {
    const text = e.target.value;
    if (text.length <= 160) {
      onChange({ ...value, custom_message: text });
    }
  };

  const handleFileSelect = async (file) => {
    if (!file) return;
    setImageLoading(true);
    try {
      await onImageUpload?.(file);
    } finally {
      setImageLoading(false);
    }
  };

  const previewBg = getPreviewBackground(cover_type, cover_value, theme);
  const isError = feedback && (feedback.toLowerCase().includes('erreur') || feedback.toLowerCase().includes('error'));

  return (
    <section className={s.section}>
      <span className={s.sectionTitle}>Design de l'invitation</span>

      {/* Preview strip */}
      <div className={s.preview}>
        {cover_type === 'image' && (currentImageUrl || (cover_type === 'image' && cover_value && !COVER_GRADIENTS[cover_value])) ? (
          <img
            src={currentImageUrl || cover_value}
            alt="Aperçu couverture"
            className={s.previewImage}
          />
        ) : (
          <div className={s.previewGradient} style={{ background: previewBg }} />
        )}
        <span className={s.previewLabel}>Aperçu couverture</span>
      </div>

      {/* Theme selector */}
      <div className={s.subsection}>
        <label className={s.subsectionLabel}>Ambiance</label>
        <div className={s.themeGrid}>
          {Object.entries(THEME_CONFIGS).map(([key, config]) => (
            <button
              key={key}
              type="button"
              className={`${s.themeCard} ${theme === key ? s.active : ''}`}
              onClick={() => handleThemeChange(key)}
            >
              <span
                className={s.themeSwatch}
                style={{ background: config.heroBg, borderColor: config.accent + '40' }}
              />
              <span className={s.label}>{config.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Font selector */}
      <div className={s.subsection}>
        <label className={s.subsectionLabel}>Typographie</label>
        <div className={s.fontSelector}>
          {FONT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`${s.fontOption} ${font_style === opt.value ? s.active : ''}`}
              onClick={() => handleFontChange(opt.value)}
              style={{ fontFamily: opt.cssVar }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cover selector */}
      <div className={s.subsection}>
        <label className={s.subsectionLabel}>Couverture de l'événement</label>
        <div className={s.coverOptions}>
          <button
            type="button"
            className={`${s.coverOption} ${cover_type === 'gradient' ? s.active : ''}`}
            onClick={() => handleCoverTypeChange('gradient')}
          >
            Dégradé
          </button>
          <button
            type="button"
            className={`${s.coverOption} ${cover_type === 'image' ? s.active : ''}`}
            onClick={() => handleCoverTypeChange('image')}
            disabled={!canUploadImage}
            title={!canUploadImage ? 'Disponible après création' : undefined}
          >
            Image
          </button>
        </div>

        {cover_type === 'gradient' && (
          <div className={s.gradientSwatches}>
            {GRADIENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`${s.swatch} ${s[opt.key]} ${cover_value === opt.value ? s.active : ''}`}
                onClick={() => handleGradientSelect(opt.value)}
                title={opt.name}
              >
                <span className={s.checkmark}>✓</span>
              </button>
            ))}
          </div>
        )}

        {cover_type === 'image' && canUploadImage && (
          <div className={s.uploaderWrapper}>
            {currentImageUrl && (
              <img src={currentImageUrl} alt="Couverture actuelle" className={s.imagePreview} />
            )}
            <div className={s.uploaderZone}>
              <input
                id="cover-file"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
                disabled={imageLoading}
              />
              <label htmlFor="cover-file" className={s.uploaderLabel}>
                <strong>Cliquez pour charger</strong> ou déposez une image
              </label>
              <div className={s.uploaderHint}>JPG, PNG — max 5 MB</div>
              {imageLoading && <div className={s.uploadProgress}>Upload en cours...</div>}
            </div>
          </div>
        )}

        {cover_type === 'image' && !canUploadImage && (
          <div className={s.uploaderHint} style={{ marginTop: '12px', color: 'var(--text-muted)' }}>
            L'upload d'image est disponible après la création de l'événement.
          </div>
        )}
      </div>

      {/* Custom message */}
      <div className={s.subsection}>
        <div className={s.messageField}>
          <label htmlFor="custom-message">Message personnalisé</label>
          <textarea
            id="custom-message"
            placeholder="Bienvenue à tous ! C'est une joie de vous voir..."
            value={custom_message}
            onChange={handleMessageChange}
          />
          <div className={`${s.messageCounter} ${custom_message.length >= 150 ? s.warning : ''}`}>
            {custom_message.length} / 160
          </div>
        </div>
      </div>

      {onSave && (
        <>
          <button
            type="button"
            className={s.saveBtn}
            onClick={onSave}
            disabled={saving || imageLoading}
          >
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
          {feedback && (
            <div className={`${s.feedback} ${isError ? s.error : s.success}`}>
              {feedback}
            </div>
          )}
        </>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Add theme swatch and font selector styles to eventCustomization.module.scss**

In `frontend/styles/eventCustomization.module.scss`, replace the `.themeCard` block (lines 80–116) with:

```scss
.themeGrid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.themeCard {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 6px;
  border: 2px solid var(--glass-border);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: center;

  &:hover {
    border-color: var(--glass-border-strong);
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-1px);
  }

  &.active {
    border-color: #ffffff;
    background: rgba(255, 255, 255, 0.12);
  }

  .label {
    font-size: 10px;
    font-weight: 600;
    color: var(--text-muted);
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
}

.themeSwatch {
  display: block;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1.5px solid;
  flex-shrink: 0;
}

// Font selector
.fontSelector {
  display: flex;
  gap: 8px;
}

.fontOption {
  flex: 1;
  padding: 10px 8px;
  border: 2px solid var(--glass-border);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 15px;
  color: var(--text-muted);
  text-align: center;

  &:hover {
    border-color: var(--glass-border-strong);
    background: rgba(255, 255, 255, 0.08);
  }

  &.active {
    border-color: #ffffff;
    background: rgba(255, 255, 255, 0.12);
    color: var(--text);
  }
}
```

Also update the `@media (max-width: 640px)` block at the bottom to handle the 5-column grid:

```scss
@media (max-width: 640px) {
  .themeGrid {
    grid-template-columns: repeat(3, 1fr);
  }

  .gradientSwatches {
    grid-template-columns: repeat(2, 1fr);
  }

  .coverOptions {
    flex-direction: column;
  }

  .fontSelector {
    flex-direction: column;
  }
}
```

- [ ] **Step 3: Verify in browser**

Open an event's dashboard page. The customization panel should show:
- "Design de l'invitation" title
- 5 theme cards with colored circle swatches and labels
- 3 font buttons, each rendered in its own font
- Everything else unchanged

- [ ] **Step 4: Commit**

```bash
git add frontend/components/EventCustomization.js frontend/styles/eventCustomization.module.scss
git commit -m "feat: premium theme presets and font selector in customization UI"
```

---

## Task 9: Guest Page — Full Layout Rewrite

**Files:**
- Modify: `frontend/app/invite/[slug]/page.js`
- Modify: `frontend/styles/invite.module.scss`

- [ ] **Step 1: Rewrite the invite page**

Replace the entire content of `frontend/app/invite/[slug]/page.js`:

```javascript
'use client';

import { useEffect, useMemo, useState, use } from 'react';
import api from '@/lib/api';
import { getThemeConfig, getFontFamily } from '@/lib/themeConfig';
import s from '@/styles/invite.module.scss';

const COVER_GRADIENTS = {
  mint_default: 'linear-gradient(135deg, #34d399, rgba(167,139,250,0.5))',
  violet_default: 'linear-gradient(135deg, #a78bfa, #fb7185)',
  rose_default: 'linear-gradient(135deg, #fb7185, #fbbf24)',
  gold_default: 'linear-gradient(135deg, #fbbf24, #fb7185)',
};

const RSVP_OPTIONS = [
  { value: 'yes', label: 'Je serai là', tone: 'yes' },
  { value: 'maybe', label: 'Peut-être', tone: 'maybe' },
  { value: 'no', label: 'Je ne pourrai pas', tone: 'no' },
];

const CONFIRMATION_COPY = {
  yes: 'À bientôt !',
  maybe: 'On espère vous voir !',
  no: 'Pas de souci !',
};

export default function InvitePage({ params }) {
  const { slug } = use(params);
  const [event, setEvent] = useState(null);
  const [identity, setIdentity] = useState({ first_name: '', last_name: '' });
  const [guest, setGuest] = useState(null);
  const [selectedRsvp, setSelectedRsvp] = useState('');
  const [step, setStep] = useState('verify');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    api.get(`/invite/${slug}`)
      .then(({ data }) => setEvent(data))
      .catch((err) => setError(err.response?.data?.error || 'Invitation introuvable.'))
      .finally(() => setLoading(false));
  }, [slug]);

  const formattedDate = useMemo(() => {
    if (!event?.date) return '';
    return new Date(event.date).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }, [event?.date]);

  const handleIdentityChange = (e) => {
    setIdentity((cur) => ({ ...cur, [e.target.name]: e.target.value }));
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        ...identity,
        ...(event?.event_type === 'open' && { rsvp_status: selectedRsvp }),
      };
      const { data } = await api.post(`/invite/${slug}/verify`, payload);
      if (!data.found) {
        setError("On n'a pas retrouvé cette invitation. Vérifie le prénom et le nom indiqués par l'hôte.");
        return;
      }
      setGuest({ id: data.guest_id, rsvp_status: data.rsvp_status });
      setSelectedRsvp(data.rsvp_status === 'pending' ? '' : data.rsvp_status);
      setStep(event?.event_type === 'open' ? 'done' : 'rsvp');
    } catch (err) {
      setError(err.response?.data?.error || "Impossible de vérifier l'invitation.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRsvp = async (e) => {
    e.preventDefault();
    if (!selectedRsvp || !guest?.id) return;
    setError('');
    setSubmitting(true);
    try {
      const { data } = await api.post(`/invite/${slug}/rsvp`, {
        guest_id: guest.id,
        rsvp_status: selectedRsvp,
      });
      setGuest((cur) => ({ ...cur, rsvp_status: data.rsvp_status }));
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.error || "Impossible d'enregistrer la réponse.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={s.loadingPage}>
        <p className={s.loading}>Chargement...</p>
      </div>
    );
  }

  const themeKey = event?.theme || 'elegant_minimal';
  const themeConfig = getThemeConfig(themeKey);
  const fontFamily = getFontFamily(event?.font_style || 'classic');
  const coverType = event?.cover_type || 'gradient';
  const coverValue = event?.cover_value || null;

  const heroBg = coverType === 'gradient' && coverValue && COVER_GRADIENTS[coverValue]
    ? COVER_GRADIENTS[coverValue]
    : themeConfig.heroBg;

  if (!event) {
    return (
      <div
        className={s.page}
        data-theme={themeKey}
        style={{ '--font-display': fontFamily }}
      >
        <div className={s.card}>
          <p className={s.kicker}>Sera</p>
          <h1 className={s.title}>Invitation introuvable</h1>
          <p className={s.muted}>{error || "Ce lien d'invitation n'est plus disponible."}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={s.page}
      data-theme={themeKey}
      style={{ '--font-display': fontFamily, '--invite-hero-bg-override': heroBg }}
    >
      {/* Hero */}
      <section className={s.hero}>
        {coverType === 'image' && coverValue ? (
          <img src={coverValue} alt="Couverture" className={s.heroCoverImage} />
        ) : null}
        <div className={s.heroContent}>
          <p className={s.kicker}>Invitation</p>
          <h1 className={s.title}>{event.title}</h1>
        </div>
      </section>

      {/* Floating card */}
      <div className={s.card}>
        {event.custom_message && (
          <p className={s.customMessage}>"{event.custom_message}"</p>
        )}
        <div className={s.meta}>
          <span>{formattedDate}</span>
          <span>{event.location}</span>
        </div>
        {event.description && <p className={s.description}>{event.description}</p>}

        <div className={s.divider} />

        {step === 'verify' && (
          <form onSubmit={handleVerify}>
            <p className={s.stepLabel}>Vérification</p>
            <div className={s.grid}>
              <label className={s.field} htmlFor="first_name">
                Prénom
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  autoComplete="given-name"
                  value={identity.first_name}
                  onChange={handleIdentityChange}
                  required
                />
              </label>
              <label className={s.field} htmlFor="last_name">
                Nom
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  autoComplete="family-name"
                  value={identity.last_name}
                  onChange={handleIdentityChange}
                  required
                />
              </label>
            </div>

            {event?.event_type === 'open' && (
              <div className={s.rsvpSection}>
                <p className={s.rsvpLabel}>Ta réponse</p>
                <div className={s.options}>
                  {RSVP_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`${s.optionBtn} ${selectedRsvp === option.value ? s.active : ''}`}
                      data-tone={option.tone}
                      onClick={() => setSelectedRsvp(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && <p className={s.error}>{error}</p>}
            <button
              className={s.primaryBtn}
              type="submit"
              disabled={submitting || (event?.event_type === 'open' && !selectedRsvp)}
            >
              {submitting ? 'Vérification...' : 'Continuer'}
            </button>
          </form>
        )}

        {step === 'rsvp' && (
          <form onSubmit={handleRsvp}>
            <p className={s.stepLabel}>Ta réponse</p>
            <div className={s.options}>
              {RSVP_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`${s.optionBtn} ${selectedRsvp === option.value ? s.active : ''}`}
                  data-tone={option.tone}
                  onClick={() => setSelectedRsvp(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {error && <p className={s.error}>{error}</p>}
            <button className={s.primaryBtn} type="submit" disabled={submitting || !selectedRsvp}>
              {submitting ? 'Enregistrement...' : 'Confirmer ma réponse'}
            </button>
          </form>
        )}

        {step === 'done' && (
          <div className={s.confirmation}>
            <p className={s.stepLabel}>Confirmation</p>
            <p className={s.confirmationName}>{identity.first_name},</p>
            <p className={s.confirmationMessage}>
              {CONFIRMATION_COPY[guest?.rsvp_status] || 'Ta réponse est bien enregistrée.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Rewrite invite.module.scss**

Replace the entire content of `frontend/styles/invite.module.scss`:

```scss
.loadingPage {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
}

.loading {
  font-size: 15px;
  color: var(--text-muted);
}

// Root page wrapper — applies theme background
.page {
  min-height: 100vh;
  background: var(--invite-hero-bg-override, var(--invite-hero-bg, #FAFAF8));
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 60px;
}

// Hero block
.hero {
  width: 100%;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px 32px;
  position: relative;
  overflow: hidden;
}

.heroCoverImage {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.heroContent {
  position: relative;
  z-index: 1;
  text-align: center;
}

.kicker {
  font-size: 11px;
  font-weight: 700;
  color: var(--invite-accent, #1A1A1A);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  opacity: 0.6;
  margin-bottom: 8px;
  display: block;
}

.title {
  font-size: 36px;
  line-height: 1.1;
  font-weight: 700;
  font-family: var(--font-display, var(--font-playfair, serif));
  color: var(--invite-text, #1A1A1A);
  text-align: center;

  // When there's a cover image, overlay text needs to be readable
  .heroCoverImage ~ .heroContent & {
    color: #FFFFFF;
    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
  }
}

// Floating card
.card {
  width: 100%;
  max-width: 480px;
  background: var(--invite-card-bg, #FFFFFF);
  border-radius: 24px;
  box-shadow: var(--invite-shadow, 0 8px 32px rgba(0, 0, 0, 0.10));
  padding: 28px 24px;
  margin: 0 16px;
  animation: fadeUp 0.28s var(--ease, cubic-bezier(0.2, 0.8, 0.2, 1)) both;
}

.customMessage {
  font-size: 15px;
  font-style: italic;
  color: var(--invite-accent, #1A1A1A);
  margin-bottom: 16px;
  line-height: 1.55;
  font-family: var(--font-display, inherit);
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  color: var(--invite-text-muted, #6B6B6B);
  margin-bottom: 12px;
}

.description {
  font-size: 14px;
  color: var(--invite-text-muted, #6B6B6B);
  white-space: pre-wrap;
  margin-bottom: 4px;
}

.divider {
  height: 1px;
  background: var(--invite-border, rgba(0, 0, 0, 0.08));
  margin: 20px 0;
}

.stepLabel {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  color: var(--invite-accent, #1A1A1A);
  opacity: 0.6;
  margin-bottom: 16px;
  display: block;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 4px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--invite-text-muted, #6B6B6B);

  input {
    width: 100%;
    min-width: 0;
    background: var(--invite-input-bg, rgba(0, 0, 0, 0.04));
    border: 1px solid var(--invite-input-border, rgba(0, 0, 0, 0.15));
    border-radius: 10px;
    padding: 11px 13px;
    color: var(--invite-text, #1A1A1A);
    font-size: 15px;
    outline: none;
    transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;

    &:focus {
      border-color: var(--invite-input-focus-border, rgba(0, 0, 0, 0.4));
      box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.06);
    }
  }
}

.rsvpSection {
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid var(--invite-border, rgba(0, 0, 0, 0.08));
}

.rsvpLabel {
  font-size: 13px;
  font-weight: 500;
  color: var(--invite-text-muted, #6B6B6B);
  margin-bottom: 10px;
  display: block;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 8px;
}

.optionBtn {
  width: 100%;
  padding: 14px 16px;
  background: transparent;
  border: 2px solid var(--invite-border, rgba(0, 0, 0, 0.12));
  border-radius: 999px;
  color: var(--invite-text, #1A1A1A);
  font-size: 15px;
  font-weight: 600;
  text-align: center;
  transition: border-color 0.15s, background 0.15s, transform 0.15s;

  &:hover {
    border-color: var(--invite-accent, #1A1A1A);
    transform: translateY(-1px);
  }

  &.active {
    background: var(--invite-accent, #1A1A1A);
    border-color: var(--invite-accent, #1A1A1A);
    color: var(--invite-btn-text, #FFFFFF);
    transform: scale(1.02);
  }
}

.primaryBtn {
  width: 100%;
  margin-top: 18px;
  background: var(--invite-accent, #1A1A1A);
  color: var(--invite-btn-text, #FFFFFF);
  font-weight: 700;
  font-size: 15px;
  border: none;
  border-radius: 999px;
  padding: 14px 16px;
  box-shadow: var(--invite-shadow, 0 8px 20px rgba(0, 0, 0, 0.15));
  transition: opacity 0.15s, transform 0.15s;

  &:hover {
    opacity: 0.88;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }
}

.error {
  margin-top: 14px;
  font-size: 13px;
  color: #dc2626;
  background: rgba(220, 38, 38, 0.08);
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: 10px;
  padding: 10px 12px;
}

.confirmation {
  text-align: center;
  padding: 12px 0;
}

.confirmationName {
  font-size: 28px;
  font-family: var(--font-display, var(--font-playfair, serif));
  color: var(--invite-text, #1A1A1A);
  margin-bottom: 8px;
  font-weight: 700;
}

.confirmationMessage {
  font-size: 16px;
  color: var(--invite-text-muted, #6B6B6B);
  font-style: italic;
}

.muted {
  font-size: 15px;
  color: var(--invite-text-muted, #6B6B6B);
  margin-top: 8px;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 520px) {
  .hero {
    min-height: 180px;
    padding: 32px 20px 24px;
  }

  .title {
    font-size: 28px;
  }

  .card {
    margin: 0 12px;
    padding: 22px 18px;
  }

  .grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Verify guest page in browser**

Open an invite link (e.g. `http://localhost:3000/invite/<slug>`). Check:
- Page background matches the event's theme hero color
- Event title uses the display font (Playfair by default)
- Card appears as a white/dark floating surface with rounded corners
- RSVP buttons are pill-shaped, stacked vertically
- Selected RSVP button fills with the accent color
- Submit button uses accent color, not white
- After submitting, confirmation shows name + message in display font

Test with `luxury_party` theme: page should be dark (`#18181B`), card dark (`#1C1C22`), accent gold.

- [ ] **Step 4: Commit**

```bash
git add frontend/app/invite/[slug]/page.js frontend/styles/invite.module.scss
git commit -m "feat: premium guest page — card layout, theme tokens, pill RSVP buttons"
```

---

## Self-Review Checklist

- [x] `font_style` flows: migration → model → controller attributes → dashboard init → PATCH payload → guest API → invite page
- [x] `THEME_CONFIGS` is single source of truth — both invite page and EventCustomization import from `themeConfig.js`
- [x] Legacy theme values (birthday, minimal, etc.) fall back via `getThemeConfig()` which returns `elegant_minimal` config for unknown keys
- [x] `[data-theme]` tokens in `globals.css` are scoped — won't affect dashboard
- [x] Dark themes (`luxury_party`, `bold_celebration`) set light text/border tokens
- [x] Cover image on guest page: shows as absolute-positioned overlay on hero, card still uses theme bg
- [x] `--font-display` CSS variable set via inline style on root wrapper — overrides per-page without affecting other routes
- [x] Font loading: `playfair.variable` and `allura.variable` classes on `<html>` — available everywhere
- [x] `handleUpdateCustomization` PATCH includes `font_style` (Task 7, Step 2)

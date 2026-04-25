# UI Refonte Glass iOS 17 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer le thème beige clair actuel par un design iOS 17 dark glass — fond indigo profond avec orbes colorés, surfaces en verre lumineux, boutons pilule blancs.

**Architecture:** Remplacement complet de `globals.css` (tokens + fond + orbes) puis mise à jour de chaque module SCSS pour utiliser les nouveaux tokens. Aucune modification de structure HTML/JSX. Aucun nouveau fichier créé.

**Tech Stack:** Next.js App Router, SCSS Modules, CSS custom properties

---

## Files Modified

| File | What changes |
|------|-------------|
| `frontend/app/globals.css` | Tous les tokens CSS + fond body + orbes |
| `frontend/styles/header.module.scss` | Header dark glass, bouton logout glass |
| `frontend/styles/auth.module.scss` | Inputs dark glass, bouton blanc pill |
| `frontend/styles/dashboard.module.scss` | Bouton CTA blanc, stat cards border-top, card hover dark |
| `frontend/styles/create.module.scss` | Inputs dark glass, bouton blanc pill |
| `frontend/styles/eventDetail.module.scss` | Boutons blancs, stat border-top, filtres, badges |
| `frontend/styles/invite.module.scss` | RSVP buttons dark glass, bouton blanc pill |
| `frontend/styles/installPrompt.module.scss` | Bouton primary blanc pill |

---

## Task 1: globals.css — Tokens & Fond

**Files:**
- Modify: `frontend/app/globals.css`

- [ ] **Step 1: Remplacer le fichier complet**

Remplacer tout le contenu de `frontend/app/globals.css` par :

```css
:root {
  --bg: #10082a;
  --bg-soft: #0d0620;
  --surface: rgba(255, 255, 255, 0.08);
  --surface-2: rgba(255, 255, 255, 0.06);
  --surface-strong: rgba(255, 255, 255, 0.90);
  --glass: rgba(255, 255, 255, 0.10);
  --glass-strong: rgba(255, 255, 255, 0.16);
  --glass-border: rgba(255, 255, 255, 0.14);
  --glass-border-strong: rgba(255, 255, 255, 0.24);
  --border: rgba(255, 255, 255, 0.10);
  --border-strong: rgba(255, 255, 255, 0.22);
  --text: #ffffff;
  --text-muted: rgba(255, 255, 255, 0.55);
  --text-on-white: #10082a;
  --accent: #f472b6;
  --accent-hover: #ec4899;
  --accent-soft: rgba(244, 114, 182, 0.18);
  --gold: #fbbf24;
  --gold-soft: rgba(251, 191, 36, 0.18);
  --mint: #34d399;
  --mint-soft: rgba(52, 211, 153, 0.18);
  --violet: #a78bfa;
  --violet-soft: rgba(167, 139, 250, 0.18);
  --rose: #fb7185;
  --rose-soft: rgba(251, 113, 133, 0.18);
  --ink: #ffffff;
  --danger: #fb7185;
  --shadow-xs: 0 2px 8px rgba(0, 0, 0, 0.30);
  --shadow-sm: 0 8px 24px rgba(0, 0, 0, 0.35);
  --shadow: 0 16px 48px rgba(0, 0, 0, 0.45);
  --radius: 20px;
  --radius-sm: 12px;
  --ease: cubic-bezier(0.2, 0.8, 0.2, 1);
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  min-height: 100%;
  overflow-x: hidden;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
  line-height: 1.5;
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: -1;
  background:
    radial-gradient(ellipse 60% 50% at 15% 5%, rgba(139, 92, 246, 0.40), transparent),
    radial-gradient(ellipse 50% 40% at 85% 10%, rgba(236, 72, 153, 0.35), transparent),
    radial-gradient(ellipse 70% 60% at 50% 90%, rgba(251, 146, 60, 0.25), transparent);
}

::selection {
  background: rgba(244, 114, 182, 0.28);
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  cursor: pointer;
  font-family: inherit;
}

input, textarea {
  font-family: inherit;
}

a:focus-visible,
button:focus-visible,
input:focus-visible,
textarea:focus-visible {
  outline: 3px solid rgba(255, 255, 255, 0.30);
  outline-offset: 3px;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Vérifier visuellement**

Lancer le dev server (`npm run dev` dans `frontend/`) et ouvrir `http://localhost:3000`. Le fond doit être `#10082a` avec des reflets violet/rose/orange visibles.

- [ ] **Step 3: Commit**

```bash
git add frontend/app/globals.css
git commit -m "style: refonte tokens CSS et fond dark iOS glass"
```

---

## Task 2: header.module.scss

**Files:**
- Modify: `frontend/styles/header.module.scss`

- [ ] **Step 1: Remplacer le fichier complet**

```scss
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.06);
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(20px) saturate(160%);
}

.logo {
  font-size: 20px;
  font-weight: 900;
  color: var(--text);
  letter-spacing: -0.03em;
}

.right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.name {
  font-size: 13px;
  color: var(--text-muted);
}

.logout {
  font-size: 13px;
  color: var(--text);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  padding: 7px 13px;
  font-weight: 800;
  transition: background 0.15s, border-color 0.15s, transform 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.14);
    border-color: var(--glass-border-strong);
    transform: translateY(-1px);
  }
}

@media (max-width: 480px) {
  .header {
    padding: 14px 16px;
  }

  .name {
    display: none;
  }
}
```

- [ ] **Step 2: Vérifier visuellement**

Le header doit être semi-transparent dark, logo blanc, bouton logout en glass outline blanc.

- [ ] **Step 3: Commit**

```bash
git add frontend/styles/header.module.scss
git commit -m "style: header dark glass iOS"
```

---

## Task 3: auth.module.scss

**Files:**
- Modify: `frontend/styles/auth.module.scss`

- [ ] **Step 1: Remplacer le fichier complet**

```scss
.page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.card {
  width: 100%;
  max-width: 400px;
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius);
  padding: 40px 32px;
  box-shadow: var(--shadow);
  backdrop-filter: blur(22px) saturate(160%);
  animation: fadeUp 0.28s var(--ease) both;
}

.logo {
  font-size: 24px;
  font-weight: 900;
  letter-spacing: -0.03em;
  color: var(--accent);
  margin-bottom: 8px;
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 4px;
}

.subtitle {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 32px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-muted);
  }

  input {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-sm);
    padding: 12px 14px;
    color: var(--text);
    font-size: 14px;
    outline: none;
    transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;

    &:focus {
      border-color: rgba(255, 255, 255, 0.35);
      background: rgba(255, 255, 255, 0.12);
      box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.08);
    }

    &::placeholder {
      color: rgba(255, 255, 255, 0.40);
    }
  }
}

.btn {
  margin-top: 8px;
  background: #ffffff;
  color: var(--text-on-white);
  font-weight: 800;
  font-size: 14px;
  border: none;
  border-radius: 999px;
  padding: 13px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  transition: background 0.15s, opacity 0.15s, transform 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.90);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

@media (max-width: 480px) {
  .page {
    align-items: flex-start;
    padding: 20px;
  }

  .card {
    padding: 28px 22px;
  }
}

.error {
  font-size: 13px;
  color: var(--danger);
  background: rgba(251, 113, 133, 0.12);
  border: 1px solid rgba(251, 113, 133, 0.25);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
}

.footer {
  margin-top: 24px;
  text-align: center;
  font-size: 13px;
  color: var(--text-muted);

  a {
    color: var(--accent);
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
}
```

- [ ] **Step 2: Vérifier visuellement**

Ouvrir `/login` et `/register`. Carte glass visible sur fond sombre, inputs dark, bouton pilule blanc, logo "Sera" en rose vif.

- [ ] **Step 3: Commit**

```bash
git add frontend/styles/auth.module.scss
git commit -m "style: auth dark glass, bouton blanc pill"
```

---

## Task 4: dashboard.module.scss

**Files:**
- Modify: `frontend/styles/dashboard.module.scss`

- [ ] **Step 1: Remplacer le fichier complet**

```scss
.page {
  width: min(1120px, calc(100% - 40px));
  margin: 0 auto;
  padding: 30px 0 96px;
  animation: fadeUp 0.24s var(--ease) both;
}

.hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 24px;
  padding: 32px;
  margin-bottom: 18px;
  color: var(--text);
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: 28px;
  box-shadow: var(--shadow);
  backdrop-filter: blur(22px) saturate(160%);
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, transparent 60%);
  }
}

.heroCopy {
  position: relative;
  z-index: 1;
  max-width: 680px;
}

.kicker {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 10px;
}

.heading {
  max-width: 720px;
  font-size: clamp(32px, 5vw, 58px);
  line-height: 0.96;
  font-weight: 850;
  letter-spacing: -0.03em;
  color: var(--text);
}

.subheading {
  max-width: 520px;
  margin-top: 16px;
  color: var(--text-muted);
  font-size: 16px;
}

.primaryAction,
.emptyBtn {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 12px 18px;
  background: #ffffff;
  color: var(--text-on-white);
  font-weight: 800;
  font-size: 14px;
  border-radius: 999px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  transition: background 0.16s, box-shadow 0.16s, transform 0.16s;

  &:hover {
    background: rgba(255, 255, 255, 0.90);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.30);
    transform: translateY(-2px);
  }
}

.statsGrid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.statCard {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-height: 112px;
  padding: 18px;
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: 22px;
  box-shadow: var(--shadow-xs);
  backdrop-filter: blur(18px) saturate(160%);

  &.coral {
    border-top: 3px solid var(--accent);
  }

  &.mint {
    border-top: 3px solid var(--mint);
  }

  &.violet {
    border-top: 3px solid var(--violet);
  }
}

.statValue {
  font-size: 38px;
  line-height: 1;
  font-weight: 850;
  color: var(--text);
}

.statLabel {
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 700;
}

.nextStrip {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 52px;
  padding: 13px 18px;
  margin-bottom: 26px;
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: 18px;
  color: var(--text);
  box-shadow: var(--shadow-xs);
  backdrop-filter: blur(18px) saturate(160%);
}

.nextLabel {
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.eventsSection {
  padding: 22px;
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: 26px;
  box-shadow: var(--shadow-xs);
  backdrop-filter: blur(18px) saturate(160%);
}

.sectionHeader {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;

  h2 {
    font-size: 22px;
    line-height: 1.1;
    letter-spacing: -0.02em;
    color: var(--text);
  }

  span {
    color: var(--text-muted);
    font-size: 13px;
    font-weight: 700;
  }
}

.list {
  display: grid;
  gap: 12px;
}

.empty {
  text-align: center;
  padding: 58px 20px;
  color: var(--text-muted);

  p {
    margin-bottom: 20px;
    font-size: 15px;
  }
}

.loading {
  color: var(--text-muted);
  font-size: 14px;
  padding: 36px 0;
  text-align: center;
}

.card {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  min-height: 92px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 14px 16px;
  backdrop-filter: blur(14px) saturate(160%);
  transition: background 0.16s, border-color 0.16s, box-shadow 0.16s, transform 0.16s;

  &:hover {
    background: var(--glass-strong);
    border-color: var(--glass-border-strong);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.30);
    transform: translateY(-2px);
  }

  &.coral .cardDate {
    background: var(--accent-soft);
    color: var(--accent);
  }

  &.gold .cardDate {
    background: var(--gold-soft);
    color: var(--gold);
  }

  &.mint .cardDate {
    background: var(--mint-soft);
    color: var(--mint);
  }

  &.violet .cardDate {
    background: var(--violet-soft);
    color: var(--violet);
  }
}

.cardDate {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: 18px;
  text-transform: uppercase;

  span {
    font-size: 24px;
    line-height: 1;
    font-weight: 850;
  }

  small {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.05em;
  }
}

.cardBody {
  min-width: 0;
}

.cardTitle {
  font-size: 17px;
  font-weight: 800;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cardMeta,
.cardLocation {
  font-size: 13px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cardLocation {
  margin-top: 2px;
}

.cardArrow {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.10);
  color: var(--text-muted);
  font-size: 24px;
  flex-shrink: 0;
}

@media (max-width: 760px) {
  .page {
    width: min(100% - 28px, 680px);
    padding-top: 18px;
  }

  .hero {
    grid-template-columns: 1fr;
    padding: 26px;
  }

  .primaryAction {
    width: 100%;
  }

  .statsGrid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .hero {
    border-radius: 24px;
  }

  .heading {
    font-size: 34px;
  }

  .eventsSection {
    padding: 16px;
    border-radius: 22px;
  }

  .card {
    grid-template-columns: 54px minmax(0, 1fr);
    gap: 12px;
  }

  .cardDate {
    width: 54px;
    height: 54px;
    border-radius: 16px;
  }

  .cardArrow {
    display: none;
  }
}
```

- [ ] **Step 2: Vérifier visuellement**

Ouvrir `/dashboard`. Hero glass avec inner highlight, stats avec border-top coloré, cards dark hoverable, bouton "Créer" pilule blanc.

- [ ] **Step 3: Commit**

```bash
git add frontend/styles/dashboard.module.scss
git commit -m "style: dashboard dark glass, CTA blanc, stat border-top"
```

---

## Task 5: create.module.scss

**Files:**
- Modify: `frontend/styles/create.module.scss`

- [ ] **Step 1: Remplacer le fichier complet**

```scss
.page {
  padding: 24px 20px;
  max-width: 600px;
  margin: 0 auto;
  animation: fadeUp 0.24s var(--ease) both;
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 24px;
  font-weight: 800;
  transition: color 0.15s, transform 0.15s;

  &:hover {
    color: var(--text);
    transform: translateX(-2px);
  }
}

.heading {
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 28px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 22px;
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  box-shadow: var(--shadow-xs);
  backdrop-filter: blur(18px) saturate(160%);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-muted);
  }

  input,
  textarea {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-sm);
    padding: 12px 14px;
    color: var(--text);
    font-size: 14px;
    outline: none;
    transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;

    &:focus {
      border-color: rgba(255, 255, 255, 0.35);
      background: rgba(255, 255, 255, 0.12);
      box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.08);
    }

    &::placeholder {
      color: rgba(255, 255, 255, 0.40);
    }
  }

  textarea {
    resize: vertical;
    min-height: 80px;
  }
}

.btn {
  margin-top: 8px;
  background: #ffffff;
  color: var(--text-on-white);
  font-weight: 850;
  font-size: 14px;
  border: none;
  border-radius: 999px;
  padding: 13px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  transition: background 0.15s, opacity 0.15s, transform 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.90);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

@media (max-width: 480px) {
  .page {
    padding: 20px 16px 56px;
  }
}

.error {
  font-size: 13px;
  color: var(--danger);
  background: rgba(251, 113, 133, 0.12);
  border: 1px solid rgba(251, 113, 133, 0.25);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
}
```

- [ ] **Step 2: Vérifier visuellement**

Ouvrir `/dashboard/create`. Formulaire glass, inputs dark, bouton pilule blanc, lien retour en blanc muted.

- [ ] **Step 3: Commit**

```bash
git add frontend/styles/create.module.scss
git commit -m "style: create form dark glass, bouton blanc pill"
```

---

## Task 6: eventDetail.module.scss

**Files:**
- Modify: `frontend/styles/eventDetail.module.scss`

- [ ] **Step 1: Remplacer le fichier complet**

```scss
.page {
  width: min(1040px, calc(100% - 40px));
  margin: 0 auto;
  padding: 28px 0 96px;
  animation: fadeUp 0.24s var(--ease) both;
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 800;
  color: var(--text-muted);
  margin-bottom: 18px;
  transition: color 0.15s, transform 0.15s;

  &:hover {
    color: var(--text);
    transform: translateX(-2px);
  }
}

.hero {
  position: relative;
  padding: 30px;
  margin-bottom: 14px;
  color: var(--text);
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: 28px;
  box-shadow: var(--shadow);
  backdrop-filter: blur(22px) saturate(160%);
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, transparent 60%);
  }
}

.kicker,
.panelLabel {
  font-size: 12px;
  font-weight: 850;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.kicker {
  color: var(--accent);
  margin-bottom: 10px;
}

.eventTitle {
  max-width: 760px;
  font-size: clamp(34px, 5vw, 60px);
  line-height: 0.96;
  font-weight: 900;
  letter-spacing: -0.035em;
  color: var(--text);
}

.eventMeta {
  margin-top: 14px;
  color: var(--text-muted);
  font-size: 15px;
  font-weight: 700;
}

.description {
  max-width: 680px;
  margin-top: 18px;
  color: var(--text-muted);
  white-space: pre-wrap;
}

.sharePanel,
.guestPanel {
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  box-shadow: var(--shadow-xs);
  backdrop-filter: blur(18px) saturate(160%);
}

.sharePanel {
  display: grid;
  grid-template-columns: minmax(0, 0.88fr) minmax(320px, 1fr);
  align-items: center;
  gap: 20px;
  padding: 20px;
  margin-bottom: 14px;
}

.panelLabel {
  color: var(--accent);
  margin-bottom: 4px;
}

.panelHint {
  color: var(--text-muted);
  font-size: 14px;
}

.inviteBox {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--glass-border);
  border-radius: 999px;
}

.inviteLinkDisplay {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  color: var(--text-muted);
  padding: 0 8px 0 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.copyBtn,
.addBtn {
  border: none;
  border-radius: 999px;
  background: #ffffff;
  color: var(--text-on-white);
  font-weight: 850;
  font-size: 14px;
  padding: 11px 16px;
  white-space: nowrap;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  transition: background 0.16s, box-shadow 0.16s, transform 0.16s, opacity 0.16s;

  &:hover {
    background: rgba(255, 255, 255, 0.90);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.30);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
}

.copyBtn.copied {
  background: var(--mint);
  color: #052e1a;
  box-shadow: 0 8px 20px rgba(52, 211, 153, 0.25);
}

.statsGrid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.statCard {
  min-height: 118px;
  padding: 18px;
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: 22px;
  box-shadow: var(--shadow-xs);
  backdrop-filter: blur(18px) saturate(160%);

  &.yes {
    border-top: 3px solid var(--mint);
  }

  &.maybe {
    border-top: 3px solid var(--violet);
  }

  &.no {
    border-top: 3px solid var(--rose);
  }

  &.pending {
    border-top: 3px solid var(--gold);
  }
}

.statValue {
  display: block;
  font-size: 38px;
  line-height: 1;
  font-weight: 900;
  color: var(--text);
}

.statLabel {
  display: block;
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 800;
}

.guestPanel {
  padding: 20px;
}

.sectionHeader {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 18px;
  align-items: end;
  margin-bottom: 18px;

  h2 {
    font-size: 24px;
    line-height: 1.1;
    letter-spacing: -0.02em;
    color: var(--text);
  }
}

.filters {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.filterTab {
  font-size: 13px;
  font-weight: 850;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  padding: 9px 13px;
  transition: color 0.15s, border-color 0.15s, background 0.15s, transform 0.15s;
  white-space: nowrap;

  &:hover {
    color: var(--text);
    border-color: var(--glass-border-strong);
    transform: translateY(-1px);
  }

  &.active {
    color: var(--text-on-white);
    background: var(--surface-strong);
    border-color: transparent;
  }
}

.guestList {
  display: grid;
  gap: 10px;
  margin-bottom: 18px;
}

.emptyGuests {
  text-align: center;
  padding: 34px 0;
  font-size: 14px;
  color: var(--text-muted);
}

.guestItem {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--glass-border);
  border-radius: 18px;
  padding: 12px 14px;
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s, transform 0.15s;

  &:hover {
    background: var(--glass-strong);
    border-color: var(--glass-border-strong);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
    transform: translateY(-1px);
  }
}

.guestName {
  min-width: 0;
  font-size: 15px;
  font-weight: 800;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.badge {
  font-size: 11px;
  font-weight: 900;
  padding: 6px 10px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.04em;

  &.yes {
    background: var(--mint-soft);
    color: var(--mint);
  }

  &.no {
    background: var(--rose-soft);
    color: var(--rose);
  }

  &.maybe {
    background: var(--violet-soft);
    color: var(--violet);
  }

  &.pending {
    background: var(--gold-soft);
    color: var(--gold);
  }
}

.deleteBtn {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  font-size: 20px;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.08);
  border: none;
  border-radius: 50%;
  line-height: 1;
  transition: color 0.15s, background 0.15s, transform 0.15s;

  &:hover {
    color: var(--danger);
    background: var(--rose-soft);
    transform: scale(1.05);
  }
}

.addForm {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
  gap: 10px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.addInput {
  min-width: 0;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  padding: 12px 14px;
  color: var(--text);
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;

  &:focus {
    border-color: rgba(255, 255, 255, 0.35);
    background: rgba(255, 255, 255, 0.12);
    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.08);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.40);
  }
}

.addError {
  grid-column: 1 / -1;
  font-size: 12px;
  font-weight: 700;
  color: var(--danger);
}

.loading {
  text-align: center;
  padding: 60px 0;
  font-size: 14px;
  color: var(--text-muted);
}

@media (max-width: 840px) {
  .page {
    width: min(100% - 28px, 680px);
    padding-top: 18px;
  }

  .sharePanel,
  .sectionHeader {
    grid-template-columns: 1fr;
  }

  .statsGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filters {
    justify-content: flex-start;
  }
}

@media (max-width: 560px) {
  .hero {
    padding: 24px;
    border-radius: 24px;
  }

  .eventTitle {
    font-size: 36px;
  }

  .sharePanel,
  .guestPanel {
    padding: 16px;
    border-radius: 22px;
  }

  .inviteBox,
  .addForm {
    grid-template-columns: 1fr;
  }

  .inviteBox {
    display: grid;
    border-radius: 18px;
  }

  .copyBtn,
  .addBtn {
    width: 100%;
  }

  .statsGrid {
    gap: 10px;
  }

  .statCard {
    min-height: 100px;
    padding: 15px;
  }

  .guestItem {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .badge {
    grid-column: 1 / 2;
    width: fit-content;
  }

  .deleteBtn {
    grid-row: 1 / 3;
    grid-column: 2;
  }
}
```

- [ ] **Step 2: Vérifier visuellement**

Ouvrir une page event detail. Hero glass, stats avec border-top coloré, liste invités dark glass, badges colorés sur fond sombre, boutons blancs pill, filtres glass (actif = blanc).

- [ ] **Step 3: Commit**

```bash
git add frontend/styles/eventDetail.module.scss
git commit -m "style: event detail dark glass, boutons blancs, badges colorés"
```

---

## Task 7: invite.module.scss

**Files:**
- Modify: `frontend/styles/invite.module.scss`

- [ ] **Step 1: Remplacer le fichier complet**

```scss
.page {
  min-height: 100vh;
  padding: 28px 20px 80px;
  max-width: 640px;
  margin: 0 auto;
  animation: fadeUp 0.24s var(--ease) both;
}

.event {
  padding: 28px;
  color: var(--text);
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: 28px;
  box-shadow: var(--shadow);
  backdrop-filter: blur(22px) saturate(160%);
  margin-bottom: 24px;
  animation: fadeUp 0.26s var(--ease) both;
}

.kicker,
.stepLabel {
  font-size: 12px;
  font-weight: 700;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.title {
  font-size: 30px;
  line-height: 1.12;
  font-weight: 750;
  color: var(--text);
  margin: 8px 0 14px;
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 18px;
}

.description {
  font-size: 15px;
  color: var(--text-muted);
  white-space: pre-wrap;
}

.panel {
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow-xs);
  backdrop-filter: blur(18px) saturate(160%);
  animation: fadeUp 0.28s var(--ease) both;
}

.stepHeader {
  margin-bottom: 18px;

  h2 {
    font-size: 20px;
    line-height: 1.2;
    color: var(--text);
    margin-top: 4px;
  }
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);

  input {
    width: 100%;
    min-width: 0;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-sm);
    padding: 12px 14px;
    color: var(--text);
    font-size: 15px;
    outline: none;
    transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;

    &:focus {
      border-color: rgba(255, 255, 255, 0.35);
      background: rgba(255, 255, 255, 0.12);
      box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.08);
    }
  }
}

.options {
  display: grid;
  gap: 10px;
}

.optionBtn {
  width: 100%;
  min-height: 48px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 15px;
  font-weight: 600;
  text-align: left;
  padding: 12px 14px;
  transition: border-color 0.15s, background 0.15s, color 0.15s, transform 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.14);
    border-color: var(--glass-border-strong);
    transform: translateY(-1px);
  }

  &.active {
    border-color: transparent;
  }

  &.yes.active {
    background: var(--mint);
    color: #052e1a;
  }

  &.maybe.active {
    background: var(--violet);
    color: #1a0a3d;
  }

  &.no.active {
    background: var(--rose);
    color: #3d0a15;
  }
}

.primaryBtn {
  width: 100%;
  margin-top: 18px;
  background: #ffffff;
  color: var(--text-on-white);
  font-weight: 850;
  font-size: 15px;
  border: none;
  border-radius: 999px;
  padding: 13px 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  transition: background 0.15s, opacity 0.15s, transform 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.90);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.error {
  margin-top: 14px;
  font-size: 13px;
  color: var(--danger);
  background: rgba(251, 113, 133, 0.12);
  border: 1px solid rgba(251, 113, 133, 0.25);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
}

.confirmation,
.muted,
.loading {
  font-size: 15px;
  color: var(--text-muted);
}

.confirmation {
  color: var(--text);
}

.loading {
  text-align: center;
  padding: 48px 0;
}

@media (max-width: 520px) {
  .page {
    padding-top: 22px;
  }

  .title {
    font-size: 26px;
  }

  .grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 2: Vérifier visuellement**

Ouvrir une page `/invite/[slug]`. Carte event glass, champs dark glass, boutons RSVP dark inactifs / colorés actifs, bouton "Confirmer" pilule blanc.

- [ ] **Step 3: Commit**

```bash
git add frontend/styles/invite.module.scss
git commit -m "style: invite dark glass, RSVP buttons colorés, CTA blanc"
```

---

## Task 8: installPrompt.module.scss

**Files:**
- Modify: `frontend/styles/installPrompt.module.scss`

- [ ] **Step 1: Remplacer le fichier complet**

```scss
.prompt {
  position: fixed;
  left: 16px;
  right: 16px;
  bottom: 16px;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  max-width: 560px;
  margin: 0 auto;
  padding: 14px;
  background: var(--glass-strong);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  backdrop-filter: blur(22px) saturate(160%);
}

.title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 2px;
}

.text {
  font-size: 13px;
  color: var(--text-muted);
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.primary,
.secondary {
  border: none;
  border-radius: 999px;
  padding: 9px 14px;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.primary {
  background: #ffffff;
  color: var(--text-on-white);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.20);
  transition: background 0.15s, transform 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.90);
    transform: translateY(-1px);
  }
}

.secondary {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-muted);
  border: 1px solid var(--glass-border);
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.14);
    color: var(--text);
  }
}

@media (max-width: 520px) {
  .prompt {
    align-items: stretch;
    flex-direction: column;
  }

  .actions {
    justify-content: flex-end;
  }
}
```

- [ ] **Step 2: Vérifier visuellement**

Le prompt PWA doit apparaître en bas de l'écran avec le style glass dark, bouton "Installer" pilule blanc, bouton "Non merci" glass outline.

- [ ] **Step 3: Commit**

```bash
git add frontend/styles/installPrompt.module.scss
git commit -m "style: install prompt dark glass, bouton blanc pill"
```

---

## Task 9: Vérification finale cross-pages

- [ ] **Step 1: Lancer le dev server**

```bash
cd frontend && npm run dev
```

- [ ] **Step 2: Vérifier chaque page**

Checklist visuelle :

| Page | URL | Points à vérifier |
|------|-----|-------------------|
| Login | `/login` | Fond sombre, orbes visibles, carte glass, bouton blanc |
| Register | `/register` | Même que login |
| Dashboard | `/dashboard` | Hero glass, stats border-top, cards dark, CTA blanc |
| Create | `/dashboard/create` | Formulaire glass, inputs dark, bouton blanc |
| Event detail | `/dashboard/[id]` | Hero, stats, invite box, guest list, badges colorés |
| Invite (guest) | `/invite/[slug]` | Carte event, RSVP buttons, bouton confirmer blanc |

- [ ] **Step 3: Vérifier mobile (DevTools)**

Passer en vue mobile (375px) sur chaque page. Vérifier lisibilité et layout.

- [ ] **Step 4: Commit final**

```bash
git add .
git commit -m "style: vérification finale refonte glass iOS 17"
```

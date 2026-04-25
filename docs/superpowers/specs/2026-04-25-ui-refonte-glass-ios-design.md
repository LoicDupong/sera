# UI Refonte — Glass iOS 17 Premium

**Date:** 2026-04-25
**Scope:** Refonte visuelle complète du frontend (globals.css + tous les modules SCSS)
**Objectif:** Remplacer l'actuel thème beige/crème par un design iOS 17 dark glass — fond indigo profond avec orbes colorés, surfaces en verre lumineux, boutons pilule blancs.

---

## Contexte

Le design actuel utilise un fond beige clair (`#fbf5ee`) avec des surfaces glass. Sur fond clair, l'effet `backdrop-filter` est invisible — les panneaux semblent plats et sans profondeur. Les couleurs (rouge-corail sur beige) manquent de cohérence et de lisibilité.

---

## Direction visuelle

**Style cible :** iOS 17 dark — apps Wallet, Music, Photos.
**Ambiance :** Festif premium. Profondeur via les orbes, élégance via le glass blanc lumineux.

---

## Système de fond

### Base
```
background: #10082a  (indigo très sombre)
```

### Orbes (fixed, pointer-events: none, z-index: 0)
Positionnés en `position: fixed` sur tout l'écran, ne scrollent pas.

| Orbe | Couleur | Position | Taille |
|------|---------|----------|--------|
| Violet | `rgba(139, 92, 246, 0.40)` | 15% x, 5% y | ellipse 60% × 50% |
| Rose | `rgba(236, 72, 153, 0.35)` | 85% x, 10% y | ellipse 50% × 40% |
| Orange | `rgba(251, 146, 60, 0.25)` | 50% x, 90% y | ellipse 70% × 60% |

Implémentés via `body::before` avec `background: radial-gradient(...)` multiples.

---

## Tokens CSS (globals.css — remplacement complet)

```css
:root {
  /* Fond */
  --bg: #10082a;
  --bg-soft: #0d0620;

  /* Surfaces glass */
  --surface: rgba(255, 255, 255, 0.08);
  --surface-2: rgba(255, 255, 255, 0.06);
  --surface-strong: rgba(255, 255, 255, 0.90);
  --glass: rgba(255, 255, 255, 0.10);
  --glass-strong: rgba(255, 255, 255, 0.16);
  --glass-border: rgba(255, 255, 255, 0.14);
  --glass-border-strong: rgba(255, 255, 255, 0.24);

  /* Bordures */
  --border: rgba(255, 255, 255, 0.10);
  --border-strong: rgba(255, 255, 255, 0.22);

  /* Texte */
  --text: #ffffff;
  --text-muted: rgba(255, 255, 255, 0.55);
  --text-on-white: #10082a;
  --ink: #ffffff;

  /* Accent — rose vif (highlights, kickers, liens) */
  --accent: #f472b6;
  --accent-hover: #ec4899;
  --accent-soft: rgba(244, 114, 182, 0.18);

  /* Couleurs sémantiques */
  --gold: #fbbf24;
  --gold-soft: rgba(251, 191, 36, 0.18);
  --mint: #34d399;
  --mint-soft: rgba(52, 211, 153, 0.18);
  --violet: #a78bfa;
  --violet-soft: rgba(167, 139, 250, 0.18);
  --rose: #fb7185;
  --rose-soft: rgba(251, 113, 133, 0.18);
  --danger: #fb7185;

  /* Ombres */
  --shadow-xs: 0 2px 8px rgba(0, 0, 0, 0.30);
  --shadow-sm: 0 8px 24px rgba(0, 0, 0, 0.35);
  --shadow: 0 16px 48px rgba(0, 0, 0, 0.45);

  /* Forme */
  --radius: 20px;
  --radius-sm: 12px;
  --ease: cubic-bezier(0.2, 0.8, 0.2, 1);
}
```

---

## Composants

### Bouton primaire
- Fond blanc `#ffffff`, texte `var(--text-on-white)` (`#10082a`)
- Border-radius `999px` (pilule)
- Hover : `background: rgba(255,255,255,0.90)` + `translateY(-2px)`
- Box-shadow : `0 8px 20px rgba(0,0,0,0.25)`
- Pas de box-shadow coloré (le fond est déjà coloré)

### Bouton secondaire / outline
- Fond `rgba(255,255,255,0.08)`, bordure `var(--glass-border)`, texte blanc
- Hover : fond `rgba(255,255,255,0.14)`, bordure `var(--glass-border-strong)`

### Inputs & Textareas
- Fond `rgba(255,255,255,0.08)`
- Bordure `1px solid rgba(255,255,255,0.14)`
- Texte `#ffffff`, placeholder `rgba(255,255,255,0.40)`
- Focus : `border-color: rgba(255,255,255,0.35)` + `box-shadow: 0 0 0 4px rgba(255,255,255,0.08)`
- Background focus : `rgba(255,255,255,0.12)`

### Labels de champ
- `color: var(--text-muted)` (`rgba(255,255,255,0.55)`)

### Panneaux / Cards glass
- `background: var(--glass)` (`rgba(255,255,255,0.10)`)
- `border: 1px solid var(--glass-border)`
- `backdrop-filter: blur(22px) saturate(160%)`
- `box-shadow: var(--shadow-sm)`

### Stat cards (dashboard & event detail)
- Remplacer `border-left: 4px solid` par `border-top: 3px solid` — plus moderne
- Couleurs : coral → `var(--accent)`, mint → `var(--mint)`, violet → `var(--violet)`, gold → `var(--gold)`, rose → `var(--rose)`

### Badges RSVP
- `yes` : fond `var(--mint-soft)`, texte `var(--mint)`
- `no` : fond `var(--rose-soft)`, texte `var(--rose)`
- `maybe` : fond `var(--violet-soft)`, texte `var(--violet)`
- `pending` : fond `var(--gold-soft)`, texte `var(--gold)`

### Boutons RSVP (invite page)
- Inactif : fond `rgba(255,255,255,0.08)`, bordure `rgba(255,255,255,0.14)`, texte blanc
- Actif yes : fond `var(--mint)`, texte `#052e1a`
- Actif maybe : fond `var(--violet)`, texte `#1a0a3d`
- Actif no : fond `var(--rose)`, texte `#3d0a15`

### Filtres tabs (event detail)
- Inactif : glass semi-transparent, texte muted
- Actif : fond blanc `rgba(255,255,255,0.90)`, texte `var(--text-on-white)`

### Header
- `background: rgba(255,255,255,0.06)`, `backdrop-filter: blur(20px)`
- Bordure basse `rgba(255,255,255,0.10)`
- Logo blanc, texte blanc
- Bouton logout : glass outline blanc

### Confettis décoratifs (hero panels)
- Remplacer les mini-tirets CSS par des caractères `✦` positionnés en `absolute` dans les `::after` des hero panels
- Couleur : `rgba(255,255,255,0.20)`
- 4-5 instances par hero panel, tailles variées (14px à 22px)

---

## Fichiers à modifier

1. `frontend/app/globals.css` — tokens + body background + orbes
2. `frontend/styles/header.module.scss`
3. `frontend/styles/auth.module.scss`
4. `frontend/styles/dashboard.module.scss`
5. `frontend/styles/create.module.scss`
6. `frontend/styles/eventDetail.module.scss`
7. `frontend/styles/invite.module.scss`
8. `frontend/styles/installPrompt.module.scss`

---

## Ce qui NE change pas

- Structure HTML / JSX — aucun composant modifié
- Noms de classes CSS — aucun refactor
- Logique métier — hors scope
- Fonctionnalités — hors scope

---

## Critères de succès

- Fond `#10082a` avec orbes visibles sur toutes les pages
- Effet `backdrop-filter` visible et élégant sur tous les panneaux
- Boutons principaux blancs sur fond sombre = contraste parfait
- Texte blanc lisible partout
- Badges RSVP colorés et lisibles
- Cohérence visuelle entre toutes les pages

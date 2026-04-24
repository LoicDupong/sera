# Dashboard Design — Sera

Date: 2026-04-25

## Routing

```
/dashboard          → liste des events du host (page d'atterrissage post-login)
/dashboard/create   → formulaire création event
/dashboard/[id]     → détail event (guest list, filtres, gestion)
```

Routes protégées : redirect `/login` si pas de token JWT.
Layout commun : header minimal (logo "Sera" + bouton logout).

## Composants

### `/dashboard/page.js`
- `EventCard` — card cliquable : nom event, date, badge "X / Y répondu"
- `EmptyState` — si 0 events : texte centré + bouton CTA gold
- `FAB` — bouton "+" fixé bottom-right → navigue vers `/dashboard/create`

### `/dashboard/create/page.js`
- Formulaire : nom (requis), date (requis), description (optionnel)
- Submit → `POST /api/events` → redirect `/dashboard/[id]` + update liste locale

### `/dashboard/[id]/page.js`
- `EventHeader` — nom, date, lien privé avec bouton copier
- `RsvpFilters` — tabs : Tous / Oui / Non / En attente
- `GuestList` — liste filtrée selon tab actif
- `GuestItem` — ligne : nom prénom + badge statut + bouton supprimer
- `AddGuestForm` — champ nom + prénom inline + bouton ajouter

## Data Flow

| Action | Appel API | Mise à jour state |
|---|---|---|
| Charger events | `GET /api/events` | `setEvents(data)` |
| Charger event + guests | `GET /api/events/:id` | `setEvent(data)`, `setGuests(data.guests)` |
| Créer event | `POST /api/events` | `setEvents(prev => [...prev, newEvent])` + redirect |
| Ajouter invité | `POST /api/events/:id/guests` | `setGuests(prev => [...prev, newGuest])` |
| Supprimer invité | `DELETE /api/events/:id/guests/:guestId` | `setGuests(prev => prev.filter(...))` |

State local `useState` par page — pas de Zustand (données page-scoped). Zustand = auth uniquement.
Pas d'optimistic update — on attend la réponse API avant de mettre à jour le state local.

## Visual

- Fond `#0d0d0d`, surface `#1a1a1a`, accent `#c9a96e` (gold), danger `#e05c5c`
- EventCard : border-left gold, nom en blanc, date en gris, badge réponses
- FAB : cercle gold, `position: fixed`, bottom-right
- RsvpFilters : tabs underline, tab actif en gold
- GuestItem badge : vert (oui) / rouge (non) / gris (en attente)
- EmptyState : texte centré + CTA gold
- Transitions : `opacity + translateY` léger au chargement des listes
- Mobile-first, une colonne, pas de breakpoint complexe

## Out of scope (MVP)

- Stats globales dans le header (V1)
- Filtres avancés / recherche par nom
- Pagination
- Co-hosts
- Import CSV

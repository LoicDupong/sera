# 16 — Build Order

## Principe
Backend first → Frontend ensuite. Chaque étape est testable indépendamment.

---

## Phase 1 — Setup & infrastructure
1. Init repo (Next.js + Express monorepo ou deux dossiers séparés)
2. Config PostgreSQL + Sequelize (connexion, migrations)
3. Variables d'environnement (docs/19_env_config.md)
4. Structure de dossiers backend (routes, controllers, models, middlewares)

## Phase 2 — Auth host
5. Model User + migration
6. POST /api/auth/register
7. POST /api/auth/login → JWT
8. Middleware auth JWT (protège les routes privées)

## Phase 3 — Events
9. Model Event + migration (avec slug auto)
10. POST /api/events — créer un event
11. GET /api/events — liste des events du host
12. GET /api/events/:id — détails event (dashboard)
13. PUT /api/events/:id — modifier
14. DELETE /api/events/:id — supprimer

## Phase 4 — Guests
15. Model Guest + migration
16. POST /api/events/:id/guests — ajouter un guest
17. DELETE /api/events/:id/guests/:guestId — supprimer un guest

## Phase 5 — Flow guest (public)
18. GET /api/events/:slug — détails event public
19. POST /api/events/:slug/verify — vérification nom/prénom
20. POST /api/events/:slug/rsvp — soumettre RSVP

## Phase 6 — Push notifications
21. Setup Web Push (clés VAPID)
22. Model PushSubscription + migration
23. POST /api/push/subscribe
24. Trigger push quand un guest répond (dans le handler RSVP)

## Phase 7 — Frontend host
25. Pages auth (register / login)
26. Dashboard — liste des events
27. Page création / édition d'event
28. Page détail event — guest list + filtres (oui / non / en attente)

## Phase 8 — Frontend guest
29. Page invitation (accès via slug)
30. Modal vérification nom/prénom
31. Form RSVP (yes / no / maybe)
32. Page confirmation / détails event post-réponse

## Phase 9 — PWA
33. manifest.json
34. Service worker (notifications push côté client)
35. Install prompt

## Phase 10 — Polish & démo
36. Animations d'apparition page guest (effet wow)
37. Responsive / mobile-first check
38. Tests end-to-end du flow complet

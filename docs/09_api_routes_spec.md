# 09 — API Routes Spec

## Public routes (sans auth)

### Auth
- `POST /api/auth/register` — créer un compte host
- `POST /api/auth/login` — login → retourne JWT

### Event (accès guest via slug)
- `GET /api/events/:slug` — récupérer les détails d'un event (page invitation guest)
- `POST /api/events/:slug/verify` — vérifier nom/prénom du guest (cherche dans la guest list)
- `POST /api/events/:slug/rsvp` — soumettre un RSVP (yes / no / maybe)

---

## Protected routes (JWT requis)

### Events
- `GET /api/events` — liste des events du host connecté
- `POST /api/events` — créer un event
- `GET /api/events/:id` — détails d'un event + liste guests (dashboard)
- `PUT /api/events/:id` — modifier un event
- `DELETE /api/events/:id` — supprimer un event

### Guests
- `POST /api/events/:id/guests` — ajouter un guest à la liste
- `DELETE /api/events/:id/guests/:guestId` — supprimer un guest

### Push notifications
- `POST /api/push/subscribe` — enregistrer une push subscription (navigateur host)
- `DELETE /api/push/subscribe` — supprimer la push subscription

---

## Payload rules

### POST /api/auth/register
```json
{ "email": "string", "password": "string", "name": "string" }
```

### POST /api/auth/login
```json
{ "email": "string", "password": "string" }
```

### POST /api/events
```json
{ "title": "string", "description": "string?", "date": "ISO8601", "location": "string" }
```

### POST /api/events/:slug/verify
```json
{ "first_name": "string", "last_name": "string" }
```
Retourne: `{ found: true, guest_id: "uuid" }` ou `{ found: false }`

### POST /api/events/:slug/rsvp
```json
{ "guest_id": "uuid", "rsvp_status": "yes | no | maybe" }
```

### POST /api/events/:id/guests
```json
{ "first_name": "string", "last_name": "string" }
```

### POST /api/push/subscribe
```json
{ "endpoint": "string", "keys": { "auth": "string", "p256dh": "string" } }
```

# 10 — Models Spec

## Model list

### User (host uniquement)
| Champ | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| email | STRING | unique, required |
| password | STRING | argon2 hash |
| name | STRING | required |
| created_at | DATE | auto |

### Event
| Champ | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| host_id | UUID | FK → User |
| title | STRING | required |
| description | TEXT | optional |
| date | DATE | required |
| location | STRING | required |
| slug | UUID | unique, généré auto (lien privé) |
| created_at | DATE | auto |

### Guest
| Champ | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| event_id | UUID | FK → Event |
| first_name | STRING | required |
| last_name | STRING | required |
| rsvp_status | ENUM | pending \| yes \| no \| maybe — défaut: pending |
| responded_at | DATE | null jusqu'à réponse |
| created_at | DATE | auto |

### PushSubscription
| Champ | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| host_id | UUID | FK → User |
| endpoint | STRING | URL push service |
| keys | JSON | auth + p256dh |
| created_at | DATE | auto |

---

## Relations
- User → hasMany Events
- User → hasMany PushSubscriptions
- Event → belongsTo User
- Event → hasMany Guests
- Guest → belongsTo Event

---

## Important validations
- Guest: (first_name + last_name + event_id) doit être unique — pas de doublon d'invité
- Event: slug généré automatiquement à la création, jamais modifiable
- Guest: rsvp_status ne peut prendre que les valeurs de l'enum
- User: email unique en base

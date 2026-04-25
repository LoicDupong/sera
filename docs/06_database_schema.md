# 06 — Database Schema

## Tables

### users
| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | UUID | PK, default gen_random_uuid() |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password | VARCHAR(255) | NOT NULL |
| name | VARCHAR(100) | NOT NULL |
| created_at | TIMESTAMP | DEFAULT NOW() |

### events
| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | UUID | PK, default gen_random_uuid() |
| host_id | UUID | FK → users.id, NOT NULL |
| title | VARCHAR(255) | NOT NULL |
| description | TEXT | NULL |
| date | TIMESTAMP | NOT NULL |
| location | VARCHAR(255) | NOT NULL |
| slug | UUID | UNIQUE, NOT NULL, default gen_random_uuid() |
| created_at | TIMESTAMP | DEFAULT NOW() |

### guests
| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | UUID | PK, default gen_random_uuid() |
| event_id | UUID | FK → events.id, NOT NULL |
| first_name | VARCHAR(100) | NOT NULL |
| last_name | VARCHAR(100) | NOT NULL |
| rsvp_status | ENUM('pending','yes','no','maybe') | DEFAULT 'pending' |
| responded_at | TIMESTAMP | NULL |
| created_at | TIMESTAMP | DEFAULT NOW() |

### push_subscriptions
| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | UUID | PK, default gen_random_uuid() |
| host_id | UUID | FK → users.id, NOT NULL |
| endpoint | TEXT | NOT NULL |
| keys | JSONB | NOT NULL |
| created_at | TIMESTAMP | DEFAULT NOW() |

---

## Key fields
- `events.slug` : identifiant public de l'event — utilisé dans l'URL du lien d'invitation
- `guests.rsvp_status` : état de réponse de l'invité
- `guests.responded_at` : timestamp de la réponse (null = pas encore répondu)
- `push_subscriptions.keys` : contient `auth` et `p256dh` pour Web Push

---

## Relations
- users → events : 1-N (un host a plusieurs events)
- events → guests : 1-N (un event a plusieurs guests)
- users → push_subscriptions : 1-N (un host peut avoir plusieurs subscriptions)

---

## Index recommandés
- `events(slug)` — lookup fréquent pour la page guest
- `guests(event_id, last_name, first_name)` — vérification nom/prénom
- `push_subscriptions(host_id)` — envoi de notifications

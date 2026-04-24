# Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full host dashboard — events list, create form, and event detail page with guest management.

**Architecture:** Three pages under `/dashboard` protected by an auth-guard layout. State is local (`useState`) per page; Zustand is auth-only. All mutations update local state immediately after API success (no refetch).

**Tech Stack:** Next.js App Router, SCSS Modules, Axios (`@/lib/api`), Zustand (`@/store/authStore`)

---

## API Contract (read before coding)

```
GET  /api/events                     → [{ id, title, date, location, description, slug, ... }]
POST /api/events                     → body: { title, date, location, description? } (title+date+location required)
GET  /api/events/:id                 → { id, title, date, location, slug, guests: [{ id, first_name, last_name, rsvp_status }] }
POST /api/events/:id/guests          → body: { first_name, last_name }  → guest object
DELETE /api/events/:id/guests/:gid   → 204
```

`rsvp_status` values: `pending` | `yes` | `no` | `maybe`

All requests need Bearer token (handled automatically by `@/lib/api` interceptor).

---

## File Map

| File | Role |
|---|---|
| `frontend/app/dashboard/layout.js` | Auth guard + AppHeader wrapper |
| `frontend/app/dashboard/page.js` | Events list + FAB |
| `frontend/app/dashboard/create/page.js` | Create event form |
| `frontend/app/dashboard/[id]/page.js` | Event detail (header + guests) |
| `frontend/components/AppHeader.js` | Shared header: logo + logout |
| `frontend/components/EventCard.js` | Clickable event card |
| `frontend/components/RsvpFilters.js` | Tab bar: Tous / Oui / Non / En attente |
| `frontend/components/GuestItem.js` | Single guest row with badge + delete |
| `frontend/components/AddGuestForm.js` | Inline add-guest form |
| `frontend/styles/header.module.scss` | AppHeader styles |
| `frontend/styles/dashboard.module.scss` | Dashboard list + EventCard styles |
| `frontend/styles/create.module.scss` | Create form styles |
| `frontend/styles/eventDetail.module.scss` | Detail page styles (all subcomponents) |

---

## Task 1: Auth Guard Layout + AppHeader

**Files:**
- Create: `frontend/app/dashboard/layout.js`
- Create: `frontend/components/AppHeader.js`
- Create: `frontend/styles/header.module.scss`

- [ ] **Step 1: Create `frontend/styles/header.module.scss`**

```scss
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  position: sticky;
  top: 0;
  z-index: 10;
}

.logo {
  font-size: 20px;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: -0.5px;
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
  color: var(--text-muted);
  background: none;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 6px 12px;
  transition: color 0.15s, border-color 0.15s;

  &:hover {
    color: var(--text);
    border-color: var(--text-muted);
  }
}
```

- [ ] **Step 2: Create `frontend/components/AppHeader.js`**

```js
'use client';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import s from '@/styles/header.module.scss';

export default function AppHeader() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className={s.header}>
      <span className={s.logo}>Sera</span>
      <div className={s.right}>
        {user && <span className={s.name}>{user.name}</span>}
        <button className={s.logout} onClick={handleLogout}>Déconnexion</button>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Create `frontend/app/dashboard/layout.js`**

```js
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import AppHeader from '@/components/AppHeader';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const init = useAuthStore((state) => state.init);

  useEffect(() => {
    init();
    if (!localStorage.getItem('token')) {
      router.push('/login');
    }
  }, []);

  return (
    <>
      <AppHeader />
      <main>{children}</main>
    </>
  );
}
```

- [ ] **Step 4: Verify — start the frontend dev server and open `http://localhost:3000/dashboard` without being logged in**

Run: `cd frontend && npm run dev`

Expected: redirects to `/login`.

Then log in and go back to `/dashboard`. Expected: header visible with "Sera" logo and logout button.

- [ ] **Step 5: Commit**

```bash
git add frontend/app/dashboard/layout.js frontend/components/AppHeader.js frontend/styles/header.module.scss
git commit -m "feat: dashboard layout with auth guard and AppHeader"
```

---

## Task 2: Dashboard Events List Page + EventCard

**Files:**
- Create: `frontend/app/dashboard/page.js`
- Create: `frontend/components/EventCard.js`
- Create: `frontend/styles/dashboard.module.scss`

- [ ] **Step 1: Create `frontend/styles/dashboard.module.scss`**

```scss
.page {
  padding: 24px 20px 100px;
  max-width: 600px;
  margin: 0 auto;
}

.heading {
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 24px;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);

  p {
    margin-bottom: 20px;
    font-size: 15px;
  }
}

.emptyBtn {
  display: inline-block;
  background: var(--accent);
  color: #0d0d0d;
  font-weight: 600;
  font-size: 14px;
  padding: 12px 24px;
  border-radius: var(--radius-sm);
  transition: background 0.15s;

  &:hover {
    background: var(--accent-hover);
  }
}

.loading {
  color: var(--text-muted);
  font-size: 14px;
  padding: 40px 0;
  text-align: center;
}

.fab {
  position: fixed;
  bottom: 28px;
  right: 20px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--accent);
  color: #0d0d0d;
  font-size: 28px;
  font-weight: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  box-shadow: 0 4px 16px rgba(201, 169, 110, 0.3);
  transition: background 0.15s, transform 0.15s;

  &:hover {
    background: var(--accent-hover);
    transform: scale(1.05);
  }
}

/* EventCard styles — used in this module */
.card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--surface);
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  border-radius: var(--radius);
  padding: 16px 18px;
  transition: background 0.15s;
  gap: 12px;

  &:hover {
    background: var(--surface-2);
  }
}

.cardBody {
  flex: 1;
  min-width: 0;
}

.cardTitle {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cardMeta {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 4px;
}

.cardArrow {
  color: var(--text-muted);
  font-size: 18px;
  flex-shrink: 0;
}
```

- [ ] **Step 2: Create `frontend/components/EventCard.js`**

```js
import Link from 'next/link';
import s from '@/styles/dashboard.module.scss';

export default function EventCard({ event }) {
  const date = event.date
    ? new Date(event.date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '—';

  return (
    <Link href={`/dashboard/${event.id}`} className={s.card}>
      <div className={s.cardBody}>
        <h2 className={s.cardTitle}>{event.title}</h2>
        <p className={s.cardMeta}>{date}{event.location ? ` · ${event.location}` : ''}</p>
      </div>
      <span className={s.cardArrow}>›</span>
    </Link>
  );
}
```

- [ ] **Step 3: Create `frontend/app/dashboard/page.js`**

```js
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import EventCard from '@/components/EventCard';
import s from '@/styles/dashboard.module.scss';

export default function DashboardPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/events')
      .then(({ data }) => setEvents(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={s.page}>
      <h1 className={s.heading}>Mes événements</h1>

      {loading ? (
        <p className={s.loading}>Chargement…</p>
      ) : events.length === 0 ? (
        <div className={s.empty}>
          <p>Aucun événement pour l'instant.</p>
          <Link href="/dashboard/create" className={s.emptyBtn}>
            Créer mon premier événement
          </Link>
        </div>
      ) : (
        <div className={s.list}>
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      <Link href="/dashboard/create" className={s.fab} aria-label="Créer un événement">
        +
      </Link>
    </div>
  );
}
```

- [ ] **Step 4: Verify — open `http://localhost:3000/dashboard`**

Expected:
- Logged in: list of events (or empty state with CTA button)
- Gold FAB "+" visible bottom-right
- Clicking a card navigates to `/dashboard/[id]` (404 for now, that's fine)

- [ ] **Step 5: Commit**

```bash
git add frontend/app/dashboard/page.js frontend/components/EventCard.js frontend/styles/dashboard.module.scss
git commit -m "feat: dashboard events list with EventCard and FAB"
```

---

## Task 3: Create Event Page

**Files:**
- Create: `frontend/app/dashboard/create/page.js`
- Create: `frontend/styles/create.module.scss`

- [ ] **Step 1: Create `frontend/styles/create.module.scss`**

```scss
.page {
  padding: 24px 20px;
  max-width: 600px;
  margin: 0 auto;
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 24px;
  transition: color 0.15s;

  &:hover {
    color: var(--text);
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
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 12px 14px;
    color: var(--text);
    font-size: 14px;
    outline: none;
    transition: border-color 0.15s;

    &:focus {
      border-color: var(--accent);
    }

    &::placeholder {
      color: var(--text-muted);
      opacity: 0.5;
    }
  }

  textarea {
    resize: vertical;
    min-height: 80px;
  }
}

.btn {
  margin-top: 8px;
  background: var(--accent);
  color: #0d0d0d;
  font-weight: 600;
  font-size: 14px;
  border: none;
  border-radius: var(--radius-sm);
  padding: 13px;
  transition: background 0.15s, opacity 0.15s;

  &:hover {
    background: var(--accent-hover);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.error {
  font-size: 13px;
  color: var(--danger);
  background: rgba(224, 92, 92, 0.08);
  border: 1px solid rgba(224, 92, 92, 0.2);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
}
```

- [ ] **Step 2: Create `frontend/app/dashboard/create/page.js`**

```js
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import s from '@/styles/create.module.scss';

export default function CreateEventPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', date: '', location: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/events', form);
      router.push(`/dashboard/${data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.page}>
      <Link href="/dashboard" className={s.back}>← Retour</Link>
      <h1 className={s.heading}>Nouvel événement</h1>

      <form className={s.form} onSubmit={handleSubmit}>
        <div className={s.field}>
          <label htmlFor="title">Nom de l'événement *</label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="Anniversaire de Marie"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className={s.field}>
          <label htmlFor="date">Date *</label>
          <input
            id="date"
            name="date"
            type="datetime-local"
            value={form.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className={s.field}>
          <label htmlFor="location">Lieu *</label>
          <input
            id="location"
            name="location"
            type="text"
            placeholder="Paris, 75001"
            value={form.location}
            onChange={handleChange}
            required
          />
        </div>

        <div className={s.field}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            placeholder="Infos supplémentaires…"
            value={form.description}
            onChange={handleChange}
          />
        </div>

        {error && <p className={s.error}>{error}</p>}

        <button className={s.btn} type="submit" disabled={loading}>
          {loading ? 'Création…' : 'Créer l\'événement'}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Verify — open `http://localhost:3000/dashboard/create`**

Expected:
- Form with title, date, location (required), description (optional)
- Submit → POST `/api/events` → redirects to `/dashboard/[id]`
- Error displayed on 400 response

After submit, check the dashboard list: new event should appear.

- [ ] **Step 4: Commit**

```bash
git add frontend/app/dashboard/create/page.js frontend/styles/create.module.scss
git commit -m "feat: create event page"
```

---

## Task 4: Event Detail Page — Header + Invite Link

**Files:**
- Create: `frontend/app/dashboard/[id]/page.js`
- Create: `frontend/styles/eventDetail.module.scss`

- [ ] **Step 1: Create `frontend/styles/eventDetail.module.scss`**

```scss
.page {
  padding: 24px 20px 100px;
  max-width: 600px;
  margin: 0 auto;
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 24px;
  transition: color 0.15s;

  &:hover {
    color: var(--text);
  }
}

/* EventHeader */
.eventHeader {
  margin-bottom: 28px;
}

.eventTitle {
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 6px;
}

.eventMeta {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 16px;
}

.inviteBox {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
}

.inviteLink {
  flex: 1;
  font-size: 13px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.copyBtn {
  font-size: 13px;
  font-weight: 500;
  color: var(--accent);
  background: none;
  border: none;
  padding: 0;
  white-space: nowrap;
  transition: color 0.15s;

  &:hover {
    color: var(--accent-hover);
  }
}

/* RsvpFilters */
.filters {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--border);
  margin-bottom: 20px;
}

.filterTab {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  background: none;
  border: none;
  padding: 10px 16px;
  border-bottom: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s;

  &:hover {
    color: var(--text);
  }

  &.active {
    color: var(--accent);
    border-bottom-color: var(--accent);
  }
}

/* GuestList */
.guestCount {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.guestList {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.emptyGuests {
  text-align: center;
  padding: 32px 0;
  font-size: 14px;
  color: var(--text-muted);
}

/* GuestItem */
.guestItem {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
}

.guestName {
  flex: 1;
  font-size: 14px;
  color: var(--text);
}

.badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.3px;

  &.yes {
    background: rgba(72, 199, 142, 0.15);
    color: #48c78e;
  }

  &.no {
    background: rgba(224, 92, 92, 0.15);
    color: var(--danger);
  }

  &.maybe {
    background: rgba(255, 189, 89, 0.15);
    color: #ffbd59;
  }

  &.pending {
    background: rgba(136, 136, 136, 0.15);
    color: var(--text-muted);
  }
}

.deleteBtn {
  font-size: 18px;
  color: var(--text-muted);
  background: none;
  border: none;
  padding: 0 4px;
  line-height: 1;
  transition: color 0.15s;

  &:hover {
    color: var(--danger);
  }
}

/* AddGuestForm */
.addForm {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.addInput {
  flex: 1;
  min-width: 120px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  color: var(--text);
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;

  &:focus {
    border-color: var(--accent);
  }

  &::placeholder {
    color: var(--text-muted);
    opacity: 0.5;
  }
}

.addBtn {
  background: var(--accent);
  color: #0d0d0d;
  font-weight: 600;
  font-size: 14px;
  border: none;
  border-radius: var(--radius-sm);
  padding: 10px 18px;
  white-space: nowrap;
  transition: background 0.15s, opacity 0.15s;

  &:hover {
    background: var(--accent-hover);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.addError {
  width: 100%;
  font-size: 12px;
  color: var(--danger);
}

.loading {
  text-align: center;
  padding: 40px 0;
  font-size: 14px;
  color: var(--text-muted);
}
```

- [ ] **Step 2: Create `frontend/components/GuestItem.js`**

```js
import s from '@/styles/eventDetail.module.scss';

const BADGE_LABELS = { yes: 'Oui', no: 'Non', maybe: 'Peut-être', pending: 'En attente' };

export default function GuestItem({ guest, onDelete }) {
  return (
    <div className={s.guestItem}>
      <span className={s.guestName}>{guest.first_name} {guest.last_name}</span>
      <span className={`${s.badge} ${s[guest.rsvp_status]}`}>
        {BADGE_LABELS[guest.rsvp_status] ?? guest.rsvp_status}
      </span>
      <button
        className={s.deleteBtn}
        onClick={() => onDelete(guest.id)}
        aria-label="Supprimer l'invité"
      >
        ×
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Create `frontend/components/RsvpFilters.js`**

```js
import s from '@/styles/eventDetail.module.scss';

const TABS = [
  { key: 'all', label: 'Tous' },
  { key: 'yes', label: 'Oui' },
  { key: 'no', label: 'Non' },
  { key: 'maybe', label: 'Peut-être' },
  { key: 'pending', label: 'En attente' },
];

export default function RsvpFilters({ active, onChange }) {
  return (
    <div className={s.filters}>
      {TABS.map((tab) => (
        <button
          key={tab.key}
          className={`${s.filterTab} ${active === tab.key ? s.active : ''}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Create `frontend/components/AddGuestForm.js`**

```js
'use client';
import { useState } from 'react';
import s from '@/styles/eventDetail.module.scss';

export default function AddGuestForm({ onAdd }) {
  const [form, setForm] = useState({ first_name: '', last_name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim()) return;
    setError('');
    setLoading(true);
    try {
      await onAdd(form.first_name.trim(), form.last_name.trim());
      setForm({ first_name: '', last_name: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'ajout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={s.addForm} onSubmit={handleSubmit}>
      <input
        className={s.addInput}
        name="first_name"
        type="text"
        placeholder="Prénom"
        value={form.first_name}
        onChange={handleChange}
        required
      />
      <input
        className={s.addInput}
        name="last_name"
        type="text"
        placeholder="Nom"
        value={form.last_name}
        onChange={handleChange}
        required
      />
      <button className={s.addBtn} type="submit" disabled={loading}>
        {loading ? '…' : 'Ajouter'}
      </button>
      {error && <p className={s.addError}>{error}</p>}
    </form>
  );
}
```

- [ ] **Step 5: Create `frontend/app/dashboard/[id]/page.js`**

```js
'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import RsvpFilters from '@/components/RsvpFilters';
import GuestItem from '@/components/GuestItem';
import AddGuestForm from '@/components/AddGuestForm';
import s from '@/styles/eventDetail.module.scss';

export default function EventDetailPage({ params }) {
  const { id } = use(params);
  const [event, setEvent] = useState(null);
  const [guests, setGuests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get(`/events/${id}`)
      .then(({ data }) => {
        setEvent(data);
        setGuests(data.guests ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleCopy = () => {
    const link = `${window.location.origin}/invite/${event.slug}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleAddGuest = async (first_name, last_name) => {
    const { data } = await api.post(`/events/${id}/guests`, { first_name, last_name });
    setGuests((prev) => [...prev, data]);
  };

  const handleDeleteGuest = async (guestId) => {
    await api.delete(`/events/${id}/guests/${guestId}`);
    setGuests((prev) => prev.filter((g) => g.id !== guestId));
  };

  const filteredGuests = filter === 'all'
    ? guests
    : guests.filter((g) => g.rsvp_status === filter);

  if (loading) return <div className={s.page}><p className={s.loading}>Chargement…</p></div>;
  if (!event) return <div className={s.page}><p className={s.loading}>Événement introuvable.</p></div>;

  const date = new Date(event.date).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const inviteLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${event.slug}`;

  return (
    <div className={s.page}>
      <Link href="/dashboard" className={s.back}>← Mes événements</Link>

      <div className={s.eventHeader}>
        <h1 className={s.eventTitle}>{event.title}</h1>
        <p className={s.eventMeta}>{date} · {event.location}</p>

        <div className={s.inviteBox}>
          <span className={s.inviteLink}>{inviteLink}</span>
          <button className={s.copyBtn} onClick={handleCopy}>
            {copied ? 'Copié !' : 'Copier'}
          </button>
        </div>
      </div>

      <RsvpFilters active={filter} onChange={setFilter} />

      <p className={s.guestCount}>{filteredGuests.length} invité{filteredGuests.length !== 1 ? 's' : ''}</p>

      <div className={s.guestList}>
        {filteredGuests.length === 0 ? (
          <p className={s.emptyGuests}>
            {filter === 'all' ? 'Aucun invité pour l\'instant.' : 'Aucun invité dans cette catégorie.'}
          </p>
        ) : (
          filteredGuests.map((guest) => (
            <GuestItem key={guest.id} guest={guest} onDelete={handleDeleteGuest} />
          ))
        )}
      </div>

      <AddGuestForm onAdd={handleAddGuest} />
    </div>
  );
}
```

- [ ] **Step 6: Verify — open `http://localhost:3000/dashboard/[id]` for a real event**

Expected:
- Event title, date, location visible
- Invite link box with working "Copier" button (check clipboard)
- Filter tabs switch correctly
- Adding a guest: appears immediately in the list, no page reload
- Deleting a guest: disappears immediately, no page reload
- Badge colors: vert (oui), rouge (non), jaune (peut-être), gris (en attente)

- [ ] **Step 7: Commit**

```bash
git add frontend/app/dashboard/[id]/page.js frontend/components/GuestItem.js frontend/components/RsvpFilters.js frontend/components/AddGuestForm.js frontend/styles/eventDetail.module.scss
git commit -m "feat: event detail page with guest list, filters, and real-time state"
```

---

## Task 5: Wire root page redirect

The root `/` page currently shows the default Next.js page. Redirect authenticated users to `/dashboard`, unauthenticated to `/login`.

**Files:**
- Modify: `frontend/app/page.js`

- [ ] **Step 1: Replace `frontend/app/page.js`**

```js
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    router.replace(token ? '/dashboard' : '/login');
  }, []);

  return null;
}
```

- [ ] **Step 2: Verify — open `http://localhost:3000/`**

Expected: redirects to `/dashboard` (if token present) or `/login` (if not).

- [ ] **Step 3: Commit**

```bash
git add frontend/app/page.js
git commit -m "feat: root page redirects to dashboard or login"
```

---

## Done

All dashboard pages are built. Full flow to test:

1. Register → auto-redirect to `/dashboard` (empty state)
2. Click "+" FAB → create event → redirect to event detail
3. Add guests manually → appear in list immediately
4. Switch filter tabs → list updates
5. Delete a guest → disappears immediately
6. Copy invite link → paste to verify correct URL
7. Go back to dashboard → event card visible

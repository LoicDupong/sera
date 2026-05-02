# Dual Event Types Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand Sera to support two distinct event types—private guest lists and open join-by-link events—with type-specific UX, dashboards, and backend logic.

**Architecture:** 
- Add `eventType` field to Event model (`private` | `open`)
- Private events: existing flow (host adds guests manually or bulk import)
- Open events: self-registration flow (guests join via link, auto-create as participants)
- Conditional dashboard layouts based on event type
- Simplified invite flow for open events (no verification, auto-RSVP)

**Tech Stack:** Next.js App Router, Express, Sequelize, PostgreSQL, SCSS

---

## File Structure

**Backend:**
- `backend/src/models/Event.js` — Add `eventType` field
- `backend/src/controllers/eventController.js` — Update `create()` to accept `eventType`, add bulk import logic
- `backend/src/controllers/guestFlowController.js` — Split verify/submit logic for open vs private events
- `backend/src/routes/events.js` — Add bulk guest import endpoint
- `backend/src/db/migrations/` — Add `eventType` column migration

**Frontend:**
- `frontend/app/dashboard/create/page.js` — Add event type selector, conditional forms
- `frontend/components/EventTypeSelector.js` — New: radio/card selector component
- `frontend/components/BulkGuestImporter.js` — New: bulk import textarea and parser
- `frontend/app/dashboard/[id]/page.js` — Conditional dashboard rendering based on eventType
- `frontend/components/OpenEventDashboard.js` — New: simplified dashboard for open events
- `frontend/app/invite/[slug]/page.js` — Update to handle open event self-registration
- `frontend/lib/guestParser.js` — New: utility for parsing bulk guest input (names, CSV, etc.)

---

## Phase 1: Database & Backend Setup

### Task 1: Add eventType Migration

**Files:**
- Create: `backend/src/db/migrations/001_add_event_type.js`

- [ ] **Step 1: Create migration file**

```javascript
// backend/src/db/migrations/001_add_event_type.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('events', 'event_type', {
      type: Sequelize.ENUM('private', 'open'),
      defaultValue: 'private',
      allowNull: false,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('events', 'event_type');
  },
};
```

- [ ] **Step 2: Run migration**

```bash
cd backend
npm run migrate
```

Expected: No errors, `event_type` column added with default value 'private'.

- [ ] **Step 3: Commit**

```bash
git add backend/src/db/migrations/001_add_event_type.js
git commit -m "feat: add event_type column to events table"
```

---

### Task 2: Update Event Model

**Files:**
- Modify: `backend/src/models/Event.js:1-41`

- [ ] **Step 1: Read current Event model**

File: `backend/src/models/Event.js`

- [ ] **Step 2: Add eventType field**

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  host_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  event_type: {
    type: DataTypes.ENUM('private', 'open'),
    defaultValue: 'private',
    allowNull: false,
  },
  slug: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    unique: true,
    allowNull: false,
  },
}, {
  tableName: 'events',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = Event;
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/models/Event.js
git commit -m "feat: add event_type field to Event model"
```

---

### Task 3: Create Guest Parser Utility

**Files:**
- Create: `frontend/lib/guestParser.js`

- [ ] **Step 1: Write guest parser utility**

```javascript
// frontend/lib/guestParser.js

/**
 * Parse bulk guest input in various formats:
 * - One per line: "John Smith\nJane Doe"
 * - Comma-separated: "John, Smith\nJane, Doe"
 * - Space-separated: "John Smith\nJane Doe"
 */
export const parseGuestInput = (input) => {
  if (!input || !input.trim()) return [];

  const lines = input
    .trim()
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return lines.map((line) => {
    // Try comma-separated first: "First, Last"
    if (line.includes(',')) {
      const [first, last] = line.split(',').map((s) => s.trim());
      if (first && last) return { first_name: first, last_name: last };
    }

    // Otherwise split by whitespace: "First Last"
    const parts = line.split(/\s+/);
    if (parts.length >= 2) {
      const first_name = parts[0];
      const last_name = parts.slice(1).join(' ');
      return { first_name, last_name };
    }

    // Single word: use as first name, empty last name (will fail validation)
    return { first_name: line, last_name: '' };
  });
};

/**
 * Validate parsed guest list
 */
export const validateGuestList = (guests) => {
  const errors = [];
  const validGuests = [];

  guests.forEach((guest, idx) => {
    if (!guest.first_name || !guest.last_name) {
      errors.push(`Ligne ${idx + 1}: prénom et nom requis`);
      return;
    }
    validGuests.push(guest);
  });

  return { validGuests, errors };
};
```

- [ ] **Step 2: Write unit tests**

```javascript
// frontend/__tests__/guestParser.test.js
import { parseGuestInput, validateGuestList } from '@/lib/guestParser';

describe('guestParser', () => {
  describe('parseGuestInput', () => {
    it('parses one-per-line format', () => {
      const input = 'John Smith\nJane Doe';
      const result = parseGuestInput(input);
      expect(result).toEqual([
        { first_name: 'John', last_name: 'Smith' },
        { first_name: 'Jane', last_name: 'Doe' },
      ]);
    });

    it('parses comma-separated format', () => {
      const input = 'John, Smith\nJane, Doe';
      const result = parseGuestInput(input);
      expect(result).toEqual([
        { first_name: 'John', last_name: 'Smith' },
        { first_name: 'Jane', last_name: 'Doe' },
      ]);
    });

    it('handles mixed whitespace', () => {
      const input = '  John Smith  \n  Jane Doe  ';
      const result = parseGuestInput(input);
      expect(result).toEqual([
        { first_name: 'John', last_name: 'Smith' },
        { first_name: 'Jane', last_name: 'Doe' },
      ]);
    });

    it('returns empty array for empty input', () => {
      expect(parseGuestInput('')).toEqual([]);
      expect(parseGuestInput('   ')).toEqual([]);
    });

    it('handles middle names (all after first become last_name)', () => {
      const input = 'John Michael Smith';
      const result = parseGuestInput(input);
      expect(result).toEqual([
        { first_name: 'John', last_name: 'Michael Smith' },
      ]);
    });
  });

  describe('validateGuestList', () => {
    it('validates correct guests', () => {
      const guests = [
        { first_name: 'John', last_name: 'Smith' },
        { first_name: 'Jane', last_name: 'Doe' },
      ];
      const { validGuests, errors } = validateGuestList(guests);
      expect(validGuests).toHaveLength(2);
      expect(errors).toHaveLength(0);
    });

    it('rejects guests with missing last_name', () => {
      const guests = [
        { first_name: 'John', last_name: '' },
      ];
      const { validGuests, errors } = validateGuestList(guests);
      expect(validGuests).toHaveLength(0);
      expect(errors).toContain('Ligne 1: prénom et nom requis');
    });
  });
});
```

- [ ] **Step 3: Run tests**

```bash
cd frontend
npm test -- __tests__/guestParser.test.js
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add frontend/lib/guestParser.js frontend/__tests__/guestParser.test.js
git commit -m "feat: add guest parser utility with tests"
```

---

## Phase 2: Backend API Updates

### Task 4: Update Event Creation to Accept eventType

**Files:**
- Modify: `backend/src/controllers/eventController.js:1-10`

- [ ] **Step 1: Update create() function**

```javascript
const { Event, Guest } = require('../models');

const create = async (req, res) => {
  const { title, description, date, location, event_type } = req.body;
  
  // Validate required fields
  if (!title || !date || !location) {
    return res.status(400).json({ error: 'title, date et location sont requis' });
  }

  // Validate event_type if provided
  if (event_type && !['private', 'open'].includes(event_type)) {
    return res.status(400).json({ error: 'event_type invalide (private ou open)' });
  }

  const event = await Event.create({
    host_id: req.user.id,
    title,
    description,
    date,
    location,
    event_type: event_type || 'private',
  });

  res.status(201).json(event);
};

// ... rest of controller unchanged
```

- [ ] **Step 2: Test with curl**

```bash
curl -X POST http://localhost:5000/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Private Party",
    "date": "2026-05-15T19:00:00",
    "location": "Paris",
    "event_type": "private"
  }'
```

Expected: Event created with `event_type: "private"`.

```bash
curl -X POST http://localhost:5000/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Open Party",
    "date": "2026-05-15T19:00:00",
    "location": "Paris",
    "event_type": "open"
  }'
```

Expected: Event created with `event_type: "open"`.

- [ ] **Step 3: Commit**

```bash
git add backend/src/controllers/eventController.js
git commit -m "feat: update event creation to accept event_type field"
```

---

### Task 5: Add Bulk Guest Import Endpoint

**Files:**
- Modify: `backend/src/controllers/eventController.js` (add bulkAddGuests)
- Modify: `backend/src/routes/events.js` (add route)

- [ ] **Step 1: Add bulkAddGuests to eventController**

```javascript
// Add to backend/src/controllers/eventController.js

const bulkAddGuests = async (req, res) => {
  const { guests } = req.body;

  if (!Array.isArray(guests) || guests.length === 0) {
    return res.status(400).json({ error: 'guests array requis et non vide' });
  }

  // Validate event exists and belongs to user
  const event = await Event.findOne({
    where: { id: req.params.id, host_id: req.user.id },
  });

  if (!event) {
    return res.status(404).json({ error: 'Event introuvable' });
  }

  // Prevent bulk import on open events
  if (event.event_type === 'open') {
    return res.status(400).json({ error: 'Impossible d\'ajouter des invités à un événement ouvert' });
  }

  const errors = [];
  const created = [];

  for (const guest of guests) {
    const { first_name, last_name } = guest;

    if (!first_name || !last_name) {
      errors.push(`Prénom et nom requis pour: ${first_name || '?'} ${last_name || '?'}`);
      continue;
    }

    try {
      const newGuest = await Guest.create({
        event_id: event.id,
        first_name,
        last_name,
        rsvp_status: 'pending',
      });
      created.push(newGuest);
    } catch (error) {
      // Handle unique constraint violation
      if (error.name === 'SequelizeUniqueConstraintError') {
        errors.push(`${first_name} ${last_name} existe déjà`);
      } else {
        errors.push(`Erreur lors de l'ajout de ${first_name} ${last_name}`);
      }
    }
  }

  res.status(201).json({
    created: created.length,
    createdGuests: created,
    errors: errors.length > 0 ? errors : undefined,
  });
};

module.exports = { create, list, getOne, update, remove, bulkAddGuests };
```

- [ ] **Step 2: Add route**

Modify `backend/src/routes/events.js`:

```javascript
const router = require('express').Router();
const auth = require('../middlewares/auth');
const { create, list, getOne, update, remove, bulkAddGuests } = require('../controllers/eventController');
const { add: addGuest, remove: removeGuest } = require('../controllers/guestController');

router.use(auth);

router.post('/', create);
router.get('/', list);
router.get('/:id', getOne);
router.put('/:id', update);
router.delete('/:id', remove);

router.post('/:id/guests', addGuest);
router.post('/:id/guests/bulk', bulkAddGuests);  // NEW: Bulk import
router.delete('/:id/guests/:guestId', removeGuest);

module.exports = router;
```

- [ ] **Step 3: Test endpoint**

```bash
curl -X POST http://localhost:5000/events/<event_id>/guests/bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "guests": [
      { "first_name": "Alice", "last_name": "Smith" },
      { "first_name": "Bob", "last_name": "Jones" }
    ]
  }'
```

Expected: Both guests created, `created: 2`.

- [ ] **Step 4: Commit**

```bash
git add backend/src/controllers/eventController.js backend/src/routes/events.js
git commit -m "feat: add bulk guest import endpoint"
```

---

### Task 6: Update Invite Flow for Open Events

**Files:**
- Modify: `backend/src/controllers/guestFlowController.js` (all functions)

- [ ] **Step 1: Update guestFlowController for both event types**

```javascript
// backend/src/controllers/guestFlowController.js
const { Event, Guest, PushSubscription } = require('../models');
const { sendPush } = require('../config/webpush');

const normalize = (str) =>
  str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/\s+/g, ' ');

const getEventBySlug = async (req, res) => {
  const event = await Event.findOne({
    where: { slug: req.params.slug },
    attributes: ['id', 'title', 'description', 'date', 'location', 'slug', 'event_type'],
  });
  if (!event) return res.status(404).json({ error: 'Event introuvable' });
  res.json(event);
};

const verifyGuest = async (req, res) => {
  const { first_name, last_name } = req.body;
  if (!first_name || !last_name) {
    return res.status(400).json({ error: 'Nom et prénom requis' });
  }

  const event = await Event.findOne({ where: { slug: req.params.slug } });
  if (!event) return res.status(404).json({ error: 'Event introuvable' });

  // For open events: auto-create guest or get existing
  if (event.event_type === 'open') {
    const inputFirst = normalize(first_name);
    const inputLast = normalize(last_name);

    let guest = await Guest.findOne({
      where: { event_id: event.id },
      attributes: ['id', 'first_name', 'last_name', 'rsvp_status'],
      where: {
        event_id: event.id,
        sequelize.where(
          sequelize.fn('LOWER', sequelize.col('first_name')),
          sequelize.Op.like,
          '%' + inputFirst + '%'
        ),
      },
    });

    // If not found, create new guest (auto-join)
    if (!guest) {
      guest = await Guest.create({
        event_id: event.id,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        rsvp_status: 'yes', // Auto-join with yes status
      });
    }

    return res.json({
      found: true,
      guest_id: guest.id,
      rsvp_status: guest.rsvp_status,
      is_new: !guest.created_at, // Flag if newly created
    });
  }

  // For private events: existing logic
  const guests = await Guest.findAll({ where: { event_id: event.id } });

  const inputFirst = normalize(first_name);
  const inputLast = normalize(last_name);

  const guest = guests.find(
    (g) => normalize(g.first_name) === inputFirst && normalize(g.last_name) === inputLast
  );

  if (!guest) return res.json({ found: false });
  res.json({ found: true, guest_id: guest.id, rsvp_status: guest.rsvp_status });
};

const submitRsvp = async (req, res) => {
  const { guest_id, rsvp_status } = req.body;
  if (!guest_id || !rsvp_status) {
    return res.status(400).json({ error: 'guest_id et rsvp_status requis' });
  }
  if (!['yes', 'no', 'maybe'].includes(rsvp_status)) {
    return res.status(400).json({ error: 'rsvp_status invalide (yes / no / maybe)' });
  }

  const event = await Event.findOne({ where: { slug: req.params.slug } });
  if (!event) return res.status(404).json({ error: 'Event introuvable' });

  const guest = await Guest.findOne({ where: { id: guest_id, event_id: event.id } });
  if (!guest) return res.status(404).json({ error: 'Invité introuvable' });

  await guest.update({ rsvp_status, responded_at: new Date() });

  // Send push notification to host
  const subs = await PushSubscription.findAll({ where: { host_id: event.host_id } });
  const label = rsvp_status === 'yes' ? '✅ présent(e)' : rsvp_status === 'no' ? '❌ absent(e)' : '🤔 peut-être';
  subs.forEach(sub => sendPush(
    { endpoint: sub.endpoint, keys: sub.keys },
    { title: 'Sera', body: `${guest.first_name} ${guest.last_name} est ${label}` }
  ));

  res.json({ success: true, rsvp_status: guest.rsvp_status });
};

module.exports = { getEventBySlug, verifyGuest, submitRsvp };
```

Wait, the above has a syntax error. Let me fix it:

```javascript
// backend/src/controllers/guestFlowController.js
const { Event, Guest, PushSubscription } = require('../models');
const { sequelize } = require('../config/database');
const { sendPush } = require('../config/webpush');

const normalize = (str) =>
  str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/\s+/g, ' ');

const getEventBySlug = async (req, res) => {
  const event = await Event.findOne({
    where: { slug: req.params.slug },
    attributes: ['id', 'title', 'description', 'date', 'location', 'slug', 'event_type'],
  });
  if (!event) return res.status(404).json({ error: 'Event introuvable' });
  res.json(event);
};

const verifyGuest = async (req, res) => {
  const { first_name, last_name } = req.body;
  if (!first_name || !last_name) {
    return res.status(400).json({ error: 'Nom et prénom requis' });
  }

  const event = await Event.findOne({ where: { slug: req.params.slug } });
  if (!event) return res.status(404).json({ error: 'Event introuvable' });

  // For open events: auto-create guest or return existing
  if (event.event_type === 'open') {
    const inputFirst = normalize(first_name);
    const inputLast = normalize(last_name);

    // Look for existing guest (normalize names for comparison)
    const allGuests = await Guest.findAll({
      where: { event_id: event.id },
      attributes: ['id', 'first_name', 'last_name', 'rsvp_status'],
    });

    const existingGuest = allGuests.find(
      (g) => normalize(g.first_name) === inputFirst && normalize(g.last_name) === inputLast
    );

    if (existingGuest) {
      return res.json({
        found: true,
        guest_id: existingGuest.id,
        rsvp_status: existingGuest.rsvp_status,
      });
    }

    // Create new guest (auto-join with yes status)
    const newGuest = await Guest.create({
      event_id: event.id,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      rsvp_status: 'yes',
    });

    return res.json({
      found: true,
      guest_id: newGuest.id,
      rsvp_status: newGuest.rsvp_status,
    });
  }

  // For private events: existing logic
  const guests = await Guest.findAll({ where: { event_id: event.id } });

  const inputFirst = normalize(first_name);
  const inputLast = normalize(last_name);

  const guest = guests.find(
    (g) => normalize(g.first_name) === inputFirst && normalize(g.last_name) === inputLast
  );

  if (!guest) return res.json({ found: false });
  res.json({ found: true, guest_id: guest.id, rsvp_status: guest.rsvp_status });
};

const submitRsvp = async (req, res) => {
  const { guest_id, rsvp_status } = req.body;
  if (!guest_id || !rsvp_status) {
    return res.status(400).json({ error: 'guest_id et rsvp_status requis' });
  }
  if (!['yes', 'no', 'maybe'].includes(rsvp_status)) {
    return res.status(400).json({ error: 'rsvp_status invalide (yes / no / maybe)' });
  }

  const event = await Event.findOne({ where: { slug: req.params.slug } });
  if (!event) return res.status(404).json({ error: 'Event introuvable' });

  const guest = await Guest.findOne({ where: { id: guest_id, event_id: event.id } });
  if (!guest) return res.status(404).json({ error: 'Invité introuvable' });

  await guest.update({ rsvp_status, responded_at: new Date() });

  // Send push notification to host
  const subs = await PushSubscription.findAll({ where: { host_id: event.host_id } });
  const label = rsvp_status === 'yes' ? '✅ présent(e)' : rsvp_status === 'no' ? '❌ absent(e)' : '🤔 peut-être';
  subs.forEach(sub => sendPush(
    { endpoint: sub.endpoint, keys: sub.keys },
    { title: 'Sera', body: `${guest.first_name} ${guest.last_name} est ${label}` }
  ));

  res.json({ success: true, rsvp_status: guest.rsvp_status });
};

module.exports = { getEventBySlug, verifyGuest, submitRsvp };
```

- [ ] **Step 2: Test private event flow (unchanged)**

```bash
# Verify guest exists in private event
curl -X POST http://localhost:5000/invite/<slug>/verify \
  -H "Content-Type: application/json" \
  -d '{ "first_name": "John", "last_name": "Smith" }'
```

Expected: `{ "found": true, "guest_id": "...", "rsvp_status": "pending" }` (if guest exists)

- [ ] **Step 3: Test open event flow (new)**

```bash
# First verification: auto-creates guest
curl -X POST http://localhost:5000/invite/<slug>/verify \
  -H "Content-Type: application/json" \
  -d '{ "first_name": "NewGuest", "last_name": "TestName" }'
```

Expected: `{ "found": true, "guest_id": "...", "rsvp_status": "yes" }`

```bash
# Second verification: returns existing guest
curl -X POST http://localhost:5000/invite/<slug>/verify \
  -H "Content-Type: application/json" \
  -d '{ "first_name": "NewGuest", "last_name": "TestName" }'
```

Expected: Same `guest_id`, `rsvp_status: "yes"`

- [ ] **Step 4: Commit**

```bash
git add backend/src/controllers/guestFlowController.js
git commit -m "feat: support auto-registration for open events"
```

---

## Phase 3: Frontend Components

### Task 7: Create EventTypeSelector Component

**Files:**
- Create: `frontend/components/EventTypeSelector.js`

- [ ] **Step 1: Build component**

```javascript
// frontend/components/EventTypeSelector.js
'use client';

import s from '@/styles/eventTypeSelector.module.scss';

export default function EventTypeSelector({ value, onChange }) {
  return (
    <fieldset className={s.selector}>
      <legend className={s.legend}>Type d'événement</legend>

      <div className={s.options}>
        <label className={`${s.option} ${value === 'private' ? s.active : ''}`}>
          <input
            type="radio"
            name="event_type"
            value="private"
            checked={value === 'private'}
            onChange={(e) => onChange(e.target.value)}
            className={s.radio}
          />
          <div className={s.content}>
            <span className={s.title}>Liste d'invités privée</span>
            <span className={s.description}>
              Vous créez la liste, vos invités répondent
            </span>
          </div>
        </label>

        <label className={`${s.option} ${value === 'open' ? s.active : ''}`}>
          <input
            type="radio"
            name="event_type"
            value="open"
            checked={value === 'open'}
            onChange={(e) => onChange(e.target.value)}
            className={s.radio}
          />
          <div className={s.content}>
            <span className={s.title}>Événement ouvert</span>
            <span className={s.description}>
              Les gens rejoignent directement via le lien
            </span>
          </div>
        </label>
      </div>
    </fieldset>
  );
}
```

- [ ] **Step 2: Create styles**

```scss
// frontend/styles/eventTypeSelector.module.scss
.selector {
  border: none;
  padding: 0;
  margin: 0;
}

.legend {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: block;
  color: var(--text-primary);
}

.options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.option {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid var(--border-color, #e0e0e0);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--accent-color, #333);
    background-color: rgba(0, 0, 0, 0.02);
  }

  &.active {
    border-color: var(--accent-color, #333);
    background-color: rgba(0, 0, 0, 0.04);
  }
}

.radio {
  width: 1.25rem;
  height: 1.25rem;
  margin-top: 0.125rem;
  cursor: pointer;
  flex-shrink: 0;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.title {
  font-weight: 600;
  color: var(--text-primary);
}

.description {
  font-size: 0.875rem;
  color: var(--text-secondary, #666);
}

@media (min-width: 640px) {
  .options {
    flex-direction: row;
    gap: 1rem;
  }

  .option {
    flex: 1;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/components/EventTypeSelector.js frontend/styles/eventTypeSelector.module.scss
git commit -m "feat: add EventTypeSelector component"
```

---

### Task 8: Create BulkGuestImporter Component

**Files:**
- Create: `frontend/components/BulkGuestImporter.js`

- [ ] **Step 1: Build component**

```javascript
// frontend/components/BulkGuestImporter.js
'use client';

import { useState } from 'react';
import { parseGuestInput, validateGuestList } from '@/lib/guestParser';
import s from '@/styles/bulkGuestImporter.module.scss';

export default function BulkGuestImporter({ onImport, onCancel }) {
  const [input, setInput] = useState('');
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleParse = () => {
    const parsed = parseGuestInput(input);
    const { validGuests, errors: validationErrors } = validateGuestList(parsed);

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    handleSubmit(validGuests);
  };

  const handleSubmit = async (guests) => {
    setLoading(true);
    try {
      await onImport(guests);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const canSubmit = input.trim().length > 0 && !loading;

  return (
    <div className={s.panel}>
      <div className={s.header}>
        <h3>Importer des invités</h3>
        <p className={s.hint}>Un par ligne ou séparés par des virgules</p>
      </div>

      <textarea
        className={s.input}
        placeholder="Alice Smith&#10;Bob, Jones&#10;Charlie Brown"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setErrors([]);
        }}
        disabled={loading}
      />

      {errors.length > 0 && (
        <div className={s.errors}>
          {errors.map((err, i) => (
            <p key={i} className={s.error}>
              {err}
            </p>
          ))}
        </div>
      )}

      <div className={s.actions}>
        <button
          type="button"
          className={s.secondary}
          onClick={onCancel}
          disabled={loading}
        >
          Annuler
        </button>
        <button
          type="button"
          className={s.primary}
          onClick={handleParse}
          disabled={!canSubmit}
        >
          {loading ? 'Importation...' : 'Importer'}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create styles**

```scss
// frontend/styles/bulkGuestImporter.module.scss
.panel {
  padding: 1.5rem;
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 0.5rem;
  background-color: var(--bg-secondary, #f9f9f9);
}

.header {
  margin-bottom: 1rem;

  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    font-weight: 600;
  }
}

.hint {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary, #666);
}

.input {
  display: block;
  width: 100%;
  min-height: 150px;
  padding: 0.75rem;
  font-family: monospace;
  font-size: 0.875rem;
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 0.375rem;
  resize: vertical;
  margin-bottom: 1rem;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.errors {
  padding: 0.75rem;
  background-color: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  border-radius: 0.375rem;
  margin-bottom: 1rem;
}

.error {
  margin: 0.25rem 0;
  font-size: 0.875rem;
  color: #dc3545;

  &:first-child {
    margin-top: 0;
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.primary,
.secondary {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.primary {
  background-color: var(--accent-color, #333);
  color: white;

  &:not(:disabled):hover {
    opacity: 0.9;
  }
}

.secondary {
  background-color: var(--border-color, #e0e0e0);
  color: var(--text-primary);

  &:not(:disabled):hover {
    background-color: var(--border-color-hover, #d0d0d0);
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/components/BulkGuestImporter.js frontend/styles/bulkGuestImporter.module.scss
git commit -m "feat: add BulkGuestImporter component"
```

---

### Task 9: Create OpenEventDashboard Component

**Files:**
- Create: `frontend/components/OpenEventDashboard.js`

- [ ] **Step 1: Build component**

```javascript
// frontend/components/OpenEventDashboard.js
'use client';

import { useMemo } from 'react';
import RsvpFilters from '@/components/RsvpFilters';
import GuestItem from '@/components/GuestItem';
import s from '@/styles/eventDetail.module.scss';

const STATS = [
  { key: 'yes', label: 'Participants' },
  { key: 'maybe', label: 'Peut-être' },
  { key: 'no', label: 'Absents' },
];

export default function OpenEventDashboard({ guests, filter, onFilterChange, onDeleteGuest }) {
  const counts = useMemo(() => {
    return guests.reduce((acc, guest) => {
      acc[guest.rsvp_status] = (acc[guest.rsvp_status] || 0) + 1;
      return acc;
    }, { yes: 0, no: 0, maybe: 0 });
  }, [guests]);

  const filteredGuests = filter === 'all'
    ? guests
    : guests.filter((g) => g.rsvp_status === filter);

  return (
    <section className={s.guestPanel}>
      <div className={s.sectionHeader}>
        <div>
          <p className={s.panelLabel}>Participants</p>
          <h2>{counts.yes + counts.maybe + counts.no} inscrit{(counts.yes + counts.maybe + counts.no) !== 1 ? 's' : ''}</h2>
        </div>
      </div>

      <div className={s.statsGrid} aria-label="Résumé des participants">
        {STATS.map((stat) => (
          <article key={stat.key} className={`${s.statCard} ${s[stat.key]}`}>
            <span className={s.statValue}>{counts[stat.key]}</span>
            <span className={s.statLabel}>{stat.label}</span>
          </article>
        ))}
      </div>

      <div className={s.filterSection}>
        <RsvpFilters active={filter} onChange={onFilterChange} hideStatuses={['pending']} />
      </div>

      <div className={s.guestList}>
        {filteredGuests.length === 0 ? (
          <p className={s.emptyGuests}>
            {filter === 'all' ? 'Aucun participant pour l\'instant.' : 'Aucun participant dans cette catégorie.'}
          </p>
        ) : (
          filteredGuests.map((guest) => (
            <GuestItem key={guest.id} guest={guest} onDelete={onDeleteGuest} />
          ))
        )}
      </div>

      <div className={s.info}>
        <p>Les participants se sont inscrits directement via le lien.</p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Update RsvpFilters to support hiding statuses**

Modify `frontend/components/RsvpFilters.js`:

```javascript
// Update the RsvpFilters component to accept hideStatuses prop
export default function RsvpFilters({ active, onChange, hideStatuses = [] }) {
  const STATUSES = [
    { key: 'all', label: 'Tous' },
    { key: 'pending', label: 'En attente' },
    { key: 'yes', label: 'Présents' },
    { key: 'maybe', label: 'Peut-être' },
    { key: 'no', label: 'Absents' },
  ].filter(status => !hideStatuses.includes(status.key));

  return (
    // ... existing render logic
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/components/OpenEventDashboard.js frontend/components/RsvpFilters.js
git commit -m "feat: add OpenEventDashboard component for open events"
```

---

## Phase 4: Frontend Pages Update

### Task 10: Update Event Creation Page

**Files:**
- Modify: `frontend/app/dashboard/create/page.js`

- [ ] **Step 1: Update create page with event type selector**

```javascript
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import EventTypeSelector from '@/components/EventTypeSelector';
import BulkGuestImporter from '@/components/BulkGuestImporter';
import s from '@/styles/create.module.scss';

export default function CreateEventPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    date: '',
    location: '',
    description: '',
    event_type: 'private',
  });
  const [showBulkImporter, setShowBulkImporter] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/events', form);
      
      // If private event and bulk import was triggered, show importer next
      if (form.event_type === 'private' && showBulkImporter) {
        router.push(`/dashboard/${data.id}?showBulkImport=true`);
      } else {
        router.push(`/dashboard/${data.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkImport = async (guests) => {
    setError('');
    try {
      await api.post(`/events/${form.id}/guests/bulk`, { guests });
      router.push(`/dashboard/${form.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'import');
    }
  };

  return (
    <div className={s.page}>
      <Link href="/dashboard" className={s.back}>← Retour</Link>
      <h1 className={s.heading}>Nouvel événement</h1>

      <form className={s.form} onSubmit={handleSubmit}>
        <EventTypeSelector
          value={form.event_type}
          onChange={(value) => setForm({ ...form, event_type: value })}
        />

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
            placeholder="Infos supplémentaires..."
            value={form.description}
            onChange={handleChange}
          />
        </div>

        {error && <p className={s.error}>{error}</p>}

        <button className={s.btn} type="submit" disabled={loading}>
          {loading ? 'Création...' : "Créer l'événement"}
        </button>
      </form>

      {showBulkImporter && form.event_type === 'private' && (
        <BulkGuestImporter
          onImport={handleBulkImport}
          onCancel={() => setShowBulkImporter(false)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Test creation flow**

Navigate to `/dashboard/create`, select event type, fill form, submit.

Expected: Event created with correct `event_type`.

- [ ] **Step 3: Commit**

```bash
git add frontend/app/dashboard/create/page.js
git commit -m "feat: add event type selector to event creation"
```

---

### Task 11: Update Event Detail Page for Conditional Dashboard

**Files:**
- Modify: `frontend/app/dashboard/[id]/page.js`

- [ ] **Step 1: Update page to render conditional dashboard**

```javascript
'use client';
import { useMemo, useState, useEffect, use } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import RsvpFilters from '@/components/RsvpFilters';
import GuestItem from '@/components/GuestItem';
import AddGuestForm from '@/components/AddGuestForm';
import OpenEventDashboard from '@/components/OpenEventDashboard';
import BulkGuestImporter from '@/components/BulkGuestImporter';
import s from '@/styles/eventDetail.module.scss';

const RSVP_STATS = [
  { key: 'yes', label: 'Présents' },
  { key: 'maybe', label: 'Peut-être' },
  { key: 'no', label: 'Absents' },
  { key: 'pending', label: 'En attente' },
];

export default function EventDetailPage({ params }) {
  const { id } = use(params);
  const [event, setEvent] = useState(null);
  const [guests, setGuests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showBulkImporter, setShowBulkImporter] = useState(false);

  useEffect(() => {
    api.get(`/events/${id}`)
      .then(({ data }) => {
        setEvent(data);
        setGuests(data.guests ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const counts = useMemo(() => {
    return guests.reduce((acc, guest) => {
      acc[guest.rsvp_status] = (acc[guest.rsvp_status] || 0) + 1;
      return acc;
    }, { yes: 0, no: 0, maybe: 0, pending: 0 });
  }, [guests]);

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

  const handleBulkImport = async (bulkGuests) => {
    try {
      const { data } = await api.post(`/events/${id}/guests/bulk`, { guests: bulkGuests });
      setGuests((prev) => [...prev, ...data.createdGuests]);
      setShowBulkImporter(false);
    } catch (err) {
      console.error('Bulk import error:', err);
    }
  };

  const filteredGuests = filter === 'all'
    ? guests
    : guests.filter((g) => g.rsvp_status === filter);

  if (loading) return <div className={s.page}><p className={s.loading}>Chargement...</p></div>;
  if (!event) return <div className={s.page}><p className={s.loading}>Événement introuvable.</p></div>;

  const date = new Date(event.date).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const time = new Date(event.date).toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit',
  });

  const inviteLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${event.slug}`;

  // For open events: render simplified dashboard
  if (event.event_type === 'open') {
    return (
      <div className={s.page}>
        <Link href="/dashboard" className={s.back}>← Mes événements</Link>

        <section className={s.hero}>
          <div>
            <p className={s.kicker}>Event room</p>
            <h1 className={s.eventTitle}>{event.title}</h1>
            <p className={s.eventMeta}>{date} · {time} · {event.location}</p>
            {event.description && <p className={s.description}>{event.description}</p>}
          </div>
        </section>

        <section className={s.sharePanel}>
          <div>
            <p className={s.panelLabel}>Lien d'invitation</p>
          </div>
          <div className={s.inviteBox}>
            <span className={s.inviteLinkDisplay}>{inviteLink}</span>
            <button
              className={`${s.copyBtn} ${copied ? s.copied : ''}`}
              onClick={handleCopy}
            >
              {copied ? '✓ Copié' : 'Copier'}
            </button>
          </div>
        </section>

        <OpenEventDashboard
          guests={guests}
          filter={filter}
          onFilterChange={setFilter}
          onDeleteGuest={handleDeleteGuest}
        />
      </div>
    );
  }

  // For private events: render original dashboard (with bulk import option)
  return (
    <div className={s.page}>
      <Link href="/dashboard" className={s.back}>← Mes événements</Link>

      <section className={s.hero}>
        <div>
          <p className={s.kicker}>Event room</p>
          <h1 className={s.eventTitle}>{event.title}</h1>
          <p className={s.eventMeta}>{date} · {time} · {event.location}</p>
          {event.description && <p className={s.description}>{event.description}</p>}
        </div>
      </section>

      <section className={s.sharePanel}>
        <div>
          <p className={s.panelLabel}>Lien d'invitation</p>
        </div>
        <div className={s.inviteBox}>
          <span className={s.inviteLinkDisplay}>{inviteLink}</span>
          <button
            className={`${s.copyBtn} ${copied ? s.copied : ''}`}
            onClick={handleCopy}
          >
            {copied ? '✓ Copié' : 'Copier'}
          </button>
        </div>
      </section>

      <section className={s.statsGrid} aria-label="Résumé RSVP">
        {RSVP_STATS.map((stat) => (
          <article key={stat.key} className={`${s.statCard} ${s[stat.key]}`}>
            <span className={s.statValue}>{counts[stat.key]}</span>
            <span className={s.statLabel}>{stat.label}</span>
          </article>
        ))}
      </section>

      <section className={s.guestPanel}>
        <div className={s.sectionHeader}>
          <div>
            <p className={s.panelLabel}>Invités</p>
            <h2>{filteredGuests.length} personne{filteredGuests.length !== 1 ? 's' : ''}</h2>
          </div>
          <RsvpFilters active={filter} onChange={setFilter} />
        </div>

        <div className={s.guestList}>
          {filteredGuests.length === 0 ? (
            <p className={s.emptyGuests}>
              {filter === 'all' ? "Aucun invité pour l'instant." : 'Aucun invité dans cette catégorie.'}
            </p>
          ) : (
            filteredGuests.map((guest) => (
              <GuestItem key={guest.id} guest={guest} onDelete={handleDeleteGuest} />
            ))
          )}
        </div>

        {showBulkImporter ? (
          <BulkGuestImporter
            onImport={handleBulkImport}
            onCancel={() => setShowBulkImporter(false)}
          />
        ) : (
          <>
            <button
              className={s.bulkImportToggle}
              onClick={() => setShowBulkImporter(true)}
              type="button"
            >
              + Importer plusieurs invités
            </button>
            <AddGuestForm onAdd={handleAddGuest} />
          </>
        )}
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Add bulkImportToggle styling**

Add to `frontend/styles/eventDetail.module.scss`:

```scss
.bulkImportToggle {
  display: block;
  width: 100%;
  padding: 0.75rem;
  border: 2px dashed var(--border-color, #e0e0e0);
  background-color: transparent;
  color: var(--text-secondary, #666);
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 1rem;

  &:hover {
    border-color: var(--accent-color, #333);
    color: var(--accent-color, #333);
  }
}
```

- [ ] **Step 3: Test both event type dashboards**

Create a private event and an open event. Verify:
- Private event shows all 4 RSVP stats and add guest form
- Open event shows only yes/maybe/no stats, no "pending" filter
- Bulk import button works for private events
- Open event has simplified message about auto-registration

- [ ] **Step 4: Commit**

```bash
git add frontend/app/dashboard/[id]/page.js frontend/styles/eventDetail.module.scss
git commit -m "feat: render conditional dashboard based on event type"
```

---

### Task 12: Update Invite Page for Open Events

**Files:**
- Modify: `frontend/app/invite/[slug]/page.js`

- [ ] **Step 1: Update page to handle open events**

```javascript
'use client';

import { useEffect, useMemo, useState, use } from 'react';
import api from '@/lib/api';
import s from '@/styles/invite.module.scss';

const RSVP_OPTIONS = [
  { value: 'yes', label: 'Je viens', tone: 'yes' },
  { value: 'maybe', label: 'Peut-être', tone: 'maybe' },
  { value: 'no', label: 'Je ne viens pas', tone: 'no' },
];

const CONFIRMATION_COPY = {
  yes: 'Parfait, ta présence est confirmée.',
  maybe: "C'est noté, tu es indiqué comme peut-être.",
  no: 'Merci pour ta réponse, ton absence est bien notée.',
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
      .catch((err) => {
        setError(err.response?.data?.error || 'Invitation introuvable.');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const formattedDate = useMemo(() => {
    if (!event?.date) return '';

    return new Date(event.date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [event?.date]);

  const handleIdentityChange = (e) => {
    setIdentity((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const { data } = await api.post(`/invite/${slug}/verify`, identity);

      if (!data.found) {
        setError("On n'a pas retrouvé cette inscription. Réessaye.");
        return;
      }

      setGuest({ id: data.guest_id, rsvp_status: data.rsvp_status });

      // For open events: auto-join with 'yes', so skip RSVP step
      if (event?.event_type === 'open') {
        setSelectedRsvp(data.rsvp_status);
        setStep('done');
      } else {
        // For private events: show RSVP step
        setSelectedRsvp(data.rsvp_status === 'pending' ? '' : data.rsvp_status);
        setStep('rsvp');
      }
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

      setGuest((current) => ({ ...current, rsvp_status: data.rsvp_status }));
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.error || "Impossible d'enregistrer la réponse.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className={s.page}>
        <p className={s.loading}>Chargement...</p>
      </main>
    );
  }

  if (!event) {
    return (
      <main className={s.page}>
        <section className={s.panel}>
          <p className={s.kicker}>Sera</p>
          <h1 className={s.title}>Invitation introuvable</h1>
          <p className={s.muted}>{error || "Ce lien d'invitation n'est plus disponible."}</p>
        </section>
      </main>
    );
  }

  return (
    <main className={s.page}>
      <section className={s.event}>
        <p className={s.kicker}>Invitation</p>
        <h1 className={s.title}>{event.title}</h1>
        <div className={s.meta}>
          <span>{formattedDate}</span>
          <span>{event.location}</span>
        </div>
        {event.description && <p className={s.description}>{event.description}</p>}
      </section>

      {step === 'verify' && (
        <form className={s.panel} onSubmit={handleVerify}>
          <div className={s.stepHeader}>
            <p className={s.stepLabel}>Vérification</p>
            <h2>Entre ton nom</h2>
          </div>

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

          {error && <p className={s.error}>{error}</p>}

          <button className={s.primaryBtn} type="submit" disabled={submitting}>
            {submitting ? 'Vérification...' : 'Continuer'}
          </button>
        </form>
      )}

      {step === 'rsvp' && event.event_type === 'private' && (
        <form className={s.panel} onSubmit={handleRsvp}>
          <div className={s.stepHeader}>
            <p className={s.stepLabel}>RSVP</p>
            <h2>Ta réponse</h2>
          </div>

          <div className={s.options}>
            {RSVP_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`${s.optionBtn} ${s[option.tone]} ${selectedRsvp === option.value ? s.active : ''}`}
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
        <section className={s.panel}>
          <div className={s.stepHeader}>
            <p className={s.stepLabel}>Confirmation</p>
            <h2>Merci, {identity.first_name}</h2>
          </div>
          <p className={s.confirmation}>
            {event.event_type === 'open'
              ? 'Tu es inscrit(e) à l\'événement. À bientôt !'
              : CONFIRMATION_COPY[guest?.rsvp_status] || 'Ta réponse est bien enregistrée.'}
          </p>
        </section>
      )}
    </main>
  );
}
```

- [ ] **Step 2: Test open event invite flow**

- Create an open event
- Share the invite link
- Try to join with a new name (should auto-create and go to confirmation)
- Try to join again with same name (should find existing and go to confirmation)

- [ ] **Step 3: Test private event invite flow (unchanged)**

Verify private events still work as before.

- [ ] **Step 4: Commit**

```bash
git add frontend/app/invite/[slug]/page.js
git commit -m "feat: support open event self-registration in invite flow"
```

---

## Phase 5: Verification & Testing

### Task 13: End-to-End Testing

**No code changes, just verification**

- [ ] **Test 1: Private Event Full Flow**
  1. Create private event
  2. Add 2 guests manually
  3. Bulk import 3 guests via paste
  4. Share invite link
  5. Guest responds via invite
  6. Dashboard shows all RSVP stats
  
Expected: All steps work smoothly, no errors.

- [ ] **Test 2: Open Event Full Flow**
  1. Create open event
  2. Share invite link
  3. Guest 1 joins via name entry (new guest)
  4. Guest 2 joins via same name (existing guest)
  5. Guest 3 joins and changes RSVP
  6. Dashboard shows participants only (no pending)

Expected: All steps work smoothly, open dashboard shows correct participants.

- [ ] **Test 3: Mobile/Responsive**
  1. Create both event types on mobile
  2. Verify EventTypeSelector is readable
  3. Verify bulk import textarea works
  4. Verify both dashboards display correctly

Expected: No layout breaks, forms usable.

- [ ] **Test 4: Error Handling**
  1. Bulk import with invalid data (single names, empty lines)
  2. Verify error messages appear
  3. Try accessing invalid event slug
  4. Verify error page shows

Expected: All errors handled gracefully with clear messages.

- [ ] **Step: Document Testing Results**

Create a quick test log if any issues found, fix them before final commit.

- [ ] **Final Commit: Testing Verification**

```bash
git add .
git commit -m "test: verify end-to-end functionality for both event types"
```

---

## Summary of Changes

**Database:**
- ✓ Added `event_type` column to events table

**Backend Models:**
- ✓ Added `event_type` field to Event model

**Backend API:**
- ✓ Event creation accepts `event_type` parameter
- ✓ Added bulk guest import endpoint
- ✓ Updated guest verification for open events (auto-create)
- ✓ Updated invite flow for open events (skip RSVP step)

**Frontend Components:**
- ✓ EventTypeSelector (radio buttons with descriptions)
- ✓ BulkGuestImporter (textarea + parser)
- ✓ OpenEventDashboard (simplified stats + guest list)
- ✓ Guest parser utility with validation

**Frontend Pages:**
- ✓ Event creation: added type selector + conditional forms
- ✓ Event detail: conditional rendering based on event type
- ✓ Invite flow: updated for open event auto-registration

**Product Impact:**
- Private events: existing UX + bulk import feature
- Open events: simple join-by-link, no pre-defined guest list, auto-participant creation

---


# Event Customization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement aesthetic event customization allowing hosts to choose themes, upload covers, and add custom welcome messages.

**Architecture:** 
- Database: 4 new columns on events table (theme, cover_type, cover_value, custom_message)
- Backend: Extended API endpoints + image upload handler
- Frontend: 5 new components for customization form + updated pages for creation/dashboard/invite
- Styling: 8 theme SCSS files with color variables applied via data-theme attribute

**Tech Stack:** Next.js App Router, Express, Sequelize, PostgreSQL, SCSS Modules

---

## File Structure

### Backend Files
- `backend/src/db/migrations/` — Database migration file
- `backend/src/models/Event.js` — Update Event model
- `backend/src/controllers/eventController.js` — Extend create() and add update() methods
- `backend/src/routes/events.js` — Add image upload route
- `backend/src/utils/imageProcessor.js` — NEW: Image validation & processing utility

### Frontend Files
- `frontend/lib/themeConstants.js` — NEW: Theme definitions (8 themes + gradients)
- `frontend/lib/imageValidator.js` — NEW: Image validation utility
- `frontend/styles/themes/` — NEW: 8 SCSS theme files (_birthday.scss, etc.)
- `frontend/components/ThemeSelector.js` — NEW
- `frontend/components/CoverSelector.js` — NEW
- `frontend/components/WelcomeMessageInput.js` — NEW
- `frontend/components/EventCustomizationForm.js` — NEW
- `frontend/components/CustomizationSummary.js` — NEW
- `frontend/app/dashboard/create/page.js` — Update (add customization step)
- `frontend/app/dashboard/[id]/page.js` — Update (add customization section + edit UI)
- `frontend/app/invite/[slug]/page.js` — Update (apply theme styling + display cover + message)
- `frontend/styles/invite.module.scss` — Update (add theme-aware styling)
- `frontend/styles/eventDetail.module.scss` — Update (add customization section styling)

---

## Phase 1: Database & Backend Model

### Task 1: Create Database Migration

**Files:**
- Create: `backend/src/db/migrations/YYYYMMDD_add_customization_columns.js`

- [ ] **Step 1: Create migration file**

```javascript
// backend/src/db/migrations/002_add_customization_columns.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('events', 'theme', {
      type: Sequelize.VARCHAR(50),
      allowNull: false,
      defaultValue: 'minimal',
    });

    await queryInterface.addColumn('events', 'cover_type', {
      type: Sequelize.VARCHAR(20),
      allowNull: false,
      defaultValue: 'gradient',
    });

    await queryInterface.addColumn('events', 'cover_value', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('events', 'custom_message', {
      type: Sequelize.VARCHAR(160),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('events', 'theme');
    await queryInterface.removeColumn('events', 'cover_type');
    await queryInterface.removeColumn('events', 'cover_value');
    await queryInterface.removeColumn('events', 'custom_message');
  },
};
```

- [ ] **Step 2: Run migration**

```bash
cd backend
npm run migrate
```

Expected: Columns added to events table with no errors.

- [ ] **Step 3: Commit**

```bash
git add backend/src/db/migrations/002_add_customization_columns.js
git commit -m "feat: add customization columns to events table"
```

---

### Task 2: Update Event Model

**Files:**
- Modify: `backend/src/models/Event.js`

- [ ] **Step 1: Read current Event model**

Read the file to see current structure.

- [ ] **Step 2: Add customization fields to model**

Update the Event model definition to include:

```javascript
// backend/src/models/Event.js
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
  theme: {
    type: DataTypes.VARCHAR(50),
    allowNull: false,
    defaultValue: 'minimal',
    validate: {
      isIn: {
        args: [['birthday', 'wedding', 'baby_shower', 'bbq', 'house_party', 'chill_night', 'corporate', 'minimal']],
        msg: 'Invalid theme',
      },
    },
  },
  cover_type: {
    type: DataTypes.VARCHAR(20),
    allowNull: false,
    defaultValue: 'gradient',
    validate: {
      isIn: {
        args: [['gradient', 'image']],
        msg: 'cover_type must be gradient or image',
      },
    },
  },
  cover_value: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  custom_message: {
    type: DataTypes.VARCHAR(160),
    allowNull: true,
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
  updatedAt: 'updated_at',
});

module.exports = Event;
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/models/Event.js
git commit -m "feat: add customization fields to Event model"
```

---

## Phase 2: Image Processing Utility

### Task 3: Create Image Processor Utility

**Files:**
- Create: `backend/src/utils/imageProcessor.js`

- [ ] **Step 1: Create image processor utility**

```javascript
// backend/src/utils/imageProcessor.js
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const crypto = require('crypto');

const UPLOAD_DIR = path.join(__dirname, '../../public/uploads/covers');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FORMATS = ['jpeg', 'png', 'webp'];
const TARGET_WIDTH = 1200;
const TARGET_HEIGHT = 600;

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const validateImageFile = (buffer, mimeType) => {
  const errors = [];

  // Check file size
  if (buffer.length > MAX_FILE_SIZE) {
    errors.push('Image must be less than 5MB');
  }

  // Check MIME type
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
    errors.push('Image must be JPG, PNG, or WebP');
  }

  return { valid: errors.length === 0, errors };
};

const processAndSaveImage = async (buffer, eventId) => {
  try {
    // Generate unique filename
    const filename = `${eventId}-${crypto.randomBytes(8).toString('hex')}.jpg`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Resize and optimize
    await sharp(buffer)
      .resize(TARGET_WIDTH, TARGET_HEIGHT, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 80 })
      .toFile(filepath);

    // Return URL path (relative to public)
    return `/uploads/covers/${filename}`;
  } catch (error) {
    throw new Error(`Failed to process image: ${error.message}`);
  }
};

module.exports = {
  validateImageFile,
  processAndSaveImage,
  MAX_FILE_SIZE,
};
```

- [ ] **Step 2: Install required package**

```bash
cd backend
npm install sharp
```

Expected: sharp installed.

- [ ] **Step 3: Commit**

```bash
git add backend/src/utils/imageProcessor.js package.json package-lock.json
git commit -m "feat: add image processor utility for cover uploads"
```

---

## Phase 3: Backend API Updates

### Task 4: Update Event Controller - Extend POST /events

**Files:**
- Modify: `backend/src/controllers/eventController.js`

- [ ] **Step 1: Update create() function to accept customization fields**

```javascript
// In backend/src/controllers/eventController.js

const create = async (req, res) => {
  const {
    title,
    description,
    date,
    location,
    event_type,
    theme,
    cover_type,
    cover_value,
    custom_message,
  } = req.body;

  // Validate required fields
  if (!title || !date || !location) {
    return res.status(400).json({ error: 'title, date, and location are required' });
  }

  // Validate event_type
  if (event_type && !['private', 'open'].includes(event_type)) {
    return res.status(400).json({ error: 'event_type must be private or open' });
  }

  // Validate theme
  const validThemes = ['birthday', 'wedding', 'baby_shower', 'bbq', 'house_party', 'chill_night', 'corporate', 'minimal'];
  if (theme && !validThemes.includes(theme)) {
    return res.status(400).json({ error: 'Invalid theme' });
  }

  // Validate cover_type
  if (cover_type && !['gradient', 'image'].includes(cover_type)) {
    return res.status(400).json({ error: 'cover_type must be gradient or image' });
  }

  // Validate custom_message length
  if (custom_message && custom_message.length > 160) {
    return res.status(400).json({ error: 'custom_message must be 160 characters or less' });
  }

  try {
    const event = await Event.create({
      host_id: req.user.id,
      title,
      description: description || null,
      date,
      location,
      event_type: event_type || 'private',
      theme: theme || 'minimal',
      cover_type: cover_type || 'gradient',
      cover_value: cover_value || `${theme || 'minimal'}_default`,
      custom_message: custom_message ? custom_message.trim() : null,
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event' });
  }
};

module.exports = { create, /* ... other exports ... */ };
```

- [ ] **Step 2: Test with curl**

```bash
curl -X POST http://localhost:5000/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Birthday Party",
    "date": "2026-05-15T19:00:00",
    "location": "Paris",
    "event_type": "private",
    "theme": "birthday",
    "cover_type": "gradient",
    "cover_value": "birthday_default",
    "custom_message": "Let'\''s party!"
  }'
```

Expected: Event created with all customization fields populated.

- [ ] **Step 3: Commit**

```bash
git add backend/src/controllers/eventController.js
git commit -m "feat: extend event creation to accept customization fields"
```

---

### Task 5: Add Event Update (PATCH) Endpoint

**Files:**
- Modify: `backend/src/controllers/eventController.js`
- Modify: `backend/src/routes/events.js`

- [ ] **Step 1: Add update() function to eventController**

```javascript
// Add to backend/src/controllers/eventController.js

const update = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    date,
    location,
    theme,
    cover_type,
    cover_value,
    custom_message,
  } = req.body;

  try {
    // Check ownership
    const event = await Event.findOne({
      where: { id, host_id: req.user.id },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Validate fields if provided
    if (theme) {
      const validThemes = ['birthday', 'wedding', 'baby_shower', 'bbq', 'house_party', 'chill_night', 'corporate', 'minimal'];
      if (!validThemes.includes(theme)) {
        return res.status(400).json({ error: 'Invalid theme' });
      }
    }

    if (cover_type && !['gradient', 'image'].includes(cover_type)) {
      return res.status(400).json({ error: 'cover_type must be gradient or image' });
    }

    if (custom_message && custom_message.length > 160) {
      return res.status(400).json({ error: 'custom_message must be 160 characters or less' });
    }

    // Update event
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (date !== undefined) updates.date = date;
    if (location !== undefined) updates.location = location;
    if (theme !== undefined) updates.theme = theme;
    if (cover_type !== undefined) updates.cover_type = cover_type;
    if (cover_value !== undefined) updates.cover_value = cover_value;
    if (custom_message !== undefined) updates.custom_message = custom_message ? custom_message.trim() : null;

    await event.update(updates);
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update event' });
  }
};

module.exports = { create, list, getOne, update, remove, /* ... */ };
```

- [ ] **Step 2: Add PATCH route**

```javascript
// In backend/src/routes/events.js

const router = require('express').Router();
const auth = require('../middlewares/auth');
const { create, list, getOne, update, remove } = require('../controllers/eventController');

router.use(auth);

router.post('/', create);
router.get('/', list);
router.get('/:id', getOne);
router.patch('/:id', update);  // NEW
router.delete('/:id', remove);

module.exports = router;
```

- [ ] **Step 3: Test update**

```bash
curl -X PATCH http://localhost:5000/events/<event_id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "theme": "wedding",
    "custom_message": "Updated message!"
  }'
```

Expected: Event updated with new theme and message.

- [ ] **Step 4: Commit**

```bash
git add backend/src/controllers/eventController.js backend/src/routes/events.js
git commit -m "feat: add PATCH /events/:id endpoint for customization updates"
```

---

### Task 6: Add Image Upload Endpoint

**Files:**
- Modify: `backend/src/routes/events.js`
- Create: `backend/src/controllers/eventController.js` (add uploadCover method)

- [ ] **Step 1: Add uploadCover() function**

```javascript
// Add to backend/src/controllers/eventController.js

const { validateImageFile, processAndSaveImage } = require('../utils/imageProcessor');

const uploadCover = async (req, res) => {
  const { id } = req.params;

  try {
    // Validate event ownership
    const event = await Event.findOne({
      where: { id, host_id: req.user.id },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate image
    const { valid, errors } = validateImageFile(req.file.buffer, req.file.mimetype);
    if (!valid) {
      return res.status(400).json({ error: errors.join(', ') });
    }

    // Process and save image
    const coverUrl = await processAndSaveImage(req.file.buffer, id);

    // Update event
    await event.update({
      cover_type: 'image',
      cover_value: coverUrl,
    });

    res.json({
      success: true,
      cover_value: coverUrl,
    });
  } catch (error) {
    res.status(500).json({ error: `Failed to upload cover: ${error.message}` });
  }
};

module.exports = { create, list, getOne, update, remove, uploadCover };
```

- [ ] **Step 2: Add multer middleware and route**

```bash
cd backend
npm install multer
```

```javascript
// Update backend/src/routes/events.js

const router = require('express').Router();
const auth = require('../middlewares/auth');
const multer = require('multer');
const { create, list, getOne, update, remove, uploadCover } = require('../controllers/eventController');

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.use(auth);

router.post('/', create);
router.get('/', list);
router.get('/:id', getOne);
router.patch('/:id', update);
router.delete('/:id', remove);
router.post('/:id/cover-image', upload.single('file'), uploadCover);  // NEW

module.exports = router;
```

- [ ] **Step 3: Test image upload**

```bash
curl -X POST http://localhost:5000/events/<event_id>/cover-image \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/image.jpg"
```

Expected: Image uploaded and resized, cover_value returned.

- [ ] **Step 4: Commit**

```bash
git add backend/src/controllers/eventController.js backend/src/routes/events.js backend/src/utils/imageProcessor.js package.json package-lock.json
git commit -m "feat: add image upload endpoint for cover images"
```

---

## Phase 4: Frontend Theme System

### Task 7: Create Theme Constants

**Files:**
- Create: `frontend/lib/themeConstants.js`

- [ ] **Step 1: Create theme definitions with all colors and gradients**

```javascript
// frontend/lib/themeConstants.js

export const THEMES = {
  birthday: {
    name: 'Birthday',
    primary: '#ff69b4',
    secondary: '#ffd700',
    accent: '#ff1493',
    text: '#333',
    textMuted: '#666',
    border: '#ffe4e1',
    bg: '#fff8f9',
    gradients: {
      default: 'linear-gradient(135deg, #ff69b4 0%, #e6b3ff 100%)',
      alt1: 'linear-gradient(135deg, #ffb3d9 0%, #ffd700 100%)',
      alt2: 'linear-gradient(135deg, #ff1493 0%, #ff69b4 100%)',
    },
  },
  wedding: {
    name: 'Wedding',
    primary: '#d4a574',
    secondary: '#f4e4c1',
    accent: '#c9927d',
    text: '#3e3e3e',
    textMuted: '#666',
    border: '#e8dcc8',
    bg: '#faf9f7',
    gradients: {
      default: 'linear-gradient(135deg, #d4a574 0%, #f4e4c1 100%)',
      alt1: 'linear-gradient(135deg, #c9927d 0%, #e8dcc8 100%)',
      alt2: 'linear-gradient(135deg, #e8cdb5 0%, #d4a574 100%)',
    },
  },
  baby_shower: {
    name: 'Baby Shower',
    primary: '#87ceeb',
    secondary: '#98ff98',
    accent: '#87ceeb',
    text: '#333',
    textMuted: '#666',
    border: '#d6f0ff',
    bg: '#f0f8ff',
    gradients: {
      default: 'linear-gradient(135deg, #87ceeb 0%, #98ff98 100%)',
      alt1: 'linear-gradient(135deg, #b0e0e6 0%, #afeeee 100%)',
      alt2: 'linear-gradient(135deg, #98fb98 0%, #87ceeb 100%)',
    },
  },
  bbq: {
    name: 'BBQ',
    primary: '#ff8c42',
    secondary: '#ffb84d',
    accent: '#ff6b35',
    text: '#333',
    textMuted: '#666',
    border: '#ffe0cc',
    bg: '#fff8f0',
    gradients: {
      default: 'linear-gradient(135deg, #ff8c42 0%, #ffb84d 100%)',
      alt1: 'linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%)',
      alt2: 'linear-gradient(135deg, #ffa500 0%, #ff8c42 100%)',
    },
  },
  house_party: {
    name: 'House Party',
    primary: '#da70d6',
    secondary: '#ff69b4',
    accent: '#dd7dd7',
    text: '#333',
    textMuted: '#666',
    border: '#f0d9f0',
    bg: '#faf6fa',
    gradients: {
      default: 'linear-gradient(135deg, #da70d6 0%, #ff69b4 100%)',
      alt1: 'linear-gradient(135deg, #ff1493 0%, #da70d6 100%)',
      alt2: 'linear-gradient(135deg, #ba55d3 0%, #ff69b4 100%)',
    },
  },
  chill_night: {
    name: 'Chill Night',
    primary: '#2c5aa0',
    secondary: '#20b2aa',
    accent: '#4169e1',
    text: '#333',
    textMuted: '#666',
    border: '#d0e8f2',
    bg: '#f0f6fa',
    gradients: {
      default: 'linear-gradient(135deg, #2c5aa0 0%, #20b2aa 100%)',
      alt1: 'linear-gradient(135deg, #4169e1 0%, #20b2aa 100%)',
      alt2: 'linear-gradient(135deg, #1e90ff 0%, #2c5aa0 100%)',
    },
  },
  corporate: {
    name: 'Corporate',
    primary: '#2c3e50',
    secondary: '#34495e',
    accent: '#3498db',
    text: '#2c3e50',
    textMuted: '#7f8c8d',
    border: '#bdc3c7',
    bg: '#ecf0f1',
    gradients: {
      default: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
      alt1: 'linear-gradient(135deg, #34495e 0%, #7f8c8d 100%)',
      alt2: 'linear-gradient(135deg, #1a252f 0%, #2c3e50 100%)',
    },
  },
  minimal: {
    name: 'Minimal',
    primary: '#333',
    secondary: '#666',
    accent: '#999',
    text: '#333',
    textMuted: '#999',
    border: '#ddd',
    bg: '#f9f9f9',
    gradients: {
      default: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
      alt1: 'linear-gradient(135deg, #e8e8e8 0%, #d0d0d0 100%)',
      alt2: 'linear-gradient(135deg, #f0f0f0 0%, #ddd 100%)',
    },
  },
};

export const THEME_ICONS = {
  birthday: '🎂',
  wedding: '💍',
  baby_shower: '👶',
  bbq: '🔥',
  house_party: '🎉',
  chill_night: '🌙',
  corporate: '💼',
  minimal: '✨',
};

export const GRADIENT_PRESETS = {
  birthday_default: 'linear-gradient(135deg, #ff69b4 0%, #e6b3ff 100%)',
  birthday_alt1: 'linear-gradient(135deg, #ffb3d9 0%, #ffd700 100%)',
  birthday_alt2: 'linear-gradient(135deg, #ff1493 0%, #ff69b4 100%)',
  // ... (repeat for all 8 themes)
};

export const getThemeByName = (themeName) => {
  return THEMES[themeName] || THEMES.minimal;
};

export const getGradientsByTheme = (themeName) => {
  const theme = getThemeByName(themeName);
  return Object.entries(theme.gradients).map(([key, value]) => ({
    name: key,
    value: value,
    label: key === 'default' ? 'Default' : `Alternative ${key.slice(-1)}`,
  }));
};
```

- [ ] **Step 2: Commit**

```bash
git add frontend/lib/themeConstants.js
git commit -m "feat: add theme constants with all 8 themes and gradients"
```

---

### Task 8: Create Image Validator

**Files:**
- Create: `frontend/lib/imageValidator.js`

- [ ] **Step 1: Create image validation utility**

```javascript
// frontend/lib/imageValidator.js

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_WIDTH = 800;
const MIN_HEIGHT = 400;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const validateImageFile = (file) => {
  const errors = [];

  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    errors.push('Image must be JPG, PNG, or WebP');
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push('Image must be less than 5MB');
  }

  return { valid: errors.length === 0, errors };
};

export const validateImageDimensions = (img) => {
  const errors = [];

  if (img.width < MIN_WIDTH || img.height < MIN_HEIGHT) {
    errors.push(`Image must be at least ${MIN_WIDTH}x${MIN_HEIGHT}px`);
  }

  return { valid: errors.length === 0, errors };
};

export const readImageFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export const getImageDimensions = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
};
```

- [ ] **Step 2: Commit**

```bash
git add frontend/lib/imageValidator.js
git commit -m "feat: add image validation utility for cover uploads"
```

---

## Phase 5: Frontend Components

### Task 9: Create ThemeSelector Component

**Files:**
- Create: `frontend/components/ThemeSelector.js`
- Create: `frontend/styles/themeSelector.module.scss`

- [ ] **Step 1: Create component**

```javascript
// frontend/components/ThemeSelector.js
'use client';

import { THEMES, THEME_ICONS } from '@/lib/themeConstants';
import s from '@/styles/themeSelector.module.scss';

export default function ThemeSelector({ value, onChange }) {
  const themeList = Object.entries(THEMES).map(([key, theme]) => ({
    key,
    ...theme,
  }));

  return (
    <fieldset className={s.selector}>
      <legend className={s.legend}>Choisir un thème</legend>

      <div className={s.grid}>
        {themeList.map((theme) => (
          <label key={theme.key} className={`${s.option} ${value === theme.key ? s.active : ''}`}>
            <input
              type="radio"
              name="theme"
              value={theme.key}
              checked={value === theme.key}
              onChange={(e) => onChange(e.target.value)}
              className={s.radio}
            />
            <div className={s.content}>
              <span className={s.icon}>{THEME_ICONS[theme.key]}</span>
              <span className={s.name}>{theme.name}</span>
              <div className={s.swatches}>
                <span className={s.swatch} style={{ backgroundColor: theme.primary }} />
                <span className={s.swatch} style={{ backgroundColor: theme.secondary }} />
                <span className={s.swatch} style={{ backgroundColor: theme.accent }} />
              </div>
            </div>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
```

- [ ] **Step 2: Create styles**

```scss
// frontend/styles/themeSelector.module.scss
.selector {
  border: none;
  padding: 0;
  margin: 0;
}

.legend {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  display: block;
  color: var(--text-primary, #333);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}

.option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;

  &:hover {
    border-color: #999;
    background: #f9f9f9;
  }

  &.active {
    border-color: #333;
    background: #f0f0f0;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
  }
}

.radio {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.icon {
  font-size: 2rem;
  line-height: 1;
}

.name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #333;
}

.swatches {
  display: flex;
  gap: 0.25rem;
}

.swatch {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border-radius: 0.25rem;
  border: 1px solid #ddd;
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/components/ThemeSelector.js frontend/styles/themeSelector.module.scss
git commit -m "feat: add ThemeSelector component"
```

---

### Task 10: Create CoverSelector Component

**Files:**
- Create: `frontend/components/CoverSelector.js`
- Create: `frontend/styles/coverSelector.module.scss`

- [ ] **Step 1: Create component**

```javascript
// frontend/components/CoverSelector.js
'use client';

import { useState } from 'react';
import { getGradientsByTheme } from '@/lib/themeConstants';
import { validateImageFile, getImageDimensions, readImageFile } from '@/lib/imageValidator';
import s from '@/styles/coverSelector.module.scss';

export default function CoverSelector({ theme, value, onCoverChange }) {
  const [activeTab, setActiveTab] = useState('gradient');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState('');
  const [uploading, setUploading] = useState(false);
  const gradients = getGradientsByTheme(theme);

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError('');

    // Validate file
    const { valid, errors } = validateImageFile(file);
    if (!valid) {
      setImageError(errors.join(', '));
      return;
    }

    try {
      // Read and preview
      const dataUrl = await readImageFile(file);
      const { width, height } = await getImageDimensions(dataUrl);

      if (width < 800 || height < 400) {
        setImageError('Image must be at least 800x400px');
        return;
      }

      setImagePreview(dataUrl);
      onCoverChange({ type: 'image', file, preview: dataUrl });
    } catch (error) {
      setImageError('Failed to process image');
    }
  };

  return (
    <fieldset className={s.selector}>
      <legend className={s.legend}>Couverture d'événement</legend>

      <div className={s.tabs}>
        <button
          type="button"
          className={`${s.tab} ${activeTab === 'gradient' ? s.active : ''}`}
          onClick={() => setActiveTab('gradient')}
        >
          Dégradé
        </button>
        <button
          type="button"
          className={`${s.tab} ${activeTab === 'image' ? s.active : ''}`}
          onClick={() => setActiveTab('image')}
        >
          Image
        </button>
        {gradients.length > 1 && (
          <button
            type="button"
            className={`${s.tab} ${activeTab === 'alternatives' ? s.active : ''}`}
            onClick={() => setActiveTab('alternatives')}
          >
            Alternatives
          </button>
        )}
      </div>

      <div className={s.content}>
        {activeTab === 'gradient' && (
          <div className={s.option}>
            <div
              className={s.preview}
              style={{ background: gradients[0]?.value }}
            />
            <p className={s.label}>Dégradé par défaut</p>
            <button
              type="button"
              className={s.btn}
              onClick={() => onCoverChange({ type: 'gradient', value: `${theme}_default` })}
            >
              Utiliser ce dégradé
            </button>
          </div>
        )}

        {activeTab === 'image' && (
          <div className={s.uploadBox}>
            <label className={s.dropZone}>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageSelect}
                disabled={uploading}
                className={s.fileInput}
              />
              <p className={s.uploadText}>
                {imagePreview ? '✓ Image sélectionnée' : '📤 Cliquez ou déposez une image'}
              </p>
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className={s.imagePreview} />
              )}
            </label>
            {imageError && <p className={s.error}>{imageError}</p>}
          </div>
        )}

        {activeTab === 'alternatives' && gradients.length > 1 && (
          <div className={s.altGrid}>
            {gradients.slice(1).map((grad) => (
              <button
                key={grad.name}
                type="button"
                className={s.altOption}
                onClick={() => onCoverChange({ type: 'gradient', value: `${theme}_${grad.name}` })}
              >
                <div
                  className={s.preview}
                  style={{ background: grad.value }}
                />
                <span className={s.label}>{grad.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </fieldset>
  );
}
```

- [ ] **Step 2: Create styles**

```scss
// frontend/styles/coverSelector.module.scss
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
  color: var(--text-primary, #333);
}

.tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid #e0e0e0;
  margin-bottom: 1.5rem;
}

.tab {
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  color: #666;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  bottom: -2px;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;

  &:hover {
    color: #333;
  }

  &.active {
    color: #333;
    border-bottom-color: #333;
  }
}

.content {
  padding: 1rem 0;
}

.option {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.preview {
  width: 100%;
  height: 150px;
  border-radius: 0.5rem;
  border: 1px solid #e0e0e0;
}

.label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #333;
  margin: 0;
}

.btn {
  padding: 0.75rem 1.5rem;
  background: #333;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #555;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.uploadBox {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dropZone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border: 2px dashed #ccc;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f9f9f9;

  &:hover {
    border-color: #333;
    background: #f0f0f0;
  }
}

.fileInput {
  display: none;
}

.uploadText {
  margin: 0;
  color: #666;
  font-weight: 500;
}

.imagePreview {
  width: 100%;
  max-width: 300px;
  height: auto;
  border-radius: 0.375rem;
  margin-top: 1rem;
}

.error {
  color: #dc3545;
  font-size: 0.875rem;
  margin: 0;
}

.altGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.altOption {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0;
  border: none;
  cursor: pointer;
  background: none;

  .preview {
    width: 100%;
    height: 100px;
    border-radius: 0.375rem;
    border: 2px solid #e0e0e0;
    transition: border-color 0.2s ease;
  }

  &:hover .preview {
    border-color: #333;
  }

  .label {
    font-size: 0.75rem;
    text-align: center;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/components/CoverSelector.js frontend/styles/coverSelector.module.scss
git commit -m "feat: add CoverSelector component with image upload and gradients"
```

---

### Task 11: Create WelcomeMessageInput Component

**Files:**
- Create: `frontend/components/WelcomeMessageInput.js`
- Create: `frontend/styles/welcomeMessageInput.module.scss`

- [ ] **Step 1: Create component**

```javascript
// frontend/components/WelcomeMessageInput.js
'use client';

import s from '@/styles/welcomeMessageInput.module.scss';

export default function WelcomeMessageInput({ value, onChange }) {
  const charCount = value?.length || 0;
  const maxChars = 160;

  return (
    <div className={s.container}>
      <label htmlFor="custom_message" className={s.label}>
        Message de bienvenue
        <span className={s.optional}> (optionnel)</span>
      </label>

      <textarea
        id="custom_message"
        value={value || ''}
        onChange={(e) => onChange(e.target.value.slice(0, maxChars))}
        placeholder="Ajoute un message personnel... 🎉"
        className={s.textarea}
        rows={3}
      />

      <div className={s.footer}>
        <span className={`${s.counter} ${charCount === maxChars ? s.full : ''}`}>
          {charCount}/{maxChars}
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create styles**

```scss
// frontend/styles/welcomeMessageInput.module.scss
.container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary, #333);
}

.optional {
  font-weight: 400;
  color: var(--text-muted, #666);
  font-size: 0.85rem;
}

.textarea {
  padding: 0.75rem;
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 0.375rem;
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--accent-color, #333);
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
  }

  &::placeholder {
    color: #999;
  }
}

.footer {
  display: flex;
  justify-content: flex-end;
}

.counter {
  font-size: 0.75rem;
  color: #999;
  font-weight: 500;

  &.full {
    color: #dc3545;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/components/WelcomeMessageInput.js frontend/styles/welcomeMessageInput.module.scss
git commit -m "feat: add WelcomeMessageInput component"
```

---

### Task 12: Create EventCustomizationForm Component

**Files:**
- Create: `frontend/components/EventCustomizationForm.js`
- Create: `frontend/styles/eventCustomizationForm.module.scss`

- [ ] **Step 1: Create component**

```javascript
// frontend/components/EventCustomizationForm.js
'use client';

import { useState } from 'react';
import ThemeSelector from '@/components/ThemeSelector';
import CoverSelector from '@/components/CoverSelector';
import WelcomeMessageInput from '@/components/WelcomeMessageInput';
import api from '@/lib/api';
import s from '@/styles/eventCustomizationForm.module.scss';

export default function EventCustomizationForm({
  eventId,
  initialData = {},
  onSave,
  onCancel,
}) {
  const [form, setForm] = useState({
    theme: initialData.theme || 'minimal',
    cover: initialData.cover || { type: 'gradient', value: 'minimal_default' },
    custom_message: initialData.custom_message || '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCoverChange = (newCover) => {
    setForm((prev) => ({ ...prev, cover: newCover }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // If cover is image type, upload first
      let coverValue = form.cover.value;

      if (form.cover.type === 'image' && form.cover.file) {
        const uploadData = new FormData();
        uploadData.append('file', form.cover.file);

        const { data: uploadResponse } = await api.post(
          `/events/${eventId}/cover-image`,
          uploadData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        coverValue = uploadResponse.cover_value;
      }

      // Update event
      await api.patch(`/events/${eventId}`, {
        theme: form.theme,
        cover_type: form.cover.type,
        cover_value: coverValue,
        custom_message: form.custom_message || null,
      });

      onSave?.();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save customization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={s.form} onSubmit={handleSubmit}>
      <div className={s.section}>
        <ThemeSelector
          value={form.theme}
          onChange={(theme) => setForm((prev) => ({ ...prev, theme }))}
        />
      </div>

      <div className={s.section}>
        <CoverSelector
          theme={form.theme}
          value={form.cover}
          onCoverChange={handleCoverChange}
        />
      </div>

      <div className={s.section}>
        <WelcomeMessageInput
          value={form.custom_message}
          onChange={(message) => setForm((prev) => ({ ...prev, custom_message: message }))}
        />
      </div>

      {error && <p className={s.error}>{error}</p>}

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
          type="submit"
          className={s.primary}
          disabled={loading}
        >
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Create styles**

```scss
// frontend/styles/eventCustomizationForm.module.scss
.form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section {
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  background: #fafafa;
}

.error {
  padding: 0.75rem;
  background-color: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  border-radius: 0.375rem;
  color: #dc3545;
  font-size: 0.875rem;
  margin: 0;
}

.actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.primary,
.secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.primary {
  background: #333;
  color: white;

  &:not(:disabled):hover {
    background: #555;
  }
}

.secondary {
  background: #e0e0e0;
  color: #333;

  &:not(:disabled):hover {
    background: #d0d0d0;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/components/EventCustomizationForm.js frontend/styles/eventCustomizationForm.module.scss
git commit -m "feat: add EventCustomizationForm combining theme, cover, and message"
```

---

### Task 13: Create CustomizationSummary Component

**Files:**
- Create: `frontend/components/CustomizationSummary.js`
- Create: `frontend/styles/customizationSummary.module.scss`

- [ ] **Step 1: Create component**

```javascript
// frontend/components/CustomizationSummary.js
'use client';

import { THEMES } from '@/lib/themeConstants';
import s from '@/styles/customizationSummary.module.scss';

export default function CustomizationSummary({ data = {} }) {
  const theme = THEMES[data.theme] || THEMES.minimal;
  const coverPreview = data.cover_type === 'image'
    ? data.cover_value
    : THEMES[data.theme]?.gradients?.default;

  return (
    <div className={s.card}>
      <div className={s.header}>
        <h3 className={s.title}>🎨 Personnalisation</h3>
      </div>

      <div className={s.content}>
        <div className={s.row}>
          <span className={s.label}>Thème:</span>
          <span className={s.value}>{theme.name}</span>
        </div>

        <div className={s.row}>
          <span className={s.label}>Couverture:</span>
          <div className={s.coverPreview} style={{ background: coverPreview }} />
        </div>

        {data.custom_message && (
          <div className={s.row}>
            <span className={s.label}>Message:</span>
            <span className={s.messageTruncated} title={data.custom_message}>
              "{data.custom_message}"
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create styles**

```scss
// frontend/styles/customizationSummary.module.scss
.card {
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  background: #f9f9f9;
}

.header {
  margin-bottom: 1rem;
}

.title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.row {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.9rem;
}

.label {
  font-weight: 600;
  min-width: 80px;
  color: #666;
}

.value {
  color: #333;
}

.coverPreview {
  width: 100%;
  max-width: 150px;
  height: 75px;
  border-radius: 0.375rem;
  border: 1px solid #ddd;
}

.messageTruncated {
  color: #666;
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/components/CustomizationSummary.js frontend/styles/customizationSummary.module.scss
git commit -m "feat: add CustomizationSummary component for dashboard"
```

---

## Phase 6: Frontend Pages - Event Creation

### Task 14: Update Event Creation Page

**Files:**
- Modify: `frontend/app/dashboard/create/page.js`

- [ ] **Step 1: Read current creation page**

Read to understand current structure and flow.

- [ ] **Step 2: Update page to add customization step**

Update the page to include a 4-step flow:

```javascript
// frontend/app/dashboard/create/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import EventTypeSelector from '@/components/EventTypeSelector';
import BulkGuestImporter from '@/components/BulkGuestImporter';
import EventCustomizationForm from '@/components/EventCustomizationForm';
import s from '@/styles/create.module.scss';

const STEPS = ['details', 'guests', 'customize', 'review'];

export default function CreateEventPage() {
  const router = useRouter();
  const [step, setStep] = useState('details');
  const [form, setForm] = useState({
    title: '',
    date: '',
    location: '',
    description: '',
    event_type: 'private',
  });
  const [customization, setCustomization] = useState({
    theme: 'minimal',
    cover: { type: 'gradient', value: 'minimal_default' },
    custom_message: '',
  });
  const [showBulkImporter, setShowBulkImporter] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleNext = () => {
    setError('');
    const stepIndex = STEPS.indexOf(step);
    if (stepIndex < STEPS.length - 1) {
      setStep(STEPS[stepIndex + 1]);
    }
  };

  const handleSkipCustomize = () => {
    // Use defaults
    setCustomization({
      theme: 'minimal',
      cover: { type: 'gradient', value: 'minimal_default' },
      custom_message: '',
    });
    setStep('review');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Upload cover image if provided
      let coverValue = customization.cover.value;

      const eventData = {
        ...form,
        theme: customization.theme,
        cover_type: customization.cover.type,
        cover_value: coverValue,
        custom_message: customization.custom_message || null,
      };

      const { data } = await api.post('/events', eventData);
      
      // If image was selected, upload it after event creation
      if (customization.cover.type === 'image' && customization.cover.file) {
        const uploadData = new FormData();
        uploadData.append('file', customization.cover.file);

        const uploadRes = await api.post(`/events/${data.id}/cover-image`, uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        // Update event with uploaded image URL
        await api.patch(`/events/${data.id}`, {
          cover_value: uploadRes.data.cover_value,
        });
      }

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

      {/* Step 1: Basic Details */}
      {step === 'details' && (
        <form className={s.form} onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
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

          <button className={s.btn} type="submit">
            Suivant
          </button>
        </form>
      )}

      {/* Step 2: Guest List or Event Type */}
      {step === 'guests' && (
        <div className={s.form}>
          <EventTypeSelector
            value={form.event_type}
            onChange={(value) => setForm({ ...form, event_type: value })}
          />

          {form.event_type === 'private' && (
            <div className={s.guestSection}>
              <h2>Ajouter des invités</h2>
              {!showBulkImporter ? (
                <button
                  className={s.btn}
                  onClick={() => setShowBulkImporter(true)}
                  type="button"
                >
                  + Ajouter des invités
                </button>
              ) : (
                <BulkGuestImporter
                  onImport={() => handleNext()}
                  onCancel={() => setShowBulkImporter(false)}
                />
              )}
            </div>
          )}

          {error && <p className={s.error}>{error}</p>}

          <div className={s.actions}>
            <button className={s.secondary} onClick={() => setStep('details')} type="button">
              ← Précédent
            </button>
            <button className={s.btn} onClick={handleNext} type="button">
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Customization */}
      {step === 'customize' && (
        <div className={s.customizeSection}>
          <p className={s.hint}>Personnalisez votre événement</p>
          <EventCustomizationForm
            eventId={null}
            initialData={customization}
            onSave={handleNext}
            onCancel={() => {}}
          />
          <button
            className={s.skipBtn}
            onClick={handleSkipCustomize}
            type="button"
          >
            Personnaliser plus tard
          </button>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 'review' && (
        <form className={s.form} onSubmit={handleSubmit}>
          <div className={s.reviewSection}>
            <h2>Résumé</h2>
            <p><strong>Titre:</strong> {form.title}</p>
            <p><strong>Date:</strong> {new Date(form.date).toLocaleString('fr-FR')}</p>
            <p><strong>Lieu:</strong> {form.location}</p>
            <p><strong>Type:</strong> {form.event_type === 'private' ? 'Privé' : 'Ouvert'}</p>
            <p><strong>Thème:</strong> {customization.theme}</p>
            {customization.custom_message && (
              <p><strong>Message:</strong> "{customization.custom_message}"</p>
            )}
          </div>

          {error && <p className={s.error}>{error}</p>}

          <div className={s.actions}>
            <button className={s.secondary} onClick={() => setStep('customize')} type="button">
              ← Précédent
            </button>
            <button className={s.btn} type="submit" disabled={loading}>
              {loading ? 'Création...' : "Créer l'événement"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Add CSS for new sections**

Update `frontend/styles/create.module.scss` to include:

```scss
// Add to create.module.scss

.customizeSection {
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  background: white;
}

.hint {
  font-size: 0.875rem;
  color: #666;
  margin-top: 0 0 1rem 0;
}

.skipBtn {
  display: block;
  margin-top: 1.5rem;
  width: 100%;
  padding: 0.75rem;
  border: 2px dashed #ccc;
  background: transparent;
  color: #666;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #333;
    color: #333;
  }
}

.reviewSection {
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  background: #f9f9f9;
  margin-bottom: 1.5rem;

  h2 {
    margin-top: 0;
  }

  p {
    margin: 0.5rem 0;
    font-size: 0.95rem;
  }
}

.actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.secondary {
  padding: 0.75rem 1.5rem;
  background: #e0e0e0;
  color: #333;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #d0d0d0;
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/app/dashboard/create/page.js frontend/styles/create.module.scss
git commit -m "feat: update event creation flow to include customization step with skip option"
```

---

## Phase 7: Frontend Pages - Dashboard

### Task 15: Update Event Detail Page - Add Customization Section

**Files:**
- Modify: `frontend/app/dashboard/[id]/page.js`
- Modify: `frontend/styles/eventDetail.module.scss`

- [ ] **Step 1: Read current event detail page**

Understand the existing dashboard structure.

- [ ] **Step 2: Add customization section to dashboard**

```javascript
// In frontend/app/dashboard/[id]/page.js, add after the hero section:

import CustomizationSummary from '@/components/CustomizationSummary';

export default function EventDetailPage({ params }) {
  // ... existing code ...
  const [showCustomizeForm, setShowCustomizeForm] = useState(false);

  // ... inside return JSX, after sharePanel and before statsGrid:

  <section className={s.customizeSection}>
    {!showCustomizeForm ? (
      <div className={s.customizeHeader}>
        <CustomizationSummary data={{
          theme: event.theme,
          cover_type: event.cover_type,
          cover_value: event.cover_value,
          custom_message: event.custom_message,
        }} />
        <button
          className={s.editCustomizeBtn}
          onClick={() => setShowCustomizeForm(true)}
          type="button"
        >
          Modifier la personnalisation
        </button>
      </div>
    ) : (
      <EventCustomizationForm
        eventId={id}
        initialData={{
          theme: event.theme,
          cover: {
            type: event.cover_type,
            value: event.cover_value,
          },
          custom_message: event.custom_message,
        }}
        onSave={() => {
          setShowCustomizeForm(false);
          // Reload event data
          api.get(`/events/${id}`).then(({ data }) => {
            setEvent(data);
          });
        }}
        onCancel={() => setShowCustomizeForm(false)}
      />
    )}
  </section>
```

- [ ] **Step 3: Add styles**

```scss
// Add to frontend/styles/eventDetail.module.scss

.customizeSection {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e0e0e0;
}

.customizeHeader {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.editCustomizeBtn {
  align-self: flex-start;
  padding: 0.75rem 1.5rem;
  background: #333;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #555;
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/app/dashboard/[id]/page.js frontend/styles/eventDetail.module.scss
git commit -m "feat: add customization section to event dashboard with edit form"
```

---

## Phase 8: Frontend Pages - Guest Invite

### Task 16: Update Invite Page - Apply Theme Styling & Display Cover & Message

**Files:**
- Modify: `frontend/app/invite/[slug]/page.js`
- Modify: `frontend/styles/invite.module.scss`

- [ ] **Step 1: Update invite page to apply theme styling and display cover**

```javascript
// In frontend/app/invite/[slug]/page.js

import { THEMES } from '@/lib/themeConstants';

export default function InvitePage({ params }) {
  // ... existing code ...

  const themeColors = THEMES[event?.theme] || THEMES.minimal;
  const coverStyle = event?.cover_type === 'image'
    ? { backgroundImage: `url(${event.cover_value})` }
    : { background: THEMES[event?.theme]?.gradients?.default || THEMES.minimal.gradients.default };

  return (
    <main className={s.page} style={{ '--theme-primary': themeColors.primary } as React.CSSProperties}>
      {/* Hero with Cover */}
      <section className={s.hero} style={coverStyle}>
        {event && (
          <div className={s.heroContent}>
            <p className={s.kicker}>Invitation</p>
            <h1 className={s.title}>{event.title}</h1>
            <div className={s.meta}>
              <span>{formattedDate}</span>
              <span>{event.location}</span>
            </div>
            {event.description && <p className={s.description}>{event.description}</p>}
          </div>
        )}
      </section>

      {/* Custom Welcome Message */}
      {event?.custom_message && (
        <section className={s.messageSection}>
          <p className={s.customMessage}>{event.custom_message}</p>
        </section>
      )}

      {/* ... rest of form sections ... */}
    </main>
  );
}
```

- [ ] **Step 2: Update invite page styles for theme support**

```scss
// Update frontend/styles/invite.module.scss

.page {
  // Set primary color as CSS variable for theming
  --theme-primary: #333;
}

.hero {
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  height: 250px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  margin-bottom: 2rem;

  @media (max-width: 640px) {
    height: 200px;
  }
}

.heroContent {
  text-align: center;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  padding: 0 1rem;
}

.kicker {
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin: 0 0 0.5rem 0;
  opacity: 0.9;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0.5rem 0;
  line-height: 1.1;

  @media (max-width: 640px) {
    font-size: 1.75rem;
  }
}

.meta {
  font-size: 1rem;
  opacity: 0.9;
  margin: 1rem 0;

  span {
    display: inline;
    margin: 0 1rem;

    &:not(:last-child)::after {
      content: ' · ';
    }
  }
}

.description {
  font-size: 1rem;
  opacity: 0.9;
  margin: 1rem 0 0 0;
}

.messageSection {
  padding: 1.5rem;
  background: rgba(var(--theme-primary-rgb, 0, 0, 0), 0.02);
  border-left: 4px solid var(--theme-primary, #333);
  margin-bottom: 2rem;
  border-radius: 0.375rem;
}

.customMessage {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--theme-primary, #333);
  margin: 0;
  line-height: 1.6;
}

// Update button styling to use theme primary
.primaryBtn {
  background-color: var(--theme-primary, #333);

  &:hover {
    filter: brightness(0.9);
  }
}

.optionBtn {
  border-color: var(--theme-primary, #333);
  color: var(--theme-primary, #333);

  &.active {
    background-color: var(--theme-primary, #333);
    color: white;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/app/invite/[slug]/page.js frontend/styles/invite.module.scss
git commit -m "feat: apply theme styling to invite page and display cover + custom message"
```

---

## Phase 9: Testing

### Task 17: End-to-End Testing

**No code changes, verification only**

- [ ] **Test 1: Create event with all customization fields**
  1. Navigate to `/dashboard/create`
  2. Fill basic details
  3. Choose event type (private)
  4. Skip guest import
  5. Select theme (e.g., Birthday)
  6. Keep default cover or upload custom image
  7. Add custom message
  8. Submit
  
Expected: Event created with all customization fields stored correctly.

- [ ] **Test 2: Verify guest invite page shows theme styling**
  1. Share event invite link
  2. Open in browser
  3. Verify cover image/gradient displays
  4. Verify custom message appears
  5. Verify theme colors apply to buttons
  
Expected: All styling matches theme. Cover is full-width responsive. Message is readable.

- [ ] **Test 3: Edit customization from dashboard**
  1. Open event dashboard
  2. Click "Modifier la personnalisation"
  3. Change theme
  4. Upload new cover image
  5. Update message
  6. Save
  
Expected: All changes saved. Dashboard reflects updates immediately. Invite page reflects changes.

- [ ] **Test 4: Test image upload validation**
  1. Try uploading file > 5MB → should error
  2. Try uploading GIF → should error
  3. Try uploading small image < 800x400px → should error
  4. Upload valid JPG → should succeed
  
Expected: Proper error messages. Valid image uploads work.

- [ ] **Test 5: Test skip customization**
  1. Create event and choose "Personnaliser plus tard"
  2. Event should be created with theme='minimal'
  3. Verify event displays with minimal theme
  4. Edit customization later
  
Expected: Skip works. Defaults apply. Can edit anytime.

- [ ] **Test 6: Mobile responsiveness**
  1. Create event on mobile
  2. Verify theme selector stacks vertically
  3. Verify cover selector tabs work
  4. Verify invite page displays correctly
  
Expected: No layout breaks. Touch interactions work.

- [ ] **Document Testing Results**

If any issues found, document and fix before final commit.

- [ ] **Final Commit**

```bash
git add .
git commit -m "test: verify end-to-end customization functionality"
```

---

## Summary

| Phase | Tasks | Impact |
|-------|-------|--------|
| 1 | Database migration + Event model | Schema ready, model updated |
| 2 | Image processor utility | Backend can process/validate images |
| 3 | API endpoints (create, patch, upload) | Backend ready for customization |
| 4 | Theme constants + image validator | Frontend utilities ready |
| 5 | 5 new components (theme, cover, message, form, summary) | Components ready for use |
| 6 | Event creation page (4 steps with skip) | Hosts can customize during creation |
| 7 | Dashboard customization section | Hosts can edit customization anytime |
| 8 | Guest invite page theming | Guests see beautiful, themed invite pages |
| 9 | Testing | All functionality verified |

---

**Total commits:** ~20 (one per meaningful task)

**Total new files:** ~15 (components, styles, utilities)

**Total modified files:** ~8 (pages, controllers, routes, styles)

Ready for implementation.

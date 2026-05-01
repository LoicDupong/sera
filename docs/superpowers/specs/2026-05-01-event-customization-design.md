# Event Customization Design — May 1, 2026

## Overview

Add aesthetic and thematic event customization to Sera, allowing hosts to make their events feel branded and premium without complexity. The system is built on **pure presets**: hosts pick a theme (which locks colors & aesthetics), optionally upload a cover image, add a welcome message, and are done. No design decisions beyond choosing from curated options.

**Goal:** Transform Sera from "event RSVP tool" into "stylish private event experience platform."

---

## MVP Scope

**In MVP:**
- Event themes (8 curated presets)
- Custom cover / hero section (default gradient | custom image | alt gradient)
- Custom welcome message (plain text, max 160 chars, optional)
- Theme-locked color palettes (no separate customization)

**Out of MVP (post-MVP):**
- Countdown timer
- Dress code / special badges
- Custom color picker
- Animated covers
- Premium themes

---

## 1. Database Schema Changes

Add 4 columns to the `events` table:

```sql
ALTER TABLE events ADD COLUMN theme VARCHAR(50) NOT NULL DEFAULT 'minimal';
ALTER TABLE events ADD COLUMN cover_type VARCHAR(20) NOT NULL DEFAULT 'gradient';
ALTER TABLE events ADD COLUMN cover_value TEXT NULL;
ALTER TABLE events ADD COLUMN custom_message VARCHAR(160) NULL;
```

**Field Details:**

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `theme` | VARCHAR(50) | NOT NULL, DEFAULT 'minimal' | Enum: birthday, wedding, baby_shower, bbq, house_party, chill_night, corporate, minimal |
| `cover_type` | VARCHAR(20) | NOT NULL, DEFAULT 'gradient' | Enum: gradient \| image |
| `cover_value` | TEXT | NULL | If gradient: preset name (e.g., 'sunset_purple'). If image: URL/path. |
| `custom_message` | VARCHAR(160) | NULL | Host's personalized invitation message (plain text + emojis). |

**Update Event Model:**
Add these 4 fields to `backend/src/models/Event.js` with appropriate Sequelize types and validations.

---

## 2. Theme System

Each theme is a **preset design** with locked aesthetics. No customization beyond picking the theme.

### Theme Catalog (8 presets)

| Theme | Use Case | Vibe | Default Gradient | Primary Color | Icon Style |
|-------|----------|------|-----------------|---------------|-----------| 
| birthday | Birthday parties | Fun, colorful | pink → lavender | #ff69b4 (hot pink) | Outlined |
| wedding | Weddings, formal | Elegant, muted | champagne → rose gold | #d4a574 (rose gold) | Elegant serif |
| baby_shower | Baby showers | Soft, playful | soft blue → mint | #87ceeb (sky blue) | Outlined rounded |
| bbq | BBQs, outdoor | Warm, rustic | warm orange → amber | #ff8c42 (warm orange) | Bold |
| house_party | House parties, casual | Vibrant, fun | vibrant purple → pink | #da70d6 (orchid) | Filled playful |
| chill_night | Relaxed gatherings | Cool, zen | deep blue → teal | #2c5aa0 (deep blue) | Minimalist |
| corporate | Professional events | Polished, minimal | dark slate → charcoal | #2c3e50 (slate) | Outlined clean |
| minimal | Timeless, flexible | Clean, neutral | light gray → white | #333 (dark gray) | Minimalist |

### Theme Composition

Each theme includes:
- **Primary color** — used for CTAs, links, highlights
- **Secondary color** — used for accents, badges, hover states
- **Text colors** — primary text, secondary text (muted)
- **Border/divider color** — subtle lines, separators
- **Background color** — subtle background tint (almost white but theme-tinted)
- **2-3 gradient presets** — for cover/hero section (default + 2 alternatives)
- **Icon set** — outlined, filled, or minimalist style
- **Typography settings** — font weight, letter spacing, line height (subtle per theme)

### Implementation: SCSS Theme Variables

Store each theme as SCSS partial:

```scss
// frontend/styles/themes/_birthday.scss
$birthday-primary: #ff69b4;
$birthday-secondary: #ffd700;
$birthday-accent: #ff1493;
$birthday-text: #333;
$birthday-text-muted: #666;
$birthday-border: #ffe4e1;
$birthday-bg: #fff8f9;

// Gradients
$birthday-gradient-default: linear-gradient(135deg, #ff69b4 0%, #e6b3ff 100%);
$birthday-gradient-alt1: linear-gradient(135deg, #ffb3d9 0%, #ffd700 100%);
$birthday-gradient-alt2: linear-gradient(135deg, #ff1493 0%, #ff69b4 100%);
```

Apply via CSS classes or inline styles on guest-facing pages.

---

## 3. Cover / Hero Section

The cover is the visual hero background displayed on:
- Guest invite page (top of event details)
- Event detail page (dashboard, top of hero)
- Event list preview (optional thumbnail)

### Host Options

**Option A: Use theme's default gradient (no action required)**
- Theme automatically includes a beautiful default gradient
- Host doesn't need to do anything
- Example: Birthday theme = soft pink → lavender gradient

**Option B: Upload custom image**
- Host uploads a JPG/PNG file (max 5MB)
- Server validates format and dimensions (min 800x400px)
- Server resizes/optimizes to 1200x600px (16:9 aspect ratio)
- Image stored in `/public/uploads/covers/{event_id}.jpg`
- Cloudinary CDN optional for optimization + caching

**Option C: Pick a theme-specific alternative gradient**
- Each theme has 2-3 gradient options beyond the default
- Host can choose from theme-specific variations
- Example: Birthday theme offers 3 gradient options
- No external images, fast loading

### Data Model

```
cover_type: 'gradient' | 'image'

If gradient:
  cover_value: 'birthday_default' | 'birthday_alt1' | 'birthday_alt2'

If image:
  cover_value: 'https://cdn.app.com/covers/event-abc123.jpg'
  (or local: '/uploads/covers/event-abc123.jpg')
```

### Fallback & Error Handling

- If image fails to load → show theme's default gradient
- If cover_value is invalid → default to theme's default gradient
- Always have a valid cover (never blank)

---

## 4. Custom Welcome Message

**Scope:**
- Plain text only (no HTML, markdown, or rich formatting)
- Emoji support (UTF-8)
- Max 160 characters
- Optional field (no default message required)

**Display:**
- Shown on guest invite page below event title/meta
- Positioned between event details and identity form

**Example:**
```
🎉 Birthday Party
May 15, 2026 · 19:00 · Paris

✨ Prépare-toi pour une soirée inoubliable 🎉

[Identity form below]
```

**Validation:**
- Trim whitespace (leading/trailing)
- Reject HTML tags (escape < > & if needed)
- Emoji are allowed
- Max 160 chars enforced on frontend + backend

---

## 5. Event Creation Flow

**Existing flow (1-2 steps):**
1. Basic details
2. Guest list or open event settings

**New flow (4 steps):**
1. **Basic details** (title, date, location, description)
2. **Guest list** (private: manual add or bulk import; open: skip)
3. **Customization** ← NEW
   - Theme selector (8 cards/radio buttons)
   - Cover section (default | upload image | alt gradient)
   - Welcome message input (optional)
   - **"Skip customization"** button → goes to Review
   - **"Next"** button → goes to Review & publish
4. **Review & publish** (summary of all details)

### "Skip Customization" UX

- If skipped, event created with:
  - `theme = 'minimal'` (safe, neutral default)
  - `cover_type = 'gradient'`, `cover_value = 'minimal_default'`
  - `custom_message = null`
- Clear messaging: *"You can customize your event anytime from your dashboard"*
- Host can edit customization later without penalty

---

## 6. Dashboard Event Detail Page

### New "Customize" Section

Add a new section on the event detail page (separate card/section):

```
┌──────────────────────────────────┐
│ 🎨 Customize Event               │
├──────────────────────────────────┤
│ Theme:     Birthday              │
│ Cover:     [Default gradient]     │
│ Message:   "Prépare-toi pour..." │
│                                  │
│ [Edit Customization]             │
└──────────────────────────────────┘
```

### Edit Customization

**Clicking "Edit Customization":**
- Opens inline expandable form (card-based) OR modal dialog
- Same form as event creation step 3
- All 3 fields: theme, cover, message
- **"Save" button** → saves and closes form, shows confirmation
- **"Cancel" button** → discards changes and closes form
- Confirmation toast: *"Customization updated"*

**Design principle:** Keep dashboard clean; customization is a collapsible section.

---

## 7. Guest-Facing Pages

### Invite Page (`/invite/[slug]`)

**Structure:**
```
┌────────────────────────────────────┐
│ [COVER: Theme gradient or image]   │ ← Full-width hero
├────────────────────────────────────┤
│ 🎉 Birthday Party                  │
│ May 15, 2026 · 19:00 · Paris       │
│                                    │
│ ✨ Prépare-toi pour une soirée...  │ ← Custom message (if set)
│                                    │
│ --- IDENTITY FORM ---              │
│ Prénom: [input]                    │
│ Nom:    [input]                    │
│ [Continuer]                        │
│                                    │
│ --- RSVP SECTION (after verify) --- │
│ [Oui] [Peut-être] [Non]            │
│ [Confirmer ma réponse]             │
│                                    │
│ --- CONFIRMATION (after RSVP) ---  │
│ Merci, [Prénom]                    │
│ Ta réponse est bien enregistrée.   │
└────────────────────────────────────┘
```

**Styling:**
- Hero cover is full-width, responsive
- Event title + meta + custom message inherit theme colors
- Buttons (CTAs) use theme primary color
- Form inputs use theme border/text colors
- RSVP option buttons use theme colors for active state

---

## 8. Frontend Components

### New Components

**1. ThemeSelector.js**
- Display 8 theme options as cards or radio buttons
- Each card shows:
  - Theme name
  - 2-3 color swatches (primary, secondary, accent)
  - Simple icon or emoji representing the theme
- Single-select (radio group)
- Clear active state

**2. CoverSelector.js**
- 3 tabs or grouped options:
  - **Tab 1: Default Gradient** — shows preview of theme's default gradient, "Use this" button
  - **Tab 2: Upload Image** — file input, drag-drop zone, preview after upload
  - **Tab 3: Alternative Gradients** — grid of 2-3 gradient presets specific to chosen theme
- Image upload validation (size, format, dimensions)
- Error messages for invalid uploads
- Preview thumbnail after selection

**3. WelcomeMessageInput.js**
- Simple text input or small textarea
- Placeholder: *"Add a personal message... (optional)"*
- Character counter: *"0/160"*
- Real-time validation (reject if > 160)
- No required field marker

**4. EventCustomizationForm.js**
- Combines all three components above
- Form layout: theme → cover → message (vertical stack)
- **"Save" button** (primary, blue)
- **"Cancel" button** (secondary, gray)
- Error handling for API failures
- Loading state during save

**5. CustomizationSummary.js** (for dashboard)
- Compact card showing current customization
- Shows: theme name, cover preview (thumbnail), message preview (truncated)
- Used in the dashboard "Customize" section header

---

## 9. API Endpoints

### Event Creation / Update

**POST /events** (existing, extended)
```json
{
  "title": "Birthday Party",
  "date": "2026-05-15T19:00:00",
  "location": "Paris",
  "description": "...",
  "event_type": "private",
  "theme": "birthday",
  "cover_type": "gradient",
  "cover_value": "birthday_default",
  "custom_message": "Prépare-toi pour une soirée inoubliable 🎉"
}
```

**PATCH /events/:id** (update event, including customization)
```json
{
  "theme": "wedding",
  "cover_type": "image",
  "cover_value": "https://cdn.app.com/covers/event-abc123.jpg",
  "custom_message": "We can't wait to celebrate with you!"
}
```

### Image Upload

**POST /events/:id/cover-image**
- Multipart file upload
- Max 5MB, format: JPG/PNG/WebP
- Server validates, resizes to 1200x600px
- Returns:
  ```json
  {
    "cover_value": "https://cdn.app.com/covers/event-abc123.jpg",
    "success": true
  }
  ```

### Get Event (with customization)

**GET /events/:id**
- Response includes all customization fields:
  ```json
  {
    "id": "...",
    "title": "Birthday Party",
    "theme": "birthday",
    "cover_type": "gradient",
    "cover_value": "birthday_default",
    "custom_message": "Prépare-toi...",
    "guests": [...]
  }
  ```

---

## 10. Validation & Constraints

### Theme Validation
- Must be one of 8 valid enum values
- Default fallback: 'minimal'
- Case-insensitive or normalize on backend

### Cover Image Validation
- File format: JPG, PNG, WebP only
- Max file size: 5MB
- Min dimensions: 800x400px
- Server resizes to 1200x600px (16:9 aspect ratio)
- Filename sanitization (no special chars)

### Cover Gradient Validation
- Must be a valid preset for the chosen theme
- Pattern: `{theme_name}_{variant}` (e.g., 'birthday_default', 'birthday_alt1')
- If invalid, fallback to theme's default gradient

### Custom Message Validation
- Max 160 characters (enforced on frontend + backend)
- Escape HTML tags (< > & " ')
- Trim whitespace
- Emoji allowed (UTF-8)
- No line breaks (optional: allow 1 newline?)

---

## 11. Styling & Theme Application

### Theme as CSS Variables

Each theme exports a set of CSS custom properties:

```scss
:root[data-theme="birthday"] {
  --theme-primary: #ff69b4;
  --theme-secondary: #ffd700;
  --theme-accent: #ff1493;
  --theme-text: #333;
  --theme-text-muted: #666;
  --theme-border: #ffe4e1;
  --theme-bg: #fff8f9;
}
```

### Applied to Components

- **Buttons (CTA):** `background-color: var(--theme-primary)`
- **Links:** `color: var(--theme-primary)`, hover: darken
- **Borders:** `border-color: var(--theme-border)`
- **Badges (RSVP status):** `background-color` varies by status + theme
- **Form inputs:** `border-color: var(--theme-border)`, focus: `var(--theme-primary)`
- **Text:** `color: var(--theme-text)` for primary, `var(--theme-text-muted)` for secondary

### Guest-Facing Pages

- Set `data-theme="{theme_name}"` on root `<html>` element
- All theme colors cascade via CSS custom properties
- Hero cover image/gradient applied to hero section background
- Fallback: If theme data missing, use 'minimal' theme

---

## 12. Mobile Considerations

- **Theme selector:** Stack as single-column list on mobile, 2-3 columns on desktop
- **Cover options:** Tabs/collapsible sections, not side-by-side
- **Image upload:** Full-screen file picker or modal dialog
- **Cover preview:** Responsive thumbnail (full-width on mobile)
- **Form inputs:** Full-width on mobile, stacked vertically
- **Customization panel:** Collapsible on mobile to save vertical space

---

## 13. Performance & Optimization

- **Image optimization:** Server resizes to 1200x600px, compress JPG (80% quality)
- **Lazy loading:** Cover images lazy-load on guest pages
- **CSS-in-JS:** Use CSS modules or SCSS to avoid theme bloat
- **Theme variables:** Pre-compile CSS, not runtime calculation
- **Caching:** Cover images cached on CDN (1-year expiry)

---

## 14. Future Extensibility

The design allows these post-MVP features without major restructuring:

**Theme Expansion:**
- Add more themes (seasonal, cultural, niche)
- Add premium themes (paid feature)

**Cover Enhancement:**
- Custom color overlay on images
- Background blur/filters
- Video cover support (expand `cover_type`)

**Message Enhancement:**
- Add personalization tokens: `{guest_name}`, `{host_name}`, `{event_title}`
- Support emoji reactions in message

**Color Customization:**
- Add `theme_custom_colors` JSON field (per-event color overrides)
- Custom color picker (post-MVP)

**Dress Code & Badges:**
- Add `dress_code` field
- Display as badge on invite page

**Countdown Timer:**
- Add `countdown_enabled` boolean
- Display days/hours remaining on invite page

---

## 15. Security & Data Privacy

- **Image upload:** Validate file type (magic bytes, not just extension)
- **Path traversal:** Sanitize uploaded filenames (UUID-based naming)
- **CORS:** Serve images from same domain or whitelisted CDN
- **XSS:** Escape custom_message when rendering (no HTML)
- **Rate limiting:** Limit image uploads (e.g., 1 per 10 seconds per user)

---

## Summary of Changes

| Component | Change | Impact |
|-----------|--------|--------|
| Database | Add 4 columns to events table | Schema migration required |
| Event model | Add 4 fields (theme, cover_type, cover_value, custom_message) | Update Sequelize definition |
| API | Extend POST /events and PATCH /events/:id | New optional parameters |
| API | Add POST /events/:id/cover-image | Image upload endpoint |
| Frontend | Create 4 new components | ThemeSelector, CoverSelector, etc. |
| Frontend | Update event creation page (step 3) | Add customization form with skip option |
| Frontend | Update event detail dashboard | Add customization card + edit form |
| Frontend | Update invite page | Apply theme styling, display cover + message |
| Styling | Create theme SCSS partials | 8 theme files with color variables |
| Frontend | Update root layout or HTML | Set `data-theme` attribute based on event |

---

## Acceptance Criteria

✓ Hosts can select from 8 curated themes during event creation  
✓ Hosts can skip customization and customize later from dashboard  
✓ Hosts can upload a custom cover image (5MB max, auto-resized)  
✓ Hosts can pick alternative gradient for cover (theme-specific)  
✓ Hosts can add a custom welcome message (max 160 chars, emoji support)  
✓ Theme colors apply to all guest-facing pages (buttons, borders, text)  
✓ Cover image/gradient displays correctly on mobile  
✓ Fallback to theme gradient if image fails to load  
✓ Dashboard shows customization summary with "Edit" option  
✓ Customization updates are saved immediately (no page refresh needed)  
✓ Private and open events both support customization  
✓ All customization fields are optional (sensible defaults apply)  

---

**Design approved and ready for implementation planning.**

# Focused UI Fixes: Selection State, Open Event RSVP, Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix event type selector active state visibility, integrate RSVP selection into the guest verification step for open events, and ensure the open event dashboard properly displays participant statuses without pending state.

**Architecture:** Three focused fixes applied independently:
1. **EventTypeSelector** SCSS: Add white border on active state
2. **Guest join flow** (/invite/[slug]/page.js): Modify verify step to include RSVP selection for open events
3. **Dashboard**: Already correctly filters pending state for open events via `hideStatuses` prop

**Tech Stack:** Next.js (App Router), JavaScript, SCSS, Zustand (for state), REST API

---

## File Structure

Files to modify:
- `frontend/styles/eventTypeSelector.module.scss` - Fix active border color
- `frontend/app/invite/[slug]/page.js` - Add RSVP selection to verify step for open events
- `frontend/styles/invite.module.scss` - Add styles for RSVP options in verify step

No new files needed. The OpenEventDashboard component already correctly uses `hideStatuses={['pending']}`.

---

## Task 1: Fix EventTypeSelector Active State Border

**Files:**
- Modify: `frontend/styles/eventTypeSelector.module.scss:35-38`

**Goal:** Add a clear white border to the `.active` state instead of the current dark border.

- [ ] **Step 1: Read current active state styling**

Current `.active` style (lines 35-38):
```scss
&.active {
  border-color: #333;
  background-color: rgba(0, 0, 0, 0.04);
}
```

- [ ] **Step 2: Update to white border**

Replace with white border:
```scss
&.active {
  border: 2px solid #ffffff;
  background-color: rgba(0, 0, 0, 0.04);
}
```

The key change: `border-color: #333` becomes `border: 2px solid #ffffff`. The border width matches the default `2px` from `.option`, ensuring consistent visual framing.

- [ ] **Step 3: Verify the change maintains design consistency**

Check that:
- The white border is visible against the background
- The 2px width matches the default `.option` border (line 25)
- Hover state still applies (line 30-32)

- [ ] **Step 4: Commit**

```bash
git add frontend/styles/eventTypeSelector.module.scss
git commit -m "fix: add white border to active event type selector"
```

---

## Task 2: Add RSVP Selection to Guest Verify Step for Open Events

**Files:**
- Modify: `frontend/app/invite/[slug]/page.js`
- Modify: `frontend/styles/invite.module.scss`

**Goal:** When a guest joins an open event, RSVP status selection happens during the name verification step, not after. Flow becomes: name + RSVP → confirmation (no separate RSVP step).

### Step 2.1: Prepare the logic

- [ ] **Step 1: Understand current flow**

Current state in `invite/[slug]/page.js`:
- Line 31: `[step, setStep]` tracks current step: `'verify'` → `'rsvp'` → `'done'`
- Line 30: `[selectedRsvp, setSelectedRsvp]` tracks RSVP choice
- Lines 65-92: `handleVerify()` calls `/invite/${slug}/verify` and sets step based on result
- Lines 94-114: `handleRsvp()` calls `/invite/${slug}/rsvp` and completes

New flow for open events:
- Guest enters name + selects RSVP in verify step
- Both are submitted together to `/invite/${slug}/verify` endpoint
- Step goes directly to 'done' if successful

### Step 2.2: Modify state handling

- [ ] **Step 2: Update handleVerify to include RSVP for open events**

Modify the `handleVerify` function (lines 65-92) to pass RSVP status:

```javascript
const handleVerify = async (e) => {
  e.preventDefault();
  setError('');
  setSubmitting(true);

  try {
    const payload = {
      ...identity,
      ...(event?.event_type === 'open' && { rsvp_status: selectedRsvp }),
    };

    const { data } = await api.post(`/invite/${slug}/verify`, payload);

    if (!data.found) {
      setError("On n'a pas retrouvé cette invitation. Vérifie le prénom et le nom indiqués par l'hôte.");
      return;
    }

    setGuest({ id: data.guest_id, rsvp_status: data.rsvp_status });
    setSelectedRsvp(data.rsvp_status === 'pending' ? '' : data.rsvp_status);

    // For open events: skip RSVP step and go directly to confirmation
    if (event?.event_type === 'open') {
      setStep('done');
    } else {
      setStep('rsvp');
    }
  } catch (err) {
    setError(err.response?.data?.error || "Impossible de vérifier l'invitation.");
  } finally {
    setSubmitting(false);
  }
};
```

Key changes:
- Line with `payload`: For open events, include `rsvp_status: selectedRsvp` in the request
- Conditional on line 82: Always skip rsvp step for open events (no need to check `data.rsvp_status`)

### Step 2.3: Update UI conditional rendering

- [ ] **Step 3: Render RSVP options in verify step for open events**

Modify the verify form (lines 148-189) to conditionally show RSVP options:

```javascript
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

    {event?.event_type === 'open' && (
      <>
        <div className={s.rsvpSection}>
          <p className={s.rsvpLabel}>Ta réponse</p>
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
        </div>
      </>
    )}

    {error && <p className={s.error}>{error}</p>}

    <button 
      className={s.primaryBtn} 
      type="submit" 
      disabled={submitting || (event?.event_type === 'open' && !selectedRsvp)}
    >
      {submitting ? 'Vérification...' : 'Continuer'}
    </button>
  </form>
)}
```

Key changes:
- New `<div className={s.rsvpSection}>` for open events (lines with `event?.event_type === 'open'`)
- RSVP options rendered using existing `RSVP_OPTIONS` constant
- Button disabled attribute: Added `(event?.event_type === 'open' && !selectedRsvp)` to require RSVP for open events

### Step 2.4: Add SCSS for the new section

- [ ] **Step 4: Add rsvpSection and rsvpLabel styles to invite.module.scss**

Append to `frontend/styles/invite.module.scss` after the `.options` definition (around line 111):

```scss
.rsvpSection {
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid var(--glass-border);
}

.rsvpLabel {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  margin-bottom: 10px;
  display: block;
}
```

These styles:
- Add visual separation between name fields and RSVP options
- Match the existing field label styling
- Use existing CSS variables for consistency

- [ ] **Step 5: Test the conditional rendering**

Verify:
- Private events: RSVP options do NOT appear in verify step (only after verification)
- Open events: RSVP options appear in verify step with the name fields
- Button is disabled if RSVP not selected for open events
- Button label is still "Continuer" for both event types

- [ ] **Step 6: Commit the changes**

```bash
git add frontend/app/invite/[slug]/page.js frontend/styles/invite.module.scss
git commit -m "feat: add RSVP selection to guest verify step for open events"
```

---

## Task 3: Verify Dashboard Correctly Filters Open Events

**Files:**
- No changes needed. Review only.

**Goal:** Confirm that the open event dashboard already correctly hides the pending state.

- [ ] **Step 1: Review OpenEventDashboard component**

The component at `frontend/components/OpenEventDashboard.js` already:
- Line 41: Passes `hideStatuses={['pending']}` to RsvpFilters
- Lines 7-10: STATS array includes only `yes`, `maybe`, `no` (no pending)
- No "En attente" label shown anywhere

- [ ] **Step 2: Review RsvpFilters implementation**

The component at `frontend/components/RsvpFilters.js`:
- Line 12: Filters tabs based on `hideStatuses` prop
- Line 3-9: TABS array includes all statuses, filtering happens at runtime

This is correct - the filter removes the pending tab from the UI for open events.

- [ ] **Step 3: Review dashboard conditional routing**

In `frontend/app/dashboard/[id]/page.js`:
- Lines 117-175: Conditional render based on `event.event_type`
- Open events use `OpenEventDashboard`
- Private events use the full stats with pending

No changes needed.

- [ ] **Step 4: Confirmation**

The dashboard already implements the requirement:
- ✓ Private events show: Présents, Peut-être, Absents, En attente
- ✓ Open events show: Présents, Peut-être, Absents (no pending)
- ✓ Stats cards reflect only relevant statuses per event type

---

## Verification Checklist

After implementing all tasks, verify:

- [ ] Event type selector shows white border when option is selected
- [ ] Private event flow unchanged: name entry → RSVP selection → confirmation
- [ ] Open event flow: name entry + RSVP selection (same step) → confirmation
- [ ] Open event guest cannot submit without selecting RSVP status
- [ ] Guest dashboard for open events shows no "En attente" filter or stats
- [ ] Guest dashboard for private events still shows "En attente"
- [ ] Mobile layout still works (responsive on <520px)
- [ ] No console errors or warnings

---

## Implementation Notes

### API Endpoint Compatibility

The `/invite/${slug}/verify` endpoint needs to handle the `rsvp_status` field in the payload for open events. Assuming the backend already supports this based on the existing codebase logic on line 82 of the invite page.

### State Management

No new state hooks needed - uses existing `selectedRsvp` and `step` variables. The conditional logic determines when RSVP is required vs optional.

### Styling

Reuses existing `.optionBtn` styles and CSS variables. New `.rsvpSection` and `.rsvpLabel` follow the pattern of existing field styling.

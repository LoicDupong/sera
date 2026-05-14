'use client';
import { useState } from 'react';
import s from '@/styles/eventDetail.module.scss';

const BADGE_LABELS = { yes: 'Oui', no: 'Non', maybe: 'Peut-être', pending: 'En attente' };
const RSVP_OPTIONS = ['yes', 'no', 'maybe', 'pending'];

export default function GuestItem({ guest, onDelete, onRsvpChange }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleRsvpSelect = async (e) => {
    const newStatus = e.target.value;
    if (newStatus === guest.rsvp_status) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onRsvpChange(guest.id, newStatus);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  };

  return (
    <div className={s.guestItem}>
      <span className={s.guestName}>{guest.first_name} {guest.last_name}</span>

      {editing ? (
        <select
          className={`${s.badge} ${s[guest.rsvp_status]} ${s.rsvpSelect}`}
          defaultValue={guest.rsvp_status}
          onChange={handleRsvpSelect}
          onBlur={() => setEditing(false)}
          disabled={saving}
          autoFocus
        >
          {RSVP_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{BADGE_LABELS[opt]}</option>
          ))}
        </select>
      ) : (
        <button
          type="button"
          className={`${s.badge} ${s[guest.rsvp_status]}${onRsvpChange ? ` ${s.badgeEditable}` : ''}`}
          onClick={() => onRsvpChange && setEditing(true)}
          title={onRsvpChange ? 'Modifier la réponse' : undefined}
        >
          {BADGE_LABELS[guest.rsvp_status] ?? guest.rsvp_status}
        </button>
      )}

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

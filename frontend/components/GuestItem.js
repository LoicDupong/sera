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

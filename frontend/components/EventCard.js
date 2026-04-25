import Link from 'next/link';
import s from '@/styles/dashboard.module.scss';

const ACCENTS = ['coral', 'gold', 'mint', 'violet'];

export default function EventCard({ event, accentIndex = 0 }) {
  const date = event.date
    ? new Date(event.date).toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Date à définir';

  const time = event.date
    ? new Date(event.date).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <Link href={`/dashboard/${event.id}`} className={`${s.card} ${s[ACCENTS[accentIndex % ACCENTS.length]]}`}>
      <div className={s.cardDate}>
        <span>{event.date ? new Date(event.date).getDate() : '--'}</span>
        <small>{event.date ? new Date(event.date).toLocaleDateString('fr-FR', { month: 'short' }) : ''}</small>
      </div>
      <div className={s.cardBody}>
        <h3 className={s.cardTitle}>{event.title}</h3>
        <p className={s.cardMeta}>{date}{time ? ` · ${time}` : ''}</p>
        {event.location && <p className={s.cardLocation}>{event.location}</p>}
      </div>
      <span className={s.cardArrow}>›</span>
    </Link>
  );
}

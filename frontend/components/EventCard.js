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

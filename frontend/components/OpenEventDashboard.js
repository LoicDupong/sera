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
      <div className={s.statsGrid}>
        {STATS.map((stat) => (
          <article key={stat.key} className={`${s.statCard} ${s[stat.key]}`}>
            <span className={s.statValue}>{counts[stat.key]}</span>
            <span className={s.statLabel}>{stat.label}</span>
          </article>
        ))}
      </div>
      <RsvpFilters active={filter} onChange={onFilterChange} hideStatuses={['pending']} />
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
    </section>
  );
}

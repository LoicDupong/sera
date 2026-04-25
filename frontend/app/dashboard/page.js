'use client';
import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import EventCard from '@/components/EventCard';
import useAuthStore from '@/store/authStore';
import s from '@/styles/dashboard.module.scss';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/events')
      .then(({ data }) => setEvents(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const upcoming = events.filter((event) => new Date(event.date) >= now).length;
    const nextEvent = [...events]
      .filter((event) => new Date(event.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

    return {
      total: events.length,
      upcoming,
      archived: Math.max(events.length - upcoming, 0),
      nextEvent,
    };
  }, [events]);

  return (
    <div className={s.page}>
      <section className={s.hero}>
        <div className={s.heroCopy}>
          <p className={s.kicker}>Sera host</p>
          <h1 className={s.heading}>Bonjour{user?.name ? ` ${user.name}` : ''}.</h1>
        </div>
        <Link href="/dashboard/create" className={s.primaryAction}>
          Créer un événement
        </Link>
      </section>

      <section className={s.statsGrid} aria-label="Résumé des événements">
        <article className={`${s.statCard} ${s.coral}`}>
          <span className={s.statValue}>{stats.total}</span>
          <span className={s.statLabel}>événement{stats.total !== 1 ? 's' : ''}</span>
        </article>
        <article className={`${s.statCard} ${s.mint}`}>
          <span className={s.statValue}>{stats.upcoming}</span>
          <span className={s.statLabel}>à venir</span>
        </article>
        <article className={`${s.statCard} ${s.violet}`}>
          <span className={s.statValue}>{stats.archived}</span>
          <span className={s.statLabel}>passé{stats.archived !== 1 ? 's' : ''}</span>
        </article>
      </section>

      {stats.nextEvent && (
        <section className={s.nextStrip}>
          <span className={s.nextLabel}>Prochain rendez-vous</span>
          <strong>{stats.nextEvent.title}</strong>
        </section>
      )}

      <section className={s.eventsSection}>
        <div className={s.sectionHeader}>
          <h2>Mes événements</h2>
          {!loading && events.length > 0 && <span>{events.length} au total</span>}
        </div>

        {loading ? (
          <p className={s.loading}>Chargement...</p>
        ) : events.length === 0 ? (
          <div className={s.empty}>
            <p>Aucun événement pour l'instant.</p>
            <Link href="/dashboard/create" className={s.emptyBtn}>
              Créer mon premier événement
            </Link>
          </div>
        ) : (
          <div className={s.list}>
            {events.map((event, index) => (
              <EventCard key={event.id} event={event} accentIndex={index} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

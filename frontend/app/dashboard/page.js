'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import EventCard from '@/components/EventCard';
import s from '@/styles/dashboard.module.scss';

export default function DashboardPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/events')
      .then(({ data }) => setEvents(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={s.page}>
      <h1 className={s.heading}>Mes événements</h1>

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
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      <Link href="/dashboard/create" className={s.fab} aria-label="Créer un événement">
        +
      </Link>
    </div>
  );
}

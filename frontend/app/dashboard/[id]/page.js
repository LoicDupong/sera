'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import RsvpFilters from '@/components/RsvpFilters';
import GuestItem from '@/components/GuestItem';
import AddGuestForm from '@/components/AddGuestForm';
import s from '@/styles/eventDetail.module.scss';

export default function EventDetailPage({ params }) {
  const { id } = use(params);
  const [event, setEvent] = useState(null);
  const [guests, setGuests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get(`/events/${id}`)
      .then(({ data }) => {
        setEvent(data);
        setGuests(data.guests ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleCopy = () => {
    const link = `${window.location.origin}/invite/${event.slug}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleAddGuest = async (first_name, last_name) => {
    const { data } = await api.post(`/events/${id}/guests`, { first_name, last_name });
    setGuests((prev) => [...prev, data]);
  };

  const handleDeleteGuest = async (guestId) => {
    await api.delete(`/events/${id}/guests/${guestId}`);
    setGuests((prev) => prev.filter((g) => g.id !== guestId));
  };

  const filteredGuests = filter === 'all'
    ? guests
    : guests.filter((g) => g.rsvp_status === filter);

  if (loading) return <div className={s.page}><p className={s.loading}>Chargement...</p></div>;
  if (!event) return <div className={s.page}><p className={s.loading}>Événement introuvable.</p></div>;

  const date = new Date(event.date).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const inviteLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${event.slug}`;

  return (
    <div className={s.page}>
      <Link href="/dashboard" className={s.back}>← Mes événements</Link>

      <div className={s.eventHeader}>
        <h1 className={s.eventTitle}>{event.title}</h1>
        <p className={s.eventMeta}>{date} · {event.location}</p>

        <div className={s.inviteSection}>
          <p className={s.inviteLabel}>Lien d'invitation</p>
          <div className={s.inviteBox}>
            <span className={s.inviteLinkDisplay}>{inviteLink}</span>
            <button
              className={`${s.copyBtn} ${copied ? s.copied : ''}`}
              onClick={handleCopy}
            >
              {copied ? '✓ Copié' : 'Copier le lien'}
            </button>
          </div>
        </div>
      </div>

      <RsvpFilters active={filter} onChange={setFilter} />

      <p className={s.guestCount}>{filteredGuests.length} invité{filteredGuests.length !== 1 ? 's' : ''}</p>

      <div className={s.guestList}>
        {filteredGuests.length === 0 ? (
          <p className={s.emptyGuests}>
            {filter === 'all' ? "Aucun invité pour l'instant." : 'Aucun invité dans cette catégorie.'}
          </p>
        ) : (
          filteredGuests.map((guest) => (
            <GuestItem key={guest.id} guest={guest} onDelete={handleDeleteGuest} />
          ))
        )}
      </div>

      <AddGuestForm onAdd={handleAddGuest} />
    </div>
  );
}

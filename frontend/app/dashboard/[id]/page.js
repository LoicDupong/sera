'use client';
import { useMemo, useState, useEffect, use } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import RsvpFilters from '@/components/RsvpFilters';
import GuestItem from '@/components/GuestItem';
import AddGuestForm from '@/components/AddGuestForm';
import OpenEventDashboard from '@/components/OpenEventDashboard';
import BulkGuestImporter from '@/components/BulkGuestImporter';
import s from '@/styles/eventDetail.module.scss';

const RSVP_STATS = [
  { key: 'yes', label: 'Présents' },
  { key: 'maybe', label: 'Peut-être' },
  { key: 'no', label: 'Absents' },
  { key: 'pending', label: 'En attente' },
];

export default function EventDetailPage({ params }) {
  const { id } = use(params);
  const [event, setEvent] = useState(null);
  const [guests, setGuests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);

  useEffect(() => {
    api.get(`/events/${id}`)
      .then(({ data }) => {
        setEvent(data);
        setGuests(data.guests ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const counts = useMemo(() => {
    return guests.reduce((acc, guest) => {
      acc[guest.rsvp_status] = (acc[guest.rsvp_status] || 0) + 1;
      return acc;
    }, { yes: 0, no: 0, maybe: 0, pending: 0 });
  }, [guests]);

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

  const handleBulkImport = async (guests) => {
    try {
      const { data } = await api.post(`/events/${id}/guests/bulk`, { guests });
      setGuests((prev) => [...prev, ...data.createdGuests]);
      setShowBulkImport(false);
    } catch (err) {
      console.error('Erreur lors de l\'importation', err);
    }
  };

  const filteredGuests = filter === 'all'
    ? guests
    : guests.filter((g) => g.rsvp_status === filter);

  if (loading) return <div className={s.page}><p className={s.loading}>Chargement...</p></div>;
  if (!event) return <div className={s.page}><p className={s.loading}>Événement introuvable.</p></div>;

  const date = new Date(event.date).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const time = new Date(event.date).toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit',
  });

  const inviteLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${event.slug}`;

  return (
    <div className={s.page}>
      <Link href="/dashboard" className={s.back}>← Mes événements</Link>

      <section className={s.hero}>
        <div>
          <p className={s.kicker}>Event room</p>
          <h1 className={s.eventTitle}>{event.title}</h1>
          <p className={s.eventMeta}>{date} · {time} · {event.location}</p>
          {event.description && <p className={s.description}>{event.description}</p>}
        </div>
      </section>

      <section className={s.sharePanel}>
        <div>
          <p className={s.panelLabel}>Lien d'invitation</p>
        </div>
        <div className={s.inviteBox}>
          <span className={s.inviteLinkDisplay}>{inviteLink}</span>
          <button
            className={`${s.copyBtn} ${copied ? s.copied : ''}`}
            onClick={handleCopy}
          >
            {copied ? '✓ Copié' : 'Copier'}
          </button>
        </div>
      </section>

      {event.event_type === 'open' ? (
        <OpenEventDashboard
          guests={guests}
          filter={filter}
          onFilterChange={setFilter}
          onDeleteGuest={handleDeleteGuest}
        />
      ) : (
        <>
          <section className={s.statsGrid} aria-label="Résumé RSVP">
            {RSVP_STATS.map((stat) => (
              <article key={stat.key} className={`${s.statCard} ${s[stat.key]}`}>
                <span className={s.statValue}>{counts[stat.key]}</span>
                <span className={s.statLabel}>{stat.label}</span>
              </article>
            ))}
          </section>

          <section className={s.guestPanel}>
            <div className={s.sectionHeader}>
              <div>
                <p className={s.panelLabel}>Invités</p>
                <h2>{filteredGuests.length} personne{filteredGuests.length !== 1 ? 's' : ''}</h2>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <RsvpFilters active={filter} onChange={setFilter} />
                <button
                  className={s.filterTab}
                  onClick={() => setShowBulkImport(!showBulkImport)}
                  title="Importer des invités en masse"
                >
                  ↓ Importer
                </button>
              </div>
            </div>

            {showBulkImport && (
              <BulkGuestImporter
                onImport={handleBulkImport}
                onCancel={() => setShowBulkImport(false)}
              />
            )}

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
          </section>
        </>
      )}
    </div>
  );
}

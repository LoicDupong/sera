'use client';

import { useEffect, useMemo, useState, use } from 'react';
import api from '@/lib/api';
import s from '@/styles/invite.module.scss';

const RSVP_OPTIONS = [
  { value: 'yes', label: 'Je viens', tone: 'yes' },
  { value: 'maybe', label: 'Peut-être', tone: 'maybe' },
  { value: 'no', label: 'Je ne viens pas', tone: 'no' },
];

const CONFIRMATION_COPY = {
  yes: 'Parfait, ta présence est confirmée.',
  maybe: "C'est noté, tu es indiqué comme peut-être.",
  no: 'Merci pour ta réponse, ton absence est bien notée.',
};

const CONFIRMATION_COPY_OPEN = {
  yes: 'Super, tu es inscrit! On te voit bientôt.',
  maybe: "C'est noté, tu es indiqué comme peut-être.",
  no: 'Merci pour ta réponse, ton absence est bien notée.',
};

export default function InvitePage({ params }) {
  const { slug } = use(params);
  const [event, setEvent] = useState(null);
  const [identity, setIdentity] = useState({ first_name: '', last_name: '' });
  const [guest, setGuest] = useState(null);
  const [selectedRsvp, setSelectedRsvp] = useState('');
  const [step, setStep] = useState('verify');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');

    api.get(`/invite/${slug}`)
      .then(({ data }) => setEvent(data))
      .catch((err) => {
        setError(err.response?.data?.error || 'Invitation introuvable.');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const formattedDate = useMemo(() => {
    if (!event?.date) return '';

    return new Date(event.date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [event?.date]);

  const handleIdentityChange = (e) => {
    setIdentity((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const { data } = await api.post(`/invite/${slug}/verify`, identity);

      if (!data.found) {
        setError("On n'a pas retrouvé cette invitation. Vérifie le prénom et le nom indiqués par l'hôte.");
        return;
      }

      setGuest({ id: data.guest_id, rsvp_status: data.rsvp_status });
      setSelectedRsvp(data.rsvp_status === 'pending' ? '' : data.rsvp_status);

      // For open events: skip RSVP step and go directly to confirmation
      if (event?.event_type === 'open' && data.rsvp_status === 'yes') {
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

  const handleRsvp = async (e) => {
    e.preventDefault();
    if (!selectedRsvp || !guest?.id) return;

    setError('');
    setSubmitting(true);

    try {
      const { data } = await api.post(`/invite/${slug}/rsvp`, {
        guest_id: guest.id,
        rsvp_status: selectedRsvp,
      });

      setGuest((current) => ({ ...current, rsvp_status: data.rsvp_status }));
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.error || "Impossible d'enregistrer la réponse.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className={s.page}>
        <p className={s.loading}>Chargement...</p>
      </main>
    );
  }

  if (!event) {
    return (
      <main className={s.page}>
        <section className={s.panel}>
          <p className={s.kicker}>Sera</p>
          <h1 className={s.title}>Invitation introuvable</h1>
          <p className={s.muted}>{error || "Ce lien d'invitation n'est plus disponible."}</p>
        </section>
      </main>
    );
  }

  return (
    <main className={s.page}>
      <section className={s.event}>
        <p className={s.kicker}>Invitation</p>
        <h1 className={s.title}>{event.title}</h1>
        <div className={s.meta}>
          <span>{formattedDate}</span>
          <span>{event.location}</span>
        </div>
        {event.description && <p className={s.description}>{event.description}</p>}
      </section>

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

          {error && <p className={s.error}>{error}</p>}

          <button className={s.primaryBtn} type="submit" disabled={submitting}>
            {submitting ? 'Vérification...' : 'Continuer'}
          </button>
        </form>
      )}

      {step === 'rsvp' && (
        <form className={s.panel} onSubmit={handleRsvp}>
          <div className={s.stepHeader}>
            <p className={s.stepLabel}>RSVP</p>
            <h2>Ta réponse</h2>
          </div>

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

          {error && <p className={s.error}>{error}</p>}

          <button className={s.primaryBtn} type="submit" disabled={submitting || !selectedRsvp}>
            {submitting ? 'Enregistrement...' : 'Confirmer ma réponse'}
          </button>
        </form>
      )}

      {step === 'done' && (
        <section className={s.panel}>
          <div className={s.stepHeader}>
            <p className={s.stepLabel}>Confirmation</p>
            <h2>Merci, {identity.first_name}</h2>
          </div>
          <p className={s.confirmation}>
            {event?.event_type === 'open'
              ? CONFIRMATION_COPY_OPEN[guest?.rsvp_status] || 'Ta réponse est bien enregistrée.'
              : CONFIRMATION_COPY[guest?.rsvp_status] || 'Ta réponse est bien enregistrée.'}
          </p>
        </section>
      )}
    </main>
  );
}

'use client';

import { useEffect, useMemo, useState, use } from 'react';
import api from '@/lib/api';
import s from '@/styles/invite.module.scss';

const THEME_GRADIENTS = {
  birthday: 'linear-gradient(135deg, var(--violet), var(--rose))',
  wedding: 'linear-gradient(135deg, #e8d5b7, #f5ebe0)',
  baby_shower: 'linear-gradient(135deg, var(--mint), var(--violet-soft))',
  bbq: 'linear-gradient(135deg, var(--rose), var(--gold))',
  house_party: 'linear-gradient(135deg, var(--violet), var(--mint))',
  chill_night: 'linear-gradient(135deg, #1a1a2e, var(--violet))',
  corporate: 'linear-gradient(135deg, #2d3748, #4a5568)',
  minimal: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))',
};

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
      const payload = {
        ...identity,
        ...(event?.event_type === 'open' && { rsvp_status: selectedRsvp }),
      };

      const { data } = await api.post(`/invite/${slug}/verify`, payload);

      if (!data.found) {
        setError("On n'a pas retrouvé cette invitation. Vérifie le prénom et le nom indiqués par l'hôte.");
        return;
      }

      setGuest({ id: data.guest_id, rsvp_status: data.rsvp_status });
      setSelectedRsvp(data.rsvp_status === 'pending' ? '' : data.rsvp_status);

      // For open events: skip RSVP step and go directly to confirmation
      if (event?.event_type === 'open') {
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
      {event?.cover_type === 'image' && event?.cover_value ? (
        <img
          src={event.cover_value}
          alt="Couverture de l'événement"
          style={{
            width: '100%',
            height: '200px',
            objectFit: 'cover',
            borderRadius: '28px',
            marginBottom: '24px',
            boxShadow: 'var(--shadow)',
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '200px',
            background: THEME_GRADIENTS[event?.theme || 'minimal'],
            borderRadius: '28px',
            marginBottom: '24px',
            boxShadow: 'var(--shadow)',
          }}
        />
      )}

      <section className={s.event}>
        <p className={s.kicker}>Invitation</p>
        <h1 className={s.title}>{event.title}</h1>
        {event?.custom_message && (
          <p className={s.customMessage} style={{ marginBottom: '14px', fontStyle: 'italic', color: 'var(--text-muted)' }}>
            "{event.custom_message}"
          </p>
        )}
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

          {event?.event_type === 'open' && (
            <>
              <div className={s.rsvpSection}>
                <p className={s.rsvpLabel}>Ta réponse</p>
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
              </div>
            </>
          )}

          {error && <p className={s.error}>{error}</p>}

          <button
            className={s.primaryBtn}
            type="submit"
            disabled={submitting || (event?.event_type === 'open' && !selectedRsvp)}
          >
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

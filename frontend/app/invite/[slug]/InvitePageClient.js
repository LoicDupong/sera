'use client';

import { useEffect, useMemo, useState, use } from 'react';
import api, { getMediaUrl } from '@/lib/api';
import { getFontFamily, getThemeConfig, COVER_GRADIENTS } from '@/lib/themeConfig';
import s from '@/styles/invite.module.scss';

const RSVP_OPTIONS = [
  { value: 'yes', label: 'Je serai là', tone: 'yes' },
  { value: 'maybe', label: 'Peut-être', tone: 'maybe' },
  { value: 'no', label: 'Je ne pourrai pas', tone: 'no' },
];

const CONFIRMATION_COPY = {
  yes: 'À bientôt !',
  maybe: 'On espère te voir !',
  no: 'Pas de souci !',
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
      .catch((err) => setError(err.response?.data?.error || 'Invitation introuvable.'))
      .finally(() => setLoading(false));
  }, [slug]);

  const formattedDate = useMemo(() => {
    if (!event?.date) return '';
    return new Date(event.date).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit', timeZone: 'UTC',
    });
  }, [event?.date]);

  const handleIdentityChange = (e) => {
    setIdentity((cur) => ({ ...cur, [e.target.name]: e.target.value }));
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
      setStep(event?.event_type === 'open' ? 'done' : 'rsvp');
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
      setGuest((cur) => ({ ...cur, rsvp_status: data.rsvp_status }));
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.error || "Impossible d'enregistrer la réponse.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={s.loadingPage}>
        <p className={s.loading}>Chargement...</p>
      </div>
    );
  }

  const themeKey = event?.theme || 'elegant_minimal';
  const isDark = getThemeConfig(themeKey).isDark;
  const fontFamily = getFontFamily(event?.font_style || 'classic');
  const coverType = event?.cover_type || 'gradient';
  const coverValue = event?.cover_value || null;

  const heroBgOverride = coverType === 'gradient' && coverValue && COVER_GRADIENTS[coverValue]
    ? COVER_GRADIENTS[coverValue]
    : null;

  if (!event) {
    return (
      <div
        className={s.page}
        data-theme={themeKey}
        style={{
          '--font-display': fontFamily,
          ...(heroBgOverride ? { '--invite-hero-bg-override': heroBgOverride } : {}),
        }}
      >
        <div className={s.card}>
          <p className={s.kicker}>Sera</p>
          <h1 className={s.title}>Invitation introuvable</h1>
          <p className={s.muted}>{error || "Ce lien d'invitation n'est plus disponible."}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={s.page}
      data-theme={themeKey}
      style={{
        '--font-display': fontFamily,
        ...(heroBgOverride ? { '--invite-hero-bg-override': heroBgOverride } : {}),
      }}
    >
      {/* Hero */}
      <section className={`${s.hero} ${coverType === 'image' && coverValue ? s.heroWithImage : ''}`}>
        {coverType === 'image' && coverValue ? (
          <>
            <img src={getMediaUrl(coverValue)} alt="Couverture" className={s.heroCoverImage} />
            <div className={s.heroOverlay} />
          </>
        ) : null}
        <div className={s.heroContent}>
          <p className={s.kicker}>Invitation</p>
          <h1 className={s.title}>{event.title}</h1>
        </div>
      </section>

      {/* Floating card */}
      <div className={s.card}>
        {event.custom_message && (
          <p className={s.customMessage}>"{event.custom_message}"</p>
        )}
        <p className={s.meta}>
          {[formattedDate, event.location].filter(Boolean).join(' · ')}
        </p>
        {event.description && <p className={s.description}>{event.description}</p>}

        {event.date && (
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL}/invite/${slug}/calendar.ics`}
            className={s.calendarCta}
            download
          >
            Ajouter à mon calendrier
          </a>
        )}

        <div className={s.divider} />

        {step === 'verify' && (
          <form onSubmit={handleVerify}>
            <p className={s.stepLabel}>Vérification</p>
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
              <div className={s.rsvpSection}>
                <p className={s.rsvpLabel}>Ta réponse</p>
                <div className={s.options}>
                  {RSVP_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`${s.optionBtn} ${selectedRsvp === option.value ? s.active : ''}`}
                      onClick={() => setSelectedRsvp(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
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
          <form onSubmit={handleRsvp}>
            <p className={s.stepLabel}>Ta réponse</p>
            <div className={s.options}>
              {RSVP_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`${s.optionBtn} ${selectedRsvp === option.value ? s.active : ''}`}
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
          <div className={s.confirmation}>
            <p className={s.stepLabel}>Confirmation</p>
            <p className={s.confirmationName}>{identity.first_name},</p>
            <p className={s.confirmationMessage}>
              {isDark ? '✦ ' : ''}{CONFIRMATION_COPY[guest?.rsvp_status] || 'Ta réponse est bien enregistrée.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

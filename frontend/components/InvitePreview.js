'use client';

import { THEME_CONFIGS, getFontFamily, COVER_GRADIENTS } from '@/lib/themeConfig';
import { getMediaUrl } from '@/lib/api';
import s from '@/styles/invitePreview.module.scss';

export default function InvitePreview({ customization = {}, event }) {
  const {
    theme = 'elegant_minimal',
    cover_type = 'gradient',
    cover_value = 'mint_default',
    custom_message = '',
    font_style = 'classic',
  } = customization;

  const config = THEME_CONFIGS[theme] ?? THEME_CONFIGS.elegant_minimal;
  const fontFamily = getFontFamily(font_style);

  const isCustomImage = cover_type === 'image' && cover_value && !COVER_GRADIENTS[cover_value];
  const heroImg = isCustomImage ? getMediaUrl(cover_value) : null;
  const heroBg = !isCustomImage
    ? (COVER_GRADIENTS[cover_value] ?? `linear-gradient(135deg, ${config.heroBg}, ${config.accent}22)`)
    : undefined;

  const titleColor = config.isDark ? '#ffffff' : config.text;

  const dateShort = event?.date
    ? new Date(event.date).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : null;

  return (
    <div className={s.wrapper}>
      <p className={s.label}>Aperçu de l'invitation</p>
      <div className={s.card}>
        {/* Hero */}
        <div className={s.hero} style={{ background: heroBg }}>
          {heroImg && <img src={heroImg} alt="" className={s.heroImg} />}
          {isCustomImage && <div className={s.heroOverlay} />}
          <div className={s.heroContent}>
            <span className={s.kicker}>Invitation</span>
            <h3 className={s.title} style={{ fontFamily, color: titleColor }}>
              {event?.title || 'Votre événement'}
            </h3>
            {dateShort && <span className={s.datePill}>{dateShort}</span>}
          </div>
        </div>

        {/* Body */}
        <div className={s.body} style={{ background: config.cardBg }}>
          {custom_message && (
            <p
              className={s.pullQuote}
              style={{ fontFamily, color: config.textMuted, borderLeftColor: config.accent + '50' }}
            >
              "{custom_message}"
            </p>
          )}
          <div className={s.divider} style={{ borderColor: config.accent + '18' }} />
          {(dateShort || event?.location) && (
            <p className={s.meta} style={{ color: config.textMuted }}>
              {[dateShort, event?.location].filter(Boolean).join(' · ')}
            </p>
          )}
          <div className={s.rsvpButtons}>
            <button
              className={s.rsvpPrimary}
              style={{ background: config.accent, color: config.isDark ? config.cardBg : '#ffffff' }}
              disabled tabIndex={-1}
            >
              ✓ Je serai là
            </button>
            <button
              className={s.rsvpGhost}
              style={{ borderColor: config.accent + '30', color: config.textMuted }}
              disabled tabIndex={-1}
            >
              Peut-être
            </button>
            <button
              className={s.rsvpGhost}
              style={{ borderColor: config.accent + '30', color: config.textMuted }}
              disabled tabIndex={-1}
            >
              Je ne pourrai pas
            </button>
          </div>
          <p className={s.watermark} style={{ color: config.textMuted }}>Sera</p>
        </div>
      </div>
    </div>
  );
}

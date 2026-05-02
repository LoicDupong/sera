'use client';

import { useState } from 'react';
import s from '@/styles/eventCustomization.module.scss';

const THEMES = [
  { value: 'birthday', label: 'Anniversaire', emoji: '🎂' },
  { value: 'wedding', label: 'Mariage', emoji: '💍' },
  { value: 'baby_shower', label: 'Baby shower', emoji: '🍼' },
  { value: 'bbq', label: 'BBQ', emoji: '🔥' },
  { value: 'house_party', label: 'Soirée', emoji: '🏠' },
  { value: 'chill_night', label: 'Soirée chill', emoji: '🌙' },
  { value: 'corporate', label: 'Corporate', emoji: '💼' },
  { value: 'minimal', label: 'Minimaliste', emoji: '✨' },
];

const GRADIENT_OPTIONS = [
  { value: 'mint_default', name: 'Mint', key: 'mint' },
  { value: 'violet_default', name: 'Violet', key: 'violet' },
  { value: 'rose_default', name: 'Rose', key: 'rose' },
  { value: 'gold_default', name: 'Gold', key: 'gold' },
];

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

const COVER_GRADIENTS = {
  mint_default: 'linear-gradient(135deg, var(--mint), var(--violet-soft))',
  violet_default: 'linear-gradient(135deg, var(--violet), var(--rose))',
  rose_default: 'linear-gradient(135deg, var(--rose), var(--gold))',
  gold_default: 'linear-gradient(135deg, var(--gold), var(--rose))',
};

function getPreviewBackground(cover_type, cover_value, theme) {
  if (cover_type === 'image' && cover_value) return null;
  if (cover_value && COVER_GRADIENTS[cover_value]) return COVER_GRADIENTS[cover_value];
  return THEME_GRADIENTS[theme] || THEME_GRADIENTS.minimal;
}

export default function EventCustomization({
  value = {},
  onChange,
  onImageUpload,
  canUploadImage = false,
  currentImageUrl = null,
  onSave,
  saving = false,
  feedback = '',
}) {
  const {
    theme = 'minimal',
    cover_type = 'gradient',
    cover_value = 'mint_default',
    custom_message = '',
  } = value;

  const [imageLoading, setImageLoading] = useState(false);

  const handleThemeChange = (newTheme) => {
    onChange({ ...value, theme: newTheme });
  };

  const handleCoverTypeChange = (newType) => {
    onChange({
      ...value,
      cover_type: newType,
      cover_value: newType === 'gradient' ? cover_value : (currentImageUrl || cover_value),
    });
  };

  const handleGradientSelect = (gradientValue) => {
    onChange({ ...value, cover_type: 'gradient', cover_value: gradientValue });
  };

  const handleMessageChange = (e) => {
    const text = e.target.value;
    if (text.length <= 160) {
      onChange({ ...value, custom_message: text });
    }
  };

  const handleFileSelect = async (file) => {
    if (!file) return;
    setImageLoading(true);
    try {
      await onImageUpload?.(file);
    } finally {
      setImageLoading(false);
    }
  };

  const previewBg = getPreviewBackground(cover_type, cover_value, theme);
  const isError = feedback && (feedback.toLowerCase().includes('erreur') || feedback.toLowerCase().includes('error'));

  return (
    <section className={s.section}>
      <span className={s.sectionTitle}>Personnalisation</span>

      {/* Preview strip */}
      <div className={s.preview}>
        {cover_type === 'image' && (currentImageUrl || (cover_type === 'image' && cover_value && !COVER_GRADIENTS[cover_value])) ? (
          <img
            src={currentImageUrl || cover_value}
            alt="Aperçu couverture"
            className={s.previewImage}
          />
        ) : (
          <div className={s.previewGradient} style={{ background: previewBg }} />
        )}
        <span className={s.previewLabel}>Aperçu couverture</span>
      </div>

      {/* Theme selector */}
      <div className={s.subsection}>
        <label className={s.subsectionLabel}>Thème de l'événement</label>
        <div className={s.themeGrid}>
          {THEMES.map((t) => (
            <button
              key={t.value}
              type="button"
              className={`${s.themeCard} ${theme === t.value ? s.active : ''}`}
              onClick={() => handleThemeChange(t.value)}
            >
              <span className={s.emoji}>{t.emoji}</span>
              <span className={s.label}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Cover selector */}
      <div className={s.subsection}>
        <label className={s.subsectionLabel}>Couverture de l'événement</label>
        <div className={s.coverOptions}>
          <button
            type="button"
            className={`${s.coverOption} ${cover_type === 'gradient' ? s.active : ''}`}
            onClick={() => handleCoverTypeChange('gradient')}
          >
            Dégradé
          </button>
          <button
            type="button"
            className={`${s.coverOption} ${cover_type === 'image' ? s.active : ''}`}
            onClick={() => handleCoverTypeChange('image')}
            disabled={!canUploadImage}
            title={!canUploadImage ? 'Disponible après création' : undefined}
          >
            Image
          </button>
        </div>

        {cover_type === 'gradient' && (
          <div className={s.gradientSwatches}>
            {GRADIENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`${s.swatch} ${s[opt.key]} ${cover_value === opt.value ? s.active : ''}`}
                onClick={() => handleGradientSelect(opt.value)}
                title={opt.name}
              >
                <span className={s.checkmark}>✓</span>
              </button>
            ))}
          </div>
        )}

        {cover_type === 'image' && canUploadImage && (
          <div className={s.uploaderWrapper}>
            {currentImageUrl && (
              <img src={currentImageUrl} alt="Couverture actuelle" className={s.imagePreview} />
            )}
            <div className={s.uploaderZone}>
              <input
                id="cover-file"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
                disabled={imageLoading}
              />
              <label htmlFor="cover-file" className={s.uploaderLabel}>
                <strong>Cliquez pour charger</strong> ou déposez une image
              </label>
              <div className={s.uploaderHint}>JPG, PNG — max 5 MB</div>
              {imageLoading && <div className={s.uploadProgress}>Upload en cours...</div>}
            </div>
          </div>
        )}

        {cover_type === 'image' && !canUploadImage && (
          <div className={s.uploaderHint} style={{ marginTop: '12px', color: 'var(--text-muted)' }}>
            L'upload d'image est disponible après la création de l'événement.
          </div>
        )}
      </div>

      {/* Custom message */}
      <div className={s.subsection}>
        <div className={s.messageField}>
          <label htmlFor="custom-message">Message personnalisé</label>
          <textarea
            id="custom-message"
            placeholder="Bienvenue à tous ! C'est une joie de vous voir..."
            value={custom_message}
            onChange={handleMessageChange}
          />
          <div className={`${s.messageCounter} ${custom_message.length >= 150 ? s.warning : ''}`}>
            {custom_message.length} / 160
          </div>
        </div>
      </div>

      {/* Save button — only rendered when onSave is provided (dashboard context) */}
      {onSave && (
        <>
          <button
            type="button"
            className={s.saveBtn}
            onClick={onSave}
            disabled={saving || imageLoading}
          >
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
          {feedback && (
            <div className={`${s.feedback} ${isError ? s.error : s.success}`}>
              {feedback}
            </div>
          )}
        </>
      )}
    </section>
  );
}

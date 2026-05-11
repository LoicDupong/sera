'use client';

import { useState } from 'react';
import { THEME_CONFIGS, FONT_OPTIONS, getThemeConfig } from '@/lib/themeConfig';
import s from '@/styles/eventCustomization.module.scss';

const GRADIENT_OPTIONS = [
  { value: 'mint_default', name: 'Mint', key: 'mint' },
  { value: 'violet_default', name: 'Violet', key: 'violet' },
  { value: 'rose_default', name: 'Rose', key: 'rose' },
  { value: 'gold_default', name: 'Gold', key: 'gold' },
];

const COVER_GRADIENTS = {
  mint_default: 'linear-gradient(135deg, var(--mint), var(--violet-soft))',
  violet_default: 'linear-gradient(135deg, var(--violet), var(--rose))',
  rose_default: 'linear-gradient(135deg, var(--rose), var(--gold))',
  gold_default: 'linear-gradient(135deg, var(--gold), var(--rose))',
};

function getPreviewBackground(cover_type, cover_value, theme) {
  if (cover_type === 'image' && cover_value) return null;
  if (cover_value && COVER_GRADIENTS[cover_value]) return COVER_GRADIENTS[cover_value];
  const config = getThemeConfig(theme);
  return `linear-gradient(135deg, ${config.heroBg}, ${config.accent}22)`;
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
    theme = 'elegant_minimal',
    cover_type = 'gradient',
    cover_value = 'mint_default',
    custom_message = '',
    font_style = 'classic',
  } = value;

  const [imageLoading, setImageLoading] = useState(false);

  const handleThemeChange = (newTheme) => {
    onChange({ ...value, theme: newTheme });
  };

  const handleFontChange = (newFont) => {
    onChange({ ...value, font_style: newFont });
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
      <span className={s.sectionTitle}>Design de l'invitation</span>

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
        <label className={s.subsectionLabel}>Ambiance</label>
        <div className={s.themeGrid}>
          {Object.entries(THEME_CONFIGS).map(([key, config]) => (
            <button
              key={key}
              type="button"
              className={`${s.themeCard} ${theme === key ? s.active : ''}`}
              onClick={() => handleThemeChange(key)}
            >
              <span
                className={s.themeSwatch}
                style={{ background: config.heroBg, borderColor: config.accent + '40' }}
              />
              <span className={s.label}>{config.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Font selector */}
      <div className={s.subsection}>
        <label className={s.subsectionLabel}>Typographie</label>
        <div className={s.fontSelector}>
          {FONT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`${s.fontOption} ${font_style === opt.value ? s.active : ''}`}
              onClick={() => handleFontChange(opt.value)}
              style={{ fontFamily: opt.cssVar }}
            >
              {opt.label}
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

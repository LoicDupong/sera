// frontend/lib/themeConfig.js

export const THEME_CONFIGS = {
  elegant_minimal: {
    label: 'Élégant Minimal',
    heroBg: '#FAFAF8',
    cardBg: '#FFFFFF',
    accent: '#1A1A1A',
    text: '#1A1A1A',
    textMuted: '#6B6B6B',
    isDark: false,
  },
  luxury_party: {
    label: 'Luxury Party',
    heroBg: '#18181B',
    cardBg: '#1C1C22',
    accent: '#C9A84C',
    text: '#FFFFFF',
    textMuted: 'rgba(255,255,255,0.6)',
    isDark: true,
  },
  editorial_chic: {
    label: 'Editorial Chic',
    heroBg: '#F5F3EE',
    cardBg: '#FFFFFF',
    accent: '#3D3530',
    text: '#1A1A1A',
    textMuted: '#6B6B6B',
    isDark: false,
  },
  feminine_luxe: {
    label: 'Feminine Luxe',
    heroBg: '#FDF6F0',
    cardBg: '#FFFFFF',
    accent: '#C8857A',
    text: '#1A1A1A',
    textMuted: '#7A5F5B',
    isDark: false,
  },
  bold_celebration: {
    label: 'Bold Celebration',
    heroBg: '#0E0E0E',
    cardBg: '#1A1A1A',
    accent: '#7C3AED',
    text: '#FFFFFF',
    textMuted: 'rgba(255,255,255,0.6)',
    isDark: true,
  },
};

export const FALLBACK_THEME_KEY = 'elegant_minimal';

export const getThemeConfig = (themeKey) =>
  THEME_CONFIGS[themeKey] ?? THEME_CONFIGS[FALLBACK_THEME_KEY];

export const FONT_OPTIONS = [
  { value: 'classic', label: 'Playfair', cssVar: 'var(--font-playfair)' },
  { value: 'script', label: 'Allura', cssVar: 'var(--font-allura)' },
  // Inter is already available as a system font on most platforms; no Google Fonts import needed
  { value: 'modern', label: 'Inter', cssVar: 'Inter, ui-sans-serif, system-ui, sans-serif' },
];

export const getFontFamily = (fontStyle) => {
  const opt = FONT_OPTIONS.find((f) => f.value === fontStyle);
  return opt ? opt.cssVar : FONT_OPTIONS[0].cssVar;
};

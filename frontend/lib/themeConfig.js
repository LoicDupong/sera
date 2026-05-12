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
    heroBg: '#1C1408',
    cardBg: '#1C1C22',
    accent: '#C9A84C',
    text: '#FFFFFF',
    textMuted: 'rgba(255,255,255,0.6)',
    isDark: true,
  },
  editorial_chic: {
    label: 'Editorial Chic',
    heroBg: '#E8E2D5',
    cardBg: '#FFFFFF',
    accent: '#5C3A2E',
    text: '#1A1A1A',
    textMuted: '#6B6B6B',
    isDark: false,
  },
  feminine_luxe: {
    label: 'Feminine Luxe',
    heroBg: '#FAF0EB',
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
    accent: '#8B5CF6',
    text: '#FFFFFF',
    textMuted: 'rgba(255,255,255,0.6)',
    isDark: true,
  },
};

export const FALLBACK_THEME_KEY = 'elegant_minimal';

export const getThemeConfig = (themeKey) =>
  THEME_CONFIGS[themeKey] ?? THEME_CONFIGS[FALLBACK_THEME_KEY];

export const FONT_OPTIONS = [
  { value: 'classic', label: 'Playfair', sublabel: 'Classique', cssVar: 'var(--font-playfair)' },
  { value: 'script', label: 'Allura', sublabel: 'Script', cssVar: 'var(--font-allura)' },
  { value: 'modern', label: 'Inter', sublabel: 'Moderne', cssVar: 'Inter, ui-sans-serif, system-ui, sans-serif' },
];

export const getFontFamily = (fontStyle) => {
  const opt = FONT_OPTIONS.find((f) => f.value === fontStyle);
  return opt ? opt.cssVar : FONT_OPTIONS[0].cssVar;
};

export const COVER_GRADIENTS = {
  mint_default:   'linear-gradient(135deg, #34d399, rgba(167,139,250,0.5))',
  violet_default: 'linear-gradient(135deg, #a78bfa, #fb7185)',
  rose_default:   'linear-gradient(135deg, #fb7185, #fbbf24)',
  gold_default:   'linear-gradient(135deg, #fbbf24, #fb7185)',
  noir:           'linear-gradient(135deg, #111111, #2d2d2d)',
  pastel:         'linear-gradient(135deg, #e8d5f0, #d5e8f4)',
};

export const GRADIENT_OPTIONS = [
  { value: 'mint_default',   name: 'Menthe', key: 'mint' },
  { value: 'violet_default', name: 'Violet', key: 'violet' },
  { value: 'rose_default',   name: 'Rose',   key: 'rose' },
  { value: 'gold_default',   name: 'Or',     key: 'gold' },
  { value: 'noir',           name: 'Noir',   key: 'noir' },
  { value: 'pastel',         name: 'Pastel', key: 'pastel' },
];

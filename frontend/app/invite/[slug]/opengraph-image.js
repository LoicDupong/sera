import { ImageResponse } from 'next/og';

export const alt = 'Invitation';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

async function getEvent(slug) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  try {
    const res = await fetch(`${apiUrl}/invite/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

const THEME_BG = {
  elegant_minimal:  { bg: '#FAFAF8', accent: '#1A1A1A', text: '#1A1A1A', muted: 'rgba(26,26,26,0.5)', dark: false },
  luxury_party:     { bg: '#1C1408', accent: '#C9A84C', text: '#FFFFFF', muted: 'rgba(255,255,255,0.5)', dark: true },
  editorial_chic:   { bg: '#E8E2D5', accent: '#5C3A2E', text: '#1A1A1A', muted: 'rgba(26,26,26,0.5)', dark: false },
  feminine_luxe:    { bg: '#FAF0EB', accent: '#C8857A', text: '#1A1A1A', muted: 'rgba(26,26,26,0.5)', dark: false },
  bold_celebration: { bg: '#0E0E0E', accent: '#8B5CF6', text: '#FFFFFF', muted: 'rgba(255,255,255,0.5)', dark: true },
};

export default async function Image({ params }) {
  const { slug } = await params;
  const event = await getEvent(slug);

  const title = event?.title || 'Invitation';
  const date = event?.date
    ? new Date(event.date).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
      })
    : null;
  const meta = [date, event?.location].filter(Boolean).join(' · ');
  const palette = THEME_BG[event?.theme] ?? THEME_BG.elegant_minimal;

  const hasCoverImage = event?.cover_type === 'image' && event?.cover_value;
  const coverImageUrl = hasCoverImage
    ? `${(process.env.NEXT_PUBLIC_API_URL || '').replace(/\/api$/, '')}${event.cover_value}`
    : null;

  // When a cover image is used, force white text regardless of theme
  const textColor = hasCoverImage ? '#ffffff' : palette.text;
  const mutedColor = hasCoverImage ? 'rgba(255,255,255,0.65)' : palette.muted;
  const accentColor = hasCoverImage ? '#ffffff' : palette.accent;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          backgroundColor: palette.bg,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Cover image background */}
        {coverImageUrl && (
          <>
            <img
              src={coverImageUrl}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            {/* Dark overlay for legibility */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.65) 100%)',
              }}
            />
          </>
        )}

        {/* Accent bar top */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
          <div style={{ width: '32px', height: '4px', borderRadius: '2px', backgroundColor: accentColor }} />
          <span style={{ fontSize: 18, fontWeight: 700, color: mutedColor, letterSpacing: '3px', textTransform: 'uppercase' }}>
            Invitation
          </span>
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
          <div
            style={{
              fontSize: title.length > 30 ? 64 : 80,
              fontWeight: 800,
              color: textColor,
              lineHeight: 1.05,
              letterSpacing: '-2px',
              maxWidth: '900px',
              textShadow: hasCoverImage ? '0 2px 12px rgba(0,0,0,0.4)' : 'none',
            }}
          >
            {title}
          </div>
          {meta && (
            <div style={{ fontSize: 28, color: mutedColor, fontWeight: 500 }}>
              {meta}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: accentColor }} />
            <span style={{ fontSize: 20, fontWeight: 700, color: mutedColor }}>sera</span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: mutedColor, letterSpacing: '1px' }}>
            Répondre à l'invitation →
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

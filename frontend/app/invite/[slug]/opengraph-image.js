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
        }}
      >
        {/* Accent bar top */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '4px', borderRadius: '2px', backgroundColor: palette.accent }} />
          <span style={{ fontSize: 18, fontWeight: 700, color: palette.muted, letterSpacing: '3px', textTransform: 'uppercase' }}>
            Invitation
          </span>
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div
            style={{
              fontSize: title.length > 30 ? 64 : 80,
              fontWeight: 800,
              color: palette.text,
              lineHeight: 1.05,
              letterSpacing: '-2px',
              maxWidth: '900px',
            }}
          >
            {title}
          </div>
          {meta && (
            <div style={{ fontSize: 28, color: palette.muted, fontWeight: 500 }}>
              {meta}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: palette.accent }} />
            <span style={{ fontSize: 20, fontWeight: 700, color: palette.muted }}>sera</span>
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: palette.dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)',
              letterSpacing: '1px',
            }}
          >
            Répondre à l'invitation →
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

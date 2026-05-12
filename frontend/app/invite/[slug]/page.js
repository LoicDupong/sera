import InvitePageClient from './InvitePageClient';

async function getEventForMeta(slug) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  try {
    const res = await fetch(`${apiUrl}/invite/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const event = await getEventForMeta(slug);
  if (!event) return { title: 'Invitation · Sera' };

  const formattedDate = new Date(event.date).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });
  const description = [formattedDate, event.location].filter(Boolean).join(' · ');

  return {
    title: `${event.title} · Sera`,
    description,
    openGraph: {
      title: event.title,
      description,
      siteName: 'Sera',
    },
  };
}

export default function InvitePage({ params }) {
  return <InvitePageClient params={params} />;
}

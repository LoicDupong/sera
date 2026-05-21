import './globals.css';
import { Playfair_Display, Allura } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import PwaInstallPrompt from '@/components/PwaInstallPrompt';

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

const allura = Allura({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-allura',
});

export const metadata = {
  title: 'Sera',
  description: "Gère tes invitations d'événements en un seul endroit.",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Sera',
    statusBarStyle: 'black-translucent',
  },
};

export const viewport = {
  themeColor: '#fff8ef',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${playfair.variable} ${allura.variable}`}>
      <body>
        {children}
        <PwaInstallPrompt />
        <Analytics />
      </body>
    </html>
  );
}

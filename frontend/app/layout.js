import './globals.css';
import PwaInstallPrompt from '@/components/PwaInstallPrompt';

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
  themeColor: '#0d0d0d',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        {children}
        <PwaInstallPrompt />
      </body>
    </html>
  );
}

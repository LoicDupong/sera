'use client';

import { useEffect, useState } from 'react';
import s from '@/styles/installPrompt.module.scss';

export default function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    if (['localhost', '127.0.0.1'].includes(window.location.hostname)) {
      navigator.serviceWorker.getRegistrations()
        .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
        .catch(() => {});

      if ('caches' in window) {
        caches.keys()
          .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
          .catch(() => {});
      }

      return;
    }

    navigator.serviceWorker.register('/sw.js').catch(() => {});

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true;

    if (isStandalone || localStorage.getItem('sera-install-dismissed') === 'true') return;

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallEvent(event);
      setVisible(true);
    };

    const handleAppInstalled = () => {
      setVisible(false);
      setInstallEvent(null);
      localStorage.setItem('sera-install-dismissed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installEvent) return;

    installEvent.prompt();
    await installEvent.userChoice;
    setVisible(false);
    setInstallEvent(null);
  };

  const handleDismiss = () => {
    localStorage.setItem('sera-install-dismissed', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside className={s.prompt} aria-label="Installer Sera">
      <div>
        <p className={s.title}>Installer Sera</p>
        <p className={s.text}>Ajoute l'app à ton écran d'accueil pour répondre plus vite.</p>
      </div>
      <div className={s.actions}>
        <button className={s.secondary} type="button" onClick={handleDismiss}>
          Plus tard
        </button>
        <button className={s.primary} type="button" onClick={handleInstall}>
          Installer
        </button>
      </div>
    </aside>
  );
}

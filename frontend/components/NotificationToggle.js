'use client';

import { usePushNotifications } from '@/hooks/usePushNotifications';
import s from '@/styles/notificationToggle.module.scss';

export default function NotificationToggle() {
  const { status, subscribe } = usePushNotifications();

  if (status === 'unsupported') return null;

  if (status === 'ios-no-pwa') {
    return (
      <p className={s.hint}>
        Pour recevoir les notifications sur iPhone, installe Sera sur ton écran d'accueil.
      </p>
    );
  }

  if (status === 'granted') {
    return (
      <p className={s.active}>Notifications activées</p>
    );
  }

  if (status === 'denied') {
    return (
      <p className={s.hint}>
        Notifications bloquées — modifie les paramètres de ton navigateur pour les réactiver.
      </p>
    );
  }

  if (status === 'error') {
    return (
      <p className={s.hint}>Impossible d'activer les notifications. Réessaie plus tard.</p>
    );
  }

  return (
    <button
      type="button"
      className={s.cta}
      onClick={subscribe}
      disabled={status === 'loading'}
    >
      {status === 'loading' ? 'Activation...' : 'Activer les notifications'}
    </button>
  );
}

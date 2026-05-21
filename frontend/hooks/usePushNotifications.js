'use client';

import { useState, useEffect } from 'react';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

function isIosWithoutPwa() {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const isStandalone = window.navigator.standalone === true;
  return isIos && !isStandalone;
}

export function usePushNotifications() {
  const [status, setStatus] = useState('default');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      setStatus('unsupported');
      return;
    }

    if (isIosWithoutPwa()) {
      setStatus('ios-no-pwa');
      return;
    }

    if (Notification.permission === 'granted') setStatus('granted');
    else if (Notification.permission === 'denied') setStatus('denied');
    else setStatus('default');
  }, []);

  const subscribe = async () => {
    if (status !== 'default') return;
    setStatus('loading');

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus('denied');
        return;
      }

      const swReadyTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('SW ready timeout')), 10000)
      );
      const registration = await Promise.race([navigator.serviceWorker.ready, swReadyTimeout]);
      const existing = await registration.pushManager.getSubscription();
      const subscription = existing || await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
      });

      const p256dh = btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh'))));
      const auth = btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth'))));
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ endpoint: subscription.endpoint, keys: { p256dh, auth } }),
      });

      if (!res.ok) throw new Error('Backend error');
      setStatus('granted');
    } catch (err) {
      console.error('[push] subscribe failed:', err.message);
      setStatus('error');
    }
  };

  return { status, subscribe };
}

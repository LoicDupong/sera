# Push Notifications PWA — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Compléter le flow push notifications PWA — CTA explicite dans le dashboard, souscription on-click, notification à réception d'un RSVP, clic notification vers l'event concerné.

**Architecture:** L'infrastructure backend existe déjà (web-push, modèle DB, routes). On retire la souscription auto du SW registration, on crée un hook `usePushNotifications` + composant `NotificationToggle` dans le dashboard, et on corrige les 4 bugs identifiés (forEach async, payload sans url, sw sans data.url, logging absent).

**Tech Stack:** Next.js 16 App Router, SCSS Modules, Express, Sequelize, web-push 3.6.7

---

## File Map

| Fichier | Action | Rôle |
|---|---|---|
| `frontend/public/sw.js` | Modifier | Passer `data` à `showNotification`, utiliser `data.url` dans `notificationclick` |
| `backend/src/config/webpush.js` | Modifier | Logger les erreurs non-410 |
| `backend/src/controllers/guestFlowController.js` | Modifier | `forEach` → `Promise.allSettled` + `url` dans payload |
| `backend/src/controllers/pushController.js` | Modifier | Ajouter handler `testPush` |
| `backend/src/routes/push.js` | Modifier | Ajouter route `POST /test` (dev only) |
| `frontend/components/PwaInstallPrompt.js` | Modifier | Retirer `subscribeToPush` + helpers |
| `frontend/hooks/usePushNotifications.js` | Créer | Hook : states + logique subscribe |
| `frontend/components/NotificationToggle.js` | Créer | CTA dashboard avec états |
| `frontend/styles/notificationToggle.module.scss` | Créer | Styles du CTA |
| `frontend/app/dashboard/page.js` | Modifier | Intégrer `<NotificationToggle />` |

---

## Task 1 — sw.js : data dans showNotification + url dans notificationclick

**Files:**
- Modify: `frontend/public/sw.js:3-24`

- [ ] **Step 1 : Mettre à jour le listener `push`**

Remplacer le bloc `push` existant (lignes 3-12) :

```js
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? { title: 'Sera', body: 'Nouvelle notification' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon.svg',
      badge: '/icons/icon.svg',
      data: { url: data.url || '/dashboard' },
    })
  );
});
```

- [ ] **Step 2 : Mettre à jour le listener `notificationclick`**

Remplacer le bloc `notificationclick` existant (lignes 14-24) :

```js
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/dashboard';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
```

- [ ] **Step 3 : Commit**

```bash
git add frontend/public/sw.js
git commit -m "fix(sw): pass data.url to notification, use it on click"
```

---

## Task 2 — webpush.js : logging erreurs non-410

**Files:**
- Modify: `backend/src/config/webpush.js:13-16`

- [ ] **Step 1 : Ajouter le logging**

Remplacer le bloc `catch` dans `sendPush` :

```js
const sendPush = async (subscription, payload) => {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  } catch (err) {
    if (err.statusCode === 410) {
      const { PushSubscription } = require('../models');
      await PushSubscription.destroy({ where: { endpoint: subscription.endpoint } });
    } else {
      console.error('[push] sendPush failed:', err.statusCode, err.message);
    }
  }
};
```

- [ ] **Step 2 : Commit**

```bash
git add backend/src/config/webpush.js
git commit -m "fix(push): log non-410 sendPush errors"
```

---

## Task 3 — guestFlowController.js : Promise.allSettled + url dans payload

**Files:**
- Modify: `backend/src/controllers/guestFlowController.js:44-49, 65-70, 111-116`

Il y a 3 blocs identiques à remplacer. Chaque bloc a la forme :
```js
subs.forEach(sub => sendPush(
  { endpoint: sub.endpoint, keys: sub.keys },
  { title: 'Sera', body: `${name} est ${label}` }
));
```

- [ ] **Step 1 : Remplacer le bloc open event — guest existant (lignes 44-49)**

```js
await Promise.allSettled(
  subs.map((sub) => sendPush(
    { endpoint: sub.endpoint, keys: sub.keys },
    { title: 'Nouvelle réponse', body: `${existingGuest.first_name} ${existingGuest.last_name} est ${label}`, url: `/dashboard/${event.id}` }
  ))
);
```

- [ ] **Step 2 : Remplacer le bloc open event — nouveau guest (lignes 65-70)**

```js
await Promise.allSettled(
  subs.map((sub) => sendPush(
    { endpoint: sub.endpoint, keys: sub.keys },
    { title: 'Nouvelle réponse', body: `${newGuest.first_name} ${newGuest.last_name} est ${label}`, url: `/dashboard/${event.id}` }
  ))
);
```

- [ ] **Step 3 : Remplacer le bloc private event — submitRsvp (lignes 111-116)**

```js
await Promise.allSettled(
  subs.map((sub) => sendPush(
    { endpoint: sub.endpoint, keys: sub.keys },
    { title: 'Nouvelle réponse', body: `${guest.first_name} ${guest.last_name} est ${label}`, url: `/dashboard/${event.id}` }
  ))
);
```

- [ ] **Step 4 : Commit**

```bash
git add backend/src/controllers/guestFlowController.js
git commit -m "fix(guest): await push sends, add event url to notification payload"
```

---

## Task 4 — pushController.js + push.js : route /test (dev only)

**Files:**
- Modify: `backend/src/controllers/pushController.js`
- Modify: `backend/src/routes/push.js`

- [ ] **Step 1 : Ajouter `testPush` dans pushController.js**

Remplacer le fichier complet :

```js
const { PushSubscription } = require('../models');
const { sendPush } = require('../config/webpush');

const subscribe = async (req, res) => {
  const { endpoint, keys } = req.body;
  if (!endpoint || !keys?.auth || !keys?.p256dh) {
    return res.status(400).json({ error: 'Subscription invalide' });
  }
  await PushSubscription.upsert({ host_id: req.user.id, endpoint, keys });
  res.status(201).json({ success: true });
};

const unsubscribe = async (req, res) => {
  const { endpoint } = req.body;
  if (!endpoint) return res.status(400).json({ error: 'endpoint requis' });
  await PushSubscription.destroy({ where: { host_id: req.user.id, endpoint } });
  res.status(204).send();
};

const testPush = async (req, res) => {
  const subs = await PushSubscription.findAll({ where: { host_id: req.user.id } });
  if (!subs.length) return res.status(404).json({ error: 'Aucune subscription trouvée' });
  await Promise.allSettled(
    subs.map((sub) => sendPush(
      { endpoint: sub.endpoint, keys: sub.keys },
      { title: 'Test Sera', body: 'Les notifications fonctionnent !', url: '/dashboard' }
    ))
  );
  res.json({ sent: subs.length });
};

module.exports = { subscribe, unsubscribe, testPush };
```

- [ ] **Step 2 : Ajouter la route dans push.js**

Remplacer le fichier complet :

```js
const router = require('express').Router();
const auth = require('../middlewares/auth');
const { subscribe, unsubscribe, testPush } = require('../controllers/pushController');

router.use(auth);

router.post('/subscribe', subscribe);
router.delete('/subscribe', unsubscribe);

if (process.env.NODE_ENV !== 'production') {
  router.post('/test', testPush);
}

module.exports = router;
```

- [ ] **Step 3 : Tester manuellement**

Avec un host connecté et un token valide :
```bash
curl -X POST http://localhost:4000/api/push/test \
  -H "Authorization: Bearer <token>"
# Attendu : { "sent": 1 } si une subscription existe
# Attendu : 404 si aucune subscription
```

- [ ] **Step 4 : Commit**

```bash
git add backend/src/controllers/pushController.js backend/src/routes/push.js
git commit -m "feat(push): add POST /api/push/test route (dev only)"
```

---

## Task 5 — PwaInstallPrompt.js : retirer subscribeToPush

**Files:**
- Modify: `frontend/components/PwaInstallPrompt.js`

- [ ] **Step 1 : Retirer `urlBase64ToUint8Array`, `subscribeToPush`, et l'appel dans register**

Le fichier doit devenir :

```js
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
        .then((registrations) => Promise.all(registrations.map((r) => r.unregister())))
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
```

- [ ] **Step 2 : Commit**

```bash
git add frontend/components/PwaInstallPrompt.js
git commit -m "fix(pwa): remove auto permission request from SW registration"
```

---

## Task 6 — hooks/usePushNotifications.js (nouveau)

**Files:**
- Create: `frontend/hooks/usePushNotifications.js`

- [ ] **Step 1 : Créer le fichier**

```js
'use client';

import { useState, useEffect } from 'react';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

function isIosWithoutPwa() {
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

      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      const subscription = existing || await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
      });

      const p256dh = btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh'))));
      const auth = btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth'))));
      const token = localStorage.getItem('token');

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
```

- [ ] **Step 2 : Commit**

```bash
git add frontend/hooks/usePushNotifications.js
git commit -m "feat(push): add usePushNotifications hook"
```

---

## Task 7 — NotificationToggle.js + styles (nouveau)

**Files:**
- Create: `frontend/components/NotificationToggle.js`
- Create: `frontend/styles/notificationToggle.module.scss`

- [ ] **Step 1 : Créer le composant**

```js
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
```

- [ ] **Step 2 : Créer les styles**

```scss
.cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  background: var(--glass);
  color: var(--text);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(12px);
  transition: background 0.15s, transform 0.15s;

  &:hover:not(:disabled) {
    background: var(--glass-strong);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.active {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);

  &::before {
    content: '✓ ';
  }
}

.hint {
  font-size: 12px;
  color: var(--text-muted);
  max-width: 480px;
}
```

- [ ] **Step 3 : Commit**

```bash
git add frontend/components/NotificationToggle.js frontend/styles/notificationToggle.module.scss
git commit -m "feat(push): add NotificationToggle component with all states"
```

---

## Task 8 — dashboard/page.js : intégrer NotificationToggle

**Files:**
- Modify: `frontend/app/dashboard/page.js`

- [ ] **Step 1 : Ajouter l'import**

Après la ligne `import s from '@/styles/dashboard.module.scss';`, ajouter :

```js
import NotificationToggle from '@/components/NotificationToggle';
```

- [ ] **Step 2 : Ajouter le composant dans le JSX**

Insérer `<NotificationToggle />` entre la section `hero` et `statsGrid` :

```jsx
      </section>

      <NotificationToggle />

      <section className={s.statsGrid} aria-label="Résumé des événements">
```

- [ ] **Step 3 : Commit**

```bash
git add frontend/app/dashboard/page.js
git commit -m "feat(dashboard): add NotificationToggle CTA"
```

---

## Task 9 — Validation manuelle

- [ ] **Step 1 : Démarrer backend + frontend**

```bash
# Terminal 1
cd backend && npm start

# Terminal 2
cd frontend && npm run dev
```

- [ ] **Step 2 : Tester le flow complet**

1. Se connecter en tant que host sur `http://localhost:3000/dashboard`
2. Vérifier que le CTA "Activer les notifications" est visible
3. Cliquer → fenêtre permission navigateur apparaît
4. Autoriser → état change en "Notifications activées"
5. Vérifier en DB :
   ```sql
   SELECT * FROM push_subscriptions WHERE host_id = '<ton-user-id>';
   ```
6. Tester la route dev :
   ```bash
   curl -X POST http://localhost:4000/api/push/test \
     -H "Authorization: Bearer <token>"
   # Attendu : {"sent":1}
   ```
7. Recevoir la notification "Test Sera"
8. Faire répondre un guest via le lien `/invite/<slug>`
9. Recevoir la notification "Nouvelle réponse"
10. Cliquer sur la notification → ouvre `/dashboard/<event-id>`

- [ ] **Step 3 : Vérifier que l'install prompt fonctionne toujours**

Ouvrir le site en production ou via `npm run build && npm start`. Le prompt d'installation doit toujours apparaître si la PWA n'est pas installée.

- [ ] **Step 4 : Push final**

```bash
git push origin main
```

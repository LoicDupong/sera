# Design — Push Notifications PWA (Sera)

**Date:** 2026-05-21  
**Statut:** Approuvé

---

## Contexte

Sera permet à un host de créer des événements et de gérer des invités. Les invités répondent via un lien public sans compte. Le host doit recevoir une notification push quand un invité répond.

L'infrastructure (service worker, web-push, modèle DB, routes backend, déclencheur RSVP) existe déjà. Ce design couvre les morceaux manquants pour un flow complet et conforme aux guidelines navigateur.

---

## Problèmes identifiés à l'audit

1. `PwaInstallPrompt.js` appelle `requestPermission()` automatiquement après enregistrement du SW — sans clic utilisateur. Violation des guidelines et de la spec produit.
2. Aucun CTA "Activer les notifications" dans l'UI host.
3. Aucune gestion des états UI (non supporté, refusé, déjà activé, erreur).
4. `sendPush` non attendu dans `guestFlowController` (`forEach` + async) — erreurs silencieuses.
5. Payload notification sans `url` — le SW ouvre toujours `/dashboard` peu importe l'événement.
6. Pas de logging pour les erreurs non-410 dans `webpush.js`.
7. Pas de route `/api/push/test` pour valider le flow en dev.

---

## Architecture

### Frontend

```
PwaInstallPrompt.js     — enregistre SW + install prompt uniquement (plus de subscribeToPush)
hooks/usePushNotifications.js  — logique subscribe, détection support, états
components/NotificationToggle.js — CTA affiché dans le dashboard host
app/dashboard/page.js   — intègre <NotificationToggle /> entre hero et stats
```

### Backend

```
config/webpush.js           — + logging erreurs non-410
controllers/guestFlowController.js  — forEach → Promise.allSettled + url dans payload
controllers/pushController.js       — + handler testPush (dev only)
routes/push.js              — + POST /test (dev only)
public/sw.js                — notificationclick utilise data.url si présent
```

---

## Détail des changements

### 1. `PwaInstallPrompt.js`

Retirer l'appel à `subscribeToPush()` après l'enregistrement du SW. Le composant revient à sa responsabilité unique : enregistrer le SW et gérer l'install prompt.

### 2. `hooks/usePushNotifications.js` (nouveau)

```
États exposés :
  status: 'unsupported' | 'default' | 'granted' | 'denied' | 'loading' | 'error'

Méthodes exposées :
  subscribe() — demande permission + souscrit + POST /api/push/subscribe

Logique interne :
  - Vérifie support serviceWorker + PushManager + Notification
  - Détecte iOS sans PWA installée (navigator.standalone)
  - await navigator.serviceWorker.ready avant subscription
  - getSubscription() pour éviter les doublons
  - urlBase64ToUint8Array pour la VAPID key
  - Extrait p256dh + auth via getKey()
  - Token depuis localStorage pour l'auth header
```

### 3. `components/NotificationToggle.js` (nouveau)

Composant client, rendu conditionnel selon `status` :

| Status | Rendu |
|---|---|
| `unsupported` | Message discret "Notifications non disponibles sur cet appareil" |
| `granted` | "Notifications activées ✓" (non interactif) |
| `denied` | "Notifications bloquées — modifie les paramètres de ton navigateur" |
| `default` | Bouton "Activer les notifications" |
| `loading` | Bouton désactivé "Activation..." |
| `error` | Message d'erreur discret |
| iOS sans PWA | "Installe Sera sur ton écran d'accueil pour recevoir les notifications" |

### 4. `app/dashboard/page.js`

Ajouter `<NotificationToggle />` entre la section `hero` et `statsGrid`.

### 5. `config/webpush.js`

Dans `sendPush`, ajouter `console.error` pour les erreurs non-410 :

```js
} catch (err) {
  if (err.statusCode === 410) { /* cleanup */ }
  else { console.error('[push] sendPush failed:', err.message); }
}
```

### 6. `controllers/guestFlowController.js`

Remplacer les 3 blocs `forEach` par `Promise.allSettled` et ajouter `url` au payload :

```js
const subs = await PushSubscription.findAll({ where: { host_id: event.host_id } });
const label = ...;
await Promise.allSettled(
  subs.map((sub) => sendPush(
    { endpoint: sub.endpoint, keys: sub.keys },
    { title: 'Nouvelle réponse', body: `${name} est ${label}`, url: `/dashboard/${event.id}` }
  ))
);
```

### 7. `controllers/pushController.js` + `routes/push.js`

Route de test dev-only :

```js
// pushController.js
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

// routes/push.js (guard dev)
if (process.env.NODE_ENV !== 'production') {
  router.post('/test', testPush);
}
```

### 8. `public/sw.js`

Dans `notificationclick`, utiliser `event.notification.data?.url` si présent :

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

Et passer `data` dans `showNotification` :

```js
self.registration.showNotification(data.title, {
  body: data.body,
  icon: '/icons/icon.svg',
  badge: '/icons/icon.svg',
  data: { url: data.url || '/dashboard' },
})
```

---

## Variables d'environnement

Aucun ajout requis — VAPID keys déjà présentes dans `.env`, `.env.local`, et `.env.example`.

---

## Ce qui n'est PAS dans ce scope

- Push vers les guests
- Retry logic sur les push échoués
- Multi-device management UI
- Désabonnement explicite depuis l'UI

---

## Flow de test attendu

1. Host connecté → dashboard → "Activer les notifications" → autoriser
2. Subscription POST vers `/api/push/subscribe` → 201
3. `POST /api/push/test` → notification reçue
4. Guest répond via lien → host reçoit notification
5. Clic notification → ouvre `/dashboard/[event_id]`

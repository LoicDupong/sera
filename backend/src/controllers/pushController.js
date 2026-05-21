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

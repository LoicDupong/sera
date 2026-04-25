const { PushSubscription } = require('../models');

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

module.exports = { subscribe, unsubscribe };

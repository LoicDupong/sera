const { Event, Guest, PushSubscription } = require('../models');
const { sendPush } = require('../config/webpush');

const normalize = (str) =>
  str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/\s+/g, ' ');

const getEventBySlug = async (req, res) => {
  const event = await Event.findOne({
    where: { slug: req.params.slug },
    attributes: ['id', 'title', 'description', 'date', 'location', 'slug'],
  });
  if (!event) return res.status(404).json({ error: 'Event introuvable' });
  res.json(event);
};

const verifyGuest = async (req, res) => {
  const { first_name, last_name } = req.body;
  if (!first_name || !last_name) {
    return res.status(400).json({ error: 'Nom et prénom requis' });
  }
  const event = await Event.findOne({ where: { slug: req.params.slug } });
  if (!event) return res.status(404).json({ error: 'Event introuvable' });

  const guests = await Guest.findAll({ where: { event_id: event.id } });

  const inputFirst = normalize(first_name);
  const inputLast = normalize(last_name);

  const guest = guests.find(
    (g) => normalize(g.first_name) === inputFirst && normalize(g.last_name) === inputLast
  );

  if (!guest) return res.json({ found: false });
  res.json({ found: true, guest_id: guest.id, rsvp_status: guest.rsvp_status });
};

const submitRsvp = async (req, res) => {
  const { guest_id, rsvp_status } = req.body;
  if (!guest_id || !rsvp_status) {
    return res.status(400).json({ error: 'guest_id et rsvp_status requis' });
  }
  if (!['yes', 'no', 'maybe'].includes(rsvp_status)) {
    return res.status(400).json({ error: 'rsvp_status invalide (yes / no / maybe)' });
  }
  const event = await Event.findOne({ where: { slug: req.params.slug } });
  if (!event) return res.status(404).json({ error: 'Event introuvable' });

  const guest = await Guest.findOne({ where: { id: guest_id, event_id: event.id } });
  if (!guest) return res.status(404).json({ error: 'Invité introuvable' });

  await guest.update({ rsvp_status, responded_at: new Date() });

  const subs = await PushSubscription.findAll({ where: { host_id: event.host_id } });
  const label = rsvp_status === 'yes' ? '✅ présent(e)' : rsvp_status === 'no' ? '❌ absent(e)' : '🤔 peut-être';
  subs.forEach(sub => sendPush(
    { endpoint: sub.endpoint, keys: sub.keys },
    { title: 'Sera', body: `${guest.first_name} ${guest.last_name} est ${label}` }
  ));

  res.json({ success: true, rsvp_status: guest.rsvp_status });
};

module.exports = { getEventBySlug, verifyGuest, submitRsvp };

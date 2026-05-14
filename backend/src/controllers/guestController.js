const { Event, Guest } = require('../models');

const normalize = (str) =>
  str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/\s+/g, ' ');

const ownsEvent = async (eventId, hostId) => {
  const event = await Event.findOne({ where: { id: eventId, host_id: hostId } });
  return event;
};

const add = async (req, res) => {
  const { first_name, last_name } = req.body;
  if (!first_name || !last_name) {
    return res.status(400).json({ error: 'first_name et last_name sont requis' });
  }
  const event = await ownsEvent(req.params.id, req.user.id);
  if (!event) return res.status(404).json({ error: 'Event introuvable' });

  if (event.event_type === 'open') {
    return res.status(400).json({ error: "Impossible d'ajouter des invités à un événement ouvert" });
  }

  const allGuests = await Guest.findAll({ where: { event_id: event.id } });
  const inputFirst = normalize(first_name);
  const inputLast = normalize(last_name);
  const existing = allGuests.find(
    (g) => normalize(g.first_name) === inputFirst && normalize(g.last_name) === inputLast
  );
  if (existing) return res.status(409).json({ error: 'Invité déjà dans la liste' });

  const guest = await Guest.create({ event_id: event.id, first_name, last_name });
  res.status(201).json(guest);
};

const remove = async (req, res) => {
  const event = await ownsEvent(req.params.id, req.user.id);
  if (!event) return res.status(404).json({ error: 'Event introuvable' });

  const guest = await Guest.findOne({ where: { id: req.params.guestId, event_id: event.id } });
  if (!guest) return res.status(404).json({ error: 'Invité introuvable' });

  await guest.destroy();
  res.status(204).send();
};

const updateRsvp = async (req, res) => {
  const { rsvp_status } = req.body;
  if (!rsvp_status || !['yes', 'no', 'maybe', 'pending'].includes(rsvp_status)) {
    return res.status(400).json({ error: 'rsvp_status invalide (yes / no / maybe / pending)' });
  }
  const event = await ownsEvent(req.params.id, req.user.id);
  if (!event) return res.status(404).json({ error: 'Event introuvable' });

  const guest = await Guest.findOne({ where: { id: req.params.guestId, event_id: event.id } });
  if (!guest) return res.status(404).json({ error: 'Invité introuvable' });

  await guest.update({ rsvp_status, responded_at: new Date() });
  res.json(guest);
};

module.exports = { add, remove, updateRsvp };

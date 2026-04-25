const { Event, Guest } = require('../models');

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

  const existing = await Guest.findOne({
    where: { event_id: event.id, first_name, last_name },
  });
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

module.exports = { add, remove };

const { Event, Guest } = require('../models');

const create = async (req, res) => {
  const { title, description, date, location, event_type } = req.body;

  // Validate required fields
  if (!title || !date || !location) {
    return res.status(400).json({ error: 'title, date et location sont requis' });
  }

  // Validate event_type if provided
  if (event_type && !['private', 'open'].includes(event_type)) {
    return res.status(400).json({ error: 'event_type invalide (private ou open)' });
  }

  const event = await Event.create({
    host_id: req.user.id,
    title,
    description,
    date,
    location,
    event_type: event_type || 'private',
  });

  res.status(201).json(event);
};

const list = async (req, res) => {
  const events = await Event.findAll({
    where: { host_id: req.user.id },
    order: [['created_at', 'DESC']],
  });
  res.json(events);
};

const getOne = async (req, res) => {
  const event = await Event.findOne({
    where: { id: req.params.id, host_id: req.user.id },
    include: [{ model: Guest, as: 'guests', order: [['created_at', 'ASC']] }],
  });
  if (!event) return res.status(404).json({ error: 'Event introuvable' });
  res.json(event);
};

const update = async (req, res) => {
  const event = await Event.findOne({ where: { id: req.params.id, host_id: req.user.id } });
  if (!event) return res.status(404).json({ error: 'Event introuvable' });
  const { title, description, date, location } = req.body;
  await event.update({ title, description, date, location });
  res.json(event);
};

const remove = async (req, res) => {
  const event = await Event.findOne({ where: { id: req.params.id, host_id: req.user.id } });
  if (!event) return res.status(404).json({ error: 'Event introuvable' });
  await event.destroy();
  res.status(204).send();
};

module.exports = { create, list, getOne, update, remove };

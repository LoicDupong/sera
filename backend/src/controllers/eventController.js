const { Event, Guest } = require('../models');

const create = async (req, res) => {
  const {
    title,
    description,
    date,
    location,
    event_type,
    theme,
    cover_type,
    cover_value,
    custom_message,
  } = req.body;

  // Validate required fields
  if (!title || !date || !location) {
    return res.status(400).json({ error: 'title, date, and location are required' });
  }

  // Validate event_type
  if (event_type && !['private', 'open'].includes(event_type)) {
    return res.status(400).json({ error: 'event_type must be private or open' });
  }

  // Validate theme
  const validThemes = ['birthday', 'wedding', 'baby_shower', 'bbq', 'house_party', 'chill_night', 'corporate', 'minimal'];
  if (theme && !validThemes.includes(theme)) {
    return res.status(400).json({ error: 'Invalid theme' });
  }

  // Validate cover_type
  if (cover_type && !['gradient', 'image'].includes(cover_type)) {
    return res.status(400).json({ error: 'cover_type must be gradient or image' });
  }

  // Validate custom_message length
  if (custom_message && custom_message.length > 160) {
    return res.status(400).json({ error: 'custom_message must be 160 characters or less' });
  }

  try {
    const event = await Event.create({
      host_id: req.user.id,
      title,
      description: description || null,
      date,
      location,
      event_type: event_type || 'private',
      theme: theme || 'minimal',
      cover_type: cover_type || 'gradient',
      cover_value: cover_value || `${theme || 'minimal'}_default`,
      custom_message: custom_message ? custom_message.trim() : null,
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event' });
  }
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

const bulkAddGuests = async (req, res) => {
  const { guests } = req.body;
  if (!Array.isArray(guests) || guests.length === 0) {
    return res.status(400).json({ error: 'guests array requis et non vide' });
  }

  const event = await Event.findOne({
    where: { id: req.params.id, host_id: req.user.id },
  });
  if (!event) return res.status(404).json({ error: 'Event introuvable' });
  if (event.event_type === 'open') {
    return res.status(400).json({ error: "Impossible d'ajouter des invités à un événement ouvert" });
  }

  const errors = [];
  const created = [];

  for (const guest of guests) {
    const { first_name, last_name } = guest;
    if (!first_name || !last_name) {
      errors.push(`Prénom et nom requis pour: ${first_name || '?'} ${last_name || '?'}`);
      continue;
    }

    try {
      const newGuest = await Guest.create({
        event_id: event.id,
        first_name,
        last_name,
        rsvp_status: 'pending',
      });
      created.push(newGuest);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        errors.push(`${first_name} ${last_name} existe déjà`);
      } else {
        errors.push(`Erreur lors de l'ajout de ${first_name} ${last_name}`);
      }
    }
  }

  res.status(201).json({
    created: created.length,
    createdGuests: created,
    errors: errors.length > 0 ? errors : undefined,
  });
};

module.exports = { create, list, getOne, update, remove, bulkAddGuests };

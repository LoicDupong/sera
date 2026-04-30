const { Event, Guest } = require('../models');

const create = async (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const events = await Event.findAll({
      where: { host_id: req.user.id },
      order: [['created_at', 'DESC']],
    });
    res.json(events);
  } catch (err) {
    next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const event = await Event.findOne({
      where: { id: req.params.id, host_id: req.user.id },
      include: [{ model: Guest, as: 'guests', order: [['created_at', 'ASC']] }],
    });
    if (!event) return res.status(404).json({ error: 'Event introuvable' });
    res.json(event);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const event = await Event.findOne({ where: { id: req.params.id, host_id: req.user.id } });
    if (!event) return res.status(404).json({ error: 'Event introuvable' });
    const { title, description, date, location } = req.body;
    await event.update({ title, description, date, location });
    res.json(event);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const event = await Event.findOne({ where: { id: req.params.id, host_id: req.user.id } });
    if (!event) return res.status(404).json({ error: 'Event introuvable' });
    await event.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const bulkAddGuests = async (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
};

module.exports = { create, list, getOne, update, remove, bulkAddGuests };

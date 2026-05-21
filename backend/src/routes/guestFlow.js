const router = require('express').Router();
const { getEventBySlug, verifyGuest, submitRsvp, getEventCalendar } = require('../controllers/guestFlowController');

router.get('/:slug/calendar.ics', getEventCalendar);
router.get('/:slug', getEventBySlug);
router.post('/:slug/verify', verifyGuest);
router.post('/:slug/rsvp', submitRsvp);

module.exports = router;

const router = require('express').Router();
const { getEventBySlug, verifyGuest, submitRsvp } = require('../controllers/guestFlowController');

router.get('/:slug', getEventBySlug);
router.post('/:slug/verify', verifyGuest);
router.post('/:slug/rsvp', submitRsvp);

module.exports = router;

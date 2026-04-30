const router = require('express').Router();
const auth = require('../middlewares/auth');
const { create, list, getOne, update, remove, bulkAddGuests } = require('../controllers/eventController');
const { add: addGuest, remove: removeGuest } = require('../controllers/guestController');

router.use(auth);

router.post('/', create);
router.get('/', list);
router.get('/:id', getOne);
router.put('/:id', update);
router.delete('/:id', remove);

router.post('/:id/guests', addGuest);
router.post('/:id/guests/bulk', bulkAddGuests);
router.delete('/:id/guests/:guestId', removeGuest);

module.exports = router;

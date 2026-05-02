const router = require('express').Router();
const auth = require('../middlewares/auth');
const multer = require('multer');
const { create, list, getOne, update, remove, bulkAddGuests, uploadCover } = require('../controllers/eventController');
const { add: addGuest, remove: removeGuest } = require('../controllers/guestController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.use(auth);

router.post('/', create);
router.get('/', list);
router.get('/:id', getOne);
router.patch('/:id', update);
router.delete('/:id', remove);

router.post('/:id/guests', addGuest);
router.post('/:id/guests/bulk', bulkAddGuests);
router.delete('/:id/guests/:guestId', removeGuest);

router.post('/:id/cover-image', upload.single('file'), uploadCover);

module.exports = router;

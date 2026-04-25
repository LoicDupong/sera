const router = require('express').Router();
const auth = require('../middlewares/auth');
const { subscribe, unsubscribe } = require('../controllers/pushController');

router.use(auth);

router.post('/subscribe', subscribe);
router.delete('/subscribe', unsubscribe);

module.exports = router;

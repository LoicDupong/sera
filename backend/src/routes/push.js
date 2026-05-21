const router = require('express').Router();
const auth = require('../middlewares/auth');
const { subscribe, unsubscribe, testPush } = require('../controllers/pushController');

router.use(auth);

router.post('/subscribe', subscribe);
router.delete('/subscribe', unsubscribe);

if (process.env.NODE_ENV !== 'production') {
  router.post('/test', testPush);
}

module.exports = router;

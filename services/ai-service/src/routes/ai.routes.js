const { Router } = require('express');
const controller = require('../controllers/ai.controller');

const router = Router();

router.get('/health', controller.health);
router.get('/ai/options', controller.getOptions);
router.post('/ai/configure', controller.configure);

module.exports = router;

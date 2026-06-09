const { Router } = require('express');
const controller = require('../controllers/roadmap.controller');

const router = Router();

router.get('/health', controller.health);

// ── Roadmap data ───────────────────────────────────────────────────────
router.get('/api/roadmap', controller.getRoadmap);

// ── Presentation API ───────────────────────────────────────────────────
router.get('/api/presentation/car', controller.getCar);
router.post('/api/presentation/car', controller.setCar);
router.post('/api/presentation/car/start', controller.startCar);
router.post('/api/presentation/car/stop', controller.stopCar);
router.get('/api/presentation/destination', controller.getDestination);

module.exports = router;

const express = require('express');
const { getOptions, buildConfiguration } = require('../controllers/configurations.controller');

const router = express.Router();

router.get('/options/:vehicleSlug', getOptions);
router.post('/build', buildConfiguration);

module.exports = router;

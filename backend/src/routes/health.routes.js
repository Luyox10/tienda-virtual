const express = require('express');
const { getHealth, getHealthDatabase } = require('../controllers/health.controller');

const router = express.Router();

router.get('/', getHealth);
router.get('/database', getHealthDatabase);

module.exports = router;

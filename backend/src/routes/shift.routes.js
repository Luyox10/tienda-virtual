const express = require('express');
const { list, current } = require('../controllers/shift.controller');

const router = express.Router();

router.get('/', list);
router.get('/current', current);

module.exports = router;

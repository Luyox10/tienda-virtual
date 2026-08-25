const express = require('express');
const { createPayment, getPayment } = require('../controllers/payment.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/', verifyToken, createPayment);
router.get('/:id', verifyToken, getPayment);

module.exports = router;

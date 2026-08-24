const express = require('express');
const { create, list, getById } = require('../controllers/order.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/', verifyToken, create);
router.get('/', verifyToken, list);
router.get('/:id', verifyToken, getById);

module.exports = router;

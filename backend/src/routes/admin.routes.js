const express = require('express');
const { create, update } = require('../controllers/adminProduct.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/products', verifyToken, requireRole('admin'), create);
router.patch('/products/:id', verifyToken, requireRole('admin'), update);

module.exports = router;

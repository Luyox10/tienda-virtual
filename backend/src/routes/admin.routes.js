const express = require('express');
const { create, update: updateProduct } = require('../controllers/adminProduct.controller');
const { update: updateAvailability } = require('../controllers/availability.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/products', verifyToken, requireRole('admin'), create);
router.patch('/products/:id', verifyToken, requireRole('admin'), updateProduct);
router.patch('/products/:id/availability', verifyToken, requireRole('admin'), updateAvailability);

module.exports = router;

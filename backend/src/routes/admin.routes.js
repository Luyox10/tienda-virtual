const express = require('express');
const { create, update: updateProduct } = require('../controllers/adminProduct.controller');
const { update: updateAvailability } = require('../controllers/availability.controller');
const { update: updateShift } = require('../controllers/shift.controller');
const { list: listPayments, approve, reject } = require('../controllers/adminPayment.controller');
const { get: getDashboard } = require('../controllers/dashboard.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/dashboard', verifyToken, requireRole('admin'), getDashboard);
router.post('/products', verifyToken, requireRole('admin'), create);
router.patch('/products/:id', verifyToken, requireRole('admin'), updateProduct);
router.patch('/products/:id/availability', verifyToken, requireRole('admin'), updateAvailability);
router.patch('/shifts/:id', verifyToken, requireRole('admin'), updateShift);
router.get('/payments', verifyToken, requireRole('admin'), listPayments);
router.patch('/payments/:id/approve', verifyToken, requireRole('admin'), approve);
router.patch('/payments/:id/reject', verifyToken, requireRole('admin'), reject);

module.exports = router;

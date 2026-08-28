const express = require('express');
const { list, remove } = require('../controllers/user.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', verifyToken, requireRole('admin'), list);
router.delete('/:id', verifyToken, requireRole('admin'), remove);

module.exports = router;

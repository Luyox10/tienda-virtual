const express = require('express');
const { list } = require('../controllers/user.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', verifyToken, requireRole('admin'), list);

module.exports = router;

const pool = require('../config/db');

const getHealth = (req, res) => {
  res.json({ status: 'ok' });
};

const getHealthDatabase = async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    console.error('Database health check failed:', err);
    res.status(503).json({ status: 'error', database: 'disconnected', error: err.message });
  }
};

module.exports = { getHealth, getHealthDatabase };

const dashboardService = require('../services/dashboardService');

const get = async (req, res) => {
  try {
    const data = await dashboardService.get();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { get };

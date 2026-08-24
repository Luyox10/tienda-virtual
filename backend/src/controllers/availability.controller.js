const availabilityService = require('../services/availabilityService');

const update = async (req, res) => {
  try {
    const { date, status } = req.body;
    const record = await availabilityService.set(req.params.id, date, status);
    res.json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { update };

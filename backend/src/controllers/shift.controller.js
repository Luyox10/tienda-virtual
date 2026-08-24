const shiftService = require('../services/shiftService');

const list = async (req, res) => {
  try {
    const shifts = await shiftService.list();
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const current = async (req, res) => {
  try {
    const shift = await shiftService.current();
    res.json({ current: shift });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { list, current };

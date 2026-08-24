const userService = require('../services/userService');

const list = async (req, res) => {
  try {
    const users = await userService.list();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { list };

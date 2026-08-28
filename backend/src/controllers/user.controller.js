const userService = require('../services/userService');

const list = async (req, res) => {
  try {
    const users = await userService.list();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await userService.remove(req.params.id);
    res.json({ id: req.params.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { list, remove };

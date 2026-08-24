const orderService = require('../services/orderService');

const create = async (req, res) => {
  try {
    const order = await orderService.create(req.user.userId, req.body.items);
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const list = async (req, res) => {
  try {
    const orders = await orderService.list(req.user.userId, req.user.role);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const order = await orderService.getById(req.params.id, req.user.userId, req.user.role);
    if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { create, list, getById };

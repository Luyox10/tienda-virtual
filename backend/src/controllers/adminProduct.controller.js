const productService = require('../services/productService');

const create = async (req, res) => {
  try {
    const product = await productService.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const product = await productService.update(req.params.id, req.body);
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await productService.remove(req.params.id);
    res.json({ id: req.params.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { create, update, remove };

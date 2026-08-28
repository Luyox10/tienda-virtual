const reportService = require('../services/reportService');

const paidProducts = async (req, res) => {
  try {
    const products = await reportService.paidProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { paidProducts };

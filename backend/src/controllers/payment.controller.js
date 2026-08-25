const paymentService = require('../services/paymentService');

const createPayment = async (req, res) => {
  try {
    const payment = await paymentService.create({
      userId: req.user.userId,
      orderId: req.body.order_id,
      amount: req.body.amount,
      proofImageUrl: req.body.proof_image_url,
      method: req.body.method || 'YAPE'
    });
    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getPayment = async (req, res) => {
  try {
    const payment = await paymentService.getById(req.params.id, req.user.userId, req.user.role);
    if (!payment) return res.status(404).json({ error: 'Pago no encontrado' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createPayment, getPayment };

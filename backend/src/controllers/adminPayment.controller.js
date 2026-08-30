const paymentService = require('../services/paymentService');

const list = async (req, res) => {
  try {
    const payments = await paymentService.list(req.user.userId, req.user.role);
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const approve = async (req, res) => {
  try {
    const payment = await paymentService.validate(req.params.id, req.user.userId, 'approve', req.body.rejection_reason);
    res.json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const reject = async (req, res) => {
  try {
    const payment = await paymentService.validate(req.params.id, req.user.userId, 'reject', req.body.rejection_reason);
    res.json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const markPending = async (req, res) => {
  try {
    const payment = await paymentService.markPending(req.params.id, req.user.userId);
    res.json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { list, approve, reject, markPending };

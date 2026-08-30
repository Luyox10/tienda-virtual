const db = require('../config/db');

const list = async (userId, role) => {
  let query = 'SELECT * FROM payments';
  const params = [];
  if (role !== 'admin') {
    query += ' WHERE user_id = ?';
    params.push(userId);
  }
  query += ' ORDER BY id DESC';
  const [rows] = await db.execute(query, params);
  return rows;
};

const getById = async (paymentId, userId, role) => {
  let query = 'SELECT * FROM payments WHERE id = ?';
  const params = [paymentId];
  if (role !== 'admin') {
    query += ' AND user_id = ?';
    params.push(userId);
  }
  const [rows] = await db.execute(query, params);
  return rows[0] || null;
};

const create = async ({ userId, orderId, amount, proofImageUrl, method = 'YAPE' }) => {
  const [orderRows] = await db.execute('SELECT * FROM orders WHERE id = ? AND user_id = ?', [orderId, userId]);
  if (orderRows.length === 0) throw new Error('Pedido no encontrado');
  const order = orderRows[0];

  if (order.status !== 'PENDING_PAYMENT') throw new Error('El pedido no espera pago');
  if (Number(amount).toFixed(2) !== Number(order.total).toFixed(2)) throw new Error('Monto incorrecto');

  const [existing] = await db.execute('SELECT id FROM payments WHERE order_id = ?', [orderId]);
  if (existing.length > 0) throw new Error('Ya existe un pago para este pedido');

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.execute(
      'INSERT INTO payments (order_id, user_id, method, amount, voucher_url, status) VALUES (?, ?, ?, ?, ?, ?)',
      [orderId, userId, method, amount, proofImageUrl || null, 'PENDING']
    );
    await conn.commit();
    return getById(result.insertId, userId, 'admin');
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const markPending = async (paymentId, adminId) => {
  const [paymentRows] = await db.execute('SELECT * FROM payments WHERE id = ?', [paymentId]);
  if (paymentRows.length === 0) throw new Error('Pago no encontrado');
  const payment = paymentRows[0];

  const [orderRows] = await db.execute('SELECT * FROM orders WHERE id = ?', [payment.order_id]);
  if (orderRows.length === 0) throw new Error('Pedido no encontrado');
  const order = orderRows[0];

  if (order.status !== 'PENDING_PAYMENT') throw new Error('El pedido ya fue marcado');

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute(
      'UPDATE payments SET reviewed_by = ?, review_notes = ? WHERE id = ?',
      [adminId, 'Marcado como pendiente', paymentId]
    );
    await conn.execute(
      'UPDATE orders SET status = ?, payment_status = ? WHERE id = ?',
      ['PAYMENT_REVIEW', 'PENDING', order.order_id]
    );
    await conn.commit();
    return getById(paymentId, null, 'admin');
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const validate = async (paymentId, adminId, action, reason) => {
  const status = action === 'approve' ? 'APPROVED' : 'REJECTED';
  const note = reason || (action === 'approve' ? 'Aprobado' : 'Rechazado');

  const [paymentRows] = await db.execute('SELECT * FROM payments WHERE id = ?', [paymentId]);
  if (paymentRows.length === 0) throw new Error('Pago no encontrado');
  const payment = paymentRows[0];

  if (payment.status !== 'PENDING') throw new Error('El pago ya fue procesado');

  const orderStatus = action === 'approve' ? 'ACCEPTED' : 'REJECTED';
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();
    await conn.execute(
      'UPDATE payments SET status = ?, reviewed_by = ?, review_notes = ? WHERE id = ?',
      [status, adminId, note, paymentId]
    );
    const paymentStatus = action === 'approve' ? 'PAID' : 'REJECTED';
    await conn.execute(
      'UPDATE orders SET status = ?, payment_status = ? WHERE id = ?',
      [orderStatus, paymentStatus, payment.order_id]
    );
    await conn.commit();
    return getById(paymentId, null, 'admin');
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

module.exports = { list, getById, create, validate, markPending };

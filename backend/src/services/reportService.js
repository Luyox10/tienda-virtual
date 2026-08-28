const db = require('../config/db');

const paidProducts = async () => {
  const [rows] = await db.execute(
    'SELECT oi.id, oi.product_name, oi.quantity, oi.unit_price, oi.subtotal, oi.created_at AS order_date, ' +
    'o.id AS order_id, ' +
    's.name AS shift_name ' +
    'FROM order_items oi ' +
    'JOIN orders o ON oi.order_id = o.id ' +
    'JOIN payments p ON p.order_id = o.id ' +
    'JOIN shifts s ON o.shift_id = s.id ' +
    'WHERE p.status = ? AND o.status = ? ' +
    'ORDER BY oi.created_at DESC',
    ['APPROVED', 'ACCEPTED']
  );
  return rows;
};

module.exports = { paidProducts };

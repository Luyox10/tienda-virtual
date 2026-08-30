const db = require('../config/db');

const get = async () => {
  const [[today]] = await db.execute(
    "SELECT COALESCE(SUM(total), 0) AS sales_today FROM orders WHERE status = 'ACCEPTED' AND DATE(created_at) = CURDATE()"
  );
  const [[month]] = await db.execute(
    "SELECT COALESCE(SUM(total), 0) AS sales_month FROM orders WHERE status = 'ACCEPTED' AND YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())"
  );
  const [counts] = await db.execute(
    "SELECT status, COUNT(*) AS count FROM orders WHERE status IN ('ACCEPTED', 'REJECTED', 'CANCELLED', 'PENDING_PAYMENT') GROUP BY status"
  );

  const map = { ACCEPTED: 0, REJECTED: 0, CANCELLED: 0, PENDING_PAYMENT: 0 };
  for (const r of counts) map[r.status] = r.count;

  const [topProductRows] = await db.execute(
    `SELECT oi.product_id, oi.product_name, p.image_url, SUM(oi.quantity) AS quantity, SUM(oi.subtotal) AS total
     FROM orders o
     JOIN order_items oi ON o.id = oi.order_id
     LEFT JOIN products p ON oi.product_id = p.id
     WHERE o.status = 'ACCEPTED' AND DATE(o.created_at) = CURDATE()
     GROUP BY oi.product_id
     ORDER BY quantity DESC
     LIMIT 1`
  );

  return {
    sales_today: Number(today.sales_today),
    sales_month: Number(month.sales_month),
    accepted_orders: map.ACCEPTED,
    rejected_orders: map.REJECTED,
    cancelled_orders: map.CANCELLED,
    pending_payment_orders: map.PENDING_PAYMENT,
    top_product_today: topProductRows[0] || null
  };
};

module.exports = { get };

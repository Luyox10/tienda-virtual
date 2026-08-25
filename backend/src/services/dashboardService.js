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

  return {
    sales_today: Number(today.sales_today),
    sales_month: Number(month.sales_month),
    accepted_orders: map.ACCEPTED,
    rejected_orders: map.REJECTED,
    cancelled_orders: map.CANCELLED,
    pending_payment_orders: map.PENDING_PAYMENT
  };
};

module.exports = { get };

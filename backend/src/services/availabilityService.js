const db = require('../config/db');

const get = async (productId, date) => {
  const [rows] = await db.execute(
    'SELECT * FROM product_daily_availability WHERE product_id = ? AND availability_date = ?',
    [productId, date]
  );
  return rows[0] || null;
};

const set = async (productId, date, status) => {
  if (!date) throw new Error('Fecha requerida');
  const isSoldOut = String(status).toUpperCase() === 'SOLD_OUT' ? 1 : 0;
  await db.execute(
    'INSERT INTO product_daily_availability (product_id, availability_date, is_sold_out) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE is_sold_out = ?',
    [productId, date, isSoldOut, isSoldOut]
  );
  return get(productId, date);
};

const isAvailable = async (productId, date) => {
  const row = await get(productId, date);
  if (!row) return true;
  return !row.is_sold_out;
};

module.exports = { get, set, isAvailable };

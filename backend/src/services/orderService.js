const db = require('../config/db');
const productService = require('./productService');
const availabilityService = require('./availabilityService');

const list = async (userId, role) => {
  let query =
    'SELECT o.*, s.name AS shift_name, ' +
    '(SELECT p.image_url FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = o.id ORDER BY oi.id LIMIT 1) AS first_product_image, ' +
    '(SELECT p.name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = o.id ORDER BY oi.id LIMIT 1) AS first_product_name ' +
    'FROM orders o LEFT JOIN shifts s ON o.shift_id = s.id';
  const params = [];
  if (role !== 'admin') {
    query += ' WHERE o.user_id = ?';
    params.push(userId);
  }
  query += ' ORDER BY o.id DESC';
  const [rows] = await db.execute(query, params);
  return rows;
};

const getById = async (orderId, userId, role) => {
  let query =
    'SELECT o.*, s.name AS shift_name ' +
    'FROM orders o LEFT JOIN shifts s ON o.shift_id = s.id ' +
    'WHERE o.id = ?';
  const params = [orderId];
  if (role !== 'admin') {
    query += ' AND o.user_id = ?';
    params.push(userId);
  }
  const [orders] = await db.execute(query, params);
  if (orders.length === 0) return null;
  const order = orders[0];
  const [items] = await db.execute(
    'SELECT oi.id, oi.product_id, oi.product_name, oi.quantity, oi.unit_price, oi.subtotal, oi.created_at, p.image_url ' +
    'FROM order_items oi ' +
    'JOIN products p ON oi.product_id = p.id ' +
    'WHERE oi.order_id = ?',
    [orderId]
  );
  order.items = items;
  return order;
};

const create = async (userId, items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('El pedido no tiene productos');
  }

  const firstProduct = await productService.getById(items[0].product_id);
  if (!firstProduct) throw new Error('Producto no encontrado');

  const orderShiftId = firstProduct.shift_id;
  const [shiftRows] = await db.execute('SELECT * FROM shifts WHERE id = ?', [orderShiftId]);
  if (shiftRows.length === 0) throw new Error('Turno no encontrado');

  const shift = shiftRows[0];
  if (!shift.is_enabled) throw new Error('El turno seleccionado no está habilitado');

  const today = new Date().toISOString().slice(0, 10);
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await productService.getById(item.product_id);
      if (!product) throw new Error('Producto no encontrado');
      if (!product.is_active) throw new Error(`Producto ${product.name} está inactivo`);
      if (product.shift_id !== orderShiftId) {
        throw new Error(`Producto ${product.name} no pertenece al turno seleccionado`);
      }

      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error('Cantidad inválida');
      }

      const available = await availabilityService.isAvailable(product.id, today);
      if (!available) throw new Error(`Producto ${product.name} agotado para hoy`);

      const unitPrice = Number(product.price);
      const subtotal = Number((unitPrice * quantity).toFixed(2));
      total += subtotal;

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity,
        unit_price: unitPrice,
        subtotal
      });
    }

    const [orderResult] = await conn.execute(
      'INSERT INTO orders (user_id, shift_id, status, total, payment_status) VALUES (?, ?, ?, ?, ?)',
      [userId, orderShiftId, 'PENDING_PAYMENT', Number(total.toFixed(2)), 'PENDING']
    );

    const orderId = orderResult.insertId;

    for (const oi of orderItems) {
      await conn.execute(
        'INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
        [orderId, oi.product_id, oi.product_name, oi.quantity, oi.unit_price, oi.subtotal]
      );
    }

    await conn.commit();
    return getById(orderId, userId, 'admin');
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

module.exports = { list, getById, create };

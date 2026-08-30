const db = require('../config/db');

const findByEmail = async (email) => {
  const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
};

const findById = async (id) => {
  const [rows] = await db.execute(
    'SELECT u.id, u.role_id, u.full_name, u.email, u.phone, u.is_active, u.created_at, r.name AS role ' +
    'FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?',
    [id]
  );
  return rows[0] || null;
};

const list = async () => {
  const [rows] = await db.execute(
    'SELECT u.id, u.full_name, u.email, u.phone, u.is_active, u.created_at, r.name AS role ' +
    'FROM users u JOIN roles r ON u.role_id = r.id ORDER BY u.id'
  );
  return rows;
};

const create = async ({ role_id, full_name, email, password_hash, phone }) => {
  const [result] = await db.execute(
    'INSERT INTO users (role_id, full_name, email, password_hash, phone) VALUES (?, ?, ?, ?, ?)',
    [role_id, full_name, email, password_hash, phone || null]
  );
  return findById(result.insertId);
};

const update = async (id, { full_name, email, phone, is_active }) => {
  const [result] = await db.execute(
    'UPDATE users SET full_name = ?, email = ?, phone = ?, is_active = ? WHERE id = ?',
    [full_name, email, phone || null, is_active, id]
  );
  if (result.affectedRows === 0) throw new Error('Usuario no encontrado');
  return findById(id);
};

const remove = async (id) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [userRows] = await conn.execute(
      'SELECT u.id, r.name AS role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?',
      [id]
    );
    if (userRows.length === 0) throw new Error('Usuario no encontrado');
    if (userRows[0].role === 'admin') throw new Error('No se puede eliminar un administrador');

    const [orderRows] = await conn.execute('SELECT id FROM orders WHERE user_id = ?', [id]);
    const orderIds = orderRows.map((o) => o.id);

    if (orderIds.length > 0) {
      const placeholders = orderIds.map(() => '?').join(',');
      await conn.execute(`DELETE FROM payments WHERE order_id IN (${placeholders})`, orderIds);
      await conn.execute(`DELETE FROM order_items WHERE order_id IN (${placeholders})`, orderIds);
      await conn.execute(`DELETE FROM orders WHERE id IN (${placeholders})`, orderIds);
    }

    await conn.execute('DELETE FROM payments WHERE user_id = ?', [id]);
    const [result] = await conn.execute('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) throw new Error('Usuario no encontrado');

    await conn.commit();
    return { id };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

module.exports = { findByEmail, findById, list, create, update, remove };

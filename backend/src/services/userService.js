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

module.exports = { findByEmail, findById, list, create };

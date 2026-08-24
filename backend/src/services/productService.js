const db = require('../config/db');

const list = async () => {
  const [rows] = await db.execute(
    'SELECT p.*, s.name AS shift_name ' +
    'FROM products p JOIN shifts s ON p.shift_id = s.id ORDER BY p.id'
  );
  return rows;
};

const getById = async (id) => {
  const [rows] = await db.execute(
    'SELECT p.*, s.name AS shift_name ' +
    'FROM products p JOIN shifts s ON p.shift_id = s.id WHERE p.id = ?',
    [id]
  );
  return rows[0] || null;
};

const create = async ({ shift_id, name, description, price, image_url }) => {
  const [result] = await db.execute(
    'INSERT INTO products (shift_id, name, description, price, image_url) VALUES (?, ?, ?, ?, ?)',
    [shift_id, name, description, price, image_url]
  );
  return getById(result.insertId);
};

const update = async (id, fields) => {
  const allowed = ['shift_id', 'name', 'description', 'price', 'image_url', 'is_active'];
  const sets = [];
  const values = [];

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      sets.push(`${key} = ?`);
      values.push(fields[key]);
    }
  }

  if (sets.length === 0) throw new Error('Nada para actualizar');

  values.push(id);
  await db.execute(`UPDATE products SET ${sets.join(', ')} WHERE id = ?`, values);
  return getById(id);
};

module.exports = { list, getById, create, update };

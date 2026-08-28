const db = require('../config/db');

const list = async () => {
  const [rows] = await db.execute('SELECT * FROM shifts ORDER BY id');
  return rows.map((s) => ({
    ...s,
    is_open: !!s.is_enabled,
  }));
};

const current = async () => {
  const [rows] = await db.execute(
    'SELECT id, name, start_time, end_time, is_enabled ' +
    'FROM shifts WHERE start_time <= CURRENT_TIME AND end_time >= CURRENT_TIME'
  );

  if (rows.length === 0) return null;

  const shift = rows[0];
  shift.is_open = !!shift.is_enabled;
  return shift;
};

const update = async (id, { is_enabled }) => {
  const fields = [];
  const values = [];

  if (is_enabled !== undefined) {
    fields.push('is_enabled = ?');
    values.push(is_enabled ? 1 : 0);
  }

  if (fields.length === 0) throw new Error('Nada para actualizar');

  values.push(id);
  await db.execute(`UPDATE shifts SET ${fields.join(', ')} WHERE id = ?`, values);

  const [rows] = await db.execute('SELECT * FROM shifts WHERE id = ?', [id]);
  return { ...rows[0], is_open: !!rows[0].is_enabled };
};

module.exports = { list, current, update };

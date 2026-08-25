const db = require('../config/db');

const list = async () => {
  const [rows] = await db.execute('SELECT * FROM shifts ORDER BY id');
  return rows;
};

const current = async () => {
  const [rows] = await db.execute(
    'SELECT id, name, start_time, end_time, is_enabled, manual_override ' +
    'FROM shifts WHERE start_time <= CURRENT_TIME AND end_time >= CURRENT_TIME'
  );

  if (rows.length === 0) return null;

  const shift = rows[0];
  const is_open = shift.manual_override !== null ? shift.manual_override : shift.is_enabled;
  shift.is_open = !!is_open;
  return shift;
};

const update = async (id, { is_enabled, manual_override }) => {
  const fields = [];
  const values = [];

  if (is_enabled !== undefined) {
    fields.push('is_enabled = ?');
    values.push(is_enabled ? 1 : 0);
  }

  if (manual_override !== undefined) {
    fields.push('manual_override = ?');
    values.push(manual_override === null ? null : (manual_override ? 1 : 0));
  }

  if (fields.length === 0) throw new Error('Nada para actualizar');

  values.push(id);
  await db.execute(`UPDATE shifts SET ${fields.join(', ')} WHERE id = ?`, values);

  const [rows] = await db.execute('SELECT * FROM shifts WHERE id = ?', [id]);
  return rows[0];
};

module.exports = { list, current, update };

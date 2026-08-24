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

module.exports = { list, current };

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const userService = require('./userService');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 10);

const findRoleId = async (name) => {
  const [rows] = await db.execute('SELECT id FROM roles WHERE name = ?', [name.toLowerCase()]);
  return rows[0]?.id;
};

const register = async ({ full_name, email, password, phone, role = 'customer' }) => {
  const existing = await userService.findByEmail(email);
  if (existing) throw new Error('El usuario ya existe');

  const roleId = await findRoleId(role);
  if (!roleId) throw new Error('Rol inválido');

  const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await userService.create({
    role_id: roleId,
    full_name,
    email,
    password_hash,
    phone
  });

  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    phone: user.phone,
    role
  };
};

const login = async ({ email, password }) => {
  const user = await userService.findByEmail(email);
  if (!user) throw new Error('Credenciales inválidas');

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new Error('Credenciales inválidas');

  const [roleRows] = await db.execute('SELECT name FROM roles WHERE id = ?', [user.role_id]);
  const role = roleRows[0]?.name;

  const token = jwt.sign({ userId: user.id, role }, JWT_SECRET, { expiresIn: '1d' });

  return {
    token,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role
    }
  };
};

module.exports = { register, login };

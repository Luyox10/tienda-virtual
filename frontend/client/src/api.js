const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003/api';

async function postJson(path, body) {
  const res = await fetch(API_URL + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

async function authGetJson(path, token) {
  const res = await fetch(API_URL + path, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

async function authPostJson(path, body, token) {
  const res = await fetch(API_URL + path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

async function getJson(path) {
  const res = await fetch(API_URL + path);
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${path}`);
  return res.json();
}

export const register = (body) => postJson('/auth/register', { ...body, role: 'customer' });
export const login = (body) => postJson('/auth/login', body);
export const getProducts = () => getJson('/products');
export const getShifts = () => getJson('/shifts');
export const getCurrentShift = () => getJson('/shifts/current');
export const createOrder = (items, token) => authPostJson('/orders', { items }, token);
export const getOrders = (token) => authGetJson('/orders', token);
export const getOrder = (id, token) => authGetJson(`/orders/${id}`, token);

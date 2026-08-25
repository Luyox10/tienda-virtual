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

async function authPatchJson(path, body, token) {
  const res = await fetch(API_URL + path, {
    method: 'PATCH',
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

async function authGetJson(path, token) {
  const res = await fetch(API_URL + path, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${path}`);
  return res.json();
}

export const login = (body) => postJson('/auth/login', body);
export const getProducts = () => getJson('/products');
export const getShifts = () => getJson('/shifts');
export const getUsers = (token) => authGetJson('/users', token);
export const getDashboard = (token) => authGetJson('/admin/dashboard', token);
export const createProduct = (body, token) => authPostJson('/admin/products', body, token);
export const updateProduct = (id, body, token) => authPatchJson(`/admin/products/${id}`, body, token);
export const setProductAvailability = (id, body, token) =>
  authPatchJson(`/admin/products/${id}/availability`, body, token);
export const updateShift = (id, body, token) => authPatchJson(`/admin/shifts/${id}`, body, token);
export const getOrders = (token) => authGetJson('/orders', token);
export const getOrder = (id, token) => authGetJson(`/orders/${id}`, token);
export const getPayments = (token) => authGetJson('/admin/payments', token);
export const approvePayment = (id, token) => authPatchJson(`/admin/payments/${id}/approve`, {}, token);
export const rejectPayment = (id, token, reason) =>
  authPatchJson(`/admin/payments/${id}/reject`, { rejection_reason: reason }, token);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003/api';

async function getJson(path) {
  const res = await fetch(API_URL + path);
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${path}`);
  return res.json();
}

export const getProducts = () => getJson('/products');
export const getShifts = () => getJson('/shifts');
export const getUsers = () => getJson('/users');
export const getDashboard = () => getJson('/admin/dashboard');

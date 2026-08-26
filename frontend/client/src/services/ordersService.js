import { authGetJson } from './api'

export const getOrders = (token) => authGetJson('/orders', token)
export const getOrder = (id, token) => authGetJson(`/orders/${id}`, token)

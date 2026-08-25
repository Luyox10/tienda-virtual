import { getJson } from './api'

export const getProducts = () => getJson('/products')

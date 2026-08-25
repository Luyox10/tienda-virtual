import { getJson } from './api'

export const getShifts = () => getJson('/shifts')
export const getCurrentShift = () => getJson('/shifts/current')

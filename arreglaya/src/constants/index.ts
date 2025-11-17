// src/constants/index.ts
// Removed BARRIOS_CABA and PROFESSIONS (no longer used)

export type RequestState = 'enviado' | 'aceptado' | 'rechazado' | 'en curso' | 'finalizado'

export const REQUEST_STATES: RequestState[] = [
  'enviado',
  'aceptado',
  'rechazado',
  'en curso',
  'finalizado',
]
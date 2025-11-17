// src/utils/profile.ts
import type { UiRole } from '../types'

// Re-exportar para compatibilidad con código existente
export type Role = UiRole

export type BaseProfile = {
  name?: string
  lastName?: string
  email?: string
  role?: Role
  /** Documento Nacional de Identidad */
  dni?: string
  /** Teléfono (guardado con el nombre corto para no romper páginas existentes) */
  phone?: string
  /** Dirección postal */
  address?: string
}

export type CustomerProfile = BaseProfile
export type ContractorProfile = BaseProfile & { description?: string; skills?: string[] }
export type AdminProfile = BaseProfile & { note?: string }
export type AnyProfile = CustomerProfile | ContractorProfile | AdminProfile

const KEY_PREFIX = 'homefix.profile:' // una entrada por email

function keyFor(email?: string){
  return `${KEY_PREFIX}${(email||'').toLowerCase()}`
}

export function loadProfile(email?: string): AnyProfile {
  try{
    const raw = localStorage.getItem(keyFor(email))
    return raw ? JSON.parse(raw) as AnyProfile : {}
  }catch{
    return {}
  }
}

export function saveProfile(email: string, updates: Partial<AnyProfile>){
  const current = loadProfile(email)
  const next = { ...current, ...updates }
  localStorage.setItem(keyFor(email), JSON.stringify(next))
  return next
}

export function clearProfile(email?: string){
  localStorage.removeItem(keyFor(email))
}

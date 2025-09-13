// src/utils/profile.ts
export type Role = 'customer' | 'contractor' | 'admin'

export type BaseProfile = { name?: string; email?: string; role?: Role }
export type CustomerProfile = BaseProfile & { barrio?: string; phone?: string }
export type ContractorProfile = BaseProfile & { barrio?: string; profession?: string; description?: string; skills?: string[] }
export type AdminProfile = BaseProfile & { note?: string }
export type AnyProfile = CustomerProfile | ContractorProfile | AdminProfile

const KEY_PREFIX = 'homefix.profile:' // una entrada por email

function keyFor(email?: string){
  return `${KEY_PREFIX}${(email||'').toLowerCase()}`
}

export function loadProfile(email?: string): AnyProfile {
  try{
    const raw = localStorage.getItem(keyFor(email))
    return raw ? JSON.parse(raw) : {}
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
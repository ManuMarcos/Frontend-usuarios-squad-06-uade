export type Role = 'customer' | 'contractor' | 'admin'
export type BaseProfile = { name?: string; email?: string; role?: Role }
export type CustomerProfile = BaseProfile & { barrio?: string; phone?: string }
export type ContractorProfile = BaseProfile & { barrio?: string; profession?: string; description?: string; skills?: string[] }
export type AdminProfile = BaseProfile & { note?: string }
export type AnyProfile = CustomerProfile | ContractorProfile | AdminProfile

const KEY='homefix.profile'

export function loadProfile(): AnyProfile {
  try{ const raw=localStorage.getItem(KEY); return raw? JSON.parse(raw):{} }
  catch{ return {} as AnyProfile }
}

export function saveProfile(updates: Partial<AnyProfile>){
  const current=loadProfile() as AnyProfile
  const next={...current,...updates}
  localStorage.setItem(KEY, JSON.stringify(next))
  return next
}

export function clearProfile(){
  localStorage.removeItem(KEY)
}
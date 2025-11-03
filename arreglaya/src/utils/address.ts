import type { AddressInfo } from '../types/address'

export type AddressErrors = Partial<Record<keyof AddressInfo, string>>

export const EMPTY_ADDR: AddressInfo = {
  userId: undefined,
  apartment: '',
  city: '',
  floor: '',
  number: '',
  state: '',
  street: '',
}

export function isEmptyAddress(a?: AddressInfo | null): boolean {
  if (!a) return true
  const { city, number, state, street, floor, apartment, userId } = a
  const vals = [city, number, state, street, floor, apartment, userId?.toString() ?? '']
  return vals.every(v => !v || String(v).trim() === '')
}

/** Si required=false y el address está vacío, no marca errores. */
export function validateAddress(a?: AddressInfo | null, required = true): AddressErrors {
  const e: AddressErrors = {}
  if (!a) {
    return required
      ? { city:'Obligatorio', number:'Obligatorio', state:'Obligatorio', street:'Obligatorio' }
      : {}
  }
  const filled = !isEmptyAddress(a)
  if (!required && !filled) return e

  const req = (v?: string) => v && v.trim().length > 0
  if (!req(a.city))   e.city = 'Obligatorio'
  if (!req(a.number)) e.number = 'Obligatorio'
  if (!req(a.state))  e.state = 'Obligatorio'
  if (!req(a.street)) e.street = 'Obligatorio'
  return e
}

/** Igualdad por campos del nuevo tipo. */
export function addressesEqual(a?: AddressInfo[], b?: AddressInfo[]): boolean {
  const norm = (xs?: AddressInfo[]) => (xs || []).map(v => ({
    userId: v.userId ?? null,
    apartment: v.apartment || '',
    city: v.city || '',
    floor: v.floor || '',
    number: v.number || '',
    state: v.state || '',
    street: v.street || '',
  }))
  return JSON.stringify(norm(a)) === JSON.stringify(norm(b))
}

/** Devuelve `undefined` si no hay cambios; si cambió, retorna el array filtrado de vacíos. */
export function buildAddressesPatch(oldArr?: AddressInfo[], newArr?: AddressInfo[]): AddressInfo[] | undefined {
  const filtered = (newArr || []).filter(a => !isEmptyAddress(a))
  if (addressesEqual(oldArr || [], filtered)) return undefined
  return filtered
}

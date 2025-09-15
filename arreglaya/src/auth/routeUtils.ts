// src/auth/routeUtils.ts
export type UiRole = 'customer' | 'contractor' | 'admin'
export type ApiRole = 'CLIENTE' | 'PRESTADOR' | 'PROVEEDOR' | 'ADMIN' // ← suma PRESTADOR y mantiene PROVEEDOR

const apiToUi: Record<ApiRole, UiRole> = {
  CLIENTE:   'customer',
  PRESTADOR: 'contractor', // ← nuevo nombre oficial
  PROVEEDOR: 'contractor', // ← compatibilidad hacia atrás
  ADMIN:     'admin',
}

export function toUiRole(role?: UiRole | ApiRole | string | null): UiRole {
  if (!role) return 'customer'
  if (role === 'customer' || role === 'contractor' || role === 'admin') return role
  const norm = String(role).trim().toUpperCase() as ApiRole
  return apiToUi[norm] ?? 'customer'
}

// (opcional pero recomendado) UI → API para futuras llamadas
export function toApiRole(ui: UiRole): Extract<ApiRole, 'CLIENTE'|'PRESTADOR'|'ADMIN'> {
  switch (ui) {
    case 'customer':   return 'CLIENTE'
    case 'contractor': return 'PRESTADOR'
    case 'admin':      return 'ADMIN'
  }
}

const roleHome: Record<UiRole, string> = {
  customer: '/perfil',
  contractor: '/perfil',
  admin: '/admin',
}

export function homeForRole(role?: UiRole | ApiRole | string | null) {
  return roleHome[toUiRole(role)]
}

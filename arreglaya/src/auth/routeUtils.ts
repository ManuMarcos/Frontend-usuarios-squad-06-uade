// src/auth/routeUtils.ts
export type UiRole = 'customer' | 'contractor' | 'admin'
export type ApiRole = 'CLIENTE' | 'PROVEEDOR' | 'ADMIN'

const apiToUi: Record<ApiRole, UiRole> = {
  CLIENTE: 'customer',
  PROVEEDOR: 'contractor',
  ADMIN: 'admin',
}

export function toUiRole(role?: UiRole | ApiRole | string | null): UiRole {
  if (!role) return 'customer'
  if (role === 'customer' || role === 'contractor' || role === 'admin') return role
  const norm = String(role).trim().toUpperCase() as ApiRole   // 👈 trim() agregado
  return apiToUi[norm] ?? 'customer'
}

const roleHome: Record<UiRole, string> = {
  customer: '/perfil',
  contractor: '/perfil',
  admin: '/admin',
}

export function homeForRole(role?: UiRole | ApiRole | string | null) {
  return roleHome[toUiRole(role)]
}
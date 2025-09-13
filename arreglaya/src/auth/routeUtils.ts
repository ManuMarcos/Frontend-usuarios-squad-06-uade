// routeUtils.ts
export type UiRole = 'customer' | 'contractor' | 'admin'
export type ApiRole = 'CLIENTE' | 'PROVEEDOR' | 'ADMIN'

const apiToUi: Record<ApiRole, UiRole> = {
  CLIENTE: 'customer',
  PROVEEDOR: 'contractor',
  ADMIN: 'admin',
}

export function toUiRole(role?: UiRole | ApiRole | null): UiRole {
  if (!role) return 'customer'
  if (role === 'customer' || role === 'contractor' || role === 'admin') return role
  const r = String(role).toUpperCase() as ApiRole
  return apiToUi[r] ?? 'customer'
}

const roleHome: Record<UiRole, string> = {
  customer: '/contratistas',
  contractor: '/trabajos',
  admin: '/admin',
}

export function homeForRole(role?: UiRole | ApiRole | null) {
  return roleHome[toUiRole(role)]
}
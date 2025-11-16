// Tipos centralizados para evitar duplicación

// Roles de la API (backend)
export type ApiRole = 'CLIENTE' | 'PRESTADOR' | 'ADMIN' | 'PROVEEDOR'

// Roles de la UI (frontend)
export type UiRole = 'customer' | 'contractor' | 'admin'

// Objeto de rol completo desde la API
export type RoleObj = {
  id: number
  name: string
  description?: string
  active?: boolean
}

// Función para convertir roles de API a UI
export function apiRoleToUiRole(apiRole?: string): UiRole {
  switch ((apiRole || '').toUpperCase()) {
    case 'CLIENTE': return 'customer'
    case 'PRESTADOR':
    case 'PROVEEDOR': return 'contractor'
    case 'ADMIN': return 'admin'
    default: return 'customer'
  }
}

// Función para convertir roles de UI a API
export function uiRoleToApiRole(uiRole: UiRole): ApiRole {
  switch (uiRole) {
    case 'customer': return 'CLIENTE'
    case 'contractor': return 'PRESTADOR'
    case 'admin': return 'ADMIN'
  }
}


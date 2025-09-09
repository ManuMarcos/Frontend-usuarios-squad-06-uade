import { Role } from './AuthProvider'

const roleHome: Record<Role, string> = {
  customer: '/contratistas',
  contractor: '/trabajos',
  admin: '/admin',
}

export function homeForRole(role?: Role) {
  return role ? roleHome[role] : '/'
}

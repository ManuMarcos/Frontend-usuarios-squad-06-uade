import api from './http'

export type Role = 'CLIENTE' | 'PROVEEDOR' | 'ADMIN'

export interface UserDTO {
  userId: number
  email: string
  firstName: string
  lastName: string
  phoneNumber?: string
  address?: string
  role: Role
  active: boolean
}

// Obtener usuario por ID
export async function getUserById(id: number): Promise<UserDTO> {
  const { data } = await api.get<UserDTO>(`/api/users/${id}`)
  return data
}

// Registrar usuario
export async function createUser(payload: {
  email: string
  password: string
  firstName: string
  lastName: string
  phoneNumber?: string
  address?: string
  role: Role
}) {
  const { data } = await api.post('/api/users/register', payload)
  return data
}

// Resetear contraseña
export async function resetUserPassword(userId: number, newPassword: string) {
  const { data } = await api.patch(`/api/users/${userId}/reset-password`, { newPassword })
  return data
}
import api from './http'

export type Role = 'CLIENTE' | 'PRESTADOR' | 'ADMIN'

export interface RegisterDTO {
  email: string
  password: string
  firstName: string
  lastName: string
  dni: string
  phoneNumber?: string
  address?: string
  role: Role
}

export async function login(email: string, password: string) {
  const { data } = await api.post('/api/users/login', { email, password })
  // Respuesta según api.yaml: { token, userInfo, message }
  return data as {
    token: string
    userInfo: {
      id: number
      email: string
      firstName: string
      lastName: string
      dni: string
      phoneNumber?: string
      address?: string
      active: boolean
      role: Role
    }
    message: string
  }
}

export async function registerUser(dto: RegisterDTO) {
  const { data } = await api.post('/api/users/register', dto)
  return data as {
    message: string
    email: string
    role: Role
  }
}

export async function resetUserPassword(userId: number, newPassword: string) {
  const { data } = await api.patch(`/api/users/${userId}/reset-password`, {
    newPassword,
  })
  return data as string // "Contraseña cambiada con éxito"
}
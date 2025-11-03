import { act } from 'react'
import api from './http'

export type Role = 'CLIENTE' | 'PRESTADOR' | 'ADMIN'
export type RoleObj = {id: number, name: string, description?: string,active?: boolean}

export interface UserDTO {
  userId: number
  email: string
  firstName: string
  lastName: string
  dni: string
  phoneNumber?: string
  address?: string
  roleDescription: Role
  role: RoleObj
  active: boolean
  barrio?:string
}

export type ApiUser = {
  profileImageUrl?: string   // 👈 opcional
  userId: number
  firstName?: string
  lastName?: string
  email: string
  dni?: string
  phoneNumber?: string
  address?: string
  barrio?: string
  roleDescription?: ApiRole,
  isActive?: boolean
}


export type ApiRole = 'CLIENTE' | 'PRESTADOR' | 'ADMIN' | 'PROVEEDOR'
export type UpdateUserRequest = Partial<{
  email: string
  firstName: string
  lastName: string
  dni: string
  phoneNumber: string
  address: string
  isActive: boolean
}>

/**
 * Actualización parcial de usuario
 * PATCH /users/{userId}
 * Devuelve string ("Usuario actualizado con éxito") según tu spec.
 */
export async function updateUserPartial(userId: number, body: UpdateUserRequest): Promise<string> {
  // filtra undefined/null para no sobreescribir accidentalmente
  const payload: Record<string, any> = {}
  Object.entries(body).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') payload[k] = v
  })

  const { data } = await api.patch(`api/users/${userId}`, payload, {
    headers: { 'Content-Type': 'application/json' },
  })

  return typeof data === 'string' ? data : 'Usuario actualizado con éxito'
}

export async function getAllUsers(): Promise<UserDTO[]> {
  const { data } = await api.get<UserDTO[]>(`api/users`)
  return data
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
  dni: string               // ← NEW obligatorio
  phoneNumber: string       // ← NEW obligatorio
  address: string           // ← NEW obligatorio
  role: ApiRole
}) {
  const { data } = await api.post('/api/users/register', payload)
  return data
}

// Resetear contraseña
export async function resetUserPassword(userId: number, newPassword: string) {
  const { data } = await api.patch(`/api/users/${userId}/reset-password`, { newPassword })
  return data
}


// Update parcial (PATCH /api/users/{id}) — protegido
export async function updateUser(userId: number, partial: Partial<{
  email: string
  firstName: string
  lastName: string
  dni: string
  phoneNumber: string
  address: string
}>) {
  await api.patch(`/api/users/${userId}`, partial)
}

// Activar/Inactivar (PATCH /api/users/{id}/active) — protegido
export async function setUserActive(userId: number, active: boolean) {
  await api.patch(`/api/users/${userId}/active`, { active: active })
}
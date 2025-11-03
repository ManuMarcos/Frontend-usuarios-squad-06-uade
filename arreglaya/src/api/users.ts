import api from './http'
import type { AddressInfo } from '../types/address'
import type { ApiRole, RoleObj } from '../types'
import { buildAddressesPatch } from '../utils/address'

export interface UserDTO {
  userId: number
  email: string
  firstName: string
  lastName: string
  dni: string
  phoneNumber?: string
  address?: string
  roleDescription: ApiRole
  role: RoleObj
  active: boolean
  barrio?:string
}
export type CreateUserPayload = {
  firstName: string
  lastName: string
  email: string
  password: string
  dni: string
  phoneNumber: string
  role: ApiRole
  addresses?: AddressInfo[]
  barrio?: string
  profession?: string
}

export type ApiUser = {
  profileImageUrl?: string   // 👈 opcional
  userId: number
  firstName?: string
  lastName?: string
  email: string
  dni?: string
  phoneNumber?: string
  addresses?: AddressInfo[]
  address?: string
  barrio?: string
  roleDescription?: ApiRole,
  isActive?: boolean
}


export type UpdateUserRequest = Partial<{
  firstName: string
  lastName: string
  email: string
  dni: string
  phoneNumber: string
  role: ApiRole
  isActive: boolean
  addresses: AddressInfo[]      // ← enviar array completo si cambió
}>


/**
 * Actualización parcial de usuario
 * PATCH /users/{userId}
 * Devuelve string ("Usuario actualizado con éxito") según tu spec.
 */
export async function updateUserPartial(userId: number | string, body: UpdateUserRequest) {
  const token = localStorage.getItem('auth.token')
  const payload: Record<string, any> = {}
  Object.entries(body).forEach(([k, v]) => {
    if (v !== undefined && v !== '') payload[k] = v
  })
  const { data } = await api.patch(`/users/${userId}`, payload, {
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  })
  return typeof data === 'string' ? data : 'Usuario actualizado con éxito'
}

export async function getAllUsers(): Promise<UserDTO[]> {
  const token = localStorage.getItem('auth.token')
  const { data } = await api.get<UserDTO[]>(`api/users`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  return data
}

// Obtener usuario por ID
export async function getUserById(userId: number) {
  const token = localStorage.getItem('auth.token')
  const { data } = await api.get<UserDTO>(`/users/${userId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
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

export async function adminCreateUser(payload: CreateUserPayload) {
  const token = localStorage.getItem('auth.token')
  const { data } = await api.post('/users/register', payload, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  return data as ApiUser
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
  const token = localStorage.getItem('auth.token')
  await api.patch(`/api/users/${userId}/active`, { active: active }, {
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  })
}
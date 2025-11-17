import { AddressInfo } from '../types/address'
import type { ApiRole } from '../types'
import api from './http'

export interface RegisterDTO {
  email: string
  password: string
  firstName: string
  lastName: string
  dni: string
  phoneNumber?: string
  addresses: AddressInfo[]
  role: ApiRole
  // barrio & profession removed
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
      role: ApiRole
    }
    message: string
  }
}

export async function registerUser(payload: RegisterDTO) {
  const { data } = await api.post('/api/users/register', payload)
  return data
}
import api from './http'

const MOCK = process.env.REACT_APP_AUTH_MOCK === 'true'

export interface RegisterDTO {
  name: string
  email: string
  password: string
  role: 'customer' | 'contractor'
  // extended fields are handled client-side
}

export async function registerUser(dto: RegisterDTO) {
  if (MOCK) {
    await new Promise(r => setTimeout(r, 500))
    return { ok: true }
  }
  const { data } = await api.post('/auth/register', dto)
  return data
}

export async function requestPasswordReset(email: string) {
  if (MOCK) {
    await new Promise(r => setTimeout(r, 500))
    return { ok: true }
  }
  const { data } = await api.post('/auth/forgot-password', { email })
  return data
}

export async function resetPassword(token: string, password: string) {
  if (MOCK) {
    await new Promise(r => setTimeout(r, 500))
    return { ok: true }
  }
  const { data } = await api.post('/auth/reset-password', { token, password })
  return data
}

// src/api/http.ts
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE ?? 'http://localhost:8081',
})

const PUBLIC_PATHS = [
  '/api/users/login',
  '/api/users/register',
  '/api/users/forgot-password',
  '/api/users/reset-password',
  // si usás reset por userId o por token, agregalos acá:
  '/api/users/',             // para /api/users/{id}/reset-password (match por startsWith)
]

api.interceptors.request.use((config) => {
  const url = config.url || ''
  const isPublic = PUBLIC_PATHS.some(p =>
    p.endsWith('/') ? url.startsWith(p) : url === p
  )
  if (!isPublic) {
    const token = localStorage.getItem('auth.token')
    if (token) {
      config.headers = config.headers || {}
      ;(config.headers as any).Authorization = `Bearer ${token}`
    }
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status
    const url = error?.config?.url || ''
    const method = (error?.config?.method || '').toString().toLowerCase()
    const rawMsg = error?.response?.data?.message ?? error?.response?.data ?? ''
    const msg = String(rawMsg || '').toLowerCase()

    const isUserUpdate = method === 'patch' && /api\/users\/\d+/.test(url)
    const skipAuthRedirect =
      url.includes('/api/users/change-password') ||
      url.includes('/api/users/register') ||
      url.includes('api/users/register') ||
      url.includes('/api/users/reset-password') ||
      isUserUpdate

    // Evitar invalidar sesión en 403 de validación (ej: email duplicado)
    const isValidation403 =
      status === 403 &&
      !!msg &&
      /(email|correo).*exist|registrad/.test(msg)

    if (skipAuthRedirect || isValidation403) {
      return Promise.reject(error)
    }

    if (status === 401 || status === 403) {
      const inactive = /inactiv|inactive|deshabilitad/.test(msg)

      // limpiar sesión local
      try {
        localStorage.removeItem('auth.token')
        localStorage.removeItem('auth.user')
      } catch {}

      // evitar loops si ya estás en /login
      if (typeof window !== 'undefined') {
        const path = window.location.pathname || ''
        const alreadyOnLogin = path.startsWith('/login')
        if (!alreadyOnLogin) {
          const qp = inactive ? 'm=inactive' : 'm=expired'
          window.location.replace(`/login?${qp}`)
        }
      }
    }
    return Promise.reject(error)
  }
)


export default api

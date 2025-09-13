// src/api/http.ts
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || 'http://localhost:8081',
})

const PUBLIC_PATHS = [
  '/api/users/login',
  '/api/users/register',
  // si usás reset por userId o por token, agregalos acá:
  '/api/users/',             // para /api/users/{id}/reset-password (match por startsWith)
]

api.interceptors.request.use((config) => {
  const url = config.url || ''
  const isPublic = PUBLIC_PATHS.some(p =>
    p.endsWith('/') ? url.startsWith(p) : url === p
  )
  if (!isPublic) {
    const token = localStorage.getItem('homefix.jwt')
    if (token) {
      config.headers = config.headers || {}
      ;(config.headers as any).Authorization = `Bearer ${token}`
    }
  }
  return config
})

export default api
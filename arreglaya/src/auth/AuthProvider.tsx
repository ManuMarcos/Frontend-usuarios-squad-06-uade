import React, { createContext, useContext } from 'react'
import { login as apiLogin } from '../api/auth'
import { toUiRole, type UiRole } from './routeUtils'

export interface User {
  id: number
  email: string
  role: UiRole
  name: string
  firstName: string
  lastName: string
  phoneNumber?: string
  address?: string
  token: string
}

interface AuthContextValue {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estado inicial: normaliza el role guardado
  const [user, setUser] = React.useState<User | null>(() => {
    const raw = localStorage.getItem('homefix.user')
    if (!raw) return null
    try {
      const u = JSON.parse(raw)
      u.role = toUiRole(u.role)
      localStorage.setItem('homefix.user', JSON.stringify(u))
      return u
    } catch {
      return null
    }
  })

  async function login(email: string, password: string) {
    const res = await apiLogin(email, password)
    const u: User = {
      id: res.userInfo.id,
      email: res.userInfo.email,
      role: toUiRole(res.userInfo.role), // 🔑 siempre normalizamos a UiRole
      name: `${res.userInfo.firstName} ${res.userInfo.lastName}`.trim(),
      firstName: res.userInfo.firstName,
      lastName: res.userInfo.lastName,
      phoneNumber: res.userInfo.phoneNumber,
      address: res.userInfo.address,
      token: res.token,
    }
    localStorage.setItem('homefix.user', JSON.stringify(u))
    localStorage.setItem('homefix.jwt', u.token)
    setUser(u)
  }

  function logout() {
    localStorage.removeItem('homefix.user')
    localStorage.removeItem('homefix.jwt')
    setUser(null)
  }

  // 🔄 Normaliza si por algún motivo el role cambia en el user actual
  React.useEffect(() => {
    if (!user) return
    const normalized = { ...user, role: toUiRole(user.role) }
    if (normalized.role !== user.role) {
      setUser(normalized)
      localStorage.setItem('homefix.user', JSON.stringify(normalized))
    }
  }, [user])

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
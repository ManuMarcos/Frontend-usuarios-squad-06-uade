import React, { createContext, useContext } from 'react'
import { login as apiLogin } from '../api/auth'
import type { UiRole, ApiRole } from '../types'
import { apiRoleToUiRole } from '../types'

export type User = {
  id:  number
  email: string
  name?: string
  role: UiRole
  /** Payload completo devuelto por el backend (sin tokens/contraseña). */
  meta?: Record<string, any>
}

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<User>
  logout: () => void
  /** Mezcla (merge) los cambios del backend a la sesión local. */
  mergeUserMeta: (patch: Record<string, any>) => void
}

const AuthContext = createContext<AuthContextType>({} as any)

const TOKEN_KEY = 'auth.token'
const USER_KEY  = 'auth.user'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(USER_KEY)
      return raw ? JSON.parse(raw) as User : null
    } catch { return null }
  })


  const login = React.useCallback(async (email: string, password: string) => {
    const data = await apiLogin( email, password )
    const token   = data?.token as string | undefined
    const apiUser = data?.userInfo ?? {}
    const apiRole = apiUser?.role as ApiRole | string | undefined

    // ⛔️ Bloqueo si isActive === false
    const isActiveFlag =
      typeof apiUser?.active === 'boolean' ? apiUser.active : true // undefined => true (compatibilidad)
    if (!isActiveFlag) {
      const err: any = new Error('Cuenta inactiva')
      err.code = 'INACTIVE_ACCOUNT'
      err.message = 'Tu cuenta está inactiva. Contactá a un administrador.'
      throw err
    }

    const uiRole = apiRoleToUiRole(apiRole)
    const id   = apiUser?.id ?? email
    const name =
      [apiUser?.firstName, apiUser?.lastName].filter(Boolean).join(' ') ||
      email.split('@')[0]

    // limpiamos campos sensibles del meta
    const { ...safeMeta } = apiUser

    const u: User = { id, email: apiUser?.email ?? email, name, role: uiRole, meta: { ...safeMeta, isActive: isActiveFlag } }

    if (token) localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(u))
    setUser(u)

    return u
  }, [])

  const logout = React.useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  const mergeUserMeta = React.useCallback((patch: Record<string, any>) => {
    setUser(prev => {
      if (!prev) return prev
      const mergedMeta = { ...(prev.meta || {}), ...patch }

      // recomputamos nombre si vienen firstName/lastName
      const newFirst = mergedMeta.firstName ?? prev.meta?.firstName
      const newLast  = mergedMeta.lastName  ?? prev.meta?.lastName
      const newName =
        [newFirst, newLast].filter(Boolean).join(' ') ||
        mergedMeta.name ||
        prev.name

      const newEmail = mergedMeta.email ?? prev.email

      const next: User = {
        ...prev,
        email: newEmail,
        name: newName,
        meta: mergedMeta,
      }
      localStorage.setItem(USER_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const value = React.useMemo<AuthContextType>(() => ({
    user, login, logout, mergeUserMeta
  }), [user, login, logout, mergeUserMeta])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

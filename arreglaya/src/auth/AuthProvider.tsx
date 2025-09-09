import React, { createContext, useContext } from 'react'

export type Role = 'customer' | 'contractor' | 'admin'
export interface User { id: string; email: string; role: Role; name: string; token: string }

interface AuthContextValue { user: User | null; login: (email: string, role: Role) => void; logout: () => void }

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(() => {
    const raw = localStorage.getItem('homefix.user'); return raw ? JSON.parse(raw) : null
  })
  function login(email: string, role: Role) {
    const fakeToken = btoa(JSON.stringify({ sub: email, role }))
    const u: User = { id: crypto.randomUUID(), email, role, name: email.split('@')[0], token: fakeToken }
    localStorage.setItem('homefix.user', JSON.stringify(u)); localStorage.setItem('homefix.jwt', u.token); setUser(u)
  }
  function logout() {
    localStorage.removeItem('homefix.user');
    localStorage.removeItem('homefix.jwt');
    setUser(null);
  }
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
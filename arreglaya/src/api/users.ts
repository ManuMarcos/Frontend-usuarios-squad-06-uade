import api from './http'
import type { Role } from '../auth/AuthProvider'

export type UserDTO = { id: string; name: string; email: string; role: Role }

const KEY = 'homefix.usersDb'
const USE_MOCK = (process.env.REACT_APP_USERS_MOCK ?? 'true') !== 'false'

function seed(): UserDTO[] {
  return [
    { id: 'u1', name: 'Ana Clienta', email: 'ana@ejemplo.com', role: 'customer' },
    { id: 'u2', name: 'Bruno Contratista', email: 'bruno@ejemplo.com', role: 'contractor' },
    { id: 'u3', name: 'Carla Admin', email: 'carla@ejemplo.com', role: 'admin' },
    { id: 'u4', name: 'Diego Cliente', email: 'diego@ejemplo.com', role: 'customer' },
    { id: 'u5', name: 'Elena Contratista', email: 'elena@ejemplo.com', role: 'contractor' },
    { id: 'u6', name: 'Fabio Admin', email: 'fabio@ejemplo.com', role: 'admin' },
  ]
}

function readDb(): UserDTO[] {
  const raw = localStorage.getItem(KEY)
  if (!raw) {
    const s = seed()
    localStorage.setItem(KEY, JSON.stringify(s))
    return s
  }
  try { return JSON.parse(raw) as UserDTO[] }
  catch {
    const s = seed()
    localStorage.setItem(KEY, JSON.stringify(s))
    return s
  }
}

function writeDb(users: UserDTO[]) {
  localStorage.setItem(KEY, JSON.stringify(users))
}

export function ensureUserInDb(u: { id: string; email: string; name: string; role: Role }){
  const db = readDb()
  const exists = db.some(x => x.email.toLowerCase() === u.email.toLowerCase())
  if (!exists) {
    db.push({ id: u.id, email: u.email, name: u.name || u.email.split('@')[0], role: u.role })
    writeDb(db)
  }
}

export async function fetchUsers(): Promise<UserDTO[]> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300))
    return readDb()
  }
  const { data } = await api.get('/users')
  return data
}

export async function updateUserRole(id: string, role: Role): Promise<UserDTO> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 250))
    const db = readDb()
    const idx = db.findIndex(u => u.id === id)
    if (idx >= 0) {
      db[idx] = { ...db[idx], role }
      writeDb(db)
      return db[idx]
    }
    throw new Error('Usuario no encontrado')
  }
  const { data } = await api.patch(`/users/${id}/role`, { role })
  return data
}

export async function bulkUpdateRole(ids: string[], role: Role): Promise<number> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300))
    const db = readDb()
    let count = 0
    ids.forEach(id => {
      const idx = db.findIndex(u => u.id === id)
      if (idx >= 0) { db[idx] = { ...db[idx], role }; count++ }
    })
    writeDb(db)
    return count
  }
  const { data } = await api.post('/users/bulk-role', { ids, role })
  return data?.updated ?? 0
}

export async function createUser(user: Omit<UserDTO, 'id'>): Promise<UserDTO> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 250))
    const newU: UserDTO = { id: crypto.randomUUID(), ...user }
    const db = readDb(); db.push(newU); writeDb(db)
    return newU
  }
  const { data } = await api.post('/users', user)
  return data
}

export async function deleteUser(id: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 250))
    const db = readDb().filter(u => u.id !== id); writeDb(db)
    return
  }
  await api.delete(`/users/${id}`)
}

/** Baja de cuenta del usuario actual (self delete) */
export async function deleteAccountSelf(current: { id: string; email: string }): Promise<void> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 250))
    // intentamos por id y, si no está, por email
    const db = readDb()
    const byId = db.findIndex(u => u.id === current.id)
    let next = db
    if (byId >= 0) {
      next = db.filter(u => u.id !== current.id)
    } else {
      next = db.filter(u => u.email.toLowerCase() !== current.email.toLowerCase())
    }
    writeDb(next)
    return
  }
  // Backend real sugerido:
  // await api.delete('/users/me')
  await api.delete(`/users/${current.id}`)
}

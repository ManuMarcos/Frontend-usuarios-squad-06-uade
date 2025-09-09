import { create } from 'zustand'
import { REQUEST_STATES } from './constants'
export type RequestState = typeof REQUEST_STATES[number]

export interface Contractor { id:string; name:string; description:string; rating:number; reviews:number; profession:string; barrio:string; phone?:string; skills?:string[] }
export interface Request { id:string; contractorId:string; contractorName:string; subject:string; image?:string; createdAt:string; state:RequestState; customerEmail:string }

interface State {
  selectedFilters: { profession?: string; barrio?: string }
  setFilters: (f: { profession?: string; barrio?: string }) => void
  contractors: Contractor[]
  requests: Request[]
  addRequest: (r: { contractorId: string; subject: string; image?: string; customerEmail: string }) => Request
}

const contractorsSeed: Contractor[] = [
  { id: '1', name: 'Juan Perez', description: 'Carpintero con 10 años de experiencia', rating: 4, reviews: 20, profession: 'Carpintero/a', barrio: 'Palermo', phone: '11-5779-933', skills: ['mesas','sillas'] },
  { id: '2', name: 'Romina Gonzalez', description: 'Pintora profesional interior/exterior', rating: 5, reviews: 12, profession: 'Pintor/a', barrio: 'Caballito' },
  { id: '3', name: 'Julian Alvarez', description: 'Electricista matriculado', rating: 4, reviews: 25, profession: 'Electricista', barrio: 'Flores' },
  { id: '4', name: 'Juana Rodriguez', description: 'Plomería y gas', rating: 3, reviews: 18, profession: 'Plomero/a', barrio: 'Belgrano' },
]

export const useStore = create<State>((set, get) => ({
  selectedFilters: {},
  setFilters: (f) => set({ selectedFilters: f }),

  contractors: contractorsSeed,
  requests: [],
  addRequest: ({ contractorId, subject, image, customerEmail }) => {
    const c = get().contractors.find(x=>x.id===contractorId)!
    const req: Request = {
      id: crypto.randomUUID(),
      contractorId,
      contractorName: c.name,
      subject, image,
      createdAt: new Date().toISOString(),
      state: 'enviado',
      customerEmail,
    }
    set({ requests: [req, ...get().requests] })
    return req
  },
}))

import React from 'react'
import { Chip } from '@mui/material'
import type { Role } from '../auth/AuthProvider'

const map: Record<Role, { label: string; color: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' }> = {
  customer:   { label: 'Cliente',     color: 'primary'  },
  contractor: { label: 'Contratista', color: 'success'  },
  admin:      { label: 'Admin',       color: 'warning'  },
}

export default function RoleChip({ role }: { role: Role }){
  const r = map[role]
  return <Chip size="small" color={r.color} label={r.label} />
}

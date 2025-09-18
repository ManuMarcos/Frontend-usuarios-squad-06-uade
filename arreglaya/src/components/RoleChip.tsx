// src/components/RoleChip.tsx
import React from 'react'
import { Chip } from '@mui/material'
import type { UiRole } from '../auth/routeUtils'

const map: Record<string, { label: string; color: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' }> = {
  customer:   { label: 'Cliente',     color: 'primary'  },
  contractor: { label: 'Contratista', color: 'success'  },
  admin:      { label: 'Admin',       color: 'warning'  },
}

export default function RoleChip({ role }: { role:  string }) {
  const r = map[role as string]
  if (!r) return <Chip size="small" color="default" label={role || 'Desconocido'} />
  return <Chip size="small" color={r.color} label={r.label} />
}
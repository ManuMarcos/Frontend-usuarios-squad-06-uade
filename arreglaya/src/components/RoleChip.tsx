// src/components/RoleChip.tsx
import React from 'react'
import { Chip } from '@mui/material'
import { toUiRole } from '../auth/routeUtils'

const map: Record<string, { label: string; color: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' }> = {
  customer:   { label: 'Cliente',     color: 'primary'  },
  contractor: { label: 'Contratista', color: 'success'  },
  admin:      { label: 'Admin',       color: 'warning'  },
}

export default function RoleChip({ role }: { role?: string }) {
  const normalized = role ? toUiRole(role) : undefined
  const r = normalized ? map[normalized] : undefined
  if (!r) return <Chip size="small" color="default" label={role || 'Desconocido'} />
  return <Chip size="small" color={r.color} label={r.label} />
}

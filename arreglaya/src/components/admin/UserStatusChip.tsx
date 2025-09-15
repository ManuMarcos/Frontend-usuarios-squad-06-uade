import React from 'react'
import { Chip } from '@mui/material'

export default function UserStatusChip({ isActive }: { isActive?: boolean }){
  const active = isActive !== false
  return (
    <Chip
      size="small"
      label={active ? 'Activo' : 'Inactivo'}
      color={active ? 'success' : 'default'}
      variant={active ? 'filled' : 'outlined'}
    />
  )
}

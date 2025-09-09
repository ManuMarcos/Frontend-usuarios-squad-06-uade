import React from 'react'
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import type { Role } from '../auth/AuthProvider'
import type { SxProps, Theme } from '@mui/material/styles'

export default function RoleSelect({
  value, onChange, size='small', label='Rol', disabled=false, sx
}:{
  value: Role
  onChange: (r: Role)=>void
  size?: 'small'|'medium'
  label?: string
  disabled?: boolean
  sx?: SxProps<Theme>
}){
  return (
    <FormControl size={size} sx={{ minWidth: 160, ...sx }} disabled={disabled}>
      <InputLabel id="role-select-label">{label}</InputLabel>
      <Select
        labelId="role-select-label"
        value={value}
        label={label}
        onChange={e=>onChange(e.target.value as Role)}
      >
        <MenuItem value="customer">Cliente</MenuItem>
        <MenuItem value="contractor">Contratista</MenuItem>
        <MenuItem value="admin">Admin</MenuItem>
      </Select>
    </FormControl>
  )
}

// src/pages/profile/CustomerProfile.tsx
import React from 'react'
import {
  Paper, Stack, Typography, Avatar, Chip, TextField, Button, FormControl,
  InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions,
  Checkbox, FormControlLabel, Box
} from '@mui/material'
import { useAuth } from '../../auth/AuthProvider'
import { loadProfile, saveProfile, clearProfile } from '../../utils/profile'
import { BARRIOS_CABA } from '../../constants'
import { useNavigate } from 'react-router-dom'

export default function CustomerProfile(){
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // 👇 clave única por usuario
  const email = user?.email || ''
  const base  = loadProfile(email)

  const fullNameFromUser =
    (user as any)?.firstName && (user as any)?.lastName
      ? `${(user as any).firstName} ${(user as any).lastName}`
      : (user as any)?.name

  const [edit, setEdit]     = React.useState(false)
  const [name, setName]     = React.useState(base.name || fullNameFromUser || '')
  const [barrio, setBarrio] = React.useState((base as any).barrio || '')
  const [phone, setPhone]   = React.useState((base as any).phone || '')

  const [openDelete, setOpenDelete]   = React.useState(false)
  const [ackDelete, setAckDelete]     = React.useState(false)
  const [busyDelete, setBusyDelete]   = React.useState(false)

  function save(){
    // guarda el perfil asociado al email del usuario logueado
    saveProfile(email, { name, email, role:'customer', barrio, phone })
    setEdit(false)
  }

  async function doDelete(){
    setBusyDelete(true)
    try{
      clearProfile(email) // borra solo mi perfil local
      logout()
      navigate('/', { replace: true })
    } finally {
      setBusyDelete(false)
    }
  }

  const avatarInitial = (name || email || '?')[0]?.toUpperCase() || '?'

  return (
    <Paper sx={{p:3}}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ width:64, height:64 }}>{avatarInitial}</Avatar>
          <Stack>
            <Typography variant="h5" fontWeight={800}>{name || 'Tu nombre'}</Typography>
            <Typography variant="body2" color="text.secondary">{email}</Typography>
            <Stack direction="row" spacing={1} mt={1}><Chip label="Cliente" /></Stack>
          </Stack>
        </Stack>

        {!edit ? (
          <Stack spacing={1}>
            <Typography><b>Barrio:</b> {barrio || '—'}</Typography>
            <Typography><b>Teléfono:</b> {phone || '—'}</Typography>

            <Stack direction="row" spacing={1} mt={2}>
              <Button variant="outlined" onClick={()=>setEdit(true)}>Editar</Button>
              <Button color="error" variant="outlined" onClick={()=>{ logout(); navigate('/', { replace: true })}}>Cerrar sesión</Button>
            </Stack>

          
          </Stack>
        ) : (
          <Stack spacing={2}>
            <TextField label="Nombre" value={name} onChange={e=>setName(e.target.value)} />
            <FormControl fullWidth>
              <InputLabel id="barrio">Barrio</InputLabel>
              <Select labelId="barrio" label="Barrio" value={barrio} onChange={e=>setBarrio(e.target.value)}>
                <MenuItem value=""><em>Ninguno</em></MenuItem>
                {BARRIOS_CABA.map(b=><MenuItem key={b} value={b}>{b}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Teléfono" value={phone} onChange={e=>setPhone(e.target.value)} />
            <Stack direction="row" spacing={2}>
              <Button variant="outlined" onClick={()=>setEdit(false)}>Cancelar</Button>
              <Button onClick={save}>Guardar</Button>
            </Stack>
          </Stack>
        )}
      </Stack>

     
    </Paper>
  )
}
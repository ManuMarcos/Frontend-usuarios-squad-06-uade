// src/pages/profile/AdminProfile.tsx
import React from 'react'
import {
  Paper, Stack, Typography, Avatar, Chip, TextField, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, FormControlLabel, Box
} from '@mui/material'
import { useAuth } from '../../auth/AuthProvider'
import { loadProfile, saveProfile, clearProfile } from '../../utils/profile'
import { useNavigate } from 'react-router-dom'

export default function AdminProfile(){
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const email = user?.email || ''
  const base  = loadProfile(email)

  const fullNameFromUser =
    (user as any)?.firstName && (user as any)?.lastName
      ? `${(user as any).firstName} ${(user as any).lastName}`
      : (user as any)?.name

  const [edit, setEdit]   = React.useState(false)
  const [name, setName]   = React.useState(base.name || fullNameFromUser || '')
  const [note, setNote]   = React.useState((base as any).note || '')

  const [openDelete, setOpenDelete] = React.useState(false)
  const [ackDelete, setAckDelete]   = React.useState(false)
  const [busyDelete, setBusyDelete] = React.useState(false)

  function save(){
    if (!email) return
    // 👇 guardar bajo la clave del email
    saveProfile(email, { name, email, role: 'admin', note })
    setEdit(false)
  }

  async function doDelete(){
    setBusyDelete(true)
    try{
      clearProfile(email)
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
            <Stack direction="row" spacing={1} mt={1}><Chip label="Admin" /></Stack>
          </Stack>
        </Stack>

        {!edit ? (
          <Stack spacing={1}>
            <Typography><b>Nota:</b> {note || '—'}</Typography>
            <Stack direction="row" spacing={1} mt={2}>
              <Button variant="outlined" onClick={()=>setEdit(true)}>Editar</Button>
              <Button color="error" variant="outlined" onClick={()=>{ logout(); navigate('/', { replace: true }) }}>Cerrar sesión</Button>
            </Stack>

            
          </Stack>
        ) : (
          <Stack spacing={2}>
            <TextField label="Nombre" value={name} onChange={e=>setName(e.target.value)} />
            <TextField label="Nota" value={note} onChange={e=>setNote(e.target.value)} />
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
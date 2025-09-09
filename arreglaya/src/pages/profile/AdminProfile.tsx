import React from 'react'
import {
  Paper, Stack, Typography, Avatar, Chip, TextField, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, FormControlLabel, Box
} from '@mui/material'
import { useAuth } from '../../auth/AuthProvider'
import { loadProfile, saveProfile, clearProfile } from '../../utils/profile'
import { useNavigate } from 'react-router-dom'
import { deleteAccountSelf } from '../../api/users'

export default function AdminProfile(){
  const { user, logout } = useAuth()
  const navigate=useNavigate()

  const [edit,setEdit]=React.useState(false)
  const base=loadProfile()
  const [name,setName]=React.useState(base.name || user?.name || '')
  const [email]=React.useState(user?.email || base.email || '')
  const [note,setNote]=React.useState((base as any).note || '')

  // Baja de cuenta
  const [openDelete, setOpenDelete] = React.useState(false)
  const [ackDelete, setAckDelete] = React.useState(false)
  const [busyDelete, setBusyDelete] = React.useState(false)

  function save(){
    saveProfile({ name, email, role:'admin', note })
    setEdit(false)
  }

  async function doDelete(){
    if(!user) return
    setBusyDelete(true)
    try{
      await deleteAccountSelf({ id: user.id, email: user.email })
    }finally{
      clearProfile()
      logout()
      navigate('/', { replace: true })
    }
  }

  return (
    <Paper sx={{p:3}}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ width:64, height:64 }}>{(name || email)[0]?.toUpperCase() || '?'}</Avatar>
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
              <Button color="error" variant="outlined" onClick={()=>{logout(); navigate('/', { replace: true })}}>Cerrar sesión</Button>
            </Stack>

            {/* Zona peligrosa: Baja de cuenta */}
            <Box sx={{mt:3, p:2, border:'1px solid', borderColor:'error.main', borderRadius:2}}>
              <Typography variant="subtitle2" color="error" gutterBottom>Dar de baja mi cuenta</Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Esta acción es permanente y eliminará tu cuenta (incluye perder acceso al panel admin).
              </Typography>
              <Button color="error" variant="contained" onClick={()=>{ setAckDelete(false); setOpenDelete(true) }}>
                Eliminar cuenta
              </Button>
            </Box>
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

      {/* Diálogo de confirmación de baja */}
      <Dialog open={openDelete} onClose={()=>setOpenDelete(false)}>
        <DialogTitle>Confirmar baja de cuenta</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{mb:1}}>
            Vas a eliminar tu cuenta de forma permanente.
          </Typography>
          <FormControlLabel
            control={<Checkbox checked={ackDelete} onChange={e=>setAckDelete(e.target.checked)} />}
            label="Entiendo las consecuencias y deseo continuar"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenDelete(false)} disabled={busyDelete}>Cancelar</Button>
          <Button color="error" variant="contained" disabled={!ackDelete || busyDelete} onClick={doDelete}>
            {busyDelete ? 'Eliminando…' : 'Eliminar definitivamente'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

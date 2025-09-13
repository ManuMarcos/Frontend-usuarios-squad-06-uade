// src/pages/profile/ContractorProfile.tsx
import React from 'react'
import {
  Paper, Stack, Typography, Avatar, Chip, TextField, Button, FormControl,
  InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions,
  Checkbox, FormControlLabel, Box
} from '@mui/material'
import { useAuth } from '../../auth/AuthProvider'
import { loadProfile, saveProfile, clearProfile } from '../../utils/profile'
import { BARRIOS_CABA, PROFESSIONS } from '../../constants'
import { useNavigate } from 'react-router-dom'

export default function ContractorProfile(){
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const email = user?.email || ''
  const base = loadProfile(email)

  const fullNameFromUser =
    (user as any)?.firstName && (user as any)?.lastName
      ? `${(user as any).firstName} ${(user as any).lastName}`
      : (user as any)?.name

  const [edit, setEdit] = React.useState(false)
  const [name, setName] = React.useState(base.name || fullNameFromUser || '')
  const [barrio, setBarrio] = React.useState((base as any).barrio || '')
  const [profession, setProfession] = React.useState((base as any).profession || '')
  const [description, setDescription] = React.useState((base as any).description || '')
  const [skills, setSkills] = React.useState<string>((base as any).skills?.join(', ') || '')

  const [openDelete, setOpenDelete] = React.useState(false)
  const [ackDelete, setAckDelete] = React.useState(false)
  const [busyDelete, setBusyDelete] = React.useState(false)

  function save(){
    if(!email) return
    const skillsArr = skills.split(',').map(s => s.trim()).filter(Boolean)
    saveProfile(email, { name, email, role: 'contractor', barrio, profession, description, skills: skillsArr })
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
            <Stack direction="row" spacing={1} mt={1}><Chip label="Contratista" /></Stack>
          </Stack>
        </Stack>

        {!edit ? (
          <Stack spacing={1}>
            <Typography><b>Profesión:</b> {profession || '—'}</Typography>
            <Typography><b>Barrio:</b> {barrio || '—'}</Typography>
            <Typography><b>Descripción:</b> {description || '—'}</Typography>
            <Typography><b>Skills:</b> {skills || '—'}</Typography>

            <Stack direction="row" spacing={1} mt={2}>
              <Button variant="outlined" onClick={()=>setEdit(true)}>Editar</Button>
              <Button color="error" variant="outlined" onClick={()=>{ logout(); navigate('/', { replace: true })}}>Cerrar sesión</Button>
            </Stack>

            <Box sx={{mt:3, p:2, border:'1px solid', borderColor:'error.main', borderRadius:2}}>
              <Typography variant="subtitle2" color="error" gutterBottom>Dar de baja mi cuenta</Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Esta acción limpiará tus datos locales y cerrará la sesión.
              </Typography>
              <Button color="error" variant="contained" onClick={()=>{ setAckDelete(false); setOpenDelete(true) }}>
                Eliminar cuenta (local)
              </Button>
            </Box>
          </Stack>
        ) : (
          <Stack spacing={2}>
            <TextField label="Nombre" value={name} onChange={e=>setName(e.target.value)} />
            <FormControl fullWidth>
              <InputLabel id="profession">Profesión</InputLabel>
              <Select labelId="profession" label="Profesión" value={profession} onChange={e=>setProfession(e.target.value)}>
                <MenuItem value=""><em>Ninguna</em></MenuItem>
                {PROFESSIONS.map(p=><MenuItem key={p} value={p}>{p}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="barrio2">Barrio</InputLabel>
              <Select labelId="barrio2" label="Barrio" value={barrio} onChange={e=>setBarrio(e.target.value)}>
                <MenuItem value=""><em>Ninguno</em></MenuItem>
                {BARRIOS_CABA.map(b=><MenuItem key={b} value={b}>{b}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Descripción" value={description} onChange={e=>setDescription(e.target.value)} multiline minRows={3} />
            <TextField label="Skills (separadas por coma)" value={skills} onChange={e=>setSkills(e.target.value)} helperText="Ej: plomería, gas, electricidad" />
            <Stack direction="row" spacing={2}>
              <Button variant="outlined" onClick={()=>setEdit(false)}>Cancelar</Button>
              <Button onClick={save}>Guardar</Button>
            </Stack>
          </Stack>
        )}
      </Stack>

      <Dialog open={openDelete} onClose={()=>setOpenDelete(false)}>
        <DialogTitle>Confirmar baja de cuenta</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{mb:1}}>
            Esta acción limpiará tus datos locales y cerrará la sesión.
          </Typography>
          <FormControlLabel
            control={<Checkbox checked={ackDelete} onChange={e=>setAckDelete(e.target.checked)} />}
            label="Entiendo y deseo continuar"
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
import React from 'react'
import { Paper, Grid, Stack, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material'
import { useAuth } from '../auth/AuthProvider'
import { useNavigate, useLocation } from 'react-router-dom'
import { homeForRole } from '../auth/routeUtils'

export default function Login(){
  const { login } = useAuth()
  const [email, setEmail] = React.useState('usuario@example.com')
  const [role, setRole] = React.useState<'customer'|'contractor'|'admin'>('customer')
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from?.pathname as string | undefined

  function onSubmit(e: React.FormEvent){
    e.preventDefault()
    login(email, role)
    const dest = from || homeForRole(role)
    navigate(dest, { replace: true })
  }

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 5 }}>
        <Paper sx={{p:3}}>
          <Typography variant="h5" fontWeight={700} mb={2}>Iniciar Sesión</Typography>
          <Stack component="form" spacing={2} onSubmit={onSubmit}>
            <TextField label="Email" value={email} onChange={e=>setEmail(e.target.value)} fullWidth />
            <FormControl fullWidth>
              <InputLabel id="rol">Rol</InputLabel>
              <Select labelId="rol" value={role} label="Rol" onChange={e=>setRole(e.target.value as any)}>
                <MenuItem value="customer">Busco contratistas</MenuItem>
                <MenuItem value="contractor">Ofrezco servicios</MenuItem>
                <MenuItem value="admin">Administrador</MenuItem>
              </Select>
            </FormControl>
            <Button type="submit">Entrar</Button>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2">¿No estás registrado? <a href="/register">Registrarse</a></Typography>
              <Typography variant="body2"><a href="/recuperar">¿Olvidaste tu contraseña?</a></Typography>
            </Stack>
          </Stack>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 7 }} display="grid" alignItems="center" justifyContent="center">
        <Stack spacing={1} textAlign="center">
          <Typography variant="h3" fontWeight={900}>Home<b>Fix</b></Typography>
          <Typography>Conectamos contratistas con personas que necesitan servicios.</Typography>
        </Stack>
      </Grid>
    </Grid>
  )
}

import React from 'react'
import { Paper, Grid, Stack, Typography, TextField, Button, Alert } from '@mui/material'
import { useAuth } from '../auth/AuthProvider'
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom'
import { homeForRole } from '../auth/routeUtils'

export default function Login(){
  const { login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from = (location.state as any)?.from?.pathname as string | undefined

  const [email, setEmail]       = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading]   = React.useState(false)
  const [error, setError]       = React.useState<string | null>(null)

   const [banner, setBanner] = React.useState<{msg: string; sev: 'warning'|'error'|'success'} | null>(null)
  React.useEffect(() => {
    const m = new URLSearchParams(location.search).get('m')
    if (m === 'inactive') setBanner({ msg: 'Tu cuenta está inactiva. Contactá a un administrador.', sev: 'error' })
    else if (m === 'expired') setBanner({ msg: 'Tu sesión expiró. Volvé a iniciar sesión.', sev: 'warning' })
    else if (m === 'reset') setBanner({ msg: '¡Contraseña actualizada! Ingresá con tu nueva contraseña.', sev: 'success' })
    else setBanner(null)
  }, [location.search])

 function parseError(err: any): string {
  if (err?.code === 'INACTIVE_ACCOUNT') {
    return 'Tu cuenta está inactiva. Contactá a un administrador.'
  }
  const status = err?.response?.status
  if (status === 401) return 'Credenciales inválidas.'
  if (status === 403) {
    const msg = err?.response?.data?.message || err?.response?.data
    if (msg && /inactiv|inactive|deshabilitad/i.test(String(msg))) {
      return 'Tu cuenta está inactiva. Contactá a un administrador.'
    }
    return 'No tenés permisos para acceder.'
  }
  if (!err?.response) return 'No se pudo conectar con el servidor.'
  return err?.response?.data?.message || err?.message || 'Error al iniciar sesión.'
}
  async function onSubmit(e: React.FormEvent){
    e.preventDefault()
    setError(null)
    setLoading(true)
    try{
      const u = await login(email, password)        // ← obtiene el user (con role)
      if (from) navigate(from, { replace: true })   // si venías de una ruta protegida
      else navigate(homeForRole(u.role), { replace: true })
    }catch(err:any){
      setError(parseError(err))
    }finally{
      setLoading(false)
    }
  }

  return (
    <Grid container spacing={2}>
      <Grid size ={{ xs: 12, md: 5 }}>
        <Paper sx={{p:3}}>
          <Typography variant="h5" fontWeight={700} mb={2}>Iniciar Sesión</Typography>
          {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}
          <Stack component="form" spacing={2} onSubmit={onSubmit}>
            <TextField label="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} fullWidth required />
            <TextField label="Contraseña" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} fullWidth required />
            <Button type="submit" disabled={loading}>{loading ? 'Ingresando…' : 'Entrar'}</Button>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2">¿No tenés cuenta? <RouterLink to="/register">Registrarse</RouterLink></Typography>
              <Typography variant="body2"><RouterLink to="/recuperar">¿Olvidaste tu contraseña?</RouterLink></Typography>
            </Stack>
          </Stack>
        </Paper>
      </Grid>
      <Grid size ={{ xs: 12, md: 7 }} display="grid" alignItems="center" justifyContent="center">
        <Stack spacing={1} textAlign="center">
          <Typography variant="h3" fontWeight={900}>Arregla<b>Ya</b></Typography>
          <Typography>Conectamos contratistas con personas que necesitan servicios.</Typography>
        </Stack>
      </Grid>
    </Grid>
  )
}

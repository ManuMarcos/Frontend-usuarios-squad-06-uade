import React from 'react'
import {
  Paper, Grid, Stack, Typography, TextField, Button, Alert
} from '@mui/material'
import { useAuth } from '../auth/AuthProvider'
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom'

export default function Login(){
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from?.pathname as string | undefined

  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  function parseError(err: any): string {
    const status = err?.response?.status
    if (status === 401) return 'Credenciales inválidas.'
    if (!err?.response) return 'No se pudo conectar con el servidor.'
    return err?.response?.data?.message || err?.message || 'Error al iniciar sesión.'
  }

  async function onSubmit(e: React.FormEvent){
    e.preventDefault()
    setError(null)
    setLoading(true)
    try{
      // El login hará navigate al home del rol según la respuesta del backend.
      await login(email, password)
      // Si tenés un "from" (ruta protegida a la que quisiste entrar), podés re-navegar:
      if (from) navigate(from, { replace: true })
    }catch(err:any){
      setError(parseError(err))
    }finally{
      setLoading(false)
    }
  }

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 5 }}>
        <Paper sx={{p:3}}>
          <Typography variant="h5" fontWeight={700} mb={2}>Iniciar Sesión</Typography>

          {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}

          <Stack component="form" spacing={2} onSubmit={onSubmit}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              fullWidth
              required
            />
            <Button type="submit" disabled={loading}>{loading ? 'Ingresando…' : 'Entrar'}</Button>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2">¿No tenés cuenta? <RouterLink to="/register">Registrarse</RouterLink></Typography>
              <Typography variant="body2"><RouterLink to="/recuperar">¿Olvidaste tu contraseña?</RouterLink></Typography>
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

import React from 'react'
import { Paper, Grid, Stack, Typography, TextField, Button } from '@mui/material'
import { useAuth } from '../auth/AuthProvider'
import { useNavigate, useLocation } from 'react-router-dom'
import { homeForRole } from '../auth/routeUtils'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = React.useState('usuario@example.com')
  const [password, setPassword] = React.useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from?.pathname as string | undefined

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    await login(email, password)
    const raw = localStorage.getItem('homefix.user')
    const roleApi = raw ? JSON.parse(raw).role : 'CLIENTE'

    // Mapeo de roles API → roles front
    const roleMap: Record<string, 'customer' | 'contractor' | 'admin'> = {
      CLIENTE: 'customer',
      PROVEEDOR: 'contractor',
      ADMIN: 'admin',
    }
    const role = roleMap[roleApi] || 'customer'

    const dest = from || homeForRole(role)
    navigate(dest, { replace: true })
  }

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 5 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight={700} mb={2}>
            Iniciar Sesión
          </Typography>
          <Stack component="form" spacing={2} onSubmit={onSubmit}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
            />
            <Button type="submit">Entrar</Button>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2">
                ¿No estás registrado? <a href="/register">Registrarse</a>
              </Typography>
              <Typography variant="body2">
                <a href="/recuperar">¿Olvidaste tu contraseña?</a>
              </Typography>
            </Stack>
          </Stack>
        </Paper>
      </Grid>
      <Grid
        size={{ xs: 12, md: 7 }}
        display="grid"
        alignItems="center"
        justifyContent="center"
      >
        <Stack spacing={1} textAlign="center">
          <Typography variant="h3" fontWeight={900}>
            Home<b>Fix</b>
          </Typography>
          <Typography>
            Conectamos contratistas con personas que necesitan servicios.
          </Typography>
        </Stack>
      </Grid>
    </Grid>
  )
}
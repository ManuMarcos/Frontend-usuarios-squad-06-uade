// src/pages/Login.tsx
import React from 'react'
import { Paper, Grid, Stack, Typography, TextField, Button, Alert } from '@mui/material'
import { useAuth } from '../auth/AuthProvider'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const navigate = useNavigate()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setError(null)
      await login(email, password)
      navigate('/perfil', { replace: true })
    } catch {
      setError("El correo electrónico o la contraseña no son correctos. Intentalo de nuevo.")
    }
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

            {error && <Alert severity="error">{error}</Alert>} 

            <Button type="submit" variant="contained">Entrar</Button>

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
            Arregla<b>YA</b>
          </Typography>
          <Typography>
            Conectamos contratistas con personas que necesitan servicios.
          </Typography>
        </Stack>
      </Grid>
    </Grid>
  )
}
// src/pages/ForgotPassword.tsx
import React from 'react'
import {
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  Alert,
  Divider,
  Paper,
  Grid,
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { resetUserPassword } from '../api/users'

export default function ForgotPassword() {
  const [email, setEmail] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    if (!email) { setError('Ingresá email'); return }
    setLoading(true)
    try {
      await resetUserPassword(email)
      setMessage('¡Te enviamos un email con el link para restablecer tu contraseña!')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'No pudimos procesar tu solicitud')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Grid
        container
        sx={{
          maxWidth: 980,
          mx: 'auto',
          px: 2,
          py: 6,
        }}
        justifyContent="space-between"
        alignItems="flex-start"
      >
        {/* Izquierda: marca y frase (igual que Login) */}
        <Grid size={{ xs: 12, md: 6 }} sx={{ mb: { xs: 4, md: 0 } }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              letterSpacing: -0.5,
              mb: 1,
            }}
          >
            Arregla
            <Box component="span" sx={{ color: '#c15d19' }}>
              Ya
            </Box>
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 400, color: '#1c1e21', maxWidth: 420 }}>
            Restablecé tu contraseña para volver a conectarte con quienes necesitan tus servicios.
          </Typography>
        </Grid>

        {/* Derecha: card (mismo look & feel que Login) */}
        <Grid size={{ xs: 12, md: 'auto' }}>
          <Paper
            elevation={3}
            sx={{
              width: 360,
              p: 2.5,
              borderRadius: 2,
              backgroundColor: '#fff',
            }}
          >
            {message && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {message}
              </Alert>
            )}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Stack component="form" spacing={2} onSubmit={onSubmit}>
              <TextField
                size="medium"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
              />
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  backgroundColor: '#c15d19',
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1,
                  '&:hover': { backgroundColor: '#a94d14' },
                }}
              >
                {loading ? 'Guardando…' : 'Restablecer'}
              </Button>
            </Stack>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <RouterLink to="/login" style={{ color: '#c15d19', fontSize: 14 }}>
                Volver a iniciar sesión
              </RouterLink>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: '#fff',
                color: '#c15d19',
                border: '1px solid rgba(0,0,0,0.08)',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#fff4ee',
                },
              }}
            >
              Crear cuenta
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

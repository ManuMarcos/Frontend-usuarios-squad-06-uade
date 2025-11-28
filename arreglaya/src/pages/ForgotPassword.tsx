// src/pages/ForgotPassword.tsx
import React from 'react'
import {
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  Divider,
  Paper,
  Grid,
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { requestPasswordReset } from '../api/users'
import { isValidEmail } from '../utils/validators'
import { useNotify } from '../context/Notifications'

export default function ForgotPassword() {
  const [email, setEmail] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const notify = useNotify()

  const emailTouched = email.length > 0
  const emailInvalid = emailTouched && !isValidEmail(email)
  const canSubmit = isValidEmail(email) && !loading

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!isValidEmail(email)) {
      notify({ severity: 'error', message: 'Ingresá un email válido' })
      return
    }

    setLoading(true)
    try {
      await requestPasswordReset(email)
      notify({
        severity: 'success',
        message: 'Si el email está registrado, te enviamos un enlace para restablecer tu contraseña.',
      })
    } catch (err: any) {
      notify({ severity: 'error', message: err?.response?.data?.message || 'No pudimos procesar tu solicitud' })
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
        sx={{ maxWidth: 980, mx: 'auto', px: 2, py: 6 }}
        justifyContent="space-between"
        alignItems="flex-start"
      >
        {/* Izquierda: marca y frase (calcado del Login) */}
        <Grid size={{ xs: 12, md: 6 }} sx={{ mb: { xs: 4, md: 0 } }}>
          <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: -0.5, mb: 1 }}>
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
            {/* Título sutil para jerarquía visual */}
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              Recuperar acceso
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Ingresá tu email y te enviaremos instrucciones para restablecer tu contraseña.
            </Typography>

            <Stack component="form" spacing={2} onSubmit={onSubmit}>
              <TextField
                size="medium"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={emailInvalid}
                helperText={emailInvalid ? 'Ingresá un email válido' : ' '}
                fullWidth
                required
              />

              <Button
                type="submit"
                variant="contained"
                disabled={!canSubmit}
                sx={{
                  backgroundColor: '#c15d19',
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1,
                  '&:hover': { backgroundColor: '#a94d14' },
                }}
              >
                {loading ? 'Enviando…' : 'Enviar instrucciones'}
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
                '&:hover': { backgroundColor: '#fff4ee' },
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

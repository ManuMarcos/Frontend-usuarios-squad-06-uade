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
import { Link as RouterLink, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { resetPasswordWithToken } from '../api/users'

export default function ResetPassword() {
  const { token: tokenParam } = useParams<{ token?: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = tokenParam || searchParams.get('token') || ''

  const [newPassword, setNewPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const passTooShort = newPassword.length > 0 && newPassword.length < 6
  const mismatch = confirmPassword.length > 0 && confirmPassword !== newPassword
  const tokenMissing = !token
  const canSubmit = Boolean(token && newPassword && confirmPassword && !passTooShort && !mismatch && !loading)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (tokenMissing) {
      setError('El enlace es inválido o expiró.')
      return
    }
    if (passTooShort) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (mismatch) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    try {
      await resetPasswordWithToken(token, newPassword)
      setMessage('¡Tu contraseña fue actualizada! Ahora te redirigiremos para iniciar sesión.')
      setTimeout(() => navigate('/login?m=reset'), 1000)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'No pudimos restablecer tu contraseña. Intentalo nuevamente.')
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
            Creá una nueva contraseña segura para proteger tu cuenta.
          </Typography>
        </Grid>

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

            {tokenMissing && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                El enlace para restablecer la contraseña no es válido. Solicitá uno nuevo.
              </Alert>
            )}

            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              Definir nueva contraseña
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Elegí una contraseña de al menos 6 caracteres.
            </Typography>

            <Stack component="form" spacing={2} onSubmit={onSubmit}>
              <TextField
                size="medium"
                type="password"
                placeholder="Nueva contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                error={passTooShort}
                helperText={passTooShort ? 'Debe tener al menos 6 caracteres' : ' '}
                fullWidth
                required
              />

              <TextField
                size="medium"
                type="password"
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={mismatch}
                helperText={mismatch ? 'Las contraseñas no coinciden' : ' '}
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
                {loading ? 'Guardando…' : 'Actualizar contraseña'}
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

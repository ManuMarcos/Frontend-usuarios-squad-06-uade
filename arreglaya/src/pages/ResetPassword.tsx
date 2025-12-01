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
import { useNotify } from '../context/Notifications'
import { checkPasswordCriteria } from '../utils/validators'

export default function ResetPassword() {
  const { token: tokenParam } = useParams<{ token?: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = tokenParam || searchParams.get('token') || ''

  const notify = useNotify()
  const [newPassword, setNewPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const criteria = checkPasswordCriteria(newPassword)
  const newPwOk = criteria.length && criteria.upper && criteria.lower && criteria.number && criteria.symbol
  const passTooShort = newPassword.length > 0 && !criteria.length
  const mismatch = confirmPassword.length > 0 && confirmPassword !== newPassword
  const tokenMissing = !token
  const canSubmit = Boolean(
    token &&
    newPwOk &&
    confirmPassword &&
    !mismatch &&
    !loading
  )

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (tokenMissing) {
      notify({ severity: 'error', message: 'El enlace es inválido o expiró.' })
      return
    }
    if (!newPwOk) {
      notify({ severity: 'error', message: 'Usá 8+ caráct., mayús, minús, número y símbolo.' })
      return
    }
    if (mismatch) {
      notify({ severity: 'error', message: 'Las contraseñas no coinciden.' })
      return
    }

    setLoading(true)
    try {
      await resetPasswordWithToken(token, newPassword)
      notify({ severity: 'success', message: '¡Tu contraseña fue actualizada!' })
      setTimeout(() => navigate('/login?m=reset'), 1000)
    } catch (err: any) {
      notify({ severity: 'error', message: err?.response?.data?.message || 'No pudimos restablecer tu contraseña. Intentalo nuevamente.' })
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
            {tokenMissing && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                El enlace para restablecer la contraseña no es válido. Solicitá uno nuevo.
              </Alert>
            )}

            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              Definir nueva contraseña
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Elegí una contraseña con 8+ caracteres, mayúscula, minúscula, número y símbolo.
            </Typography>

            <Stack component="form" spacing={2} onSubmit={onSubmit}>
              <TextField
                size="medium"
                type="password"
                placeholder="Nueva contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                error={newPassword.length > 0 && !newPwOk}
                helperText={
                  newPassword.length > 0 && !newPwOk
                    ? 'Usá 8+ caráct., mayús, minús, número y símbolo.'
                    : ' '
                }
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

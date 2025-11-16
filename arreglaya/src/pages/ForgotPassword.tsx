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
  IconButton,
  InputAdornment,
} from '@mui/material'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded'
import { Link as RouterLink } from 'react-router-dom'
import { resetUserPassword } from '../api/users'

export default function ForgotPassword() {
  const [userId, setUserId] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [showPass, setShowPass] = React.useState(false)

  const [loading, setLoading] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  // UX: validaciones mínimas SOLO visuales (no cambian la lógica)
  const idError = userId.trim().length === 0
  const passError = newPassword.trim().length === 0
  const canSubmit = !idError && !passError && !loading

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null); setMessage(null)

    if (idError || passError) {
      setError('Ingresá ID y contraseña')
      return
    }

    setLoading(true)
    try {
      await resetUserPassword(Number(userId), newPassword)
      setMessage('¡Contraseña restablecida con éxito!')
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
            {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Título sutil para jerarquía visual */}
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              Restablecer contraseña
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Ingresá tu ID de usuario y una nueva contraseña.
            </Typography>

            <Stack component="form" spacing={2} onSubmit={onSubmit}>
              <TextField
                size="medium"
                placeholder="ID de usuario"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                error={idError && !!userId} // marca si tocaron y dejaron vacío
                helperText={idError && !!userId ? 'Campo obligatorio' : ' '}
                fullWidth
                required
              />

              <TextField
                size="medium"
                type={showPass ? 'text' : 'password'}
                placeholder="Nueva contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                error={passError && !!newPassword}
                helperText={passError && !!newPassword ? 'Campo obligatorio' : ' '}
                fullWidth
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        onClick={() => setShowPass(s => !s)}
                        edge="end"
                      >
                        {showPass ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
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

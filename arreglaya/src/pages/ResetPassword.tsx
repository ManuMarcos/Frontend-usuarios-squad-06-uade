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
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import { Link as RouterLink, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { resetPasswordWithToken } from '../api/users'
import { useNotify } from '../context/Notifications'
import { checkPasswordCriteria } from '../utils/validators'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded'

export default function ResetPassword() {
  const { token: tokenParam } = useParams<{ token?: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = tokenParam || searchParams.get('token') || ''

  const notify = useNotify()
  const [newPassword, setNewPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [showNew, setShowNew] = React.useState(false)
  const [showConfirm, setShowConfirm] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [redirectIn, setRedirectIn] = React.useState<number | null>(null)
  const countdownRef = React.useRef<NodeJS.Timeout | null>(null)

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
      setRedirectIn(5)
    } catch (err: any) {
      notify({ severity: 'error', message: err?.response?.data?.message || 'No pudimos restablecer tu contraseña. Intentalo nuevamente.' })
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    if (redirectIn === null) return
    if (countdownRef.current) clearInterval(countdownRef.current)
    countdownRef.current = setInterval(() => {
      setRedirectIn((prev) => {
        if (prev === null) return prev
        if (prev <= 1) {
          clearInterval(countdownRef.current as NodeJS.Timeout)
          countdownRef.current = null
          navigate('/login?m=reset')
          return null
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
        countdownRef.current = null
      }
    }
  }, [redirectIn, navigate])

  const goLoginNow = React.useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
    setRedirectIn(null)
    navigate('/login?m=reset')
  }, [navigate])

  return (
    <>
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
                  type={showNew ? 'text' : 'password'}
                  placeholder="Nueva contraseña"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  error={newPassword.length > 0 && !newPwOk}
                  helperText={
                    newPassword.length > 0 && !newPwOk
                      ? 'Usá 8+ caráct., mayús, minús, número y símbolo.'
                      : ' '
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton edge="end" onClick={() => setShowNew(s => !s)}>
                          {showNew ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  fullWidth
                  required
                />

                <TextField
                  size="medium"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={mismatch}
                  helperText={mismatch ? 'Las contraseñas no coinciden' : ' '}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton edge="end" onClick={() => setShowConfirm(s => !s)}>
                          {showConfirm ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  fullWidth
                  required
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={!canSubmit || redirectIn !== null}
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

      <Dialog
        open={redirectIn !== null}
        onClose={() => {}}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1.5 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #c15d19, #f6a269)',
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                fontWeight: 800,
              }}
            >
              ✓
            </Box>
            <Typography variant="h6" component="div" fontWeight={800}>
              Contraseña actualizada
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
              Te redirigiremos al login para que inicies sesión con tu nueva contraseña.
            </Typography>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: '#fff8f2',
                border: '1px solid #f0d8c6',
              }}
            >
              <Typography variant="body2" fontWeight={700} sx={{ color: '#c15d19' }}>
                {redirectIn ?? 0} segundos
              </Typography>
              <Typography variant="caption" color="text.secondary">
                antes de redirigir a la pantalla de login
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={goLoginNow} variant="contained" fullWidth>
            Ir al login ahora
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

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
} from '@mui/material'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded'
import { useAuth } from '../auth/AuthProvider'
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom'
import { homeForRole } from '../auth/routeUtils'
import { useNotify } from '../context/Notifications'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from?.pathname as string | undefined
  const notify = useNotify()

  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [banner, setBanner] = React.useState<{ msg: string; sev: 'warning' | 'error' | 'success' } | null>(null)

  React.useEffect(() => {
    const m = new URLSearchParams(location.search).get('m')
    if (m === 'inactive') setBanner({ msg: 'Tu cuenta está inactiva. Contactá a un administrador.', sev: 'error' })
    else if (m === 'expired') setBanner({ msg: 'Tu sesión expiró. Volvé a iniciar sesión.', sev: 'warning' })
    else if (m === 'reset') setBanner({ msg: '¡Contraseña actualizada! Ingresá con tu nueva contraseña.', sev: 'success' })
    else setBanner(null)
  }, [location.search])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const u = await login(email, password)
      notify({ severity: 'success', message: 'Ingreso exitoso.' })
      if (from) navigate(from, { replace: true })
      else navigate(homeForRole(u.role), { replace: true })
    } catch (err: any) {
      notify({ severity: 'error', message: 'Credenciales inválidas o cuenta inactiva.' })
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
        {/* Izquierda: marca y frase */}
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
            ArreglaYa te ayuda a conectar con las personas que necesitan tus servicios o con contratistas que ya los ofrecen.
          </Typography>
        </Grid>

        {/* Derecha: card de login */}
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
            {banner && (
              <Alert severity={banner.sev} sx={{ mb: 2 }}>
                {banner.msg}
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
              <TextField
                size="medium"
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton edge="end" onClick={() => setShowPassword(s => !s)}>
                        {showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
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
                disabled={loading}
                sx={{
                  backgroundColor: '#c15d19',
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1,
                  '&:hover': { backgroundColor: '#a94d14' },
                }}
              >
                {loading ? 'Ingresando…' : 'Iniciar sesión'}
              </Button>
            </Stack>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <RouterLink to="/recuperar" style={{ color: '#c15d19', fontSize: 14 }}>
                ¿Olvidaste tu contraseña?
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

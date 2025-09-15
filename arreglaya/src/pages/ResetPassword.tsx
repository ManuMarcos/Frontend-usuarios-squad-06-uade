import React from 'react'
import {
  Paper, Grid, Stack, Typography, TextField, Button, Alert
} from '@mui/material'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import PasswordField from '../components/PasswordField'
import PasswordStrengthBar from '../components/PasswordStrengthBar'
import { isValidEmail, checkPasswordCriteria } from '../utils/validators'
import { getAllUsers, resetUserPassword, type ApiUser } from '../api/users'

export default function ResetPassword(){
  const navigate = useNavigate()

  // form
  const [email, setEmail]       = React.useState('')
  const [password, setPassword] = React.useState('')
  const [confirm, setConfirm]   = React.useState('')

  // ux
  const [loading, setLoading] = React.useState(false)
  const [error, setError]     = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)
  const [touched, setTouched] = React.useState({ email:false, password:false, confirm:false })

  // validations
  const criteria = checkPasswordCriteria(password)
  const pwOk =
    !!criteria.length && criteria.upper && criteria.lower && criteria.number && criteria.symbol
  const emailErr = touched.email && !isValidEmail(email)
  const passErr  = touched.password && !pwOk
  const confErr  = touched.confirm && password !== confirm

  const formValid = isValidEmail(email) && pwOk && password === confirm

  function parseError(err: any): string {
    const status = err?.response?.status
    const msg = err?.response?.data?.message || err?.response?.data || err?.message
    if (status === 401) return 'Necesitás iniciar sesión para realizar esta acción.'
    if (status === 403) return 'No tenés permisos para realizar esta acción.'
    if (!err?.response) return 'No se pudo conectar con el servidor.'
    if (msg) return String(msg)
    return 'Ocurrió un error al intentar actualizar la contraseña.'
  }

  async function onSubmit(e: React.FormEvent){
    e.preventDefault()
    setTouched({ email:true, password:true, confirm:true })
    if (!formValid) { setError('Revisá los campos marcados.'); return }

    setLoading(true); setError(null); setSuccess(null)
    try{
      // 1) Traer todos los usuarios (requiere JWT)
      const users: ApiUser[] = await getAllUsers()

      // 2) Buscar por email (case-insensitive)
      const matches = users.filter(u => (u.email || '').toLowerCase() === email.toLowerCase())
      if (matches.length === 0) {
        setError('No encontramos un usuario con ese email.')
        setLoading(false)
        return
      }
      if (matches.length > 1) {
        setError('Se encontraron múltiples usuarios con ese email. Contactá a un administrador.')
        setLoading(false)
        return
      }

      const found = matches[0]
      if (found.isActive === false) {
        setError('La cuenta está inactiva. No es posible actualizar la contraseña.')
        setLoading(false)
        return
      }

      // 3) Reset con userId + nueva contraseña
      await resetUserPassword( found.userId, password )

      setSuccess('¡Listo! Actualizamos la contraseña.')
      setTimeout(() => navigate('/login?m=reset', { replace: true }), 800)
    }catch(err:any){
      setError(parseError(err))
    }finally{
      setLoading(false)
    }
  }

  return (
    <Grid container spacing={2}>
      <Grid size = {{xs: 12, md: 5}}>
        <Paper sx={{ p:3 }}>
          <Typography variant="h5" fontWeight={700} mb={2}>Recuperar contraseña</Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Stack component="form" spacing={2} onSubmit={onSubmit}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, email:true }))}
              error={!!emailErr}
              helperText={emailErr ? 'Ingresá un email válido.' : ' '}
              fullWidth
              required
            />

            <PasswordField
              label="Nueva contraseña"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setPassword(e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, password:true }))}
              error={!!passErr}
              helperText={passErr ? 'Usá 8+ caráct., mayús, minús, número y símbolo.' : ' '}
              required
            />
            <PasswordStrengthBar password={password} />

            <PasswordField
              label="Confirmar contraseña"
              value={confirm}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setConfirm(e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, confirm:true }))}
              error={!!confErr}
              helperText={confErr ? 'Las contraseñas no coinciden.' : ' '}
              required
            />

            <Button type="submit" disabled={loading || !formValid}>
              {loading ? 'Actualizando…' : 'Actualizar contraseña'}
            </Button>

            <Typography variant="body2">
              ¿Recordaste tu contraseña? <RouterLink to="/login">Iniciar sesión</RouterLink>
            </Typography>
          </Stack>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, md: 7 }} display="grid" alignItems="center" justifyContent="center">
        <Stack spacing={1} textAlign="center">
          <Typography variant="h3" fontWeight={900}>Home<b>Fix</b></Typography>
          <Typography>Ingresá tu email y elegí una nueva contraseña segura.</Typography>
        </Stack>
      </Grid>
    </Grid>
  )
}

import React from 'react'
import { Paper, Stack, Typography, Button, Grid, Alert } from '@mui/material'
import PasswordField from '../components/PasswordField'
import PasswordStrengthBar from '../components/PasswordStrengthBar'
import { resetPassword } from '../api/auth'
import { useParams, useNavigate } from 'react-router-dom'
import { checkPasswordCriteria } from '../utils/validators'

export default function ResetPassword(){
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [password, setPassword] = React.useState('')
  const [confirm, setConfirm] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const c = checkPasswordCriteria(password)
  const pwOk = c.length && c.upper && c.lower && c.number && c.symbol

  async function onSubmit(e: React.FormEvent){
    e.preventDefault()
    setError(null); setMessage(null)
    if(!pwOk) return setError('La contraseña no cumple los requisitos')
    if(password !== confirm) return setError('Las contraseñas no coinciden')
    setLoading(true)
    try{
      await resetPassword(token || '', password)
      setMessage('¡Contraseña restablecida!')
      setTimeout(()=> navigate('/login'), 900)
    }catch(err:any){
      setError(err?.response?.data?.message || 'No se pudo restablecer la contraseña')
    }finally{ setLoading(false) }
  }

  return (
    <Grid container justifyContent="center">
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{p:3}}>
          <Typography variant="h5" fontWeight={800} mb={2}>Restablecer contraseña</Typography>
          {message && <Alert severity="success" sx={{mb:2}}>{message}</Alert>}
          {error && <Alert severity="error" sx={{mb:2}}>{error}</Alert>}
          <Stack component="form" spacing={2} onSubmit={onSubmit}>
            <PasswordField label="Nueva contraseña" value={password} onChange={e=>setPassword(e.target.value)} required />
            <PasswordStrengthBar password={password} />
            <PasswordField label="Confirmar contraseña" value={confirm} onChange={e=>setConfirm(e.target.value)} required />
            <Stack direction="row" spacing={2}>
              <Button variant="outlined" onClick={()=>navigate('/login')}>Ir a iniciar sesión</Button>
              <Button type="submit" disabled={loading || !pwOk || password !== confirm}>
                {loading ? 'Guardando…' : 'Guardar contraseña'}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  )
}

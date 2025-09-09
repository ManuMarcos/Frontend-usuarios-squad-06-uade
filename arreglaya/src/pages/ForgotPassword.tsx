import React from 'react'
import { Paper, Stack, Typography, TextField, Button, Grid, Alert } from '@mui/material'
import { requestPasswordReset } from '../api/auth'
import { isValidEmail } from '../utils/validators'

export default function ForgotPassword(){
  const [email, setEmail] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const emailOk = isValidEmail(email)

  async function onSubmit(e: React.FormEvent){
    e.preventDefault()
    setError(null); setMessage(null)
    if(!emailOk){ setError('Email inválido'); return }
    setLoading(true)
    try{
      await requestPasswordReset(email)
      setMessage('Si el email está registrado, te enviamos un link para restablecer la contraseña.')
    }catch(err:any){
      setError(err?.response?.data?.message || 'No pudimos procesar tu solicitud')
    }finally{ setLoading(false) }
  }

  return (
    <Grid container justifyContent="center">
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{p:3}}>
          <Typography variant="h5" fontWeight={800} mb={2}>Recuperar contraseña</Typography>
          {message && <Alert severity="success" sx={{mb:2}}>{message}</Alert>}
          {error && <Alert severity="error" sx={{mb:2}}>{error}</Alert>}
          <Stack component="form" spacing={2} onSubmit={onSubmit}>
            <TextField label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required
              error={!!email && !emailOk} helperText={!!email && !emailOk ? 'Email inválido' : ''} />
            <Button type="submit" disabled={loading || !emailOk}>{loading ? 'Enviando…' : 'Enviar instrucciones'}</Button>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  )
}

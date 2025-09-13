import React from 'react'
import { Paper, Stack, Typography, TextField, Button, Grid, Alert } from '@mui/material'
import { resetUserPassword } from '../api/auth'

export default function ForgotPassword(){
  const [userId, setUserId] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  async function onSubmit(e: React.FormEvent){
    e.preventDefault()
    setError(null); setMessage(null)
    if(!userId || !newPassword){ setError('Ingresá ID y contraseña'); return }
    setLoading(true)
    try{
      await resetUserPassword(Number(userId), newPassword)
      setMessage('¡Contraseña restablecida con éxito!')
    }catch(err:any){
      setError(err?.response?.data?.message || 'No pudimos procesar tu solicitud')
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
            <TextField label="User ID" value={userId} onChange={e=>setUserId(e.target.value)} required />
            <TextField label="Nueva contraseña" type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} required />
            <Button type="submit" disabled={loading}>{loading ? 'Guardando…' : 'Restablecer'}</Button>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  )
}
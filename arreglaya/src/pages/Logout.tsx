import React from 'react'
import { useAuth } from '../auth/AuthProvider'
import { useNavigate } from 'react-router-dom'
import { CircularProgress, Stack, Typography } from '@mui/material'

export default function Logout(){
  const { logout } = useAuth()
  const navigate = useNavigate()
  React.useEffect(()=>{
    logout()
    const t = setTimeout(()=> navigate('/', { replace: true }), 200)
    return ()=> clearTimeout(t)
  },[logout, navigate])
  return (
    <Stack alignItems="center" spacing={2} sx={{py:6}}>
      <CircularProgress />
      <Typography>Cerrando sesión…</Typography>
    </Stack>
  )
}

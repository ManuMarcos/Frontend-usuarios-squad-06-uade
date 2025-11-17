import React from 'react'
import { Stack, Typography, Button, Box, CircularProgress } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { homeForRole } from '../auth/routeUtils'

export default function Landing(){
  const navigate = useNavigate()
  const { user } = useAuth()

  // Si hay sesión, redirige al home del rol (y evita volver con "Atrás")
  React.useEffect(() => {
    if (user) {
      navigate(homeForRole(user.role), { replace: true })
    }
  }, [user, navigate])

  // Mientras decide/redirige, no mostramos el hero para evitar "flash"
  if (user) {
    return (
      <Box display="grid" justifyContent="center" alignItems="center" minHeight="40vh">
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">Redirigiendo…</Typography>
        </Stack>
      </Box>
    )
  }

  // Vista pública (invitado)
  return (
    <Box display="grid" justifyContent="center" alignItems="center" minHeight="60vh">
      <Stack spacing={3} textAlign="center">
        <Typography variant="h2" fontWeight={900}>Arregla<b>Ya</b></Typography>
        <Typography>¿Estás buscando contratar a una persona para que te resuelva un problema en tu hogar?</Typography>
        <Typography variant="body2">¡Empezá a buscar!</Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button onClick={()=>navigate('/buscar')}>Buscar Contratista</Button>
          <Button onClick={()=>navigate('/login')} variant="outlined">Ofrezco Servicios</Button>
        </Stack>
      </Stack>
    </Box>
  )
}

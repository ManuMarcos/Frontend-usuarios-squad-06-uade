import React from 'react'
import { Paper, Typography, Stack } from '@mui/material'

export default function Terms(){
  return (
    <Paper sx={{p:3}}>
      <Stack spacing={2}>
        <Typography variant="h5" fontWeight={800}>Términos y Condiciones</Typography>
        <Typography variant="body2" color="text.secondary">
          Este texto es un placeholder. Aquí irán los términos y condiciones del servicio.
          Incluye el tratamiento de datos, responsabilidades, y alcance de la plataforma.
        </Typography>
      </Stack>
    </Paper>
  )
}

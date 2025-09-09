import React from 'react'
import { Paper, Typography, Stack } from '@mui/material'

export default function Privacy(){
  return (
    <Paper sx={{p:3}}>
      <Stack spacing={2}>
        <Typography variant="h5" fontWeight={800}>Política de Privacidad</Typography>
        <Typography variant="body2" color="text.secondary">
          Este texto es un placeholder. Aquí se describe cómo recopilamos, usamos y protegemos
          los datos personales. Actualizar con el documento legal definitivo.
        </Typography>
      </Stack>
    </Paper>
  )
}

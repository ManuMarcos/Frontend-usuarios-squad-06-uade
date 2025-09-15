import React from 'react'
import { Stack, Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export default function RequestSuccess(){
  const navigate = useNavigate()
  return (
    <Stack alignItems="center" spacing={2} sx={{py:6}}>
      <Typography variant="h4" fontWeight={800}>¡La solicitud fue enviada con éxito!</Typography>
      <Typography variant="body2" color="text.secondary">Gracias por utilizar ArreglaYa</Typography>
      <Stack direction="row" spacing={2}>
        <Button onClick={()=>navigate('/contratistas')}>Seguir buscando contratistas 🙂</Button>
        <Button variant="outlined" onClick={()=>navigate('/')}>Por hoy no 🙁</Button>
      </Stack>
    </Stack>
  )
}

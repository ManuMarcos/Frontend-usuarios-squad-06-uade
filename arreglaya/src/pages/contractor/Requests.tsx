import React from 'react'
import { Grid, Paper, Stack, Typography, Button } from '@mui/material'
import { useStore } from '../../store'

export default function ContractorRequests(){
  const { requests } = useStore()
  return (
    <div>
      <Typography variant="h5" fontWeight={800} mb={2}>Solicitudes</Typography>
      <Grid container spacing={2}>
        {requests.map(r => (
          <Grid size={{ xs: 12, md: 6 }} key={r.id}>
            <Paper sx={{p:2}}>
              <Stack spacing={1}>
                <Typography fontWeight={700}>NOMBRE APELLIDO</Typography>
                <Typography variant="caption" color="text.secondary">{new Date(r.createdAt).toLocaleString()}</Typography>
                <Typography fontWeight={700}>Título</Typography>
                <Typography>{r.subject}</Typography>
                {r.image && <img src={r.image} alt="adjunto" style={{width:160, borderRadius:12}} />}
                <Button variant="outlined" size="small">ver más</Button>
              </Stack>
            </Paper>
          </Grid>
        ))}
        {!requests.length && <Typography variant="body2" color="text.secondary" sx={{m:2}}>No hay solicitudes aún.</Typography>}
      </Grid>
    </div>
  )
}

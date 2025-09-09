import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { Box, Paper, Grid, Stack, Typography, Avatar, Rating, Button } from '@mui/material'

export default function ContractorDetail(){
  const { id } = useParams()
  const c = useStore(s=>s.contractors.find(x=>x.id===id))
  const navigate = useNavigate()
  if(!c) return <div>No encontrado</div>

  return (
    <Stack spacing={2}>
      <Button variant="outlined" onClick={()=>navigate(-1)}>← Atrás</Button>
      <Paper sx={{p:2}}>
        <Box sx={{height:160, bgcolor:'#ddd', borderRadius:2, mb:2}} />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }} textAlign="center">
            <Avatar sx={{width:100,height:100, mx:'auto'}} />
            <Rating value={c.rating} readOnly sx={{mt:1}} />
            <Typography variant="body2" color="text.secondary">{c.reviews} reviews</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 9 }}>
            <Typography variant="h4" fontWeight={800}>{c.name}</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>Perfil profesional</Typography>
            <Typography>{c.description}</Typography>
            {c.skills?.length ? <><Typography fontWeight={700} mt={2}>Habilidades</Typography><ul>{c.skills.map(s=><li key={s}>{s}</li>)}</ul></> : null}
            {c.phone && <><Typography fontWeight={700} mt={2}>Contacto</Typography><Typography>tel: {c.phone}</Typography></>}
            <Button sx={{mt:2}} onClick={()=>navigate('/solicitar/'+c.id)}>Solicitar Servicio</Button>
          </Grid>
        </Grid>
      </Paper>
    </Stack>
  )
}

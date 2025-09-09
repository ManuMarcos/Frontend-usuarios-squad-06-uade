import React from 'react'
import { Grid, Paper, Typography } from '@mui/material'

export default function ContractorHome(){
  return (
    <div>
      <Typography variant="h5" fontWeight={800} mb={2}>Trabajos</Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}><Paper sx={{p:3, outline:'3px solid #4aa5ff'}}>NOMBRE APELLIDO — Descripción — ⭐️⭐️⭐️☆ 25 reviews</Paper></Grid>
        <Grid size={{ xs: 12, md: 6 }}><Paper sx={{p:3}}>—</Paper></Grid>
        <Grid size={{ xs: 12, md: 6 }}><Paper sx={{p:3}}>—</Paper></Grid>
        <Grid size={{ xs: 12, md: 6 }}><Paper sx={{p:3}}>—</Paper></Grid>
      </Grid>
    </div>
  )
}

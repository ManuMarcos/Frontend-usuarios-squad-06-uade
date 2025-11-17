import React, { useState } from 'react'
import {Paper, Stack, Typography, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material'
import Grid from '@mui/material/Grid'
// barrio/profession filters removed
import { useStore } from '../store'
import { useNavigate } from 'react-router-dom'

export default function Search(){
  const setFilters = useStore(s=>s.setFilters)
  const navigate = useNavigate()

  function buscar(){
    // no filters to set after removing barrio/profession
    setFilters({})
    navigate('/contratistas')
  }

  return (
    <Grid container spacing={4} alignItems="flex-start">
      <Grid size={{ xs: 12, md: 5 }}>
        <Stack spacing={2}>
          <Typography variant="h6">Contanos un poco de vos…</Typography>
          <Paper sx={{p:2}}>
            <Stack spacing={2}>
              {/* barrio/profession filters removed */}
              <Button onClick={buscar}>Buscar</Button>
              <Typography variant="body2">¿Ya tenés una cuenta? <a href="/login">Iniciar sesión</a></Typography>
            </Stack>
          </Paper>
        </Stack>
      </Grid>
      <Grid size={{ xs: 12, md: 7 }}>
        <Typography variant="body2" color="text.secondary" mb={1}>Contratistas destacados</Typography>
        <Grid container spacing={2}>
          {[...Array(3)].map((_,i)=>(<Grid size={{ xs: 12 }} key={i}><Paper sx={{p:3, bgcolor:'#eee'}} /></Grid>))}
        </Grid>
      </Grid>
    </Grid>
  )
}

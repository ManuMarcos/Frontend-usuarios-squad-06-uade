import React, { useState } from 'react'
import {Paper, Stack, Typography, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material'
import Grid from '@mui/material/Grid'
import { BARRIOS_CABA, PROFESSIONS } from '../constants'
import { useStore } from '../store'
import { useNavigate } from 'react-router-dom'

export default function Search(){
  const [profession, setProfession] = useState('')
  const [barrio, setBarrio] = useState('')
  const setFilters = useStore(s=>s.setFilters)
  const navigate = useNavigate()

  function buscar(){
    setFilters({ profession, barrio })
    navigate('/contratistas')
  }

  return (
    <Grid container spacing={4} alignItems="flex-start">
      <Grid size={{ xs: 12, md: 5 }}>
        <Stack spacing={2}>
          <Typography variant="h6">Contanos un poco de vos…</Typography>
          <Paper sx={{p:2}}>
            <Stack spacing={2}>
              <FormControl fullWidth>
                <InputLabel>¿Qué profesional estás buscando?</InputLabel>
                <Select label="¿Qué profesional estás buscando?" value={profession} onChange={e=>setProfession(e.target.value)}>
                  <MenuItem value="">Cualquiera</MenuItem>
                  {PROFESSIONS.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>¿En qué barrio?</InputLabel>
                <Select label="¿En qué barrio?" value={barrio} onChange={e=>setBarrio(e.target.value)}>
                  <MenuItem value="">Cualquiera</MenuItem>
                  {BARRIOS_CABA.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                </Select>
              </FormControl>
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

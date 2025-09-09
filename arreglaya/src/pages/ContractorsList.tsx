import React from 'react'
import { Grid } from '@mui/material'
import { useStore } from '../store'
import ContractorCard from '../components/ContractorCard'
import { Link as RouterLink } from 'react-router-dom'

export default function ContractorsList(){
  const { contractors, selectedFilters } = useStore()
  const list = contractors.filter(c =>
    (!selectedFilters.profession || c.profession === selectedFilters.profession) &&
    (!selectedFilters.barrio || c.barrio === selectedFilters.barrio)
  )
  return (
    <Grid container spacing={2}>
      {list.map(c => (
        <Grid size={{ xs: 12, md: 6 }} key={c.id}
          component={RouterLink} to={'/contratistas/'+c.id} style={{textDecoration:'none'}}>
          <ContractorCard name={c.name} description={c.description} rating={c.rating} reviews={c.reviews} />
        </Grid>
      ))}
    </Grid>
  )
}

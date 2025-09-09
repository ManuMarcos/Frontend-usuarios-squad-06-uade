import React from 'react'
import { Outlet } from 'react-router-dom'
import Container from '@mui/material/Container'
import AppHeader from './components/AppHeader'

export default function App(){
  return (
    <>
      <AppHeader />
      <Container sx={{py:3}} maxWidth="lg">
        <Outlet />
      </Container>
    </>
  )
}

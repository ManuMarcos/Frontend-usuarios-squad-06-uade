import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Paper, Grid, Stack, Typography, Avatar, Button, CircularProgress, Alert } from '@mui/material'
import { getUserById, type UserDTO } from '../api/users'
import { toUiRole } from '../auth/routeUtils'
import { loadProfile } from '../utils/profile'

export default function ContractorDetail(){
  const { id } = useParams()
  const navigate = useNavigate()

  const [data, setData] = React.useState<UserDTO | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let mounted = true
    async function run(){
      if(!id){ setError('ID inválido'); setLoading(false); return }
      setLoading(true)
      try{
        const u = await getUserById(Number(id))
        if (mounted) setData(u)
      }catch(e:any){
        if (mounted) setError(e?.message || 'No se pudo cargar el contratista')
      }finally{
        if (mounted) setLoading(false)
      }
    }
    run()
    return () => { mounted = false }
  }, [id])

  if (loading) return <Stack alignItems="center" sx={{py:4}}><CircularProgress /></Stack>
  if (error) return <Alert severity="error" sx={{my:2}}>{error}</Alert>
  if (!data) return <Alert severity="warning" sx={{my:2}}>No encontrado</Alert>

  // Validamos que sea realmente PROVEEDOR
  const role = toUiRole(data.roleDescription)
  const isContractor = role === 'contractor'

  // Nombre y extras (intentamos complementar con perfil local si existe)
  const local = loadProfile()
  const fullName = `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim() || local.name || data.email.split('@')[0]
  const barrio = data.address || ''
  const phone = data.phoneNumber || (local as any).phone || ''
  const description = (local as any).description || ''
  const skills: string[] = (local as any).skills || []

  return (
    <Stack spacing={2}>
      <Button variant="outlined" onClick={()=>navigate(-1)}>← Atrás</Button>

      {!isContractor && (
        <Alert severity="info">
          Este usuario no tiene rol de contratista. Mostrando información disponible.
        </Alert>
      )}

      <Paper sx={{p:2}}>
        <Box sx={{height:160, bgcolor:'#ddd', borderRadius:2, mb:2}} />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }} textAlign="center">
            <Avatar sx={{width:100,height:100, mx:'auto'}}>
              {(fullName || data.email)[0]?.toUpperCase() || '?'}
            </Avatar>
            <Typography variant="body2" color="text.secondary" sx={{mt:1}}>
              {isContractor ? 'Contratista' : 'Usuario'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 9 }}>
            <Typography variant="h4" fontWeight={800}>{fullName}</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>{data.email}</Typography>

            {description && (
              <>
                <Typography fontWeight={700} mt={1}>Perfil profesional</Typography>
                <Typography>{description}</Typography>
              </>
            )}

            {!!skills.length && (
              <>
                <Typography fontWeight={700} mt={2}>Habilidades</Typography>
                <ul style={{marginTop:4}}>
                  {skills.map(s => <li key={s}>{s}</li>)}
                </ul>
              </>
            )}

            {(barrio || phone) && (
              <>
                <Typography fontWeight={700} mt={2}>Contacto</Typography>
                {barrio && <Typography>Dirección: {barrio}</Typography>}
                {phone && <Typography>Tel: {phone}</Typography>}
              </>
            )}

            {isContractor && (
              <Button sx={{mt:2}} onClick={()=>navigate('/solicitar/'+data.userId)}>
                Solicitar Servicio
              </Button>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Stack>
  )
}
import React, { ChangeEvent, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { useAuth } from '../auth/AuthProvider'
import { Paper, Stack, Typography, TextField, Button } from '@mui/material'

export default function RequestForm(){
  const { id } = useParams()
  const c = useStore(s=>s.contractors.find(x=>x.id===id))
  const add = useStore(s=>s.addRequest)
  const { user } = useAuth()
  const navigate = useNavigate()
  const [subject, setSubject] = useState('Quiero una mesa de madera con cuatro sillas')
  const [image, setImage] = useState<string | undefined>()

  if(!c) return <div>Contratista no encontrado</div>

  function onFile(e: ChangeEvent<HTMLInputElement>){
    const f = e.target.files?.[0]; if(!f) return
    const reader = new FileReader()
    reader.onload = () => setImage(reader.result as string)
    reader.readAsDataURL(f)
  }
  function send(){
    const r = add({ contractorId: c!.id, subject, image, customerEmail: user?.email || 'anon@homefix' })
    navigate('/exito', { state: { id: r.id } })
  }

  return (
    <Stack spacing={2}>
      <Button variant="outlined" onClick={()=>navigate(-1)}>← Atrás</Button>
      <Paper sx={{p:2}}>
        <Typography fontWeight={700} mb={1}>ASUNTO</Typography>
        <TextField multiline minRows={5} fullWidth value={subject} onChange={e=>setSubject(e.target.value)} />
        <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2}>
          <Button component="label" variant="outlined">Adjuntar imagen
            <input type="file" accept="image/*" hidden onChange={onFile} />
          </Button>
          <Button onClick={send}>Enviar</Button>
        </Stack>
        {image && <img src={image} alt="adjunto" style={{width:160, borderRadius:12, marginTop:12}} />}
      </Paper>
    </Stack>
  )
}

import React from 'react'
import {
  Paper, Stack, Typography, Avatar, Chip, TextField, Button,
  FormControl, InputLabel, Select, MenuItem, Snackbar, Alert, CircularProgress
} from '@mui/material'
import { useAuth } from '../../auth/AuthProvider'
import { getUserById, updateUserPartial, type ApiUser } from '../../api/users'
import { BARRIOS_CABA } from '../../constants'
import { useNavigate } from 'react-router-dom'
import ProfileImageUploader from '../../components/ProfileImageUploader'


type Errors = {
  firstName?: string
  lastName?: string
  email?: string
  dni?: string
  phoneNumber?: string
  address?: string
}

function validate(values: {
  firstName: string
  lastName: string
  email: string
  dni: string
  phoneNumber: string
  address: string
}): Errors {
  const e: Errors = {}
  if (!values.firstName.trim() || values.firstName.trim().length < 2) e.firstName = 'Ingresá tu nombre.'
  if (!values.lastName.trim()  || values.lastName.trim().length < 2) e.lastName  = 'Ingresá tu apellido.'
  if (!/^\S+@\S+\.\S+$/.test(values.email)) e.email = 'Email inválido.'
  if (!/^\d{7,10}$/.test(values.dni)) e.dni = 'DNI: solo números (7 a 10 dígitos).'
  if (values.phoneNumber.replace(/\D/g,'').length < 6) e.phoneNumber = 'Teléfono incompleto.'
  if (!values.address.trim() || values.address.trim().length < 3) e.address = 'Ingresá tu dirección.'
  return e
}

export default function CustomerProfile(){
  const { user, logout, mergeUserMeta } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = React.useState(true)
  const [edit, setEdit]       = React.useState(false)
  const [saving, setSaving]   = React.useState(false)
  const [toast, setToast]     = React.useState<{open:boolean; msg:string; sev:'success'|'error'}>({open:false, msg:'', sev:'success'})

  // Estado del formulario
  const [firstName, setFirstName] = React.useState('')
  const [lastName, setLastName]   = React.useState('')
  const [email, setEmail]         = React.useState(user?.email ?? '')
  const [dni, setDni]             = React.useState('')
  const [phoneNumber, setPhone]   = React.useState('')
  const [address, setAddress]     = React.useState('')
  const [barrio, setBarrio]       = React.useState('')

  // 👇 NUEVO: foto de perfil
  const [profileImageUrl, setProfileImageUrl] = React.useState('')

  // snapshot original para "dirty check"
  const original = React.useRef<ApiUser | null>(null)

  React.useEffect(() => {
    let alive = true
    async function load(){
      if (!user?.id) { setLoading(false); return }
      try {
        const data = await getUserById(user.id) as ApiUser

        if (!alive) return

        original.current = data
        // precargar formulario
        setFirstName(data.firstName ?? '')
        setLastName(data.lastName ?? '')
        setEmail(data.email ?? user.email)
        setDni(data.dni ?? '')
        setPhone(data.phoneNumber ?? '')
        setAddress(data.address ?? '')
        setBarrio(data.barrio ?? '')

        // 👇 NUEVO: precargar foto
        setProfileImageUrl(data.profileImageUrl ?? '')

        // actualizar sesión local
        mergeUserMeta(data)
      } catch (err: any) {
        setToast({open:true, msg: err?.response?.data || err?.message || 'No se pudo cargar el usuario', sev:'error'})
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [user?.id, user?.email, mergeUserMeta])

  const values = { firstName, lastName, email, dni, phoneNumber, address }
  const errors = validate(values)
  const isValid = Object.keys(errors).length === 0

  function isDirty(): boolean {
    const o = original.current
    if (!o) return false
    return (
      firstName !== (o.firstName ?? '') ||
      lastName  !== (o.lastName  ?? '') ||
      email     !== (o.email     ?? user?.email ?? '') ||
      dni       !== (o.dni       ?? '') ||
      phoneNumber !== (o.phoneNumber ?? '') ||
      address   !== (o.address   ?? '') ||
      barrio    !== (o.barrio    ?? '') ||
      //  NUEVO: si cambió la foto, también hay cambios
      profileImageUrl !== (o.profileImageUrl ?? '')
    )
  }

  function reset() {
    const o = original.current
    if (!o) return
    setFirstName(o.firstName ?? '')
    setLastName(o.lastName ?? '')
    setEmail(o.email ?? user?.email ?? '')
    setDni(o.dni ?? '')
    setPhone(o.phoneNumber ?? '')
    setAddress(o.address ?? '')
    setBarrio(o.barrio ?? '')
    // 👇 NUEVO
    setProfileImageUrl(o.profileImageUrl ?? '')
    setEdit(false)
  }

  async function save(){
    if(!user?.id){ setToast({open:true, msg:'No se encontró ID de usuario.', sev:'error'}); return }
    const errs = validate(values)
    if (Object.keys(errs).length) { setToast({open:true, msg:'Revisá los campos señalados.', sev:'error'}); return }

    setSaving(true)
    try {
      // construir patch (solo cambios)
      const base = original.current
      const patch: any = {}
      if (firstName !== (base?.firstName ?? '')) patch.firstName = firstName
      if (lastName  !== (base?.lastName  ?? '')) patch.lastName  = lastName
      if (email     !== (base?.email     ?? user.email)) patch.email = email
      if (dni       !== (base?.dni       ?? '')) patch.dni = dni
      if (phoneNumber !== (base?.phoneNumber ?? '')) patch.phoneNumber = phoneNumber
      if (address   !== (base?.address   ?? '')) patch.address = address
      if (barrio    !== (base?.barrio    ?? '')) patch.barrio = barrio
      // 👇 NUEVO
      if (profileImageUrl !== (base?.profileImageUrl ?? '')) patch.profileImageUrl = profileImageUrl

      const msg = await updateUserPartial(user.id, patch)
      // actualizar snapshot + sesión
      original.current = { ...(original.current || {}), ...patch } as ApiUser
      mergeUserMeta(patch)

      setToast({open:true, msg: msg || 'Datos guardados', sev:'success'})
      setEdit(false)
    } catch (e:any) {
      setToast({open:true, msg: e?.response?.data || e?.message || 'No se pudo guardar', sev:'error'})
    } finally {
      setSaving(false)
    }
  }

  const displayName =
    [firstName, lastName].filter(Boolean).join(' ') ||
    [original.current?.firstName, original.current?.lastName].filter(Boolean).join(' ') ||
    user?.name || email

  if (loading) {
    return (
      <Paper sx={{p:3}}>
        <Stack spacing={2} alignItems="center"><CircularProgress /><Typography>Cargando…</Typography></Stack>
      </Paper>
    )
  }

  return (
    <Paper sx={{p:3}}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2} alignItems="center">
          {/* 👇 ahora el avatar muestra la foto si hay */}
          <Avatar
            src={profileImageUrl || undefined}
            sx={{ width:64, height:64 }}
          >
            {(displayName || email)[0]?.toUpperCase() || '?'}
          </Avatar>
          <Stack>
            <Typography variant="h5" fontWeight={800}>{displayName}</Typography>
            <Typography variant="body2" color="text.secondary">{email}</Typography>
            <Stack direction="row" spacing={1} mt={1}><Chip label="Cliente" /></Stack>

            {/* 👇 Uploader visible siempre que haya user */}
            {user?.id && (
              <ProfileImageUploader
                userId={user.id}
                onUploaded={(url) => {
                  setProfileImageUrl(url)
                  setToast({open:true, msg:'Foto subida', sev:'success'})
                }}
              />
            )}
          </Stack>
        </Stack>

        {!edit ? (
          <Stack spacing={1}>
            <Typography><b>Nombre:</b> {firstName || '—'}</Typography>
            <Typography><b>Apellido:</b> {lastName || '—'}</Typography>
            <Typography><b>Email:</b> {email || '—'}</Typography>
            <Typography><b>DNI:</b> {dni || '—'}</Typography>
            <Typography><b>Teléfono:</b> {phoneNumber || '—'}</Typography>
            <Typography><b>Dirección:</b> {address || '—'}</Typography>
            {/* <Typography><b>Barrio:</b> {barrio || '—'}</Typography> */}

            <Stack direction="row" spacing={1} mt={2}>
              <Button variant="outlined" onClick={()=>setEdit(true)}>Editar</Button>
              <Button color="error" variant="outlined" onClick={()=>{ logout(); navigate('/', { replace: true }) }}>Cerrar sesión</Button>
            </Stack>
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Stack direction={{ xs:'column', sm:'row' }} spacing={2}>
              <TextField
                label="Nombre"
                value={firstName}
                onChange={(e)=>setFirstName(e.target.value)}
                error={!!errors.firstName} helperText={errors.firstName || ' '}
                fullWidth
              />
              <TextField
                label="Apellido"
                value={lastName}
                onChange={(e)=>setLastName(e.target.value)}
                error={!!errors.lastName} helperText={errors.lastName || ' '}
                fullWidth
              />
            </Stack>

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              error={!!errors.email} helperText={errors.email || ' '}
              fullWidth
            />

            <Stack direction={{ xs:'column', sm:'row' }} spacing={2}>
              <TextField
                label="DNI"
                value={dni}
                inputMode="numeric"
                onChange={(e)=>setDni(e.target.value.replace(/\D/g,''))}
                error={!!errors.dni} helperText={errors.dni || ' '}
                fullWidth
              />
              <TextField
                label="Teléfono"
                value={phoneNumber}
                onChange={(e)=>setPhone(e.target.value)}
                error={!!errors.phoneNumber} helperText={errors.phoneNumber || ' '}
                fullWidth
              />
            </Stack>

            <TextField
              label="Dirección"
              value={address}
              onChange={(e)=>setAddress(e.target.value)}
              error={!!errors.address} helperText={errors.address || ' '}
              fullWidth
            />

            {/* <FormControl fullWidth>
              <InputLabel id="barrio">Barrio</InputLabel>
              <Select labelId="barrio" label="Barrio" value={barrio} onChange={(e)=>setBarrio(e.target.value)}>
                <MenuItem value=""><em>Ninguno</em></MenuItem>
                {BARRIOS_CABA.map(b=><MenuItem key={b} value={b}>{b}</MenuItem>)}
              </Select>
            </FormControl> */}

            <Stack direction="row" spacing={2}>
              <Button variant="outlined" onClick={reset} disabled={saving}>Cancelar</Button>
              <Button
                onClick={save}
                disabled={saving || !isValid || !isDirty()}
                variant="contained"
              >
                {saving ? 'Guardando…' : 'Guardar'}
              </Button>
            </Stack>
          </Stack>
        )}
      </Stack>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={()=>setToast(s=>({...s, open:false}))}>
        <Alert severity={toast.sev} onClose={()=>setToast(s=>({...s, open:false}))}>{toast.msg}</Alert>
      </Snackbar>
    </Paper>
  )
}

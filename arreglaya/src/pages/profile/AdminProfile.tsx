import React from 'react'
import {
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import Grid from '@mui/material/Grid'
import { alpha } from '@mui/material/styles'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import ContactPhoneIcon from '@mui/icons-material/ContactPhone'
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined'
import AddressListForm from '../../components/AddressListForm'
import type { AddressInfo } from '../../types/address'
import {
  EMPTY_ADDR,
  isEmptyAddress,
  validateAddress,
  buildAddressesPatch
} from '../../utils/address'
import { useAuth } from '../../auth/AuthProvider'
import { getUserById, updateUserPartial, type ApiUser } from '../../api/users'
import { useNavigate } from 'react-router-dom'
import AvatarEditor from '../../components/AvatarEditor'
import ChangePasswordForm from '../../components/ChangePasswordForm'
import { useNotify } from '../../context/Notifications'

type InfoItem = { label: string; value: React.ReactNode }

function InfoCard({ title, icon, items }: { title: string; icon: React.ReactNode; items: InfoItem[] }) {
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        p: 2.5,
        height: '100%',
        bgcolor: 'background.default'
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
        {icon}
        <Typography variant="subtitle2" fontWeight={700}>
          {title}
        </Typography>
      </Stack>
      <Stack spacing={1}>
        {items.map(({ label, value }) => (
          <Stack key={label} direction="row" justifyContent="space-between" spacing={1}>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
            <Typography variant="body2" fontWeight={600}>{value || '—'}</Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  )
}

type Errors = {
  firstName?: string
  lastName?: string
  email?: string
  phoneNumber?: string
  dni?: string
}

function validate(values: {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  dni: string
}): Errors {
  const e: Errors = {}
  const firstLen = values.firstName.trim().length
  const lastLen = values.lastName.trim().length
  const namePattern = /^[a-zA-ZÁÉÍÓÚáéíóúÑñÜü\s]*$/
  const firstNamePatternOk = namePattern.test(values.firstName)
  const lastNamePatternOk = namePattern.test(values.lastName)
  const phoneLen = values.phoneNumber.trim().length
  const phonePattern = /^[0-9()+\- ]*$/
  const phonePatternOk = phonePattern.test(values.phoneNumber)
  if (firstLen < 2) e.firstName = 'Ingresá tu nombre.'
  else if (!firstNamePatternOk) e.firstName = 'Solo letras.'
  else if (firstLen > 40) e.firstName = 'Máximo 40 caracteres.'
  if (lastLen < 2) e.lastName  = 'Ingresá tu apellido.'
  else if (!lastNamePatternOk) e.lastName = 'Solo letras.'
  else if (lastLen > 40) e.lastName = 'Máximo 40 caracteres.'
  if (!/^\S+@\S+\.\S+$/.test(values.email)) e.email = 'Email inválido.'
  if (!phonePatternOk) e.phoneNumber = 'Solo números, espacios, +, - y ().'
  else if (phoneLen > 20) e.phoneNumber = 'Máximo 20 caracteres.'
  else if (values.phoneNumber.replace(/\D/g,'').length < 6) e.phoneNumber = 'Ingresá al menos 6 dígitos.'
  if (!/^\d{7,10}$/.test(values.dni)) e.dni = '7 a 10 dígitos, solo números.'
  return e
}

export default function AdminProfile(){
  const { user, logout, mergeUserMeta } = useAuth()
  const navigate = useNavigate()

  const notify = useNotify()
  const [loading, setLoading] = React.useState(true)
  const [edit, setEdit]       = React.useState(false)
  const [saving, setSaving]   = React.useState(false)
  const [firstName, setFirstName] = React.useState('')
  const [lastName, setLastName]   = React.useState('')
  const [email, setEmail]         = React.useState(user?.email ?? '')
  const [phoneNumber, setPhone]   = React.useState('')
  const [dni, setDni]             = React.useState('')
  const [profileImageUrl, setProfileImageUrl] = React.useState('')
  const [addresses, setAddresses] = React.useState<AddressInfo[]>([])
  const [changePassOpen, setChangePassOpen] = React.useState(false)
  const cleanAddresses = React.useMemo(
    () => (addresses || []).filter(a => !isEmptyAddress(a)),
    [addresses]
  )
  const values = { firstName, lastName, email, phoneNumber, dni }
  const errors = validate(values)
  const isValid = Object.keys(errors).length === 0

  const original = React.useRef<ApiUser | null>(null)

  React.useEffect(() => {
    let alive = true
    async function load(){
      if (!user?.id) { setLoading(false); return }
      try {
        const data = await getUserById(user.id)
        if (!alive) return
        const srcAddrs: AddressInfo[] | undefined = Array.isArray((data as any).addresses)
          ? (data as any).addresses
          : Array.isArray((data as any).address)
          ? (data as any).address
          : undefined
        const normalizedAddrs = srcAddrs && srcAddrs.length ? srcAddrs.map(a => ({ ...a })) : []
        original.current = { ...data, addresses: normalizedAddrs }

        setFirstName(data.firstName ?? '')
        setLastName(data.lastName ?? '')
        setEmail(data.email ?? user.email)
        setPhone(data.phoneNumber ?? '')
        setDni(data.dni ?? '')
        setProfileImageUrl((data as any).profileImageUrl ?? '')
        setAddresses(normalizedAddrs.length ? normalizedAddrs : [])

        mergeUserMeta(data)
      } catch (err:any) {
        notify({ severity: 'error', message: err?.response?.data || err?.message || 'No se pudo cargar el usuario' })
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [user?.id, user?.email, mergeUserMeta])



  function isDirty(): boolean {
    const o = original.current
    if (!o) return false
    const basicDirty =
      firstName !== (o.firstName ?? '') ||
      lastName  !== (o.lastName  ?? '') ||
      email     !== (o.email     ?? user?.email ?? '') ||
      phoneNumber !== (o.phoneNumber ?? '') ||
      profileImageUrl !== ((o as any).profileImageUrl ?? '')

    const addrsDirty =
      JSON.stringify((addresses || []).filter(a => !isEmptyAddress(a))) !==
      JSON.stringify(((o.addresses || []) as AddressInfo[]).filter(a => !isEmptyAddress(a)))

    return basicDirty || addrsDirty
  }

  function reset(){
    const o = original.current
    if (!o) return
    setFirstName(o.firstName ?? '')
    setLastName(o.lastName ?? '')
    setEmail(o.email ?? user?.email ?? '')
    setPhone(o.phoneNumber ?? '')
    const srcAddrs: AddressInfo[] | undefined = Array.isArray((o as any).addresses)
      ? (o as any).addresses
      : Array.isArray((o as any).address)
      ? (o as any).address
      : undefined
    const normalizedAddrs = srcAddrs && srcAddrs.length ? srcAddrs.map(a => ({ ...a })) : []
    setAddresses(normalizedAddrs.length ? normalizedAddrs : [])
    setProfileImageUrl((o as any).profileImageUrl ?? '')
    setEdit(false)
  }

  async function save(){
    if(!user?.id){ notify({ severity: 'error', message:'No se encontró ID de usuario.' }); return }
    const errs = validate(values)
    if (Object.keys(errs).length) { notify({ severity: 'error', message:'Revisá los campos señalados.' }); return }

    setSaving(true)
    try {
      const base = original.current
      const patch: any = {}
      if (firstName !== (base?.firstName ?? '')) patch.firstName = firstName
      if (lastName  !== (base?.lastName  ?? '')) patch.lastName  = lastName
      if (email     !== (base?.email     ?? user.email)) patch.email = email
      if (phoneNumber !== (base?.phoneNumber ?? '')) patch.phoneNumber = phoneNumber
      if (dni !== (base?.dni ?? '')) patch.dni = dni
      const addrPatch = buildAddressesPatch(base?.addresses, addresses)
      if (addrPatch !== undefined) patch.address = addrPatch
      if (profileImageUrl !== ((base as any).profileImageUrl ?? '')) patch.profileImageUrl = profileImageUrl

      const msg = await updateUserPartial(user.id, patch)
      original.current = { ...(original.current || {}), ...patch } as ApiUser
      mergeUserMeta(patch)

      notify({ severity: 'success', message: msg || 'Datos guardados' })
      setEdit(false)
    } catch (e:any) {
      notify({ severity: 'error', message: e?.response?.data || e?.message || 'No se pudo guardar' })
    } finally {
      setSaving(false)
    }
  }

  const displayName =
    [firstName, lastName].filter(Boolean).join(' ') ||
    [original.current?.firstName, original.current?.lastName].filter(Boolean).join(' ') ||
    user?.name || email

  const sectionCardSx = {
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 2,
    p: 2.5,
    bgcolor: 'background.default'
  } as const

  const identityInfo: InfoItem[] = [
    { label: 'Nombre', value: firstName || '—' },
    { label: 'Apellido', value: lastName || '—' },
    { label: 'DNI', value: dni || '—' },
  ]
  const contactInfo: InfoItem[] = [
    { label: 'Email', value: email || '—' },
    { label: 'Teléfono', value: phoneNumber || '—' }
  ]
  if (loading) {
    return (
      <Paper sx={{p:3}}>
        <Stack spacing={2} alignItems="center"><CircularProgress /><Typography>Cargando…</Typography></Stack>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
      <Stack spacing={3}>
        <Box
          sx={(theme) => ({
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            alignItems: { xs: 'flex-start', md: 'center' },
            border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
            backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.primary.light, 0.15)})`
          })}
        >
          <AvatarEditor
            src={profileImageUrl}
            name={displayName}
            userId={user!.id}
            enabled
            onChangeUrl={(url) => { setProfileImageUrl(url); mergeUserMeta({ profileImageUrl: url }) }}
            onRemove={() => { setProfileImageUrl(''); mergeUserMeta({ profileImageUrl: '' }) }}
          />

          <Stack spacing={0.5} flex={1}>
            <Typography variant="h5" fontWeight={800}>{displayName}</Typography>
            <Typography variant="body2" color="text.secondary">{email}</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
              <Chip label="Admin" color="primary" variant="outlined" />
            </Stack>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            {!edit && (
              <Button variant="outlined" onClick={() => setEdit(true)}>
                Editar perfil
              </Button>
            )}
            {!edit && (
              <Button variant="outlined" onClick={() => setChangePassOpen(true)}>
                Editar contraseña
              </Button>
            )}
            <Button
              color="error"
              variant="outlined"
              onClick={() => { logout(); navigate('/', { replace: true }) }}
            >
              Cerrar sesión
            </Button>
          </Stack>
        </Box>

        {!edit ? (
          <Stack spacing={3}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <InfoCard
                  title="Identidad"
                  icon={<PersonOutlineIcon fontSize="small" color="primary" />}
                  items={identityInfo}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <InfoCard
                  title="Contacto"
                  icon={<ContactPhoneIcon fontSize="small" color="primary" />}
                  items={contactInfo}
                />
              </Grid>
            </Grid>

            <Box sx={sectionCardSx}>
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <HomeWorkOutlinedIcon color="primary" fontSize="small" />
                <Typography variant="subtitle2" fontWeight={700}>
                  Domicilios cargados
                </Typography>
                <Chip size="small" label={cleanAddresses.length} />
              </Stack>
              {cleanAddresses.length ? (
                <Stack spacing={1.5}>
                  {cleanAddresses.map((addr, idx) => (
                    <Box key={idx} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
                      <Typography variant="subtitle2" fontWeight={700}>
                        Domicilio #{idx + 1}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {[addr.street, addr.number].filter(Boolean).join(' ')}
                        <br />
                        {[addr.city, addr.state].filter(Boolean).join(', ')}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Sin domicilios cargados.
                </Typography>
              )}
            </Box>
          </Stack>
        ) : (
          <Stack spacing={3}>
            <Box sx={sectionCardSx}>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <PersonOutlineIcon color="primary" fontSize="small" />
                <Typography variant="subtitle2" fontWeight={700}>Datos personales</Typography>
              </Stack>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Nombre"
                    value={firstName}
                    onChange={(e)=>setFirstName(e.target.value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñÜü\s]/g,''))}
                    inputProps={{ maxLength: 40 }}
                    error={!!errors.firstName} helperText={errors.firstName || `${firstName.length}/40`}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Apellido"
                    value={lastName}
                    onChange={(e)=>setLastName(e.target.value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñÜü\s]/g,''))}
                    inputProps={{ maxLength: 40 }}
                    error={!!errors.lastName} helperText={errors.lastName || `${lastName.length}/40`}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Box>

            <Box sx={sectionCardSx}>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <ContactPhoneIcon color="primary" fontSize="small" />
                <Typography variant="subtitle2" fontWeight={700}>Contacto</Typography>
              </Stack>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                    error={!!errors.email} helperText={errors.email || ' '}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="DNI"
                    value={dni}
                    onChange={(e)=>setDni(e.target.value.replace(/\\D/g,''))}
                    error={!!errors.dni} helperText={errors.dni || ' '}
                    disabled
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Teléfono"
                    value={phoneNumber}
                    onChange={(e)=>setPhone(e.target.value)}
                    inputProps={{ maxLength: 20 }}
                    error={!!errors.phoneNumber} helperText={errors.phoneNumber || `${phoneNumber.length}/20`}
                    fullWidth
                  />
                </Grid>
                
              </Grid>
            </Box>

            <Box sx={sectionCardSx}>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <HomeWorkOutlinedIcon color="primary" fontSize="small" />
                <Typography variant="subtitle2" fontWeight={700}>Domicilios</Typography>
                <Chip size="small" label={cleanAddresses.length} />
              </Stack>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Gestioná tus domicilios tal como en otros perfiles.
              </Typography>
              <AddressListForm value={addresses} onChange={setAddresses} />
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button variant="outlined" onClick={reset} disabled={saving} fullWidth>Cancelar</Button>
              <Button
                onClick={save}
                disabled={saving || !isValid || !isDirty()}
                variant="contained"
                fullWidth
              >
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </Button>
            </Stack>
          </Stack>
        )}
      </Stack>

      <Dialog open={changePassOpen} onClose={() => setChangePassOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Cambiar contraseña</DialogTitle>
        <DialogContent dividers>
          <ChangePasswordForm
            defaultEmail={email}
            onResult={(sev, msg) => {
              notify({ severity: sev, message: msg })
              if (sev === 'success') setChangePassOpen(false)
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangePassOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

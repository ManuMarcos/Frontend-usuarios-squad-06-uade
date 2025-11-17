// src/pages/profile/ContractorProfile.tsx
import React from 'react'
import {
  Paper,
  Stack,
  Typography,
  Chip,
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
  Box
} from '@mui/material'
import Grid from '@mui/material/Grid'
import { alpha } from '@mui/material/styles'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import ContactPhoneIcon from '@mui/icons-material/ContactPhone'
import FmdGoodOutlinedIcon from '@mui/icons-material/FmdGoodOutlined'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'
import { getUserById, updateUserPartial, type ApiUser } from '../../api/users'
// PROFESSIONS removed
import AddressListForm from '../../components/AddressListForm'
import AvatarEditor from '../../components/AvatarEditor'
import type { AddressInfo } from '../../types/address'
import {
  EMPTY_ADDR,
  isEmptyAddress,
  validateAddress,
  buildAddressesPatch
} from '../../utils/address'
import { isValidEmail } from '../../utils/validators'

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
      <Divider sx={{ mb: 1 }} />
      <Stack spacing={1}>
        {items.map(({ label, value }) => (
          <Stack
            key={label}
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
          >
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {value || '—'}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  )
}

export default function ContractorProfile() {
  const { user, logout, mergeUserMeta } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = React.useState(true)
  const [edit, setEdit] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [toast, setToast] = React.useState<{ open: boolean; msg: string; sev: 'success' | 'error' }>({
    open: false, msg: '', sev: 'success'
  })

  // Datos básicos
  const [firstName, setFirstName] = React.useState('')
  const [lastName, setLastName]   = React.useState('')
  const [email, setEmail]         = React.useState(user?.email ?? '')
  const [dni, setDni]             = React.useState('')
  const [phoneNumber, setPhone]   = React.useState('')

  // N domicilios
  const [addresses, setAddresses] = React.useState<AddressInfo[]>([])

  // Foto de perfil
  const [profileImageUrl, setProfileImageUrl] = React.useState('')

  const filteredAddresses = React.useMemo(
    () => (addresses || []).filter(a => !isEmptyAddress(a)),
    [addresses]
  )
  const addressItems = filteredAddresses.map((addr, idx) => ({ addr, idx }))
  const [showAllAddresses, setShowAllAddresses] = React.useState(addressItems.length <= 3)
  const prevAddressCount = React.useRef(addressItems.length)

  // Snapshot original para dirty-check
  const original = React.useRef<ApiUser | null>(null)

  React.useEffect(() => {
    let alive = true
    async function load() {
      if (!user?.id) { setLoading(false); return }
      try {
        const data = await getUserById(user.id) as ApiUser
        if (!alive) return

        const srcAddrs: AddressInfo[] | undefined = Array.isArray((data as any).addresses)
          ? (data as any).addresses
          : Array.isArray((data as any).address)
          ? (data as any).address
          : undefined
        const normalizedAddrs = srcAddrs && srcAddrs.length ? srcAddrs.map(addr => ({ ...addr })) : []
        original.current = { ...data, addresses: normalizedAddrs }
        setFirstName(data.firstName ?? '')
        setLastName(data.lastName ?? '')
        setEmail(data.email ?? user.email)
        setDni(data.dni ?? '')
        setPhone(data.phoneNumber ?? '')
        setAddresses(normalizedAddrs)

        setProfileImageUrl((data as any).profileImageUrl ?? '')

        // sync sesión
        mergeUserMeta(data)
      } catch (err: any) {
        setToast({
          open: true,
          msg: err?.response?.data || err?.message || 'No se pudo cargar el usuario',
          sev: 'error'
        })
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [user?.id, user?.email, mergeUserMeta])

  // Validaciones
  const emailOk = isValidEmail(email)
  const dniOk   = /^\d{7,10}$/.test(dni)
  const phoneOk = phoneNumber.replace(/\D/g, '').length >= 6
  const isValid =
    firstName.trim().length >= 2 &&
    lastName.trim().length  >= 2 &&
    emailOk && dniOk && phoneOk

  function isDirty(): boolean {
    const o = original.current
    if (!o) return false
    const basicDirty =
      firstName    !== (o.firstName ?? '') ||
      lastName     !== (o.lastName  ?? '') ||
      email        !== (o.email     ?? user?.email ?? '') ||
      dni          !== (o.dni       ?? '') ||
      phoneNumber  !== (o.phoneNumber ?? '') ||
      profileImageUrl !== ((o as any).profileImageUrl ?? '')

    const addrsDirty =
      JSON.stringify((addresses || []).filter(a => !isEmptyAddress(a))) !==
      JSON.stringify(((o.addresses || []) as AddressInfo[]).filter(a => !isEmptyAddress(a)))

    return basicDirty || addrsDirty
  }

  function reset() {
    const o = original.current
    if (!o) return
    setFirstName(o.firstName ?? '')
    setLastName(o.lastName ?? '')
    setEmail(o.email ?? user?.email ?? '')
    setDni(o.dni ?? '')
    setPhone(o.phoneNumber ?? '')
    const srcAddrs: AddressInfo[] | undefined = Array.isArray((o as any).addresses)
      ? (o as any).addresses
      : Array.isArray((o as any).address)
      ? (o as any).address
      : undefined
    const normalizedAddrs = srcAddrs && srcAddrs.length ? srcAddrs.map(addr => ({ ...addr })) : []
    setAddresses(normalizedAddrs)
    setProfileImageUrl((o as any).profileImageUrl ?? '')
    setEdit(false)
  }

  async function save() {
    if (!user?.id) {
      setToast({ open: true, msg: 'No se encontró ID de usuario.', sev: 'error' })
      return
    }
    if (!isValid) {
      setToast({ open: true, msg: 'Revisá los campos marcados.', sev: 'error' })
      return
    }
    setSaving(true)
    try {
      const base: Partial<ApiUser> = original.current || {}
      const patch: any = {}

      if (firstName    !== (base.firstName ?? '')) patch.firstName = firstName
      if (lastName     !== (base.lastName  ?? '')) patch.lastName  = lastName
      if (email        !== (base.email     ?? user.email)) patch.email = email
      if (dni          !== (base.dni       ?? '')) patch.dni = dni
      if (phoneNumber  !== (base.phoneNumber ?? '')) patch.phoneNumber = phoneNumber
      if (profileImageUrl !== ((base as any).profileImageUrl ?? '')) patch.profileImageUrl = profileImageUrl

      const addrPatch = buildAddressesPatch(base?.addresses, addresses)
      if (addrPatch !== undefined) patch.address = addrPatch

      const msg = await updateUserPartial(user.id, patch)

      original.current = { ...(original.current || {}), ...patch }
      mergeUserMeta(patch)

      setToast({ open: true, msg: msg || 'Datos guardados', sev: 'success' })
      setEdit(false)
    } catch (e: any) {
      setToast({ open: true, msg: e?.response?.data || e?.message || 'No se pudo guardar', sev: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const displayName =
    [firstName, lastName].filter(Boolean).join(' ') ||
    [original.current?.firstName, original.current?.lastName].filter(Boolean).join(' ') ||
    user?.name ||
    email

  const handleProfileImageChange = React.useCallback((url: string) => {
    setProfileImageUrl(url)
    original.current = { ...(original.current || {}), profileImageUrl: url } as ApiUser
    mergeUserMeta({ profileImageUrl: url })
  }, [mergeUserMeta])

  const handleProfileImageRemove = React.useCallback(() => {
    handleProfileImageChange('')
  }, [handleProfileImageChange])

  React.useEffect(() => {
    if (addressItems.length <= 3) {
      setShowAllAddresses(true)
    } else if (prevAddressCount.current <= 3 && addressItems.length > 3) {
      setShowAllAddresses(false)
    }
    prevAddressCount.current = addressItems.length
  }, [addressItems.length])

  const addressesPreview = showAllAddresses ? addressItems : addressItems.slice(0, 3)
  const hasManyAddresses = addressItems.length > 3
  const sectionCardSx = {
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 2,
    p: 2.5,
    bgcolor: 'background.default'
  } as const

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography>Cargando…</Typography>
        </Stack>
      </Paper>
    )
  }

  const identityInfo: InfoItem[] = [
    { label: 'Nombre', value: firstName || '—' },
    { label: 'Apellido', value: lastName || '—' },
    { label: 'DNI', value: dni || '—' }
  ]

  const contactInfo: InfoItem[] = [
    { label: 'Email', value: email || '—' },
    { label: 'Teléfono', value: phoneNumber || '—' }
  ]

  const formatAddress = (addr: AddressInfo) => {
    const line1 = [addr.street, addr.number].filter(Boolean).join(' ')
    const line2 = [addr.floor && `Piso ${addr.floor}`, addr.apartment && `Depto ${addr.apartment}`]
      .filter(Boolean)
      .join(' · ')
    const line3 = [addr.city, addr.state].filter(Boolean).join(', ')
    return [line1, line2, line3].filter(Boolean).join(' • ')
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
            onChangeUrl={handleProfileImageChange}
            onRemove={handleProfileImageRemove}
          />

          <Stack spacing={0.5} flex={1}>
            <Typography variant="h5" fontWeight={800}>{displayName}</Typography>
            <Typography variant="body2" color="text.secondary">{email}</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
              <Chip label="Prestador" color="primary" variant="outlined" />
              <Chip
                icon={<FmdGoodOutlinedIcon fontSize="small" />}
                label={`${addressItems.length} domicilios`}
                variant="outlined"
              />
            </Stack>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            {!edit && (
              <Button variant="outlined" onClick={() => setEdit(true)}>
                Editar perfil
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
                <FmdGoodOutlinedIcon color="primary" fontSize="small" />
                <Typography variant="subtitle2" fontWeight={700}>Domicilios guardados</Typography>
                <Chip size="small" label={filteredAddresses.length} />
              </Stack>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Podés agregar tantos domicilios como zonas de cobertura tengas asignadas.
              </Typography>

              {addressItems.length ? (
                <>
                  <Stack spacing={1.5} sx={{ maxHeight: 320, overflowY: 'auto', pr: 1 }}>
                    {addressesPreview.map(({ addr, idx }) => (
                      <Box
                        key={`addr-view-${idx}`}
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          p: 2,
                          bgcolor: 'background.paper'
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center" mb={0.5} flexWrap="wrap">
                          <Chip size="small" label={`#${idx + 1}`} />
                          <Typography variant="subtitle2" fontWeight={700}>
                            {[addr.city, addr.state].filter(Boolean).join(', ') || 'Ubicación pendiente'}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {formatAddress(addr)}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                  {hasManyAddresses && (
                    <Button
                      size="small"
                      onClick={() => setShowAllAddresses(s => !s)}
                      sx={{ alignSelf: 'flex-start', mt: 1 }}
                    >
                      {showAllAddresses ? 'Ver menos' : `Ver todos (${addressItems.length})`}
                    </Button>
                  )}
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Aún no cargaste domicilios.
                </Typography>
              )}
            </Box>
          </Stack>
        ) : (
          <Stack spacing={3}>
            <Box sx={sectionCardSx}>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <PersonOutlineIcon color="primary" fontSize="small" />
                <Typography variant="subtitle2" fontWeight={700}>
                  Datos personales
                </Typography>
              </Stack>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Nombre"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    error={firstName.trim().length < 2}
                    helperText={firstName.trim().length < 2 ? 'Ingresá tu nombre.' : ' '}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Apellido"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    error={lastName.trim().length < 2}
                    helperText={lastName.trim().length < 2 ? 'Ingresá tu apellido.' : ' '}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Box>

            <Box sx={sectionCardSx}>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <ContactPhoneIcon color="primary" fontSize="small" />
                <Typography variant="subtitle2" fontWeight={700}>
                  Contacto
                </Typography>
              </Stack>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    error={!emailOk}
                    helperText={!emailOk ? 'Email inválido.' : ' '}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="DNI"
                    value={dni}
                    inputMode="numeric"
                    onChange={e => setDni(e.target.value.replace(/\D/g, ''))}
                    error={!dniOk}
                    helperText={!dniOk ? '7 a 10 dígitos, solo números.' : ' '}
                    disabled
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Teléfono"
                    value={phoneNumber}
                    onChange={e => setPhone(e.target.value)}
                    error={!phoneOk}
                    helperText={!phoneOk ? 'Teléfono incompleto.' : ' '}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Box>

            <Box sx={sectionCardSx}>
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <FmdGoodOutlinedIcon color="primary" fontSize="small" />
                <Typography variant="subtitle2" fontWeight={700}>
                  Domicilios
                </Typography>
                <Chip size="small" label={addressItems.length} />
              </Stack>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Mantené tus domicilios actualizados para recibir pedidos cerca de cada zona.
              </Typography>
              <AddressListForm value={addresses} onChange={setAddresses} />
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button variant="outlined" onClick={reset} disabled={saving} fullWidth>
                Cancelar
              </Button>
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

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast(s => ({ ...s, open: false }))}
      >
        <Alert
          severity={toast.sev}
          onClose={() => setToast(s => ({ ...s, open: false }))}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </Paper>
  )
}

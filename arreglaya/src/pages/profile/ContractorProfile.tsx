// src/pages/profile/ContractorProfile.tsx
import React from 'react'
import {
  Paper, Stack, Typography, Chip, TextField, Button,
  FormControl, InputLabel, Select, MenuItem,
  Snackbar, Alert, CircularProgress, Divider
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'
import { getUserById, updateUserPartial, type ApiUser } from '../../api/users'
import { PROFESSIONS } from '../../constants'
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

  // Rol-específico (Prestador)
  const [profession, setProfession]   = React.useState('')
  const [description, setDescription] = React.useState('')

  // N domicilios
  const [addresses, setAddresses] = React.useState<AddressInfo[]>([{ ...EMPTY_ADDR }])

  // Foto de perfil
  const [profileImageUrl, setProfileImageUrl] = React.useState('')

  // Snapshot original para dirty-check
  const original = React.useRef<ApiUser | null>(null)

  React.useEffect(() => {
    let alive = true
    async function load() {
      if (!user?.id) { setLoading(false); return }
      try {
        const data = await getUserById(user.id) as ApiUser
        if (!alive) return

        original.current = data
        setFirstName(data.firstName ?? '')
        setLastName(data.lastName ?? '')
        setEmail(data.email ?? user.email)
        setDni(data.dni ?? '')
        setPhone(data.phoneNumber ?? '')
        setProfession((data as any).profession ?? '')
        setDescription((data as any).description ?? '')

        const srcAddrs: AddressInfo[] | undefined = Array.isArray((data as any).addresses)
          ? (data as any).addresses
          : Array.isArray((data as any).address)
          ? (data as any).address
          : undefined
        setAddresses(srcAddrs && srcAddrs.length ? srcAddrs : [{ ...EMPTY_ADDR }])

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
  const addressesOk = (addresses || [])
    .filter(a => Object.keys(validateAddress(a, true)).length === 0).length >= 1
  const professionOk = !!profession

  const isValid =
    firstName.trim().length >= 2 &&
    lastName.trim().length  >= 2 &&
    emailOk && dniOk && phoneOk &&
    addressesOk && professionOk

  function isDirty(): boolean {
    const o = original.current
    if (!o) return false
    const basicDirty =
      firstName    !== (o.firstName ?? '') ||
      lastName     !== (o.lastName  ?? '') ||
      email        !== (o.email     ?? user?.email ?? '') ||
      dni          !== (o.dni       ?? '') ||
      phoneNumber  !== (o.phoneNumber ?? '') ||
      profession   !== ((o as any).profession ?? '') ||
      description  !== ((o as any).description ?? '') ||
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
    setProfession((o as any).profession ?? '')
    setDescription((o as any).description ?? '')
    setAddresses(o.addresses?.length ? o.addresses : [{ ...EMPTY_ADDR }])
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
      if (profession   !== ((base as any).profession ?? '')) patch.profession = profession
      if (description  !== ((base as any).description ?? '')) patch.description = description
      if (profileImageUrl !== ((base as any).profileImageUrl ?? '')) patch.profileImageUrl = profileImageUrl

      const addrPatch = buildAddressesPatch(base.addresses, addresses)
      if (addrPatch !== undefined) patch.addresses = addrPatch

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

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={2}>
        {/* Header + Avatar */}
        <Stack direction="row" spacing={2} alignItems="center">
          <AvatarEditor
            src={profileImageUrl}
            name={displayName}
            userId={user!.id}
            enabled={edit}
            onChangeUrl={(url) => setProfileImageUrl(url)}
            onRemove={() => setProfileImageUrl('')}
          />
          <Stack>
            <Typography variant="h5" fontWeight={800}>{displayName}</Typography>
            <Typography variant="body2" color="text.secondary">{email}</Typography>
            <Stack direction="row" spacing={1} mt={1}><Chip label="Prestador" /></Stack>
          </Stack>
        </Stack>

        {!edit ? (
          // ===== Lectura =====
          <Stack spacing={1}>
            <Typography><b>Nombre:</b> {firstName || '—'}</Typography>
            <Typography><b>Apellido:</b> {lastName || '—'}</Typography>
            <Typography><b>Email:</b> {email || '—'}</Typography>
            <Typography><b>DNI:</b> {dni || '—'}</Typography>
            <Typography><b>Teléfono:</b> {phoneNumber || '—'}</Typography>
            <Typography><b>Profesión:</b> {profession || '—'}</Typography>
            {description && <Typography><b>Descripción:</b> {description}</Typography>}

            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1" fontWeight={700}>Domicilios</Typography>
            <Stack spacing={1}>
              {(addresses || []).filter(a => !isEmptyAddress(a)).map((a, idx) => (
                <Stack key={idx} spacing={0.5}>
                  <Typography variant="body2"><b>Domicilio {idx + 1}</b></Typography>
                  <Typography variant="body2" color="text.secondary">
                    {a.street} {a.number}{a.floor ? `, Piso ${a.floor}` : ''}{a.apartment ? `, Depto ${a.apartment}` : ''}
                    <br />{a.city}, {a.state}
                  </Typography>
                </Stack>
              ))}
              {(!addresses || addresses.length === 0) && <Typography>—</Typography>}
            </Stack>

            <Stack direction="row" spacing={1} mt={2}>
              <Button variant="outlined" onClick={() => setEdit(true)}>Editar</Button>
              <Button
                color="error"
                variant="outlined"
                onClick={() => { logout(); navigate('/', { replace: true }) }}
              >
                Cerrar sesión
              </Button>
            </Stack>
          </Stack>
        ) : (
          // ===== Edición =====
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Nombre"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                error={firstName.trim().length < 2}
                helperText={firstName.trim().length < 2 ? 'Ingresá tu nombre.' : ' '}
                fullWidth
              />
              <TextField
                label="Apellido"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                error={lastName.trim().length < 2}
                helperText={lastName.trim().length < 2 ? 'Ingresá tu apellido.' : ' '}
                fullWidth
              />
            </Stack>

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              error={!emailOk}
              helperText={!emailOk ? 'Email inválido.' : ' '}
              fullWidth
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="DNI"
                value={dni}
                inputMode="numeric"
                onChange={e => setDni(e.target.value.replace(/\D/g, ''))}
                error={!dniOk}
                helperText={!dniOk ? '7 a 10 dígitos, solo números.' : ' '}
                fullWidth
              />
              <TextField
                label="Teléfono"
                value={phoneNumber}
                onChange={e => setPhone(e.target.value)}
                error={!phoneOk}
                helperText={!phoneOk ? 'Teléfono incompleto.' : ' '}
                fullWidth
              />
            </Stack>

            <FormControl fullWidth>
              <InputLabel id="profession">Profesión</InputLabel>
              <Select
                labelId="profession"
                label="Profesión"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
              >
                <MenuItem value=""><em>Ninguna</em></MenuItem>
                {PROFESSIONS.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </Select>
            </FormControl>

            <TextField
              label="Descripción (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline minRows={3}
            />

            <Divider />

            {/* Edición de N domicilios */}
            <AddressListForm value={addresses} onChange={setAddresses} />

            <Stack direction="row" spacing={2}>
              <Button variant="outlined" onClick={reset} disabled={saving}>Cancelar</Button>
              <Button onClick={save} disabled={saving || !isValid || !isDirty()} variant="contained">
                {saving ? 'Guardando…' : 'Guardar'}
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

import React from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, TextField, Button, FormControl, InputLabel, Select, MenuItem,
  Alert, Stack, Typography
} from '@mui/material'
// barrio/profession lists removed from constants
import { adminCreateUser, type ApiUser } from '../../api/users'
import PasswordField from '../PasswordField'
import PasswordStrengthBar from '../PasswordStrengthBar'
import { isValidEmail, checkPasswordCriteria } from '../../utils/validators'
import { AddressInfo } from '../../types/address'
import { EMPTY_ADDR, isEmptyAddress, validateAddress } from '../../utils/address'
import AddressListForm from '../AddressListForm'
import { ApiRole } from '../../types'

type Props = {
  open: boolean
  onClose: () => void
  /** Se llama al crear OK, pasamos el usuario creado para refrescar la tabla o usarlo. */
  onCreated?: (user: ApiUser) => void
}

export default function AdminCreateUserDialog({ open, onClose, onCreated }: Props){
  // Campos
  const [firstName, setFirstName]   = React.useState('')
  const [lastName, setLastName]     = React.useState('')
  const [email, setEmail]           = React.useState('')
  const [password, setPassword]     = React.useState('')
  const [confirm, setConfirm]       = React.useState('')
  const [dni, setDni]               = React.useState('')
  const [phoneNumber, setPhone]     = React.useState('')
  const [role, setRole]             = React.useState<ApiRole>('CLIENTE')
  // barrio/profession removed
  const [addresses, setAddresses] = React.useState<AddressInfo[]>([{ ...EMPTY_ADDR }])


 

  // validación de addresses: al menos uno válido
  const validList = addresses.filter(a => Object.keys(validateAddress(a, true)).length === 0)
  const addressesOk = validList.length >= 1

  const [loading, setLoading] = React.useState(false)
  const [error, setError]     = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open) {
      // reset al abrir
      setFirstName(''); setLastName(''); setEmail(''); setPassword(''); setConfirm('')
      setDni(''); setPhone('')
  setRole('CLIENTE');
      setAddresses([{ ...EMPTY_ADDR }])
      setLoading(false); setError(null)
    }
  }, [open])

  // Validaciones
  const criteria = checkPasswordCriteria(password)
  const pwOk = criteria.length && criteria.upper && criteria.lower && criteria.number && criteria.symbol
  const confirmOk = password === confirm

  const phoneDigits = phoneNumber.replace(/\D/g,'').length
  const phonePattern = /^[0-9()+\- ]*$/
  const phonePatternOk = phonePattern.test(phoneNumber)
  const phoneLenOk = phoneNumber.trim().length <= 40
  const phoneMsg = !phonePatternOk
    ? 'Solo números, espacios, +, - y ().'
    : !phoneLenOk
    ? 'Máximo 40 caracteres.'
    : phoneDigits < 6
    ? 'Ingresá al menos 6 dígitos.'
    : ''

  const errors = {
    firstName: firstName.trim().length < 2 ? 'Ingresá el nombre.' : '',
    lastName:  lastName.trim().length  < 2 ? 'Ingresá el apellido.' : '',
    email:     !isValidEmail(email) ? 'Email inválido.' : '',
    password:  !pwOk ? 'Usá 8+ caráct., mayús, minús, número y símbolo.' : '',
    confirm:   !confirmOk ? 'No coincide.' : '',
    dni:       !/^\d{7,10}$/.test(dni) ? '7 a 10 dígitos, solo números.' : '',
    phone:     phoneMsg,
    // barrio/profession validations removed
  }

  const isValid =
    !errors.firstName && !errors.lastName && !errors.email &&
    !errors.password && !errors.confirm && !errors.dni &&
    !errors.phone &&
    addressesOk

  async function handleCreate(){
    setError(null)
    if (!isValid) { setError('Revisá los campos marcados.'); return }
    setLoading(true)
    try{
      const payload = {
        firstName, lastName, email, password, dni, phoneNumber, role,
        addresses: addresses.filter(a => !isEmptyAddress(a)),
  // barrio/profession removed from payload
      }
      const user = await adminCreateUser(payload)
      onCreated?.(user)
      onClose()
    }catch(e:any){
      const msg = e?.response?.data?.message || e?.response?.data || e?.message || 'No se pudo crear el usuario'
      setError(msg)
    }finally{
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>Crear usuario</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2}>
          <Grid size = {{ xs: 12, sm: 6 }}>
            <TextField label="Nombre" value={firstName}
              onChange={(e)=>setFirstName(e.target.value)}
              inputProps={{ maxLength: 20 }}
              error={!!errors.firstName} helperText={errors.firstName || `${firstName.length}/40`} fullWidth />
          </Grid>
          <Grid size = {{ xs: 12, sm: 6 }}>
            <TextField label="Apellido" value={lastName}
              onChange={(e)=>setLastName(e.target.value)}
              inputProps={{ maxLength: 20 }}
              error={!!errors.lastName} helperText={errors.lastName || `${lastName.length}/40`} fullWidth />
          </Grid>

          <Grid size = {{ xs: 12, sm: 6 }}>
            <TextField label="Email" type="email" value={email}
              onChange={(e)=>setEmail(e.target.value)}
              error={!!errors.email} helperText={errors.email || ' '} fullWidth />
          </Grid>
          <Grid size = {{ xs: 12, sm: 3 }}>
            <TextField label="DNI" inputMode="numeric" value={dni}
              onChange={(e)=>setDni(e.target.value.replace(/\D/g,''))}
              error={!!errors.dni} helperText={errors.dni || ' '} fullWidth />
          </Grid>
          <Grid size = {{ xs: 12, sm: 3 }}>
            <TextField label="Teléfono" value={phoneNumber}
              onChange={(e)=>setPhone(e.target.value)}
              inputProps={{ maxLength: 20 }}
              error={!!errors.phone} helperText={errors.phone || `${phoneNumber.length}/40`} fullWidth />
          </Grid>

          <Grid size = {{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel id="role">Rol</InputLabel>
              <Select
                labelId="role" label="Rol" value={role}
                onChange={(e)=>setRole(e.target.value as ApiRole)}
              >
                <MenuItem value="CLIENTE">Cliente</MenuItem>
                <MenuItem value="PRESTADOR">Prestador</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* barrio/profession fields removed */}

          <Grid size = {{ xs: 12, sm: 6 }}>
            <PasswordField
              label="Contraseña"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              error={!!errors.password} helperText={errors.password || ' '}
              fullWidth
            />
            <PasswordStrengthBar password={password} />
          </Grid>
          <Grid size = {{ xs: 12, sm: 6 }}>
            <PasswordField
              label="Confirmar contraseña"
              value={confirm}
              onChange={(e)=>setConfirm(e.target.value)}
              error={!!errors.confirm} helperText={errors.confirm || ' '}
              fullWidth
            />
          </Grid>
        </Grid>

        <Typography variant="h6" mt={3} mb={1}>Domicilios</Typography>
        <AddressListForm value={addresses} onChange={setAddresses} />
      </DialogContent>
      <DialogActions>
        <Stack direction="row" spacing={1}>
          <Button onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button
            onClick={handleCreate}
            disabled={loading || !isValid}
            variant="contained"
          >
            {loading ? 'Creando…' : 'Crear usuario'}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  )
}


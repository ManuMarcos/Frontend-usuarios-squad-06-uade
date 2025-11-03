import React from 'react'
import {
  Paper, Grid, Stack, Typography, TextField, Button, Alert,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { registerUser, type RegisterDTO } from '../api/auth'
import { isValidEmail, checkPasswordCriteria } from '../utils/validators'
import PasswordField from '../components/PasswordField'
import PasswordStrengthBar from '../components/PasswordStrengthBar'
import AddressListForm from '../components/AddressListForm'
import type { AddressInfo } from '../types/address'
import { EMPTY_ADDR, validateAddress, isEmptyAddress } from '../utils/address'
import { BARRIOS_CABA, PROFESSIONS } from '../constants'
import { ApiRole } from '../types'

type UiRole = 'customer' | 'contractor' | 'admin'
const toApiRole = (r: UiRole) => r === 'customer' ? 'CLIENTE' : r === 'contractor' ? 'PRESTADOR' : 'ADMIN'

export default function Register(){
  const navigate = useNavigate()

  // Datos personales
  const [firstName, setFirstName] = React.useState('')
  const [lastName, setLastName]   = React.useState('')
  const [email, setEmail]         = React.useState('')
  const [dni, setDni]             = React.useState('')
  const [phone, setPhone]         = React.useState('')

  // Credenciales
  const [password, setPassword]   = React.useState('')
  const [confirm, setConfirm]     = React.useState('')

  // Rol + específicos
  const [role, setRole]           = React.useState<UiRole>('customer')
  const [barrio, setBarrio]       = React.useState('')
  const [profession, setProfession] = React.useState('')

  // N domicilios
 const [addresses, setAddresses] = React.useState<AddressInfo[]>([{ ...EMPTY_ADDR }])


  // UX
  const [loading, setLoading] = React.useState(false)
  const [error, setError]     = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)
  const [touched, setTouched] = React.useState({ email:false, password:false, confirm:false })

  // Validaciones
  const emailOk = isValidEmail(email)
  const dniOk   = /^\d{7,10}$/.test(dni)
  const phoneOk = phone.replace(/\D/g,'').length >= 6

  const pwCrit  = checkPasswordCriteria(password)
  const pwOk    = !!pwCrit.length && pwCrit.upper && pwCrit.lower && pwCrit.number && pwCrit.symbol
  const confOk  = password === confirm

  const addressesOk = (addresses || []).filter(a => Object.keys(validateAddress(a, true)).length === 0).length >= 1


  const roleOk =
    (role === 'customer'   && !!barrio) ||
    (role === 'contractor' && !!profession) ||
    (role === 'admin')

  const formValid =
    firstName.trim().length >= 2 &&
    lastName.trim().length  >= 2 &&
    emailOk && dniOk && phoneOk &&
    pwOk && confOk && addressesOk && roleOk

  function parseError(err:any): string {
    const status = err?.response?.status
    const msg = err?.response?.data?.message || err?.response?.data || err?.message
    if (status === 409 && /email/i.test(String(msg))) return 'Ese email ya está registrado.'
    if (status === 400) return 'Revisá los datos ingresados.'
    if (!err?.response) return 'No se pudo conectar con el servidor.'
    return msg || 'Error al registrar.'
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched({ email:true, password:true, confirm:true })
    if (!formValid) { setError('Revisá los campos marcados.'); return }

    setLoading(true); setError(null); setSuccess(null)
    try {
      const payload: RegisterDTO = {
        email,
        password,
        firstName,
        lastName,
        dni,
        phoneNumber: phone,
        role: toApiRole(role) as ApiRole,
        addresses: (addresses || []).filter(a => !isEmptyAddress(a)),
      }
      await registerUser(payload)
      setSuccess('¡Cuenta creada! Iniciá sesión para continuar.')
      setTimeout(() => navigate('/login?m=registered', { replace: true }), 900)
    } catch (err:any) {
      setError(parseError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
      <Grid size={{ xs: 12, md: 7 }}>
        <Paper sx={{ p:3 }}>
          <Typography variant="h5" fontWeight={700} mb={2}>Crear cuenta</Typography>

          {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb:2 }}>{success}</Alert>}

          <Stack component="form" spacing={2} onSubmit={onSubmit}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Nombre" value={firstName} onChange={(e)=>setFirstName(e.target.value)}
                  error={firstName.trim().length < 2} helperText={firstName.trim().length < 2 ? 'Ingresá tu nombre.' : ' '} fullWidth />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Apellido" value={lastName} onChange={(e)=>setLastName(e.target.value)}
                  error={lastName.trim().length < 2} helperText={lastName.trim().length < 2 ? 'Ingresá tu apellido.' : ' '} fullWidth />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Email" type="email" value={email}
                  onChange={(e)=>setEmail(e.target.value)}
                  onBlur={()=>setTouched(t=>({...t, email:true}))}
                  error={touched.email && !emailOk}
                  helperText={touched.email && !emailOk ? 'Email inválido.' : ' '}
                  fullWidth />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField label="DNI" inputMode="numeric" value={dni}
                  onChange={(e)=>setDni(e.target.value.replace(/\D/g,''))}
                  error={!dniOk} helperText={!dniOk ? '7 a 10 dígitos, solo números.' : ' '}
                  fullWidth />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField label="Teléfono" value={phone}
                  onChange={(e)=>setPhone(e.target.value)}
                  error={!phoneOk} helperText={!phoneOk ? 'Teléfono incompleto.' : ' '}
                  fullWidth />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel id="role">Rol</InputLabel>
                  <Select labelId="role" label="Rol" value={role} onChange={(e)=>setRole(e.target.value as UiRole)}>
                    <MenuItem value="customer">Cliente</MenuItem>
                    <MenuItem value="contractor">Prestador</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <PasswordField
                  label="Contraseña"
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                  onBlur={()=>setTouched(t=>({...t, password:true}))}
                  error={touched.password && !pwOk}
                  helperText={touched.password && !pwOk ? 'Usá 8+ caráct., mayús, minús, número y símbolo.' : ' '}
                />
                <PasswordStrengthBar password={password} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <PasswordField
                  label="Confirmar contraseña"
                  value={confirm}
                  onChange={(e)=>setConfirm(e.target.value)}
                  onBlur={()=>setTouched(t=>({...t, confirm:true}))}
                  error={touched.confirm && !confOk}
                  helperText={touched.confirm && !confOk ? 'No coincide.' : ' '}
                />
              </Grid>
            </Grid>

            {/* N domicilios */}
            <Typography variant="h6" mt={1}>Domicilios</Typography>
            <AddressListForm value={addresses} onChange={setAddresses} />

            <Button type="submit" disabled={loading || !formValid}>
              {loading ? 'Creando cuenta…' : 'Crear cuenta'}
            </Button>

            <Typography variant="body2">
              ¿Ya tenés cuenta? <RouterLink to="/login">Iniciar sesión</RouterLink>
            </Typography>
          </Stack>
        </Paper>

    </Grid>
  )
}
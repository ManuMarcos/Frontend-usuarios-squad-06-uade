import React from 'react'
import {
  Paper, Grid, Stack, Typography, TextField, Button,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { registerUser, type RegisterDTO } from '../api/auth'
import { isValidEmail, checkPasswordCriteria } from '../utils/validators'
import { useNotify } from '../context/Notifications'
import PasswordField from '../components/PasswordField'
import PasswordStrengthBar from '../components/PasswordStrengthBar'
import AddressListForm from '../components/AddressListForm'
import type { AddressInfo } from '../types/address'
import { EMPTY_ADDR, validateAddress, isEmptyAddress } from '../utils/address'
// barrio/profession constants removed
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

  // N domicilios
 const [addresses, setAddresses] = React.useState<AddressInfo[]>([{ ...EMPTY_ADDR }])


  // UX
  const notify = useNotify()
  const [loading, setLoading] = React.useState(false)
  const [touched, setTouched] = React.useState({ email:false, password:false, confirm:false })

  // Validaciones
  const firstNameLen = firstName.length
  const lastNameLen = lastName.length
  const firstNameTrim = firstName.trim().length
  const lastNameTrim = lastName.trim().length
  const namePattern = /^[a-zA-ZÁÉÍÓÚáéíóúÑñÜü\s]*$/
  const firstNamePatternOk = namePattern.test(firstName)
  const lastNamePatternOk = namePattern.test(lastName)
  const firstNameLenOk = firstNameLen <= 40
  const lastNameLenOk = lastNameLen <= 40
  const emailOk = isValidEmail(email)
  const dniOk   = /^\d{7,10}$/.test(dni)
  const phoneDigits = phone.replace(/\D/g,'').length
  const phoneLenOk = phone.trim().length <= 20
  const phonePattern = /^[0-9()+\- ]*$/
  const phonePatternOk = phonePattern.test(phone)
  const phoneOk = phonePatternOk && phoneLenOk && phoneDigits >= 6

  const pwCrit  = checkPasswordCriteria(password)
  const pwOk    = !!pwCrit.length && pwCrit.upper && pwCrit.lower && pwCrit.number && pwCrit.symbol
  const confOk  = password === confirm

  // No requerimos campos extra por rol (barrio/profession fueron removidos)
  const roleOk = true

  const formValid =
    firstNameTrim >= 2 && firstNameLenOk && firstNamePatternOk &&
    lastNameTrim  >= 2 && lastNameLenOk && lastNamePatternOk &&
    emailOk && dniOk && phoneOk &&
    pwOk && confOk && roleOk

  function parseError(err:any): string {
    const status = err?.response?.status
    const serverMsg = err?.response?.data?.message || err?.response?.data
    if (typeof serverMsg === 'string' && serverMsg.trim().length) return serverMsg
    if (!err?.response) return 'No se pudo conectar con el servidor.'
    if (status === 409 && /email/i.test(String(err?.message ?? ''))) return 'Ese email ya está registrado.'
    if (status === 400) return 'Revisá los datos ingresados.'
    return err?.message || 'Error al registrar.'
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched({ email:true, password:true, confirm:true })
    if (!formValid) {
      notify({ severity: 'error', message: 'Revisá los campos marcados.' })
      return
    }

    setLoading(true)
    try {
      const payload: RegisterDTO = {
        email,
        password,
        firstName,
        lastName,
        dni,
        phoneNumber: phone,
        role: toApiRole(role) as ApiRole,
        address: (addresses || []).filter(a => !isEmptyAddress(a)),
      }
      await registerUser(payload)
      notify({ severity: 'success', message: '¡Cuenta creada! Iniciá sesión para continuar.' })
      setTimeout(() => navigate('/login?m=registered', { replace: true }), 900)
    } catch (err:any) {
      notify({ severity: 'error', message: parseError(err) })
    } finally {
      setLoading(false)
    }
  }

  return (
      <Grid size={{ xs: 12, md: 7 }}>
        <Paper sx={{ p:3 }}>
          <Typography variant="h5" fontWeight={700} mb={2}>Crear cuenta</Typography>

          <Stack component="form" spacing={2} onSubmit={onSubmit}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Nombre"
                  value={firstName}
                  onChange={(e)=>setFirstName(e.target.value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñÜü\s]/g,''))}
                  inputProps={{ maxLength: 40 }}
                  error={firstNameTrim < 2 || !firstNameLenOk || !firstNamePatternOk}
                  helperText={
                    !firstNamePatternOk ? 'Solo letras.' :
                    firstNameTrim < 2 ? 'Ingresá tu nombre.' :
                    !firstNameLenOk ? 'Máximo 40 caracteres.' :
                    `${firstNameLen}/40`
                  }
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Apellido"
                  value={lastName}
                  onChange={(e)=>setLastName(e.target.value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñÜü\s]/g,''))}
                  inputProps={{ maxLength: 40 }}
                  error={lastNameTrim < 2 || !lastNameLenOk || !lastNamePatternOk}
                  helperText={
                    !lastNamePatternOk ? 'Solo letras.' :
                    lastNameTrim < 2 ? 'Ingresá tu apellido.' :
                    !lastNameLenOk ? 'Máximo 40 caracteres.' :
                    `${lastNameLen}/40`
                  }
                  fullWidth
                />
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
                <TextField
                  label="Teléfono"
                  value={phone}
                  onChange={(e)=>setPhone(e.target.value)}
                  inputProps={{ maxLength: 20 }}
                  error={!phoneOk}
                  helperText={
                    !phonePatternOk ? 'Solo números, espacios, +, - y ().' :
                    !phoneLenOk ? 'Máximo 20 caracteres.' :
                    !phoneOk ? 'Ingresá al menos 6 dígitos.' :
                    `${phone.length}/20`
                  }
                  fullWidth
                />
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

              {/* barrio/profession fields removed */}

              <Grid size={{ xs: 12, sm: 6 }}>
                <PasswordField
                  label="Contraseña"
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                  onBlur={()=>setTouched(t=>({...t, password:true}))}
                  error={touched.password && !pwOk}
                  helperText={touched.password && !pwOk ? 'Usá 8+ caráct., mayús, minús, número y símbolo.' : ' '}
                  fullWidth
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
                  fullWidth
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

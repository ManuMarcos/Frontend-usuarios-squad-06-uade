import React from 'react'
import { Stack, TextField, Button, Alert, IconButton, InputAdornment } from '@mui/material'
import { changePassword } from '../api/users'
import { isValidEmail } from '../utils/validators'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded'

type Props = {
  defaultEmail?: string
  onResult?: (sev: 'success' | 'error', msg: string) => void
}

export default function ChangePasswordForm({ defaultEmail = '', onResult }: Props) {
  const [email, setEmail] = React.useState(defaultEmail)
  const [oldPassword, setOldPassword] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [localAlert, setLocalAlert] = React.useState<{ msg: string; sev: 'success' | 'error' } | null>(null)
  const [showOld, setShowOld] = React.useState(false)
  const [showNew, setShowNew] = React.useState(false)

  React.useEffect(() => {
    setEmail(defaultEmail)
  }, [defaultEmail])

  const canSubmit =
    isValidEmail(email) &&
    oldPassword.trim().length >= 6 &&
    newPassword.trim().length >= 6 &&
    !loading

  const showLocalAlert = !onResult

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValidEmail(email)) {
      const msg = 'Ingresá un email válido.'
      if (onResult) onResult('error', msg)
      else setLocalAlert({ sev: 'error', msg })
      return
    }
    if (oldPassword.trim().length < 6 || newPassword.trim().length < 6) {
      const msg = 'La contraseña debe tener al menos 6 caracteres.'
      if (onResult) onResult('error', msg)
      else setLocalAlert({ sev: 'error', msg })
      return
    }

    setLoading(true)
    setLocalAlert(null)
    try {
      await changePassword({ email, oldPassword, newPassword })
      const successMsg = 'Contraseña actualizada correctamente.'
      if (onResult) onResult('success', successMsg)
      else setLocalAlert({ sev: 'success', msg: successMsg })
      setOldPassword('')
      setNewPassword('')
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'No pudimos actualizar la contraseña.'
      if (onResult) onResult('error', msg)
      else setLocalAlert({ sev: 'error', msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack component="form" spacing={2} onSubmit={handleSubmit}>
      {showLocalAlert && localAlert && (
        <Alert severity={localAlert.sev}>{localAlert.msg}</Alert>
      )}
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={email.length > 0 && !isValidEmail(email)}
        helperText={email.length > 0 && !isValidEmail(email) ? 'Ingresá un email válido.' : ' '}
        fullWidth
        disabled
        required
      />
      <TextField
        label="Contraseña actual"
        type={showOld ? 'text' : 'password'}
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}
        helperText={oldPassword && oldPassword.length < 6 ? 'Mínimo 6 caracteres' : ' '}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowOld(s => !s)} edge="end">
                {showOld ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        fullWidth
        required
      />
      <TextField
        label="Nueva contraseña"
        type={showNew ? 'text' : 'password'}
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        helperText={newPassword && newPassword.length < 6 ? 'Mínimo 6 caracteres' : ' '}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowNew(s => !s)} edge="end">
                {showNew ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        fullWidth
        required
      />
      <Button
        type="submit"
        variant="contained"
        disabled={!canSubmit}
        sx={{
          textTransform: 'none',
          fontWeight: 600,
        }}
      >
        {loading ? 'Actualizando…' : 'Cambiar contraseña'}
      </Button>
    </Stack>
  )
}

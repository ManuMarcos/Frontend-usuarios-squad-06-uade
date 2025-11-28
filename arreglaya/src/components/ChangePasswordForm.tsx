import React from 'react'
import { Stack, TextField, Button, IconButton, InputAdornment } from '@mui/material'
import { changePassword } from '../api/users'
import { isValidEmail } from '../utils/validators'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded'
import { useNotify } from '../context/Notifications'

type Props = {
  defaultEmail?: string
  onResult?: (sev: 'success' | 'error', msg: string) => void
}

export default function ChangePasswordForm({ defaultEmail = '', onResult }: Props) {
  const notify = useNotify()
  const [email, setEmail] = React.useState(defaultEmail)
  const [oldPassword, setOldPassword] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
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

  const emit = React.useCallback((sev: 'success' | 'error', msg: string) => {
    if (onResult) onResult(sev, msg)
    else notify({ severity: sev, message: msg })
  }, [notify, onResult])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValidEmail(email)) {
      emit('error', 'Ingresá un email válido.')
      return
    }
    if (oldPassword.trim().length < 6 || newPassword.trim().length < 6) {
      emit('error', 'La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      await changePassword({ email, oldPassword, newPassword })
      emit('success', 'Contraseña actualizada correctamente.')
      setOldPassword('')
      setNewPassword('')
    } catch (err: any) {
      emit('error', err?.response?.data?.message || 'No pudimos actualizar la contraseña.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack component="form" spacing={2} onSubmit={handleSubmit}>
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

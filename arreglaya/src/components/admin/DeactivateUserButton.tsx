import React from 'react'
import {
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography
} from '@mui/material'
import PersonOffIcon from '@mui/icons-material/PersonOff'
import HowToRegIcon from '@mui/icons-material/HowToReg'
import { setUserActive } from '../../api/users'
import { useAuth } from '../../auth/AuthProvider'

type Props = {
  userId: number
  isActive?: boolean
  userEmail?: string
  onDone?: (active: boolean) => void
}

export default function DeactivateUserButton({ userId, isActive, userEmail, onDone }: Props){
  const active = isActive !== false
  const [open, setOpen] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const { user } = useAuth()

  const isSelf = user?.id === userId // evitar que el admin se desactive a sí mismo

  async function handleConfirm(){
    setBusy(true)
    try{
      const next = !active
      await setUserActive(userId, next)
      onDone?.(next)
      setOpen(false)
    }finally{
      setBusy(false)
    }
  }

  if (active) {
    return (
      <>
        <Tooltip title={isSelf ? 'No podés darte de baja a vos mismo' : 'Dar de baja (inactivar)'}>
          <span>
            <IconButton size="small" onClick={()=>setOpen(true)} disabled={isSelf}>
              <PersonOffIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Dialog open={open} onClose={busy ? undefined : ()=>setOpen(false)}>
          <DialogTitle>Dar de baja usuario</DialogTitle>
          <DialogContent>
            <Typography variant="body2">
              ¿Confirmás inactivar la cuenta {userEmail ? <b>{userEmail}</b> : 'seleccionada'}?
              Esta acción es reversible desde este panel.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>setOpen(false)} disabled={busy}>Cancelar</Button>
            <Button color="error" variant="contained" onClick={handleConfirm} disabled={busy}>
              {busy ? 'Procesando…' : 'Inactivar'}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    )
  }

  // Reactivar
  return (
    <Tooltip title="Reactivar usuario">
      <span>
        <IconButton size="small" onClick={handleConfirm} disabled={busy}>
          <HowToRegIcon fontSize="small" />
        </IconButton>
      </span>
    </Tooltip>
  )
}

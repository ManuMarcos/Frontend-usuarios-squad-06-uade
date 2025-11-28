import React from 'react'
import Snackbar from '@mui/material/Snackbar'
import Alert, { type AlertColor } from '@mui/material/Alert'

type Notification = {
  id: number
  message: string
  severity: AlertColor
}

type NotifyPayload = {
  message: string
  severity?: AlertColor
}

type NotificationsContextValue = {
  notify: (payload: NotifyPayload) => void
}

const NotificationsContext = React.createContext<NotificationsContextValue | undefined>(undefined)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notification, setNotification] = React.useState<Notification | null>(null)

  const notify = React.useCallback(({ message, severity = 'info' }: NotifyPayload) => {
    setNotification({ id: Date.now(), message, severity })
  }, [])

  const handleClose = (_?: unknown, reason?: string) => {
    if (reason === 'clickaway') return
    setNotification(null)
  }

  return (
    <NotificationsContext.Provider value={{ notify }}>
      {children}
      <Snackbar
        open={Boolean(notification)}
        autoHideDuration={4000}
        onClose={handleClose}
        key={notification?.id || 'notify'}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        sx={{ position: 'fixed', bottom: 24, left: 24 }}
      >
        <Alert severity={notification?.severity ?? 'info'} onClose={handleClose} sx={{ width: '100%' }}>
          {notification?.message ?? ''}
        </Alert>
      </Snackbar>
    </NotificationsContext.Provider>
  )
}

export function useNotify() {
  const ctx = React.useContext(NotificationsContext)
  if (!ctx) {
    throw new Error('useNotify must be used within NotificationsProvider')
  }
  return ctx.notify
}

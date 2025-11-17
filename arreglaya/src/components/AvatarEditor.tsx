// src/components/AvatarEditor.tsx
import React from 'react'
import {
  Box, Avatar, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, Stack, Typography
} from '@mui/material'
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import { updateUserPartial } from '../api/users'
import ProfileImageUploader from './ProfileImageUploader'

type Props = {
  src?: string
  name?: string
  userId: number
  enabled?: boolean           // si false, no muestra overlay ni permite editar
  onChangeUrl: (url: string) => void
  onRemove?: () => void       // opcional: limpiar foto
}

export default function AvatarEditor({
  src,
  name,
  userId,
  enabled = false,
  onChangeUrl,
  onRemove
}: Props) {
  const [open, setOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null)
  const initials = (name || '').trim()[0]?.toUpperCase() || '?'

  const persistProfileImage = React.useCallback(async (nextUrl: string | null) => {
    const prev = src ?? ''
    setSaving(true)
    setError(null)
    setSuccessMsg(null)
    onChangeUrl(nextUrl ?? '')
    try {
      await updateUserPartial(userId, { profileImageUrl: nextUrl } as any)
      if (!nextUrl && onRemove) {
        onRemove()
      }
      setSuccessMsg(nextUrl ? 'Foto actualizada.' : 'Foto eliminada.')
    } catch (err: any) {
      const msg = err?.response?.data || err?.message || 'No se pudo actualizar la foto.'
      setError(msg)
      onChangeUrl(prev)
    } finally {
      setSaving(false)
    }
  }, [src, userId, onChangeUrl, onRemove])

  const handleUploaded = React.useCallback((url: string) => {
    void persistProfileImage(url)
  }, [persistProfileImage])

  const handleRemove = React.useCallback(() => {
    void persistProfileImage(null)
  }, [persistProfileImage])

  return (
    <>
      <Box sx={{ position: 'relative', display: 'inline-block' }}>
        <Avatar
          src={src || undefined}
          alt={name}
          sx={{
            width: 80,
            height: 80,
            boxShadow: 1,
            border: theme => `2px solid ${theme.palette.background.paper}`
          }}
        >
          {initials}
        </Avatar>

        {enabled && (
          <Tooltip title="Cambiar foto">
            <IconButton
              size="small"
              onClick={() => setOpen(true)}
              sx={{
                position: 'absolute',
                right: -6,
                bottom: -6,
                bgcolor: 'background.paper',
                border: theme => `1px solid ${theme.palette.divider}`,
                '&:hover': { bgcolor: 'background.default' }
              }}
            >
              <CameraAltRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Actualizar foto de perfil</DialogTitle>
        <DialogContent>
          <Stack spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <Avatar
              src={src || undefined}
              alt={name}
              sx={{ width: 128, height: 128, boxShadow: 1 }}
            >
              {initials}
            </Avatar>

            <Typography variant="body2" color="text.secondary">
              Formatos aceptados: JPG/PNG. Tamaño recomendado ≥ 256×256.
            </Typography>

            {/* Uploader real: delegamos la subida y recibimos la URL final */}
            <ProfileImageUploader
              userId={userId}
              onUploaded={handleUploaded}
              disabled={saving}
            />

            {saving && (
              <Typography variant="body2" color="text.secondary">
                Guardando foto…
              </Typography>
            )}
            {!saving && successMsg && (
              <Typography variant="body2" color="success.main">
                {successMsg}
              </Typography>
            )}
            {error && (
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {src && onRemove && (
            <Button
              color="inherit"
              startIcon={<DeleteOutlineRoundedIcon />}
              onClick={handleRemove}
              disabled={saving}
            >
              Quitar foto
            </Button>
          )}
          <Button onClick={() => setOpen(false)} variant="contained">
            Listo
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

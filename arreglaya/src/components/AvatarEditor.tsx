// src/components/AvatarEditor.tsx
import React from 'react'
import {
  Box, Avatar, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, Stack, Typography
} from '@mui/material'
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
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
  const initials = (name || '').trim()[0]?.toUpperCase() || '?'

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
              onUploaded={(url: string) => onChangeUrl(url)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {src && onRemove && (
            <Button
              color="inherit"
              startIcon={<DeleteOutlineRoundedIcon />}
              onClick={() => { onRemove(); onChangeUrl('') }}
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

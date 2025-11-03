import React from 'react'
import {
  Box, Grid, TextField, IconButton, Stack, Typography, Divider, Tooltip, Button
} from '@mui/material'
  import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AddIcon from '@mui/icons-material/Add'
import type { AddressInfo } from '../types/address'
import { EMPTY_ADDR, validateAddress } from '../utils/address'

type ItemErrors = { [index: number]: ReturnType<typeof validateAddress> }

type Props = {
  value: AddressInfo[]
  onChange: (next: AddressInfo[]) => void
  disabled?: boolean
}

export default function AddressListForm({ value, onChange, disabled }: Props) {
  const list = value.length ? value : [{ ...EMPTY_ADDR }]

  function setAt<T extends keyof AddressInfo>(i: number, k: T, v: AddressInfo[T]) {
    const next = list.map((it, idx) => idx === i ? { ...it, [k]: v } : it)
    onChange(next)
  }

  function removeAt(i: number) {
    const next = list.filter((_, idx) => idx !== i)
    onChange(next.length ? next : [{ ...EMPTY_ADDR }])
  }

  function addEmpty() {
    onChange([...list, { ...EMPTY_ADDR }])
  }

  // validación por item
  const errors: ItemErrors = {}
  list.forEach((it, idx) => { errors[idx] = validateAddress(it, true) })

  return (
    <Stack spacing={2}>
      {list.map((it, i) => (
        <Box key={i} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography fontWeight={700}>Domicilio {i+1}</Typography>
            <Tooltip title="Eliminar domicilio">
              <span>
                <IconButton size="small" onClick={()=>removeAt(i)} disabled={disabled || list.length<=1}>
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                label="Provincia/Estado"
                value={it.state || ''}
                onChange={e=>setAt(i,'state',e.target.value)}
                error={!!errors[i].state}
                helperText={errors[i].state || ' '}
                fullWidth
                disabled={disabled}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                label="Ciudad"
                value={it.city || ''}
                onChange={e=>setAt(i,'city',e.target.value)}
                error={!!errors[i].city}
                helperText={errors[i].city || ' '}
                fullWidth
                disabled={disabled}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                label="Calle"
                value={it.street || ''}
                onChange={e=>setAt(i,'street',e.target.value)}
                error={!!errors[i].street}
                helperText={errors[i].street || ' '}
                fullWidth
                disabled={disabled}
              />
            </Grid>

            <Grid size={{ xs: 6, sm: 3, md: 2 }}>
              <TextField
                label="Número"
                value={it.number || ''}
                onChange={e=>setAt(i,'number',e.target.value)}
                error={!!errors[i].number}
                helperText={errors[i].number || ' '}
                fullWidth
                disabled={disabled}
              />
            </Grid>

            <Grid size={{ xs: 6, sm: 3, md: 2 }}>
              <TextField
                label="Piso"
                value={it.floor || ''}
                onChange={e=>setAt(i,'floor',e.target.value)}
                fullWidth
                disabled={disabled}
              />
            </Grid>

            <Grid size={{ xs: 6, sm: 3, md: 2 }}>
              <TextField
                label="Depto"
                value={it.apartment || ''}
                onChange={e=>setAt(i,'apartment',e.target.value)}
                fullWidth
                disabled={disabled}
              />
            </Grid>
          </Grid>
        </Box>
      ))}

      <Button startIcon={<AddIcon />} onClick={addEmpty} disabled={disabled} sx={{ alignSelf: 'flex-start' }}>
        Agregar domicilio
      </Button>
      <Divider />
    </Stack>
  )
}

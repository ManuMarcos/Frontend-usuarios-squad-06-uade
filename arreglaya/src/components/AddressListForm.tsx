import React from 'react'
import {
  Box,
  Grid,
  TextField,
  IconButton,
  Stack,
  Typography,
  Divider,
  Tooltip,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AddIcon from '@mui/icons-material/Add'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import type { AddressInfo } from '../types/address'
import { EMPTY_ADDR, validateAddress } from '../utils/address'

type ItemErrors = { [index: number]: ReturnType<typeof validateAddress> }

type Props = {
  value: AddressInfo[]
  onChange: (next: AddressInfo[]) => void
  disabled?: boolean
}

const ARG_PROVINCES = [
  'Buenos Aires',
  'Ciudad Autónoma de Buenos Aires',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán'
] as const

export default function AddressListForm({ value, onChange, disabled }: Props) {
  const list = value.length ? value : []
  const [expandedIndex, setExpandedIndex] = React.useState<number>(0)

  React.useEffect(() => {
    if (expandedIndex > list.length - 1) {
      setExpandedIndex(Math.max(0, list.length - 1))
    }
  }, [list.length, expandedIndex])

  function setAt<T extends keyof AddressInfo>(i: number, k: T, v: AddressInfo[T]) {
    const next = list.map((it, idx) => idx === i ? { ...it, [k]: v } : it)
    onChange(next)
  }

  function removeAt(i: number) {
    const next = list.filter((_, idx) => idx !== i)
    onChange(next)
    setExpandedIndex(prev => {
      if (prev === i) return Math.max(0, i - 1)
      if (prev > i) return prev - 1
      return prev
    })
  }

  function addEmpty() {
    onChange([...list, { ...EMPTY_ADDR }])
    setExpandedIndex(list.length)
  }

  // validación por item
  const errors: ItemErrors = {}
  list.forEach((it, idx) => { errors[idx] = validateAddress(it, true) })

  function renderSummary(it: AddressInfo) {
    const summaryParts = [it.street, it.number && `#${it.number}`, it.city, it.state].filter(Boolean)
    return summaryParts.length ? summaryParts.join(' • ') : 'Completá los datos para este domicilio'
  }

  return (
    <Stack spacing={2}>
      {list.length > 0 ? (
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {list.map((_, idx) => (
            <Chip
              key={`addr-pill-${idx}`}
              label={`Domicilio ${idx + 1}`}
              color={expandedIndex === idx ? 'primary' : 'default'}
              variant={expandedIndex === idx ? 'filled' : 'outlined'}
              size="small"
              onClick={() => setExpandedIndex(idx)}
            />
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Sin domicilios cargados. Usá “Agregar domicilio” para sumar uno nuevo.
        </Typography>
      )}

      {list.map((it, i) => {
        const hasErrors = Object.keys(errors[i] || {}).length > 0
        return (
          <Accordion
            key={i}
            expanded={expandedIndex === i}
            onChange={() => setExpandedIndex(expandedIndex === i ? -1 : i)}
            disableGutters
            square={false}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              '&:before': { display: 'none' }
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ flexDirection: 'row-reverse' }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                sx={{
                  width: '100%',
                  flexWrap: 'wrap',
                  columnGap: 1.5,
                  rowGap: 1,
                  minWidth: 0
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography fontWeight={700}>
                    Domicilio {i + 1}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {renderSummary(it)}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
                  <Chip
                    label={hasErrors ? 'Incompleto' : 'Completo'}
                    color={hasErrors ? 'warning' : 'success'}
                    variant={hasErrors ? 'outlined' : 'filled'}
                    size="small"
                  />
                  <Tooltip title="Eliminar domicilio">
                    <span>
                      <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); removeAt(i) }}
                        disabled={disabled}
                        sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <FormControl fullWidth disabled={disabled} error={!!errors[i].state}>
                    <InputLabel id={`province-${i}`}>Provincia</InputLabel>
                    <Select
                      labelId={`province-${i}`}
                      label="Provincia"
                      value={it.state || ''}
                      onChange={e=>setAt(i,'state',e.target.value)}
                      MenuProps={{ style: { maxHeight: 320 } }}
                    >
                      {ARG_PROVINCES.map(prov => (
                        <MenuItem key={prov} value={prov}>{prov}</MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{errors[i].state || ' '}</FormHelperText>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField
                    label="Ciudad"
                    value={it.city || ''}
                    onChange={e=>setAt(i,'city',e.target.value)}
                    error={!!errors[i].city}
                    helperText={errors[i].city || ' '}
                    inputProps={{ maxLength: 40 }}
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
                    inputProps={{ maxLength: 40 }}
                    fullWidth
                    disabled={disabled}
                  />
                </Grid>

                <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                  <TextField
                    label="Número"
                    value={it.number || ''}
                    inputMode="numeric"
                    onChange={e=>setAt(i,'number', e.target.value.replace(/\D/g, ''))}
                    error={!!errors[i].number}
                    helperText={errors[i].number || ' '}
                    inputProps={{ maxLength: 10 }}
                    fullWidth
                    disabled={disabled}
                  />
                </Grid>

                <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                  <TextField
                    label="Piso"
                    value={it.floor || ''}
                    onChange={e=>setAt(i,'floor',e.target.value)}
                    inputProps={{ maxLength: 3 }}
                    fullWidth
                    disabled={disabled}
                  />
                </Grid>

                <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                  <TextField
                    label="Depto"
                    value={it.apartment || ''}
                    onChange={e=>setAt(i,'apartment',e.target.value)}
                    inputProps={{ maxLength: 3 }}
                    fullWidth
                    disabled={disabled}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        )
      })}

      <Button startIcon={<AddIcon />} onClick={addEmpty} disabled={disabled} sx={{ alignSelf: 'flex-start' }}>
        Agregar domicilio
      </Button>
      <Divider />
    </Stack>
  )
}

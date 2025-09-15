import React from 'react'
import {
  Paper, Stack, Typography, Divider, Chip, Grid, Tooltip, Accordion,
  AccordionSummary, AccordionDetails
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { toUiRole } from '../auth/routeUtils'

type Props = {
  meta?: Record<string, any>
  role?: string
  title?: string
}

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  if (value === undefined || value === null || value === '') return null
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography>{String(value)}</Typography>
    </Stack>
  )
}

export default function ProfileServerInfo({ meta, role, title = 'Datos del backend' }: Props){
  const m = meta || {}

  // Campos “típicos” en orden
  const ordered: Array<[string, string, any]> = [
    ['Nombre',       'firstName',   m.firstName],
    ['Apellido',     'lastName',    m.lastName],
    ['Email',        'email',       m.email],
    ['Rol',          'role',        toUiRole(m.role || role)],
    ['DNI',          'dni',         m.dni],
    ['Teléfono',     'phoneNumber', m.phoneNumber ?? m.phone],
    ['Dirección',    'address',     m.address],
    ['Barrio',       'barrio',      m.barrio],
    ['Profesión',    'profession',  m.profession],
    ['Estado',       'status',      m.status],
    ['Creado',       'createdAt',   m.createdAt],
    ['Actualizado',  'updatedAt',   m.updatedAt],
    ['Último acceso','lastLoginAt', m.lastLoginAt],
  ]

  // Excluir claves ya mostradas o sensibles
  const shownKeys = new Set(ordered.map(([, key]) => key))
  const blacklist = new Set(['password','token','accessToken','refreshToken'])
  const extras = Object.entries(m)
    .filter(([k,v]) => !shownKeys.has(k) && !blacklist.has(k) && v !== undefined && v !== null && v !== '')
    .sort(([a],[b]) => a.localeCompare(b))

  const hasAny = ordered.some(([, , v]) => v != null && v !== '') || extras.length > 0

  if (!hasAny) return null

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="subtitle1" fontWeight={700}>{title}</Typography>
          <Tooltip title="Información recibida al iniciar sesión"><Chip size="small" label="del API" /></Tooltip>
        </Stack>
      </Stack>

      <Grid container spacing={2} sx={{ mb: extras.length ? 1 : 0 }}>
        {ordered.map(([label, _key, value]) => (
          <Grid size={{ xs: 12, sm: 6 ,md: 4 }} key={_key}>
            <Field label={label} value={value} />
          </Grid>
        ))}
      </Grid>

      {extras.length > 0 && (
        <>
          <Divider sx={{ my: 1 }} />
          <Accordion elevation={0}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2">Otros datos ({extras.length})</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {extras.map(([k, v]) => (
                  <Grid size={{ xs: 12, sm: 6 ,md: 4 }} key={k}>
                    <Field label={k} value={typeof v === 'object' ? JSON.stringify(v) : v} />
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </>
      )}
    </Paper>
  )
}

import React from 'react'
import {
  Paper, Stack, Typography, TextField, IconButton, Tooltip, Snackbar, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, InputAdornment, Box, MenuItem
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/PersonAddAlt1'
import ShieldIcon from '@mui/icons-material/AdminPanelSettings'

import RoleChip from '../../components/RoleChip' // usa UiRole (customer|contractor|admin)

import { getUserById, createUser, type UserDTO, type Role as ApiRole } from '../../api/users'

type UiRole = 'customer' | 'contractor' | 'admin'
type UiUser = { id: number; name: string; email: string; role: UiRole }

// Mapas de rol (API → UI y UI → API)
const apiToUi: Record<ApiRole, UiRole> = {
  CLIENTE: 'customer',
  PROVEEDOR: 'contractor',
  ADMIN: 'admin',
}
const uiToApi: Record<Exclude<UiRole, 'admin'>, ApiRole> = {
  customer: 'CLIENTE',
  contractor: 'PROVEEDOR',
}

function toUiUser(u: UserDTO): UiUser {
  return {
    id: u.userId,
    name: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email.split('@')[0],
    email: u.email,
    role: apiToUi[u.role],
  }
}

export default function Admin() {
  const [rows, setRows] = React.useState<UiUser[]>([])
  const [loading, setLoading] = React.useState(false)

  // búsqueda por ID (el back sólo expone GET /api/users/{id})
  const [searchId, setSearchId] = React.useState<string>('')

  // diálogo de creación (ajustado al contrato del back)
  const [createDialog, setCreateDialog] =
    React.useState<{ open: boolean; firstName: string; lastName: string; email: string; password: string; role: Exclude<UiRole,'admin'> }>({
      open: false, firstName: '', lastName: '', email: '', password: '', role: 'customer'
    })

  const [snack, setSnack] = React.useState<{ open: boolean; msg: string; type: 'success' | 'error' | 'info' }>({
    open: false, msg: '', type: 'success'
  })

  async function doSearch() {
    if (!searchId.trim()) return
    if (!/^\d+$/.test(searchId)) {
      setSnack({ open: true, msg: 'ID inválido (debe ser numérico).', type: 'error' })
      return
    }
    setLoading(true)
    try {
      const u = await getUserById(Number(searchId))
      const ui = toUiUser(u)
      setRows(prev => {
        const idx = prev.findIndex(x => x.id === ui.id)
        if (idx >= 0) {
          const next = [...prev]; next[idx] = ui; return next
        }
        return [ui, ...prev]
      })
      setSnack({ open: true, msg: `Usuario ${ui.email} cargado.`, type: 'success' })
    } catch (e: any) {
      setSnack({ open: true, msg: e?.message || 'No se encontró el usuario', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  async function onCreate() {
    try {
      const payload = {
        email: createDialog.email,
        password: createDialog.password,
        firstName: createDialog.firstName,
        lastName: createDialog.lastName,
        role: uiToApi[createDialog.role],
      }
      await createUser(payload)
      setSnack({ open: true, msg: 'Usuario creado.', type: 'success' })
      setCreateDialog({ open: false, firstName: '', lastName: '', email: '', password: '', role: 'customer' })
    } catch (e: any) {
      setSnack({ open: true, msg: e?.message || 'No se pudo crear el usuario', type: 'error' })
    }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <ShieldIcon />
          <Typography variant="h5" fontWeight={800}>Usuarios</Typography>
          <Chip size="small" label={loading ? 'Cargando…' : `${rows.length} cargado(s)`} sx={{ ml: 1 }} />
        </Stack>

        <Stack direction="row" spacing={1}>
          <Tooltip title="Alta de usuario">
            <IconButton onClick={() => setCreateDialog({ open: true, firstName: '', lastName: '', email: '', password: '', role: 'customer' })}>
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Búsqueda por ID */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
        <TextField
          placeholder="ID de usuario"
          value={searchId}
          onChange={e => setSearchId(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 220 }}
        />
        <Button variant="contained" onClick={doSearch} disabled={!searchId || loading}>Buscar</Button>
      </Stack>

      {/* Tabla (solo lectura) */}
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell sx={{ width: 140 }}>Rol</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(u => (
              <TableRow key={u.id} hover>
                <TableCell>{u.id}</TableCell>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', justifyContent: 'left' }}>
                    <RoleChip role={u.role} />
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {!rows.length && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                    Buscá por ID para cargar usuarios.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Crear usuario */}
      <Dialog open={createDialog.open} onClose={() => setCreateDialog({ open: false, firstName: '', lastName: '', email: '', password: '', role: 'customer' })}>
        <DialogTitle>Crear usuario</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: 360 }}>
            <TextField label="Nombre" value={createDialog.firstName} onChange={e => setCreateDialog(d => ({ ...d, firstName: e.target.value }))} />
            <TextField label="Apellido" value={createDialog.lastName} onChange={e => setCreateDialog(d => ({ ...d, lastName: e.target.value }))} />
            <TextField label="Email" type="email" value={createDialog.email} onChange={e => setCreateDialog(d => ({ ...d, email: e.target.value }))} />
            <TextField label="Contraseña" type="password" value={createDialog.password} onChange={e => setCreateDialog(d => ({ ...d, password: e.target.value }))} />
            <TextField
              select
              label="Rol"
              value={createDialog.role}
              onChange={e => setCreateDialog(d => ({ ...d, role: e.target.value as Exclude<UiRole,'admin'> }))}
            >
              <MenuItem value="customer">Cliente</MenuItem>
              <MenuItem value="contractor">Contratista</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog({ open: false, firstName: '', lastName: '', email: '', password: '', role: 'customer' })}>
            Cancelar
          </Button>
          <Button
            onClick={onCreate}
            variant="contained"
            disabled={!createDialog.email || !createDialog.password || !createDialog.firstName || !createDialog.lastName}
          >
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
        <Alert severity={snack.type} onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.msg}</Alert>
      </Snackbar>
    </Paper>
  )
}
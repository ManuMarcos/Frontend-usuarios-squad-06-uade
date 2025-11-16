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

import { getUserById, type UserDTO, getAllUsers } from '../../api/users'
import type { ApiRole, UiRole } from '../../types'
import { apiRoleToUiRole } from '../../types'
import AdminCreateUserDialog from '../../components/admin/AdminCreateUserDialog'
import DeactivateUserButton from '../../components/admin/DeactivateUserButton'
import UserStatusChip from '../../components/admin/UserStatusChip'

type UiUser = { userId: number; name: string; email: string; role: UiRole; isActive?: boolean, roleName?: string }

// Mapa de rol (API → UI)
const apiToUi: Record<ApiRole, UiRole> = {
  CLIENTE: 'customer',
  PRESTADOR: 'contractor',
  ADMIN: 'admin',
  PROVEEDOR: 'contractor',
}

function toUiUser(u: UserDTO): UiUser {
  return {
    userId: u.userId,
    name: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email.split('@')[0],
    email: u.email,
    role: apiToUi[u.roleDescription],
    roleName: u.role?.name,
    isActive: u.active,
  }
}

export default function Admin() {
  const [rows, setRows] = React.useState<UiUser[]>([])
  const [loading, setLoading] = React.useState(false)
  const [openCreate, setOpenCreate] = React.useState(false)


  // búsqueda por ID (el back sólo expone GET /api/users/{id})
  const [searchId, setSearchId] = React.useState<string>('')


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
        const idx = prev.findIndex(x => x.userId === ui.userId)
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

  // La creación de usuarios ahora se maneja completamente a través del diálogo AdminCreateUserDialog

  async function handleCreated() {
    // opción A: recargar la tabla
    const users = await getAllUsers()

    setRows(users.map(toUiUser))
  }
  // ...
  React.useEffect(() => {
    let alive = true
      ; (async () => {
        try {
          const users = await getAllUsers()
          if (!alive) return
          setRows(users.map(toUiUser))
        } catch (e: any) {
          setSnack({ open: true, msg: e?.response?.data || e?.message || 'No se pudo obtener usuarios', type: 'error' })
        }
      })()
    return () => { alive = false }
  }, [])


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
            <IconButton onClick={() => setOpenCreate(true)}>
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
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>

            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(u => (
                <TableRow key={u.userId} hover>
                <TableCell>{u.userId}</TableCell>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', justifyContent: 'left' }}>
                    <RoleChip role={u.roleName ?? 'Desconocido'} />
                  </Box>
                </TableCell>
                <TableCell><UserStatusChip isActive={u.isActive} /></TableCell>
                <TableCell align="right">
                  <DeactivateUserButton
                    userId={u.userId}
                    isActive={u.isActive}
                    userEmail={u.email}
                    onDone={(active) => setRows(prev => prev.map(r => r.userId === u.userId ? { ...r, isActive: active } : r))}
                  />
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
      <AdminCreateUserDialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreated={() => { setOpenCreate(false); handleCreated() }}
      />

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
        <Alert severity={snack.type} onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.msg}</Alert>
      </Snackbar>
    </Paper>
  )
}
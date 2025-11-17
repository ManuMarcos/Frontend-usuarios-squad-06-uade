import React from 'react'
import {
  Paper, Stack, Typography, TextField, IconButton, Tooltip, Snackbar, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, InputAdornment, Box
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/PersonAddAlt1'
import ShieldIcon from '@mui/icons-material/AdminPanelSettings'

import { type UserDTO, getAllUsers } from '../../api/users'
import type { UiRole } from '../../types'
import { apiRoleToUiRole } from '../../types'
import AdminCreateUserDialog from '../../components/admin/AdminCreateUserDialog'
import DeactivateUserButton from '../../components/admin/DeactivateUserButton'
import UserStatusChip from '../../components/admin/UserStatusChip'

type UiUser = { userId: number; name: string; email: string; role: UiRole; isActive?: boolean }

const roleLabelByUi: Record<UiRole, string> = {
  customer: 'Cliente',
  contractor: 'Prestador',
  admin: 'Admin',
}

function toUiUser(u: UserDTO): UiUser {
  const rawRole =
    typeof u.role === 'string'
      ? u.role
      : (u.role as any)?.name ||
        (u.role as any)?.description ||
        u.roleDescription ||
        undefined
  return {
    userId: u.userId,
    name: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email.split('@')[0],
    email: u.email,
    role: apiRoleToUiRole(rawRole),
    isActive: u.active,
  }
}

export default function Admin() {
  const [rows, setRows] = React.useState<UiUser[]>([])
  const [sortAsc, setSortAsc] = React.useState(true)
  const [loading, setLoading] = React.useState(false)
  const [openCreate, setOpenCreate] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')


  const [snack, setSnack] = React.useState<{ open: boolean; msg: string; type: 'success' | 'error' | 'info' }>({
    open: false, msg: '', type: 'success'
  })

  // La creación de usuarios ahora se maneja completamente a través del diálogo AdminCreateUserDialog

  async function handleCreated() {
    const users = await getAllUsers()
    setRows(sortRows(users.map(toUiUser)))
  }
  // ...
  React.useEffect(() => {
    let alive = true
      ; (async () => {
        try {
          const users = await getAllUsers()
          if (!alive) return
          setRows(sortRows(users.map(toUiUser)))
        } catch (e: any) {
          setSnack({ open: true, msg: e?.response?.data || e?.message || 'No se pudo obtener usuarios', type: 'error' })
        }
      })()
    return () => { alive = false }
  }, [])


  function sortRows(list: UiUser[]) {
    return [...list].sort((a, b) => sortAsc ? a.userId - b.userId : b.userId - a.userId)
  }

  function toggleSort() {
    setSortAsc(prev => !prev)
  }

  const filteredRows = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    const base = term
      ? rows.filter(r =>
          r.name.toLowerCase().includes(term) ||
          r.email.toLowerCase().includes(term)
        )
      : rows
    return sortRows(base)
  }, [rows, searchTerm, sortAsc])

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

      {/* Búsqueda en tiempo real */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
        <TextField
          placeholder="Buscar por nombre o email"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 260 }}
        />
      </Stack>

      {/* Tabla (solo lectura) */}
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell onClick={toggleSort} sx={{ cursor: 'pointer', userSelect: 'none' }}>
                ID {sortAsc ? '▲' : '▼'}
              </TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell sx={{ width: 140 }}>Rol</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>

            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.map(u => (
                <TableRow key={u.userId} hover>
                <TableCell>{u.userId}</TableCell>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Typography variant="body2">{roleLabelByUi[u.role]}</Typography>
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
            {!filteredRows.length && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                    No se encontraron usuarios con ese criterio.
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

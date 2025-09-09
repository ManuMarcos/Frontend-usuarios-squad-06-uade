import React from 'react'
import {
    Paper, Stack, Typography, TextField, IconButton, Tooltip, Snackbar, Alert,
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Checkbox, Chip, InputAdornment, MenuItem,
    Box
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import SaveIcon from '@mui/icons-material/SaveAlt'
import SwapHoriz from '@mui/icons-material/SwapHoriz'
import AddIcon from '@mui/icons-material/PersonAddAlt1'
import DeleteIcon from '@mui/icons-material/DeleteOutline'
import ShieldIcon from '@mui/icons-material/AdminPanelSettings'

import RoleChip from '../../components/RoleChip'
import RoleSelect from '../../components/RoleSelect'
import {
    fetchUsers, updateUserRole, bulkUpdateRole, createUser, deleteUser,
    ensureUserInDb, type UserDTO
} from '../../api/users'
import { useAuth } from '../../auth/AuthProvider'

export default function Admin() {
    const { user: current } = useAuth()

    const [rows, setRows] = React.useState<UserDTO[]>([])
    const [loading, setLoading] = React.useState(true)

    const [q, setQ] = React.useState('')
    const [roleFilter, setRoleFilter] = React.useState<'all' | 'customer' | 'contractor' | 'admin'>('all')
    const [selected, setSelected] = React.useState<string[]>([])

    const [snack, setSnack] = React.useState<{ open: boolean; msg: string; type: 'success' | 'error' | 'info' }>({
        open: false, msg: '', type: 'success'
    })

    const [bulkDialog, setBulkDialog] = React.useState<{ open: boolean; role: 'customer' | 'contractor' | 'admin' }>({
        open: false, role: 'customer'
    })
    const [createDialog, setCreateDialog] = React.useState<{ open: boolean; name: string; email: string; role: 'customer' | 'contractor' | 'admin' }>({
        open: false, name: '', email: '', role: 'customer'
    })

    React.useEffect(() => {
        if (current) { ensureUserInDb(current) }
        (async () => {
            setLoading(true)
            const data = await fetchUsers()
            setRows(data)
            setLoading(false)
        })()
    }, [current])

    const filtered = rows.filter(r =>
        (roleFilter === 'all' ? true : r.role === roleFilter) &&
        (q.trim() ? (r.name.toLowerCase().includes(q.toLowerCase()) || r.email.toLowerCase().includes(q.toLowerCase())) : true)
    )

    function toggleSelect(id: string) {
        setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
    }

    async function onRoleChange(u: UserDTO, newRole: UserDTO['role']) {
        if (current && u.id === current.id && newRole !== 'admin') {
            setSnack({ open: true, msg: 'No podés quitarte el rol Admin a vos mismo.', type: 'error' })
            return
        }
        try {
            const upd = await updateUserRole(u.id, newRole)
            setRows(prev => prev.map(r => r.id === u.id ? upd : r))
            setSnack({ open: true, msg: `Rol actualizado: ${u.email} → ${newRole}`, type: 'success' })
        } catch (e: any) {
            setSnack({ open: true, msg: e?.message || 'Error al actualizar rol', type: 'error' })
        }
    }

    async function applyBulk(role: 'customer' | 'contractor' | 'admin') {
        if (current) {
            const ids = selected.filter(id => id !== current.id || role === 'admin') // evita auto-quitar admin
            if (ids.length !== selected.length && role !== 'admin') {
                setSnack({ open: true, msg: 'Se omitió al usuario actual (no se puede auto-quitar Admin).', type: 'info' })
            }
            const n = await bulkUpdateRole(ids, role)
            if (n > 0) {
                const data = await fetchUsers()
                setRows(data)
                setSelected([])
                setSnack({ open: true, msg: `${n} usuario(s) actualizados a ${role}.`, type: 'success' })
            }
        }
        setBulkDialog({ open: false, role: 'customer' })
    }

    async function onCreate() {
        try {
            const u = await createUser({
                name: createDialog.name || createDialog.email.split('@')[0],
                email: createDialog.email,
                role: createDialog.role
            })
            setRows(prev => [...prev, u])
            setCreateDialog({ open: false, name: '', email: '', role: 'customer' })
            setSnack({ open: true, msg: 'Usuario creado.', type: 'success' })
        } catch (e: any) {
            setSnack({ open: true, msg: e?.message || 'No se pudo crear el usuario', type: 'error' })
        }
    }

    async function onDelete(id: string) {
        if (current && id === current.id) {
            setSnack({ open: true, msg: 'No podés eliminar tu propio usuario.', type: 'error' })
            return
        }
        await deleteUser(id)
        setRows(prev => prev.filter(r => r.id !== id))
        setSelected(s => s.filter(x => x !== id))
        setSnack({ open: true, msg: 'Usuario eliminado.', type: 'success' })
    }

    return (
        <Paper sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <ShieldIcon />
                    <Typography variant="h5" fontWeight={800}>Usuarios y Roles</Typography>
                    <Chip size="small" label={loading ? 'Cargando…' : `${rows.length} usuarios`} sx={{ ml: 1 }} />
                </Stack>

                <Stack direction="row" spacing={1}>
                    <Tooltip title="Alta de usuario">
                        <IconButton onClick={() => setCreateDialog({ open: true, name: '', email: '', role: 'customer' })}><AddIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Cambiar rol a seleccionados">
                        <IconButton onClick={() => setBulkDialog({ open: true, role: 'customer' })} disabled={!selected.length}><SwapHoriz /></IconButton>
                    </Tooltip>
                </Stack>
            </Stack>

            {/* Filtros */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
                <TextField
                    placeholder="Buscar por nombre o email"
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                            </InputAdornment>
                        ),
                    }}
                    fullWidth
                />
                <TextField
                    select
                    label="Rol"
                    value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value as any)}
                    sx={{ minWidth: 180 }}
                >
                    <MenuItem value="all">Todos</MenuItem>
                    <MenuItem value="customer">Cliente</MenuItem>
                    <MenuItem value="contractor">Contratista</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                </TextField>
            </Stack>

            {/* Tabla */}
            <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    indeterminate={selected.length > 0 && selected.length < filtered.length}
                                    checked={filtered.length > 0 && selected.length === filtered.length}
                                    onChange={e => setSelected(e.target.checked ? filtered.map(f => f.id) : [])}
                                />
                            </TableCell>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Email</TableCell>

                            {/* NUEVO: columna solo para el chip */}
                            <TableCell sx={{ width: 140 }}>Rol</TableCell>

                            {/* NUEVO: columna del selector, con ancho fijo */}
                            <TableCell sx={{ minWidth: 240 }}>Cambiar rol</TableCell>

                            <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {filtered.map(u => (
                            <TableRow key={u.id} hover>
                                <TableCell padding="checkbox">
                                    <Checkbox checked={selected.includes(u.id)} onChange={() => toggleSelect(u.id)} />
                                </TableCell>

                                <TableCell>{u.name}</TableCell>
                                <TableCell>{u.email}</TableCell>

                                {/* NUEVO: solo el chip, centrado */}
                                <TableCell>
                                    <Box sx={{ display: 'flex', justifyContent: 'left' }}>
                                        <RoleChip role={u.role} />
                                    </Box>
                                </TableCell>

                                {/* NUEVO: solo el selector, alineado a la derecha y con ancho fijo */}
                                <TableCell sx={{ minWidth: 240 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                                        <RoleSelect
                                            value={u.role}
                                            onChange={(r) => onRoleChange(u, r)}
                                            size="small"
                                            disabled={current?.id === u.id && u.role === 'admin'}
                                            sx={{ width: 180 }}  // anchura constante → todos alineados
                                        />
                                    </Box>
                                </TableCell>

                                <TableCell align="right">
                                    <Tooltip title="Eliminar usuario">
                                        <span>
                                            <IconButton onClick={() => onDelete(u.id)} disabled={!!current && current.id === u.id}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                        {!filtered.length && (
                            <TableRow>
                                <TableCell colSpan={5}>
                                    <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                                        Sin resultados
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Diálogo cambio masivo */}
            <Dialog open={bulkDialog.open} onClose={() => setBulkDialog({ open: false, role: 'customer' })}>
                <DialogTitle>Cambiar rol a seleccionados</DialogTitle>
                <DialogContent>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                        <Typography>Nuevo rol:</Typography>
                        <RoleSelect value={bulkDialog.role} onChange={(r) => setBulkDialog(d => ({ ...d, role: r }))} size="medium" />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setBulkDialog({ open: false, role: 'customer' })}>Cancelar</Button>
                    <Button onClick={() => applyBulk(bulkDialog.role)} startIcon={<SaveIcon />} variant="contained">Aplicar</Button>
                </DialogActions>
            </Dialog>

            {/* Diálogo crear usuario */}
            <Dialog open={createDialog.open} onClose={() => setCreateDialog({ open: false, name: '', email: '', role: 'customer' })}>
                <DialogTitle>Crear usuario</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1, minWidth: 360 }}>
                        <TextField label="Nombre" value={createDialog.name} onChange={e => setCreateDialog(d => ({ ...d, name: e.target.value }))} />
                        <TextField label="Email" type="email" value={createDialog.email} onChange={e => setCreateDialog(d => ({ ...d, email: e.target.value }))} />
                        <RoleSelect value={createDialog.role} onChange={(r) => setCreateDialog(d => ({ ...d, role: r }))} size="medium" />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateDialog({ open: false, name: '', email: '', role: 'customer' })}>Cancelar</Button>
                    <Button onClick={onCreate} startIcon={<AddIcon />} variant="contained" disabled={!createDialog.email}>Crear</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
                <Alert severity={snack.type} onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.msg}</Alert>
            </Snackbar>
        </Paper>
    )
}

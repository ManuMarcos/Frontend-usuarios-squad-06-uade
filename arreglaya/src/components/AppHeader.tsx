// src/components/AppHeader.tsx
import React from 'react'
import {
  AppBar, Toolbar, Typography, Stack, Avatar,
  Menu, MenuItem, ListItemIcon, Divider, Tooltip, ButtonBase
} from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { toUiRole } from '../auth/routeUtils'

import PersonOutline from '@mui/icons-material/PersonOutline'
import WorkOutline from '@mui/icons-material/WorkOutline'
import AssignmentTurnedIn from '@mui/icons-material/AssignmentTurnedIn'
import Dashboard from '@mui/icons-material/Dashboard'
import LogoutIcon from '@mui/icons-material/Logout'
import ExpandMore from '@mui/icons-material/ExpandMore'
import ExpandLess from '@mui/icons-material/ExpandLess'

export default function AppHeader() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)
  const handleClose = () => setAnchorEl(null)
  const go = (path: string) => { navigate(path); handleClose() }

  if (!user) {
    
    return (
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography
            variant="h5"
            sx={{ fontWeight: 900, letterSpacing: 0.5, flex: 1 }}
            color="inherit"
          >
            Arregla<b>Ya</b>
          </Typography>
        </Toolbar>
      </AppBar>
    )
  }

  const uiRole = toUiRole(user.role)
  const fullName = user.meta?.firstName && user.meta?.lastName ? `${user.meta?.firstName} ${user.meta?.lastName}` : user.name || user.email
  const avatarInitial = (user.meta?.firstName || user.name || user.email || '?')[0]?.toUpperCase() || '?'

  const roleItems: Array<{ label: string; to?: string; icon: React.ReactNode; action?: () => void }> = []
  if (uiRole === 'contractor') {
    roleItems.push({ label: 'Trabajos', to: '/trabajos', icon: <WorkOutline /> })
    roleItems.push({ label: 'Solicitudes', to: '/solicitudes', icon: <AssignmentTurnedIn /> })
  }
  if (uiRole === 'admin') roleItems.push({ label: 'Panel Admin', to: '/admin', icon: <Dashboard /> })

  return (
    <AppBar position="static" color="primary">
      <Toolbar sx={{ gap: 2 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 900, letterSpacing: 0.5, flex: 1 }}
          
          color="inherit"
        >
          Arregla<b>Ya</b>
        </Typography>

        {/* Avatar + menú solo si hay sesión */}
        <Tooltip title={open ? 'Cerrar menú de cuenta' : 'Abrir menú de cuenta'}>
          <ButtonBase
            onClick={handleOpen}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            sx={{
              borderRadius: 999,
              px: 1.25, py: 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: 'inherit',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' }
            }}
          >
            <Avatar sx={{ bgcolor: '#00000022', width: 32, height: 32 }}>
              {avatarInitial}
            </Avatar>
            <Typography
              variant="body2"
              sx={{
                display: { xs: 'none', sm: 'block' },
                maxWidth: 200,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
              title={fullName}
            >
              {fullName}
            </Typography>
            {open ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
          </ButtonBase>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={(e) => e.stopPropagation()}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={() => go('/perfil')}>
            <ListItemIcon><PersonOutline fontSize="small" /></ListItemIcon>
            <Stack spacing={0} sx={{ minWidth: 180 }}>
              <Typography>{fullName || 'Perfil'}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                {user.email}
              </Typography>
            </Stack>
          </MenuItem>

          {roleItems.map(item => (
            <MenuItem key={item.label} onClick={item.action ? item.action : () => go(item.to!)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              {item.label}
            </MenuItem>
          ))}

          <Divider />

          <MenuItem onClick={() => { handleClose(); logout(); navigate('/', { replace: true }) }}>
            <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
            Cerrar sesión
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}
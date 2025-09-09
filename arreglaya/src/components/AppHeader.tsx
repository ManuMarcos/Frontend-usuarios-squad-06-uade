import React from 'react'
import {
  AppBar, Toolbar, Typography, Stack, Avatar,
  Menu, MenuItem, ListItemIcon, Divider, Tooltip, ButtonBase
} from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

import PersonOutline from '@mui/icons-material/PersonOutline'
import PeopleOutline from '@mui/icons-material/PeopleOutline'
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

  // Opciones por rol (solo dentro del menú)
  const roleItems: Array<{ label: string; to?: string; icon: React.ReactNode; action?: () => void }> = []
  if (user?.role === 'customer') roleItems.push({ label: 'Contratistas', to: '/contratistas', icon: <PeopleOutline /> })
  if (user?.role === 'contractor') {
    roleItems.push({ label: 'Trabajos', to: '/trabajos', icon: <WorkOutline /> })
    roleItems.push({ label: 'Solicitudes', to: '/solicitudes', icon: <AssignmentTurnedIn /> })
  }
  if (user?.role === 'admin') roleItems.push({ label: 'Panel Admin', to: '/admin', icon: <Dashboard /> })

  return (
    <AppBar position="static" color="primary">
      <Toolbar sx={{ gap: 2 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 900, letterSpacing: 0.5, flex: 1 }}
          component={RouterLink}
          to="/"
          color="inherit"
        >
          Home<b>Fix</b>
        </Typography>

        {/* Trigger de cuenta (Avatar + etiqueta + chevron) */}
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
              transition: 'all .15s ease',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' },
              '&:focus-visible': { outline: '2px solid rgba(255,255,255,0.6)', outlineOffset: 2 }
            }}
          >
            <Avatar sx={{ bgcolor: '#00000022', width: 32, height: 32 }}>
              {user?.name?.[0]?.toUpperCase() || '?'}
            </Avatar>
            <Typography
              variant="body2"
              sx={{
                display: { xs: 'none', sm: 'block' },
                maxWidth: 180,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {user ? 'Mi cuenta' : 'Invitado'}
            </Typography>
            {open ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
          </ButtonBase>
        </Tooltip>

        {/* Menú de cuenta */}
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={(e) => e.stopPropagation()}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {!user ? (
            <>
              <MenuItem onClick={() => go('/login')}>
                <ListItemIcon><PersonOutline fontSize="small" /></ListItemIcon>
                Iniciar sesión
              </MenuItem>
              <MenuItem onClick={() => go('/register')}>
                <ListItemIcon><PeopleOutline fontSize="small" /></ListItemIcon>
                Registrarse
              </MenuItem>
            </>
          ) : (
            <>
              {/* Perfil con subtexto de email */}
              <MenuItem onClick={() => go('/perfil')}>
                <ListItemIcon><PersonOutline fontSize="small" /></ListItemIcon>
                <Stack spacing={0} sx={{ minWidth: 160 }}>
                  <Typography>Perfil</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                    {user.email}
                  </Typography>
                </Stack>
              </MenuItem>

              {/* Opciones específicas por rol */}
              {roleItems.map(item => (
                <MenuItem
                  key={item.label}
                  onClick={item.action ? item.action : () => go(item.to!)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  {item.label}
                </MenuItem>
              ))}

              <Divider />

              <MenuItem onClick={() => { handleClose(); logout(); navigate('/', { replace: true }) }}>
                <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                Cerrar sesión
              </MenuItem>

            </>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  )
}

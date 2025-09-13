// src/auth/ProtectedRoute.tsx
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import { homeForRole, toUiRole, type UiRole } from './routeUtils'

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: UiRole[] }> = ({ children, roles }) => {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const userRole = toUiRole(user.role)
  const allowed = !roles || roles.map(r => toUiRole(r)).includes(userRole)

  if (!allowed) {
    return <Navigate to={homeForRole(userRole)} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
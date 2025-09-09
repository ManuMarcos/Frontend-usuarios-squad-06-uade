import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import { homeForRole } from './routeUtils'

const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  if (user) return <Navigate to={homeForRole(user.role)} replace />
  return <>{children}</>
}

export default GuestRoute

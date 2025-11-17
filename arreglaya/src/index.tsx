import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import theme from './theme'
import App from './App'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Search from './pages/Search'
import ContractorsList from './pages/ContractorsList'
import ContractorDetail from './pages/ContractorDetail'
import RequestForm from './pages/RequestForm'
import RequestSuccess from './pages/RequestSuccess'
import Admin from './pages/admin/Admin'
import { AuthProvider } from './auth/AuthProvider'
import ProtectedRoute from './auth/ProtectedRoute'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Profile from './pages/profile/Profile'
import Logout from './pages/Logout'
import GuestRoute from './auth/GuestRoute'

const router = createBrowserRouter([
  {
    path: '/', element: <App />, children: [
      { index: true, element: <GuestRoute><Login /></GuestRoute> },
      { path: 'login', element: <GuestRoute><Login /></GuestRoute> },
      { path: 'register', element: <GuestRoute><Register /></GuestRoute> },
      { path: 'recuperar', element: <GuestRoute><ResetPassword /></GuestRoute> },
      { path: 'restablecer/:token', element: <GuestRoute><ResetPassword /></GuestRoute> },

      { path: 'terminos', element: <Terms /> },
      { path: 'privacidad', element: <Privacy /> },
      { path: 'buscar', element: <Search /> },

      { path: 'contratistas', element: <ProtectedRoute roles={['customer']}><ContractorsList /></ProtectedRoute> },
      { path: 'contratistas/:id', element: <ProtectedRoute roles={['customer' ]}><ContractorDetail /></ProtectedRoute> },
      { path: 'solicitar/:id', element: <ProtectedRoute roles={['customer' ]}><RequestForm /></ProtectedRoute> },
      { path: 'exito', element: <ProtectedRoute roles={['customer', 'admin']}><RequestSuccess /></ProtectedRoute> },

      { path: 'perfil', element: <ProtectedRoute roles={['customer', 'contractor', 'admin']}><Profile /></ProtectedRoute> },
      { path: 'logout', element: <Logout /> },

      { path: 'admin', element: <ProtectedRoute roles={['admin']}><Admin /></ProtectedRoute> },
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

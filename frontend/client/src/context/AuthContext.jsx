import { createContext, useContext, useState } from 'react'
import { register as apiRegister, login as apiLogin } from '../services/api'

const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem('customer')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        localStorage.removeItem('customer')
      }
    }
    return null
  })

  const saveAuth = (data) => {
    localStorage.setItem('customer', JSON.stringify(data))
    setAuth(data)
  }

  const register = async (body) => {
    const data = await apiRegister(body)
    saveAuth(data)
    return data
  }

  const login = async (body) => {
    const data = await apiLogin(body)
    saveAuth(data)
    return data
  }

  const logout = () => {
    localStorage.removeItem('customer')
    setAuth(null)
  }

  return (
    <AuthContext.Provider
      value={{
        auth,
        user: auth?.user || null,
        token: auth?.token || null,
        isAuthenticated: !!auth?.token,
        role: auth?.user?.role || null,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

import { createContext, useContext, useEffect, useState } from 'react'
import { login as apiLogin } from '../lib/api'

interface AuthUser {
  id: string
  name: string
  email: string
  role: string
}

interface AuthContextValue {
  token: string | null
  user: AuthUser | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('inkloom_token'))
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem('inkloom_user')
    return raw ? JSON.parse(raw) : null
  })

  const login = async (email: string, password: string) => {
    const result = await apiLogin(email, password)
    setToken(result.access_token)
    setUser(result.user)
    localStorage.setItem('inkloom_token', result.access_token)
    localStorage.setItem('inkloom_user', JSON.stringify(result.user))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('inkloom_token')
    localStorage.removeItem('inkloom_user')
  }

  useEffect(() => {
    if (token) return
    // Demo-only convenience login for the local prototype.
    void (async () => {
      try {
        await login('admin@example.com', 'demo-password-change-me')
      } catch {
        // Ignore; the user can log in manually.
      }
    })()
  }, [token])

  return <AuthContext.Provider value={{ token, user, login, logout }}>{children}</AuthContext.Provider>
}

// oxlint-disable-next-line react/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
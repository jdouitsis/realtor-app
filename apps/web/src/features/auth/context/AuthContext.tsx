import { createContext, useCallback, useEffect, useState } from 'react'
import type { AuthContextValue, User } from '../types/auth.types'

const STORAGE_KEY = 'auth_user'

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? (JSON.parse(stored) as User) : null
  })

  const isAuthenticated = user !== null

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [user])

  const login = useCallback(async (email: string, _password: string) => {
    // Dummy auth - create user from email
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      name: email.split('@')[0],
    }
    setUser(newUser)
  }, [])

  const register = useCallback(async (email: string, _password: string, name?: string) => {
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      name: name ?? email.split('@')[0],
    }
    setUser(newUser)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

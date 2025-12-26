import { createContext, useCallback, useEffect, useState } from 'react'

import { trpcClient } from '@/lib/trpc'

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

  const login = useCallback(async (email: string, password: string) => {
    // Dummy auth - create user from email
    const res = await trpcClient.auth.login.mutate({ email, password })
    setUser(res.user)
  }, [])

  const register = useCallback(async (email: string, password: string, name: string) => {
    const res = await trpcClient.auth.register.mutate({ email, password, name })
    setUser(res.user)
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

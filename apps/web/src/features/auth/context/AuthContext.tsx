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
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = user !== null

  // Validate session on mount
  useEffect(() => {
    async function validateSession() {
      try {
        const me = await trpcClient.auth.me.query()
        if (me) {
          setUser(me)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(me))
        } else {
          setUser(null)
          localStorage.removeItem(STORAGE_KEY)
        }
      } catch {
        setUser(null)
        localStorage.removeItem(STORAGE_KEY)
      } finally {
        setIsLoading(false)
      }
    }

    void validateSession()
  }, [])

  // Sync user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [user])

  const login = useCallback(async (email: string) => {
    const res = await trpcClient.auth.login.mutate({ email })
    return { userId: res.userId }
  }, [])

  const register = useCallback(async (email: string, name: string) => {
    const res = await trpcClient.auth.register.mutate({ email, name })
    return { userId: res.userId }
  }, [])

  const verifyOtp = useCallback(async (userId: string, code: string) => {
    const res = await trpcClient.auth.verifyOtp.mutate({ userId, code })
    setUser(res.user)
  }, [])

  const resendOtp = useCallback(async (userId: string) => {
    await trpcClient.auth.resendOtp.mutate({ userId })
  }, [])

  const logout = useCallback(async () => {
    await trpcClient.auth.logout.mutate()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, register, verifyOtp, resendOtp, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

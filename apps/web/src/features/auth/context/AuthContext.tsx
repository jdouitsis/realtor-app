import { createContext, useCallback, useEffect, useState } from 'react'

import { useStorage } from '@/lib/storage'
import { trpcClient } from '@/lib/trpc'

import type { AuthContextValue } from '../types/auth.types'

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // User is stored for faster and cleaner state management
  const [user, setUser, clearUser] = useStorage('auth_user')
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = user !== null

  // Validate session on mount
  useEffect(() => {
    trpcClient.auth.me
      .query()
      .then((me) => {
        if (me) setUser(me)
        else clearUser()
      })
      .catch(() => clearUser())
      .finally(() => setIsLoading(false))
  }, [setUser, clearUser])

  const login = useCallback(async (email: string) => {
    const res = await trpcClient.auth.login.mutate({ email })
    return { userId: res.userId }
  }, [])

  const register = useCallback(async (email: string, name: string) => {
    const res = await trpcClient.auth.register.mutate({ email, name })
    return { userId: res.userId }
  }, [])

  const verifyOtp = useCallback(
    async (userId: string, code: string) => {
      const res = await trpcClient.auth.verifyOtp.mutate({ userId, code })
      setUser(res.user)
    },
    [setUser]
  )

  const resendOtp = useCallback(async (userId: string) => {
    await trpcClient.auth.resendOtp.mutate({ userId })
  }, [])

  const logout = useCallback(async () => {
    await trpcClient.auth.logout.mutate()
    clearUser()
  }, [clearUser])

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, register, verifyOtp, resendOtp, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

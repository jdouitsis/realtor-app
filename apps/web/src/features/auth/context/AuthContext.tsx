import { createContext, useCallback } from 'react'

import { useStorage } from '@/lib/storage'
import { trpcClient } from '@/lib/trpc'

import type { AuthContextValue } from '../types/auth.types'

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken, clearToken] = useStorage('auth_token')

  const isAuthenticated = token !== null

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
      setToken(res.token)
    },
    [setToken]
  )

  const resendOtp = useCallback(async (userId: string) => {
    await trpcClient.auth.resendOtp.mutate({ userId })
  }, [])

  const logout = useCallback(async () => {
    await trpcClient.auth.logout.mutate()
    clearToken()
  }, [clearToken])

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, register, verifyOtp, resendOtp, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

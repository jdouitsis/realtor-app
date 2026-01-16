import { clearStorage, getStorage, setStorage } from '@/lib/storage'
import { trpcClient } from '@/lib/trpc'

export interface AuthOptions {
  type?: 'otp' | 'magic'
  redirectUrl?: string
}

export interface Auth {
  readonly isAuthenticated: boolean
  login: (email: string, options?: AuthOptions) => Promise<void>
  register: (email: string, name: string, options?: AuthOptions) => Promise<void>
  verifyOtp: (email: string, code: string) => Promise<void>
  resendOtp: (email: string) => Promise<void>
  logout: () => Promise<void>
}

interface RouterLike {
  invalidate: () => Promise<void>
}

/**
 * Factory to create auth object with router reference for automatic invalidation.
 *
 * @example
 * const auth = createAuth(router)
 * await auth.logout()  // clears token and invalidates router
 */
export function createAuth(router: RouterLike): Auth {
  return {
    get isAuthenticated() {
      return getStorage('auth_token') !== null
    },

    async login(email, options) {
      await trpcClient.auth.login.mutate({
        email,
        type: options?.type,
        redirectUrl: options?.redirectUrl,
      })
    },

    async register(email, name, options) {
      try {
        await trpcClient.auth.register.mutate({
          email,
          name,
          type: options?.type,
          redirectUrl: options?.redirectUrl,
        })
      } catch (error) {
        console.error(error)
      }
    },

    async verifyOtp(email, code) {
      const res = await trpcClient.auth.verifyOtp.mutate({ email, code })
      setStorage('auth_token', res.token)
      void router.invalidate()
    },

    async resendOtp(email) {
      await trpcClient.auth.resendOtp.mutate({ email })
    },

    async logout() {
      await trpcClient.auth.logout.mutate()
      clearStorage('auth_token')
      void router.invalidate()
    },
  }
}

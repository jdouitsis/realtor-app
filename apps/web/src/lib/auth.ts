import { clearStorage, getStorage, setStorage } from '@/lib/storage'
import { trpcClient } from '@/lib/trpc'

export interface RequestMagicLinkOptions {
  redirectUrl?: string
  expiresInHours?: number
}

export interface Auth {
  readonly isAuthenticated: boolean
  login: (email: string) => Promise<{ userId: string }>
  register: (email: string, name: string) => Promise<{ userId: string }>
  verifyOtp: (userId: string, code: string) => Promise<void>
  resendOtp: (userId: string) => Promise<void>
  requestMagicLink: (email: string, options?: RequestMagicLinkOptions) => Promise<void>
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

    async login(email) {
      const res = await trpcClient.auth.login.mutate({ email })
      return { userId: res.userId }
    },

    async register(email, name) {
      const res = await trpcClient.auth.register.mutate({ email, name })
      return { userId: res.userId }
    },

    async verifyOtp(userId, code) {
      const res = await trpcClient.auth.verifyOtp.mutate({ userId, code })
      setStorage('auth_token', res.token)
      void router.invalidate()
    },

    async resendOtp(userId) {
      await trpcClient.auth.resendOtp.mutate({ userId })
    },

    async requestMagicLink(email, options) {
      await trpcClient.auth.requestMagicLink.mutate({
        email,
        redirectUrl: options?.redirectUrl,
        expiresInHours: options?.expiresInHours,
      })
    },

    async logout() {
      await trpcClient.auth.logout.mutate()
      clearStorage('auth_token')
      void router.invalidate()
    },
  }
}

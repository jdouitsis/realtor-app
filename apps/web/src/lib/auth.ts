import { clearStorage, getStorage, setStorage } from '@/lib/storage'
import { trpcClient } from '@/lib/trpc'

export interface RequestMagicLinkOptions {
  redirectUrl?: string
  expiresInHours?: number
}

export interface Auth {
  readonly isAuthenticated: boolean
  login: (email: string) => Promise<{ email: string }>
  register: (email: string, name: string) => Promise<{ email: string }>
  verifyOtp: (email: string, code: string) => Promise<void>
  resendOtp: (email: string) => Promise<void>
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
      return { email: res.email }
    },

    async register(email, name) {
      const res = await trpcClient.auth.register.mutate({ email, name })
      return { email: res.email }
    },

    async verifyOtp(email, code) {
      const res = await trpcClient.auth.verifyOtp.mutate({ email, code })
      setStorage('auth_token', res.token)
      void router.invalidate()
    },

    async resendOtp(email) {
      await trpcClient.auth.resendOtp.mutate({ email })
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

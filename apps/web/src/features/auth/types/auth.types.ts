export interface User {
  id: string
  email: string
  name: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface AuthContextValue extends AuthState {
  login: (email: string) => Promise<{ userId: string }>
  register: (email: string, name: string) => Promise<{ userId: string }>
  verifyOtp: (userId: string, code: string) => Promise<void>
  resendOtp: (userId: string) => Promise<void>
  logout: () => Promise<void>
}

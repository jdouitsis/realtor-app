export interface User {
  id: string
  email: string
  name?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

export interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => void
}

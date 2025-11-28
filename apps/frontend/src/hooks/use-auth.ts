import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  avatar?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

const createAuthStore = (set: any, get: any) => {
  const setUser = (user: User | null) => set({ user, isAuthenticated: !!user })
  const setToken = (token: string | null) => set({ token })
  const setLoading = (loading: boolean) => set({ isLoading: loading })
  const setError = (error: string | null) => set({ error })
  const clearError = () => set({ error: null })

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Login failed')

      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false, error: null })
      if (typeof window !== 'undefined') localStorage.setItem('token', data.token)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      setLoading(false)
      throw err
    }
  }

  const register = async (userData: RegisterData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Registration failed')

      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false, error: null })
      if (typeof window !== 'undefined') localStorage.setItem('token', data.token)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
      setLoading(false)
      throw err
    }
  }

  const logout = () => {
    set({ user: null, token: null, isAuthenticated: false, error: null })
    if (typeof window !== 'undefined') localStorage.removeItem('token')
  }

  return {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    setUser,
    setToken,
    setLoading,
    setError,
    clearError,
    login,
    register,
    logout,
  }
}

// Export store; persist only in browser
export const useAuth = typeof window !== 'undefined'
  ? create<AuthState & AuthActions>()(
      persist(createAuthStore as any, {
        name: 'auth-storage',
        partialize: (state: any) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
      }) as any
    )
  : create<AuthState & AuthActions>()(createAuthStore as any)










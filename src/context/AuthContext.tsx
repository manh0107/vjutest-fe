'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService, LoginResponse, User } from '@/services/authService'
import { toast } from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<LoginResponse>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await authService.getCurrentUser()
        setUser(userData)
        if (userData) {
          redirectBasedOnRole(userData.role)
        }
      } catch (error) {
        console.error('Lỗi kiểm tra đăng nhập:', error)
        authService.logout()
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const redirectBasedOnRole = (role: string) => {
    if (role === 'ADMIN') {
      router.push('/admin/dashboard')
    } else if (role === 'TEACHER') {
      router.push('/teacher/dashboard')
    } else {
      router.push('/dashboard')
    }
  }

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await authService.login({ email, password })
      authService.setToken(response.token)
      const userData = await authService.getCurrentUser()
      setUser(userData)
      redirectBasedOnRole(userData.role)
      return response
    } catch (error: any) {
      console.error('Lỗi đăng nhập:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      authService.logout()
      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('Lỗi đăng xuất:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider')
  }
  return context
} 
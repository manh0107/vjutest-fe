'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService, LoginResponse } from '@/services/authService'
import { User } from '@/services/types'
import { toast } from 'sonner'

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
        const token = authService.getToken()
        if (!token) {
          setLoading(false)
          return
        }

        const userData = await authService.getCurrentUser()
        console.log('Current user data:', userData)
        setUser(userData)
        if (userData && userData.role) {
          redirectBasedOnRole(userData.role)
        }
      } catch (error: any) {
        console.error('Lỗi kiểm tra đăng nhập:', error)
        authService.logout()
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const redirectBasedOnRole = (role: string | { name: string }) => {
    let roleName: string
    if (typeof role === 'string') {
      roleName = role.toLowerCase()
    } else if (role && role.name) {
      roleName = role.name.toLowerCase()
    } else {
      console.error('Vai trò không hợp lệ:', role)
      return
    }

    console.log('Redirecting based on role:', roleName)

    if (roleName === 'admin') {
      router.push('/dashboard')
    } else if (roleName === 'teacher') {
      router.push('/teacher/dashboard')
    } else {
      router.push('/dashboard')
    }
  }

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await authService.login({ email, password })
      console.log('Login response:', response)
      
      const userData = await authService.getCurrentUser()
      console.log('User data after login:', userData)
      
      setUser(userData)
      toast.success('Đăng nhập thành công')
      
      if (userData && userData.role) {
        redirectBasedOnRole(userData.role)
      } else {
        console.error('Không tìm thấy thông tin vai trò người dùng')
        toast.error('Lỗi xác thực vai trò người dùng')
      }
      
      return response
    } catch (error: any) {
      console.error('Lỗi đăng nhập:', error)
      toast.error(error.message || 'Đăng nhập thất bại')
      throw error
    }
  }

  const logout = async () => {
    try {
      authService.logout()
      setUser(null)
      router.push('/login')
    } catch (error: any) {
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
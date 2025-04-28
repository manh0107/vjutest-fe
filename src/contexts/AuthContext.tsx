"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService } from '@/services/authService'
import { useRouter } from 'next/navigation'
import { User } from '@/services/types'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Kiểm tra token trong localStorage
        const token = authService.getToken()
        if (token) {
          // Kiểm tra token có hợp lệ không
          if (!authService.isTokenExpired(token)) {
            const user = await authService.getCurrentUser()
            setUser(user)
            // Khởi động refresh token interval
            authService.startRefreshInterval()
          } else {
            // Nếu token hết hạn, thử refresh
            try {
              await authService.refreshToken()
              const user = await authService.getCurrentUser()
              setUser(user)
              authService.startRefreshInterval()
            } catch (error) {
              console.error('Token refresh failed:', error)
              authService.logout()
              router.push('/login')
            }
          }
        } else {
          // Không có token, chuyển về trang login
          router.push('/login')
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        // Nếu có lỗi khởi tạo, logout và chuyển về trang login
        authService.logout()
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Cleanup khi component unmount
    return () => {
      authService.stopRefreshInterval()
    }
  }, [router])

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password)
      if (response.token) {
        // Token is already stored in localStorage by authService.login
        const user = await authService.getCurrentUser()
        if (user) {
          setUser(user)
          router.push('/dashboard')
        } else {
          throw new Error('Không thể lấy thông tin người dùng')
        }
      } else {
        throw new Error('Đăng nhập thất bại')
      }
    } catch (error: any) {
      console.error('Error during login:', error)
      throw new Error(error.message || 'Đăng nhập thất bại')
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    router.push('/login')
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
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider')
  }
  return context
} 
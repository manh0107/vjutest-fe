"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService } from '@/services/authService'
import { useRouter } from 'next/navigation'
import { User, Role } from '@/services/types'
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

  const getRoleName = (role: Role): string => {
    if (typeof role === 'string') {
      return role
    }
    if (typeof role === 'object' && role !== null && 'name' in role) {
      return role.name || ''
    }
    return ''
  }

  useEffect(() => {
    const initializeAuth = async () => {
      const publicPaths = ['/login', '/register', '/forgot-password', '/verify', '/reset-password'];
      const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
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
              if (!publicPaths.some((p) => pathname.startsWith(p))) {
                router.push('/login')
              }
            }
          }
        } else {
          // Không có token, chuyển về trang login nếu không phải trang public
          if (!publicPaths.some((p) => pathname.startsWith(p))) {
            router.push('/login')
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        // Nếu có lỗi khởi tạo, logout và chuyển về trang login nếu không phải trang public
        authService.logout()
        if (!publicPaths.some((p) => pathname.startsWith(p))) {
          router.push('/login')
        }
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
          // Chuyển hướng dựa trên role
          const roleName = getRoleName(user.role)
          console.log('User role:', roleName) // Debug log
          
          if (roleName === 'ROLE_ADMIN' || roleName === 'admin') {
            router.push('/dashboard')
          } else if (roleName === 'ROLE_TEACHER' || roleName === 'teacher') {
            router.push('/teacher')
          } else if (roleName === 'ROLE_USER' || roleName === 'student' || roleName === 'ROLE_STUDENT') {
            router.push('/student')
          } else {
            console.error('Unknown role:', roleName)
            router.push('/')
          }
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
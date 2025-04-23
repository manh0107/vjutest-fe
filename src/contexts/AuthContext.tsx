'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService } from '@/services/authService'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  name: string
  email: string
  role: string
  image?: string
  code?: string
  phoneNumber?: number
  className?: string
  gender?: string
  isEnabled: boolean
  createdAt: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (token: string) => void
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
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
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

  const login = async (token: string) => {
    try {
      localStorage.setItem('token', token)
      authService.setToken(token)
      
      // Fetch user info
      const user = await authService.getCurrentUser()
      setUser(user)
      
      // Start refresh interval
      authService.startRefreshInterval()
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error during login:', error)
      logout()
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    authService.logout()
    setUser(null)
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
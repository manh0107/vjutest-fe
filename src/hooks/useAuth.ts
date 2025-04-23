import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { userService } from '@/services/userService'
import type { User } from '@/services/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')

      console.log('useAuth hook: Checking authentication state', {
        hasToken: !!token,
        hasUserData: !!userData
      })

      if (!token) {
        console.log('useAuth hook: No token found')
        setLoading(false)
        return
      }

      try {
        // Nếu có user data trong localStorage, sử dụng nó
        if (userData) {
          const parsedUser = JSON.parse(userData)
          console.log('useAuth hook: Successfully parsed user data', {
            userId: parsedUser.id,
            role: parsedUser.role
          })
          setUser(parsedUser)
        } 
        // Nếu có token nhưng không có user data, lấy từ API
        else {
          console.log('useAuth hook: Token exists but no user data, fetching from API')
          const currentUser = await userService.getCurrentUser()
          console.log('useAuth hook: Successfully fetched user data from API', {
            userId: currentUser.id,
            role: currentUser.role
          })
          localStorage.setItem('user', JSON.stringify(currentUser))
          setUser(currentUser)
        }
      } catch (error) {
        console.error('useAuth hook: Error initializing auth:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = (token: string, user: User) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setUser(user)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    router.push('/login')
  }

  return {
    user,
    loading,
    login,
    logout,
  }
} 
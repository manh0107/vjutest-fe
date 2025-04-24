import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { userService } from '@/services/userService'
import type { User } from '@/services/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')

        if (!token) {
          if (isMounted) {
            setUser(null)
            setLoading(false)
          }
          return
        }

        if (!userData) {
          try {
            const currentUser = await userService.getCurrentUser()
            if (isMounted) {
              localStorage.setItem('user', JSON.stringify(currentUser))
              setUser(currentUser)
              setLoading(false)
            }
          } catch (error) {
            if (isMounted) {
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              setUser(null)
              setLoading(false)
            }
          }
        } else {
          if (isMounted) {
            setUser(JSON.parse(userData))
            setLoading(false)
          }
        }
      } catch (error) {
        if (isMounted) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
          setLoading(false)
        }
      }
    }

    checkAuth()

    return () => {
      isMounted = false
    }
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
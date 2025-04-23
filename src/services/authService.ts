import axios from 'axios'
import type { User as UserType } from './types'
import { jwtDecode } from 'jwt-decode'

const API_URL = 'http://localhost:8080'
const REFRESH_INTERVAL = 4 * 60 * 1000 // 4 phút
const INITIAL_RETRY_DELAY = 1000 // 1 giây
const MAX_RETRY_DELAY = 10000    // 10 giây
const MAX_RETRIES = 3

let refreshInterval: NodeJS.Timeout | null = null
let refreshPromise: Promise<string> | null = null

// Cấu hình axios mặc định
axios.defaults.baseURL = API_URL
axios.defaults.withCredentials = true

// Cập nhật header Authorization cho tất cả request
const updateAxiosHeaders = (token: string) => {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

interface TokenResponse {
  accessToken: string
  refreshToken: string
}

interface JwtPayload {
  exp: number
}

export interface LoginResponse {
  token: string
  message: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
}

export interface User {
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

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials)
      const { token } = response.data
      if (token) {
        this.setToken(token)
        this.startRefreshInterval()
      }
      return response.data
    } catch (error: any) {
      console.error('Lỗi đăng nhập:', error)
      throw new Error(error.response?.data?.message || 'Đăng nhập thất bại')
    }
  },

  async register(data: RegisterData): Promise<void> {
    await axios.post(`${API_URL}/auth/register`, data)
  },

  async getCurrentUser(): Promise<UserType> {
    try {
      const token = await this.getValidToken()
      const response = await axios.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      return response.data
    } catch (error: any) {
      console.error('Lỗi lấy thông tin người dùng:', error)
      throw new Error(error.response?.data?.message || 'Không thể lấy thông tin người dùng')
    }
  },

  getToken(): string | null {
    return localStorage.getItem('token')
  },

  setToken(token: string): void {
    localStorage.setItem('token', token)
    updateAxiosHeaders(token)
  },

  logout(): void {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    this.stopRefreshInterval()
    axios.post('/auth/logout', null, { withCredentials: true })
      .catch(error => console.error('Lỗi khi logout:', error))
  },

  isAuthenticated(): boolean {
    const token = this.getToken()
    return !!token && !this.isTokenExpired(token)
  },

  async refreshToken(): Promise<string> {
    if (refreshPromise) {
      return refreshPromise
    }

    refreshPromise = (async () => {
      let retries = MAX_RETRIES
      let delay = INITIAL_RETRY_DELAY

      while (retries > 0) {
        try {
          console.log(`Đang thử refresh token... (còn ${retries} lần thử)`)
          const response = await axios.post<LoginResponse>('/auth/refresh-token', null, {
            withCredentials: true
          })

          if (response.data.token) {
            this.setToken(response.data.token)
            console.log('Refresh token thành công')
            return response.data.token
          }
          throw new Error('Không nhận được token mới')
        } catch (error: any) {
          retries--
          console.error(`Lỗi refresh token (còn ${retries} lần thử):`, error.message)

          // Nếu token hết hạn hoặc không còn lần thử nào
          if (retries === 0 || error.response?.status === 403) {
            this.logout()
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
          }

          // Đợi với thời gian tăng dần trước khi thử lại
          await new Promise(resolve => setTimeout(resolve, delay))
          delay = Math.min(delay * 2, MAX_RETRY_DELAY)
        }
      }
      throw new Error('Không thể làm mới token sau nhiều lần thử')
    })()

    // Đảm bảo refreshPromise được reset kể cả khi có lỗi
    refreshPromise.catch(() => {}).finally(() => {
      refreshPromise = null
    })

    return refreshPromise
  },

  startRefreshInterval(): void {
    if (refreshInterval) {
      clearInterval(refreshInterval)
    }
    
    refreshInterval = setInterval(async () => {
      try {
        const token = this.getToken()
        if (!token || this.isTokenExpired(token)) {
          console.log('Token sắp hết hạn, bắt đầu làm mới...')
          await this.refreshToken()
        }
      } catch (error) {
        console.error('Lỗi khi tự động làm mới token:', error)
        this.stopRefreshInterval()
      }
    }, REFRESH_INTERVAL)

    // Thêm listener để dừng interval khi tab/window đóng
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.stopRefreshInterval()
      })
    }
  },

  stopRefreshInterval(): void {
    if (refreshInterval) {
      clearInterval(refreshInterval)
      refreshInterval = null
    }
  },

  async getValidToken(): Promise<string> {
    const token = this.getToken()
    if (!token) {
      throw new Error('Không tìm thấy token')
    }

    if (this.isTokenExpired(token)) {
      return await this.refreshToken()
    }

    return token
  },

  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<JwtPayload>(token)
      const currentTime = Date.now() / 1000
      return decoded.exp - currentTime < 60
    } catch (error) {
      return true
    }
  }
} 
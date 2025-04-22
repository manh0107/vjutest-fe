import axios from 'axios'
import { User as UserType } from './types'
import { jwtDecode } from 'jwt-decode'

const API_URL = 'http://localhost:8080'
const REFRESH_INTERVAL = 4.5 * 60 * 1000 // 4 phút 30 giây

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
  username: string
  email: string
  role: string
}

let refreshInterval: NodeJS.Timeout | null = null

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

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials, {
        withCredentials: true
      })
      const { token } = response.data
      if (token) {
        localStorage.setItem('token', token)
        updateAxiosHeaders(token)
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

  async getCurrentUser(): Promise<User> {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Không tìm thấy token')
      }

      const response = await axios.get(`${API_URL}/auth/me`, {
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
    axios.post('/auth/logout', null, { withCredentials: true })
      .catch(error => console.error('Lỗi khi logout:', error))
    delete axios.defaults.headers.common['Authorization']
    this.stopRefreshInterval()
  },

  isAuthenticated(): boolean {
    const token = this.getToken()
    return !!token
  },

  async refreshToken(): Promise<string> {
    try {
      const response = await axios.post<LoginResponse>('/auth/refresh-token', null, {
        withCredentials: true
      })

      if (response.data.token) {
        this.setToken(response.data.token)
        return response.data.token
      }

      throw new Error('Không nhận được token mới')
    } catch (error: any) {
      console.error('Lỗi làm mới token:', error)
      if (error.response?.status === 403) {
        const errorMessage = error.response?.data?.message
        if (errorMessage && errorMessage.includes('expired')) {
          this.logout()
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
        }
      }
      throw error
    }
  },

  startRefreshInterval(): void {
    // Dừng interval cũ nếu có
    this.stopRefreshInterval()
    
    // Bắt đầu interval mới
    refreshInterval = setInterval(async () => {
      try {
        console.log('Đang tự động làm mới token...')
        await this.refreshToken()
        console.log('Làm mới token thành công')
      } catch (error) {
        console.error('Lỗi khi tự động làm mới token:', error)
        this.stopRefreshInterval()
      }
    }, REFRESH_INTERVAL)
  },

  stopRefreshInterval(): void {
    if (refreshInterval) {
      clearInterval(refreshInterval)
      refreshInterval = null
    }
  },

  async getValidToken(): Promise<string> {
    try {
      const token = this.getToken()
      if (!token) {
        throw new Error('Không tìm thấy token')
      }

      if (this.isTokenExpired(token)) {
        return await this.refreshToken()
      }

      return token
    } catch (error: any) {
      console.error('Lỗi khi lấy token:', error)
      throw error
    }
  },

  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<JwtPayload>(token)
      const currentTime = Date.now() / 1000
      // Token được coi là hết hạn nếu còn ít hơn 1 phút
      return decoded.exp - currentTime < 60
    } catch (error) {
      return true
    }
  }
} 
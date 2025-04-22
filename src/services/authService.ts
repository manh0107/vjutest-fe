import axios from 'axios'
import { User as UserType } from './types'

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

// Function to check if token is expired or about to expire (within 5 minutes)
const isTokenExpired = (token: string): boolean => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    const { exp } = JSON.parse(jsonPayload)
    const now = Math.floor(Date.now() / 1000)
    return exp - now < 300 // Token is considered expired if it will expire in less than 5 minutes
  } catch (error) {
    return true // If we can't parse the token, consider it expired
  }
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials)
      const { token } = response.data
      if (token) {
        this.setToken(token)
        // Cập nhật header Authorization
        updateAxiosHeaders(token)
        // Bắt đầu interval refresh token sau khi đăng nhập thành công
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
      const token = this.getToken()
      if (!token) {
        throw new Error('Không tìm thấy token')
      }

      const response = await axios.get(`${API_URL}/auth/me`)
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
    // Cập nhật header Authorization mỗi khi token thay đổi
    updateAxiosHeaders(token)
  },

  logout(): void {
    localStorage.removeItem('token')
    // Xóa header Authorization khi đăng xuất
    delete axios.defaults.headers.common['Authorization']
    // Dừng interval refresh token khi đăng xuất
    this.stopRefreshInterval()
  },

  isAuthenticated(): boolean {
    const token = this.getToken()
    return !!token
  },

  async refreshToken(): Promise<string> {
    try {
      const response = await axios.post(`${API_URL}/auth/refresh-token`, {})
      const { token } = response.data
      if (token) {
        this.setToken(token) // Cập nhật token mới và header
        return token
      }
      throw new Error('Không thể làm mới token')
    } catch (error: any) {
      console.error('Lỗi làm mới token:', error)
      this.logout()
      throw new Error(error.response?.data?.message || 'Phiên đăng nhập đã hết hạn')
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
    const token = this.getToken()
    if (!token) {
      throw new Error('Không tìm thấy token')
    }

    if (isTokenExpired(token)) {
      console.log('Token sắp hết hạn, đang làm mới...')
      return await this.refreshToken()
    }

    return token
  }
} 
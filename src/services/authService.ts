import axios from 'axios'
import type { User } from './types'
import { jwtDecode } from 'jwt-decode'

const API_URL = 'http://localhost:8080'
const REFRESH_INTERVAL = 4 * 60 * 1000 // 4 phút
const INITIAL_RETRY_DELAY = 1000 // 1 giây
const MAX_RETRY_DELAY = 10000    // 10 giây
const MAX_RETRIES = 3

let refreshInterval: NodeJS.Timeout | null = null
let refreshPromise: Promise<string> | null = null

// Create a separate axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true
})

// Cập nhật header Authorization cho tất cả request
const updateAxiosHeaders = (token: string) => {
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
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
  user?: User
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
  department?: string
  major?: string
  isEnabled: boolean
  createdAt: string
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await axiosInstance.post<LoginResponse>('/auth/login', {
        email,
        password
      }, {
        withCredentials: true
      })

      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
        
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user))
        }
      }

      return response.data
    } catch (error: any) {
      console.error('Lỗi đăng nhập:', error)
      throw new Error(error.response?.data?.message || 'Đăng nhập thất bại')
    }
  },

  async register(data: RegisterData): Promise<void> {
    await axiosInstance.post('/auth/register', data)
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      // First check localStorage
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        return JSON.parse(storedUser)
      }

      // If no stored user, fetch from API
      const response = await axiosInstance.get<User>('/auth/me')
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data))
        return response.data
      }
      return null
    } catch (error: any) {
      console.error('Error getting current user:', error.message)
      if (error.response?.status === 401) {
        // Token might be expired, try to refresh
        try {
          await this.refreshToken()
          // Retry getting user after token refresh
          const response = await axiosInstance.get<User>('/auth/me')
          if (response.data) {
            localStorage.setItem('user', JSON.stringify(response.data))
            return response.data
          }
        } catch (refreshError) {
          // If refresh fails, clear everything and return null
          this.logout()
        }
      }
      return null
    }
  },

  getToken(): string | null {
    return localStorage.getItem('token')
  },

  logout(): void {
    // Clear token and user from localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // Clear axios headers
    delete axiosInstance.defaults.headers.common['Authorization']
    
    // Call logout endpoint to clear refresh token cookie
    axiosInstance.post('/auth/logout')
      .catch(error => console.error('Lỗi khi logout:', error))
  },

  isAuthenticated(): boolean {
    const token = this.getToken()
    return !!token && !this.isTokenExpired(token)
  },

  async refreshToken(): Promise<string> {
    try {
      // Nếu đã có một promise refresh token đang chạy, trả về promise đó
      if (refreshPromise) {
        return refreshPromise;
      }

      // Tạo promise mới cho refresh token
      refreshPromise = (async () => {
        try {
          const response = await axiosInstance.post<LoginResponse>('/auth/refresh-token', null, {
            withCredentials: true
          });

          if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            return response.data.token;
          }
          throw new Error('Không nhận được token mới');
        } catch (error: any) {
          console.error('Lỗi refresh token:', error.message);
          // Xóa token cũ và chuyển hướng về trang login
          this.logout();
          window.location.href = '/login';
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } finally {
          // Reset promise khi hoàn thành
          refreshPromise = null;
        }
      })();

      return refreshPromise;
    } catch (error: any) {
      console.error('Lỗi refresh token:', error.message);
      this.logout();
      window.location.href = '/login';
      throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }
  },

  startRefreshInterval(): void {
    // Dừng interval cũ nếu có
    this.stopRefreshInterval();
    
    // Bắt đầu interval mới
    refreshInterval = setInterval(async () => {
      try {
        const token = this.getToken();
        if (token && this.isTokenExpired(token)) {
          await this.refreshToken();
        }
      } catch (error) {
        console.error('Lỗi trong refresh interval:', error);
        this.stopRefreshInterval();
        this.logout();
        window.location.href = '/login';
      }
    }, REFRESH_INTERVAL);
  },

  stopRefreshInterval(): void {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
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
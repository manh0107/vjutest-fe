import axios from 'axios'
import { User as UserType } from './types'

const API_URL = 'http://localhost:8080'

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

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials)
      const { token } = response.data
      if (token) {
        localStorage.setItem('token', token)
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
  },

  logout(): void {
    localStorage.removeItem('token')
  },

  isAuthenticated(): boolean {
    const token = this.getToken()
    return !!token
  }
} 
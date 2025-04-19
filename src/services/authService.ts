import axios from 'axios'

const API_URL = 'http://localhost:8080'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  message: string
}

export interface User {
  id: number
  username: string
  email: string
  role: string
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await axios.post(`${API_URL}/auth/login`, credentials)
    return response.data
  },

  async register(data: RegisterData): Promise<void> {
    await axios.post(`${API_URL}/auth/register`, data)
  },

  async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }

    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  setToken(token: string): void {
    localStorage.setItem('token', token)
  },

  logout(): void {
    localStorage.removeItem('token')
  },
} 
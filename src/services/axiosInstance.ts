import axios from 'axios'
import { authService } from './authService'

export const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
})

// Add request interceptor to add auth token
axiosInstance.interceptors.request.use(
  async (config) => {
    // Lấy token từ localStorage hoặc authService
    let token = localStorage.getItem('token')
    if (!token && authService.getToken) {
      token = authService.getToken()
    }
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
) 
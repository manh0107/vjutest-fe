import axios from 'axios'
import type { User } from './types'

const API_URL = 'http://localhost:8080'

export const userService = {
  async getUsers(): Promise<User[]> {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Không tìm thấy token')
      }

      const response = await axios.get(`${API_URL}/users/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('Users response:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Lỗi khi lấy danh sách người dùng:', error.response || error)
      if (error.response?.status === 403) {
        throw new Error('Bạn không có quyền truy cập danh sách người dùng')
      }
      throw new Error(error.response?.data || 'Không thể tải danh sách người dùng')
    }
  },

  async getCurrentUser(): Promise<User> {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Không tìm thấy token')
      }

      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response.data
    } catch (error: any) {
      console.error('Lỗi khi lấy thông tin người dùng:', error.response || error)
      throw new Error(error.response?.data || 'Không thể lấy thông tin người dùng')
    }
  },

  async getUserById(id: number): Promise<User> {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Không tìm thấy token')
      }

      const response = await axios.get(`${API_URL}/users/find/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response.data
    } catch (error: any) {
      console.error('Lỗi khi lấy thông tin người dùng:', error.response || error)
      throw new Error(error.response?.data || 'Không thể tải thông tin người dùng')
    }
  },

  async createUser(data: Partial<User>): Promise<User> {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Không tìm thấy token')
      }

      // Chuyển đổi role ID theo định dạng của backend
      let roleId: number;
      switch (data.role) {
        case 'ROLE_ADMIN':
          roleId = 3; // admin
          break;
        case 'ROLE_TEACHER':
          roleId = 2; // teacher
          break;
        case 'ROLE_USER':
          roleId = 1; // student
          break;
        default:
          roleId = 1; // mặc định là student
      }

      // Log để debug
      console.log('Converting role to ID:', { role: data.role, roleId });

      // Định dạng dữ liệu theo yêu cầu của backend
      const userData = {
        name: data.name,
        email: data.email,
        password: data.password,
        code: data.code,
        phoneNumber: data.phoneNumber,
        className: data.className || null,
        gender: data.gender || null,
        role: {
          id: roleId
        },
        isEnabled: data.isEnabled
      }

      console.log('Creating user with data:', userData);

      const response = await axios.post(`${API_URL}/users/create`, userData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      console.log('Server response:', response.data);
      return response.data
    } catch (error: any) {
      console.error('Lỗi khi tạo người dùng:', error.response || error)
      if (error.response?.status === 403) {
        throw new Error('Bạn không có quyền tạo người dùng mới. Vui lòng đăng nhập với tài khoản admin.')
      }
      const errorMessage = error.response?.data || 'Không thể tạo người dùng'
      throw new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage))
    }
  },

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Không tìm thấy token')
      }

      console.log('Updating user with data:', data);

      const response = await axios.put(`${API_URL}/users/update/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      console.log('Server response:', response.data);
      return response.data
    } catch (error: any) {
      console.error('Lỗi khi cập nhật người dùng:', error.response || error)
      throw new Error(error.response?.data || 'Không thể cập nhật người dùng')
    }
  },

  async deleteUser(id: number): Promise<void> {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Không tìm thấy token')
      }

      await axios.delete(`${API_URL}/users/delete/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    } catch (error: any) {
      console.error('Lỗi khi xóa người dùng:', error.response || error)
      throw new Error(error.response?.data || 'Không thể xóa người dùng')
    }
  }
} 
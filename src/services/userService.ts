import axios from 'axios'
import type { User } from './types'

const API_URL = 'http://localhost:8080'

export const userService = {
  async getUsers(): Promise<User[]> {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:8080/users/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response.data
    } catch (error) {
      throw error
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

  async createUser(userData: Partial<User>): Promise<User> {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Không tìm thấy token')
      }

      // Chuyển đổi role ID theo định dạng của backend
      let roleId: number;
      switch (userData.role) {
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

      // Định dạng dữ liệu theo yêu cầu của backend
      const formattedData = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        code: userData.code,
        phoneNumber: userData.phoneNumber,
        className: userData.className || null,
        gender: userData.gender || null,
        role: {
          id: roleId
        },
        isEnabled: userData.isEnabled,
        image: userData.image || "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg"
      }

      const response = await fetch(`${API_URL}/users/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formattedData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = 'Không thể tạo người dùng'
        
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.message || errorMessage
        } catch (e) {
          // Nếu không parse được JSON, sử dụng text response
          errorMessage = errorText || errorMessage
        }

        if (response.status === 403) {
          errorMessage = 'Bạn không có quyền tạo người dùng mới. Vui lòng đăng nhập với tài khoản admin.'
        }

        throw new Error(errorMessage)
      }

      const responseText = await response.text()
      if (!responseText) {
        throw new Error('Không nhận được dữ liệu từ server')
      }

      try {
        return JSON.parse(responseText)
      } catch (e) {
        throw new Error('Dữ liệu trả về không hợp lệ')
      }
    } catch (error: any) {
      throw new Error(error.message || 'Không thể tạo người dùng')
    }
  },

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Không tìm thấy token')
      }

      const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Không thể cập nhật người dùng')
      }

      return await response.json()
    } catch (error: any) {
      throw new Error(error.message || 'Không thể cập nhật người dùng')
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
  },

  async updateUserImage(userId: number, formData: FormData): Promise<User> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    try {
      const response = await fetch(`${API_URL}/users/update/${userId}/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user image');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user image:', error);
      throw error;
    }
  }
} 
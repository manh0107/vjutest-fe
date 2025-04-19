import axios from 'axios'

const API_URL = 'http://localhost:8080'

export interface User {
  id: number
  username: string
  email: string
  role: string
}

export const userService = {
  async getAllUsers(): Promise<User[]> {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }

    const response = await axios.get(`${API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  async getUserById(id: number): Promise<User> {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }

    const response = await axios.get(`${API_URL}/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }

    const response = await axios.put(`${API_URL}/users/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  async deleteUser(id: number): Promise<void> {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }

    await axios.delete(`${API_URL}/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
} 
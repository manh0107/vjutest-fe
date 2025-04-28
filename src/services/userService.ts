import { User } from './types'
import { axiosInstance } from './axiosInstance'

interface CreateUserRequest {
  name?: string;
  email?: string;
  code?: number;
  phoneNumber?: number;
  password?: string;
  gender?: string;
  image?: string;
  isEnabled?: boolean;
  department?: { id: number };
  major?: { id: number };
  role: { id: number };
}

export const userService = {
  // Get all users
  getUsers: async () => {
    const response = await axiosInstance.get('/users/all')
    return response.data
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await axiosInstance.get('/auth/me')
    return response.data
  },

  // Get user by ID
  getUserById: async (id: number) => {
    const response = await axiosInstance.get(`/users/find/${id}`)
    return response.data
  },

  // Create new user
  createUser: async (userData: CreateUserRequest, userId: number) => {
    const response = await axiosInstance.post(`/users/create?userId=${userId}`, userData)
    return response.data
  },

  // Update user
  updateUser: async (id: number, userData: Partial<User>, userId: number) => {
    const response = await axiosInstance.put(`/users/update/${id}?userId=${userId}`, userData)
    return response.data
  },

  // Delete user
  deleteUser: async (id: number) => {
    const response = await axiosInstance.delete(`/users/delete/${id}`)
    return response.data
  },

  // Update user image
  updateUserImage: async (userId: number, formData: FormData) => {
    const response = await axiosInstance.post(`/users/${userId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Get classes created by user
  getUserCreatedClasses: async (userId: number) => {
    const response = await axiosInstance.get(`/users/${userId}/created-classes`)
    return response.data
  },

  // Get subjects created by user
  getUserCreatedSubjects: async (userId: number) => {
    const response = await axiosInstance.get(`/users/${userId}/created-subjects`)
    return response.data
  },

  // Get exams created by user
  getUserCreatedExams: async (userId: number) => {
    const response = await axiosInstance.get(`/users/${userId}/created-exams`)
    return response.data
  },

  // Get questions created by user
  getUserCreatedQuestions: async (userId: number) => {
    const response = await axiosInstance.get(`/users/${userId}/created-questions`)
    return response.data
  },

  // Get classes where user is teaching
  getTeacherClasses: async (userId: number) => {
    const response = await axiosInstance.get(`/users/${userId}/teaching-classes`)
    return response.data
  }
} 
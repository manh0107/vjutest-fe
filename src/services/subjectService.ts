import axios from 'axios'
import { authService } from './authService'

axios.defaults.baseURL = 'http://localhost:8080'; // Đảm bảo mọi request trỏ về BE

export interface Subject {
  id: number
  name: string
  subjectCode: string
  description: string
  creditHour: number
  createdAt: string
  createdById: number
  createdByName: string
  exams: any[] // You can define a proper Exam interface if needed
  majorId?: number
  majorIds?: number[]
  departmentIds?: number[]
  visibility: 'PUBLIC' | 'DEPARTMENT' | 'MAJOR'
}

interface UserInfo {
  id: number
  name: string
}

export interface CreateSubjectData {
  name: string
  subjectCode: string
  description: string
  creditHour: number
  visibility: 'PUBLIC' | 'DEPARTMENT' | 'MAJOR'
  departmentIds?: number[]
  majorIds?: number[]
}

export interface UpdateSubjectData {
  name?: string
  subjectCode?: string
  description?: string
  creditHour?: number
  majorId?: number
}

export const subjectService = {
  async getAllSubjects(): Promise<Subject[]> {
    try {
      const token = await authService.getValidToken()
      const response = await axios.get('/subjects/all', {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error: any) {
      console.error('Lỗi khi lấy danh sách môn học:', error)
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách môn học')
    }
  },

  async getSubjectById(id: number): Promise<Subject> {
    try {
      const token = await authService.getValidToken()
      const response = await axios.get(`/subjects/find/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error: any) {
      console.error('Lỗi khi lấy thông tin môn học:', error)
      throw new Error(error.response?.data?.message || 'Không thể lấy thông tin môn học')
    }
  },

  async createSubject(data: CreateSubjectData): Promise<Subject> {
    try {
      const token = await authService.getValidToken()
      const response = await axios.post('/subjects/create', data, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error: any) {
      console.error('Lỗi khi tạo môn học:', error)
      throw new Error(error.response?.data?.message || 'Không thể tạo môn học')
    }
  },

  async updateSubject(id: number, data: UpdateSubjectData): Promise<Subject> {
    try {
      const token = await authService.getValidToken()
      const response = await axios.put(`/subjects/update/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error: any) {
      console.error('Lỗi khi cập nhật môn học:', error)
      throw new Error(error.response?.data?.message || 'Không thể cập nhật môn học')
    }
  },

  async deleteSubject(id: number): Promise<void> {
    try {
      const token = await authService.getValidToken()
      await axios.delete(`/subjects/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch (error: any) {
      console.error('Lỗi khi xóa môn học:', error)
      throw new Error(error.response?.data?.message || 'Không thể xóa môn học')
    }
  },

  async getSubjectsInClass(classId: number): Promise<Subject[]> {
    try {
      const token = await authService.getValidToken();
      const response = await axios.get(`/classes/${classId}/subjects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      console.error('Lỗi khi lấy danh sách môn học trong lớp:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách môn học trong lớp');
    }
  },

  async getTeacherSubjects(): Promise<Subject[]> {
    try {
      const token = await authService.getValidToken()
      const response = await axios.get('/subjects/all', {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error: any) {
      console.error('Lỗi khi lấy danh sách môn học của giảng viên:', error)
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách môn học của giảng viên')
    }
  }
} 
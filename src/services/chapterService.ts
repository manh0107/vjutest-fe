import axios from 'axios'
import { authService } from './authService'

axios.defaults.baseURL = 'http://localhost:8080'; // Đảm bảo mọi request trỏ về BE

export interface Chapter {
  id: string
  name: string
  subject: {
    id: string
    name: string
  }
  createdById: string
  createdByName: string
  modifiedById: string
  modifiedByName: string
  createdAt: string
  modifiedAt: string
  questionTotal: number
}

export const chapterService = {
  async getChapters(subjectId: string): Promise<Chapter[]> {
    try {
      const token = await authService.getValidToken()
      const response = await axios.get(`/chapters/subject/${subjectId}/all`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error: any) {
      console.error('Lỗi khi lấy danh sách chương học:', error)
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách chương học')
    }
  },

  async createChapter(name: string, subjectId: string): Promise<Chapter> {
    try {
      const token = await authService.getValidToken()
      const response = await axios.post('/chapters/create', null, {
        params: {
          name,
          subjectId
        },
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error: any) {
      console.error('Lỗi khi tạo chương học:', error)
      throw new Error(error.response?.data?.message || 'Không thể tạo chương học')
    }
  },

  async updateChapter(id: string, name: string): Promise<Chapter> {
    try {
      const token = await authService.getValidToken()
      const response = await axios.put(`/chapters/update/${id}`, null, {
        params: {
          name
        },
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error: any) {
      console.error('Lỗi khi cập nhật chương học:', error)
      throw new Error(error.response?.data?.message || 'Không thể cập nhật chương học')
    }
  },

  async deleteChapter(id: string): Promise<void> {
    try {
      const token = await authService.getValidToken()
      await axios.delete(`/chapters/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch (error: any) {
      console.error('Lỗi khi xóa chương học:', error)
      throw new Error(error.response?.data?.message || 'Không thể xóa chương học')
    }
  }
} 
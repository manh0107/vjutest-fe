import axios from 'axios'
import { authService } from './authService'
import { API_URL } from './config'

axios.defaults.baseURL = 'http://localhost:8080'

export interface Question {
  id: number
  name: string
  difficulty: number
  isPublic?: boolean
  isCompleted?: boolean
  chapterId?: number
  chapterName?: string
  createdAt?: string
  updatedAt?: string
  createdById?: number
  createdByName?: string
  modifiedById?: number
  modifiedByName?: string
  imageUrl?: string
}

export interface CreateQuestionData {
  name: string
  difficulty: number
  chapterId: number
  imageFile?: File
}

export interface UpdateQuestionRequest {
  name: string
  difficulty: number
}

export const questionService = {

  async createQuestion(formData: FormData) {
    try {
      const token = await authService.getValidToken()
      
      // Do not modify the FormData with transformRequest
      const response = await axios.post(`${API_URL}/questions/create`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          // Let the browser set the correct Content-Type with boundary for multipart/form-data
        }
      })
      return response.data
    } catch (error: any) {
      console.error('Error creating question:', error)
      throw new Error(error.response?.data?.message || 'Không thể tạo câu hỏi')
    }
  },

  async updateQuestion(id: number, formData: FormData): Promise<Question> {
    try {
      const token = await authService.getValidToken()
      
      // Do not modify the FormData with transformRequest
      const response = await axios.put(`${API_URL}/questions/update/${id}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          // Let the browser set the correct Content-Type with boundary for multipart/form-data
        }
      })
      return response.data
    } catch (error: any) {
      console.error('Error updating question:', error)
      throw new Error(error.response?.data?.message || 'Không thể cập nhật câu hỏi')
    }
  },

  async deleteQuestion(id: number): Promise<void> {
    try {
      const token = await authService.getValidToken()
      await axios.delete(`${API_URL}/questions/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch (error: any) {
      console.error('Lỗi khi xóa câu hỏi:', error)
      throw new Error(error.response?.data?.message || 'Không thể xóa câu hỏi')
    }
  },

  async getQuestionsByChapter(chapterId: number): Promise<Question[]> {
    try {
      const token = await authService.getValidToken()
      const response = await axios.get(`${API_URL}/questions/by-chapter/${chapterId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error: any) {
      console.error('Lỗi khi lấy danh sách câu hỏi theo chương:', error)
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách câu hỏi theo chương')
    }
  }
}
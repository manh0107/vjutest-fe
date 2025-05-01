import axios from 'axios'
import { authService } from './authService'
import { API_URL } from './config'

axios.defaults.baseURL = 'http://localhost:8080'

export interface Answer {
  id: number
  answerName: string
  isCorrect: boolean
  questionId: number
  createdAt?: string
  updatedAt?: string
  imageUrl?: string
  image?: File | null
  isNew?: boolean
  isEdited?: boolean
  isDeleted?: boolean
}

export interface CreateAnswerRequest {
  answerName: string
  isCorrect: boolean
  questionId: number
  imageFile?: File
}

export interface CreateAnswerData {
  answerName: string
  isCorrect: boolean
  questionId: number
}

export const answerService = {
  async getAnswersByQuestion(questionId: number): Promise<Answer[]> {
    try {
      const token = await authService.getValidToken()
      const response = await axios.get(`${API_URL}/answers/by-question/${questionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error: any) {
      console.error('Error fetching answers:', error)
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách đáp án')
    }
  },

  async createAnswers(questionId: number, formData: FormData): Promise<Answer[]> {
    try {
      const token = await authService.getValidToken()
      console.log('Creating answers with token:', token)
      console.log('FormData contents:', {
        answers: formData.get('answers'),
        imageFiles: formData.get('imageFiles'),
        questionId
      })
      
      const response = await axios.post(`${API_URL}/answers/create?questionId=${questionId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error: any) {
      console.error('Error creating answers:', error)
      console.error('Error response:', error.response?.data)
      throw new Error(error.response?.data?.message || 'Không thể tạo đáp án')
    }
  },

  async updateAnswer(id: number, formData: FormData, questionId: number): Promise<Answer> {
    try {
      const token = await authService.getValidToken()
      const response = await axios.put(`${API_URL}/answers/update/${id}?questionId=${questionId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error: any) {
      console.error('Error updating answer:', error)
      throw new Error(error.response?.data?.message || 'Không thể cập nhật đáp án')
    }
  },

  async deleteAnswer(id: number): Promise<void> {
    try {
      const token = await authService.getValidToken()
      await axios.delete(`${API_URL}/answers/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch (error: any) {
      console.error('Error deleting answer:', error)
      throw new Error(error.response?.data?.message || 'Không thể xóa đáp án')
    }
  },

  async createSingleAnswer(questionId: number, formData: FormData): Promise<Answer> {
    try {
      const token = await authService.getValidToken()
      console.log('Creating single answer with token:', token)
      console.log('FormData contents:', {
        answer: formData.get('answer'),
        imageFile: formData.get('imageFile'),
        questionId
      })
      
      const response = await axios.post(`${API_URL}/answers/create-single?questionId=${questionId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error: any) {
      console.error('Error creating answer:', error)
      console.error('Error response:', error.response?.data)
      throw new Error(error.response?.data?.message || 'Không thể tạo đáp án')
    }
  },
}
import api from './axios'
import { authService } from './authService'
import { API_URL } from './config'

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
      const response = await api.get(`/answers/by-question/${questionId}`)
      return response.data
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error('Bạn không có quyền truy cập danh sách đáp án này')
      }
      if (error.response?.status === 404) {
        throw new Error('Không tìm thấy câu hỏi')
      }
      console.error('Error fetching answers:', error)
      throw error
    }
  },

  async createAnswers(questionId: number, formData: FormData): Promise<Answer[]> {
    try {
      const response = await api.upload(`/answers/create?questionId=${questionId}`, formData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating answers:', error);
      throw new Error(error.response?.data?.message || 'Không thể tạo đáp án');
    }
  },

  async updateAnswer(id: number, formData: FormData, questionId: number): Promise<Answer> {
    try {
      const token = await authService.getValidToken()
      const response = await api.put(`${API_URL}/answers/update/${id}?questionId=${questionId}`, formData, {
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
      await api.delete(`${API_URL}/answers/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch (error: any) {
      console.error('Error deleting answer:', error)
      throw new Error(error.response?.data?.message || 'Không thể xóa đáp án')
    }
  },

  async createSingleAnswer(questionId: number, formData: FormData): Promise<Answer> {
    try {
      const response = await api.upload(`/answers/create-single?questionId=${questionId}`, formData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating answer:', error);
      throw new Error(error.response?.data?.message || 'Không thể tạo đáp án');
    }
  },
}
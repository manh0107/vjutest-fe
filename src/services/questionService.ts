import axios from 'axios'
import { authService } from './authService'
import { API_URL } from './config'
import { examService } from './examService'
import api from './axios'

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
  },

  async createQuestionInExam(formData: FormData, answers: { content: string; isCorrect: boolean }[]) {
    try {
      const token = await authService.getValidToken();
      formData.append('answers', JSON.stringify(answers));
      const response = await axios.post(`${API_URL}/questions/create-in-exam`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error creating question in exam:', error);
      throw new Error(error.response?.data?.message || 'Không thể tạo câu hỏi trong bài kiểm tra');
    }
  },

  async getQuestionsByExam(examId: number): Promise<Question[]> {
    try {
      const response = await api.get(`${API_URL}/questions/exam/${examId}`);
      return response.data;
    } catch (error: any) {
      console.error('Lỗi khi lấy danh sách câu hỏi theo bài kiểm tra:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách câu hỏi theo bài kiểm tra');
    }
  },

  async updateQuestionInExam(
    questionId: number,
    examId: number,
    questionData: {
      name: string;
      difficulty: number;
      examQuestions: { point: number }[];
    },
    imageFile?: File
  ): Promise<Question> {
    try {
      const token = await authService.getValidToken()
      const formData = new FormData()
      formData.append('question', new Blob([JSON.stringify(questionData)], { type: 'application/json' }))
      if (imageFile) {
        formData.append('imageFile', imageFile)
      }
      const response = await api.put(`${API_URL}/questions/update-in-exam/${questionId}?examId=${examId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error: any) {
      console.error('Error updating question in exam:', error)
      throw new Error(error.response?.data?.message || 'Không thể cập nhật câu hỏi trong bài kiểm tra')
    }
  },

  async deleteQuestionFromExam(questionId: number, examId: number): Promise<void> {
    try {
      await examService.deleteQuestionFromExam(questionId, examId);
    } catch (error: any) {
      console.error('Lỗi khi xóa câu hỏi khỏi bài kiểm tra:', error);
      throw new Error(error.response?.data?.message || 'Không thể xóa câu hỏi khỏi bài kiểm tra');
    }
  },

  duplicateQuestion: async (examId: number, questionId: number) => {
    try {
      const token = await authService.getValidToken();
      const response = await axios.post(`${API_URL}/questions/exams/${examId}/questions/${questionId}/duplicate`, null, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error duplicating question:', error);
      throw new Error(error.response?.data?.message || 'Không thể nhân bản câu hỏi');
    }
  },

  updateQuestionsOrder: async (examId: number, questionIds: number[]) => {
    const response = await fetch(`${API_URL}/exams/${examId}/questions/order`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ questionIds }),
    });
    if (!response.ok) throw new Error('Failed to update questions order');
    return response.json();
  },

  getQuestionById: async (questionId: number) => {
    const response = await fetch(`${API_URL}/questions/${questionId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) throw new Error('Failed to get question');
    return response.json();
  },
}
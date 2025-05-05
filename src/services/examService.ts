import api from './axios'
import { authService } from './authService'

// Cache for storing API responses
const responseCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Helper function to check cache
const getFromCache = (key: string) => {
  const cached = responseCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  return null
}

// Helper function to set cache
const setCache = (key: string, data: any) => {
  responseCache.set(key, { data, timestamp: Date.now() })
}

// Helper function to clear cache
const clearCache = () => {
  responseCache.clear()
}

export interface Question {
  id: number
  content: string
  options: string[]
  correctAnswer: number
  examId: number
}

export interface Exam {
  id: number
  name: string
  examCode: string
  description: string
  durationTime: number
  passScore: number
  isPublic: boolean
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED'
  startAt: string | null
  endAt: string | null
  subject: {
    id: number
    name: string
    code: string
  }
  totalQuestions: number
  createdAt: string
  createdBy: {
    id: number
    name: string
  }
}

export interface CreateExamData {
  name: string
  examCode?: string
  description: string
  durationTime: number
  passScore: number
  isPublic: boolean
  visibility?: 'PUBLIC' | 'DEPARTMENT' | 'MAJOR'
  departmentIds?: number[]
  majorIds?: number[]
}

export interface UpdateExamData extends CreateExamData {
  status?: 'DRAFT' | 'PUBLISHED' | 'CLOSED'
  startAt?: string
  endAt?: string
}

export interface ExamSubmission {
  examId: number
  answers: Array<{
    questionId: number
    selectedOption: number
  }>
}

export interface ExamResult {
  examId: number
  score: number
  totalQuestions: number
  correctAnswers: number
  submittedAt: string
}

export const examService = {
  // Lấy danh sách bài kiểm tra công khai theo môn học
  async getPublicExams(subjectId: number): Promise<Exam[]> {
    const cacheKey = `public-exams-${subjectId}`
    const cachedData = getFromCache(cacheKey)
    if (cachedData) {
      return cachedData
    }

    try {
      const response = await api.get(`/exams/public-exams/${subjectId}`)
      setCache(cacheKey, response.data)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách bài kiểm tra')
    }
  },

  // Lấy danh sách bài kiểm tra trong lớp học
  async getClassExams(classId: number, subjectId: number): Promise<Exam[]> {
    const cacheKey = `class-exams-${classId}-${subjectId}`
    const cachedData = getFromCache(cacheKey)
    if (cachedData) {
      return cachedData
    }

    try {
      const response = await api.get(`/exams/class/${classId}?subjectId=${subjectId}`)
      setCache(cacheKey, response.data)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách bài kiểm tra')
    }
  },

  // Tạo bài kiểm tra công khai
  async createPublicExam(subjectId: number, examData: CreateExamData, departmentIds?: number[], majorIds?: number[]): Promise<Exam> {
    try {
      const response = await api.post(`/exams/create-without-class?subjectId=${subjectId}${departmentIds ? `&departmentIds=${departmentIds.join(',')}` : ''}${majorIds ? `&majorIds=${majorIds.join(',')}` : ''}`, examData)
      clearCache() // Xóa cache sau khi tạo bài kiểm tra thành công
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể tạo bài kiểm tra')
    }
  },

  // Tạo bài kiểm tra trong lớp học
  async createClassExam(classId: number, subjectId: number, examData: CreateExamData): Promise<Exam> {
    try {
      const response = await api.post(`/exams/create?classId=${classId}&subjectId=${subjectId}`, examData)
      clearCache() // Xóa cache sau khi tạo bài kiểm tra thành công
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể tạo bài kiểm tra')
    }
  },

  // Lấy thông tin bài kiểm tra theo ID
  async getExamById(examId: number): Promise<Exam> {
    try {
      const response = await api.get(`/exams/find/${examId}`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể lấy thông tin bài kiểm tra')
    }
  },

  // Cập nhật trạng thái bài kiểm tra
  async updateExamStatus(
    examId: number,
    status: 'DRAFT' | 'PUBLISHED' | 'CLOSED',
    startAt?: string,
    endAt?: string,
    passPercent?: number,
    durationTime?: number
  ): Promise<Exam> {
    try {
      const response = await api.put(`/exams/${examId}/status`, {
        newStatus: status,
        startAt,
        endAt,
        passPercent,
        durationTime
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể cập nhật trạng thái bài kiểm tra');
    }
  },

  // Cập nhật bài kiểm tra
  async updateExam(examId: number, data: UpdateExamData): Promise<Exam> {
    try {
      const response = await api.put(`/exams/update/${examId}`, data)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể cập nhật bài kiểm tra')
    }
  },

  // Xóa bài kiểm tra
  async deleteExam(examId: number): Promise<void> {
    try {
      await api.delete(`/exams/delete/${examId}`)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể xóa bài kiểm tra')
    }
  },

  // Nộp bài kiểm tra
  async submitExam(submission: ExamSubmission): Promise<ExamResult> {
    try {
      const response = await api.post(`/exams/submit-exam/${submission.examId}`, submission)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể nộp bài kiểm tra')
    }
  },

  // Lấy kết quả bài kiểm tra
  async getExamResults(examId: number): Promise<ExamResult[]> {
    try {
      const response = await api.get(`/exams/results/${examId}`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể lấy kết quả bài kiểm tra')
    }
  },

  deleteQuestionFromExam: async (questionId: number, examId: number) => {
    try {
      const token = await authService.getValidToken()
      const user = await authService.getCurrentUser()
      
      if (!token || !user) {
        throw new Error('Authentication required')
      }

      const response = await api.delete(
        `/exams/delete-question/${questionId}?examId=${examId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      return response.data
    } catch (error) {
      console.error('Error deleting question from exam:', error)
      throw error
    }
  },

  revertToDraft: async (examId: number) => {
    const token = await authService.getValidToken();
    const response = await api.put(`/exams/${examId}/to-draft`, null, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
} 
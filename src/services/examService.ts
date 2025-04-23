import axios from 'axios'

const API_URL = 'http://localhost:8080'

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
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Không tìm thấy token')
      }

      const response = await axios.get(`${API_URL}/exams/public-exams/${subjectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      setCache(cacheKey, response.data)
      return response.data
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn')
      }
      if (error.response?.status === 403) {
        throw new Error('Bạn không có quyền truy cập')
      }
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách bài kiểm tra')
    }
  },

  // Lấy danh sách bài kiểm tra trong lớp học
  async getClassExams(classId: number, subjectId: number, userId: number): Promise<Exam[]> {
    const cacheKey = `class-exams-${classId}-${subjectId}-${userId}`
    const cachedData = getFromCache(cacheKey)
    if (cachedData) {
      return cachedData
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Không tìm thấy token')
      }

      const response = await axios.get(`${API_URL}/exams/class/${classId}/subject/${subjectId}/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      setCache(cacheKey, response.data)
      return response.data
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn')
      }
      if (error.response?.status === 403) {
        throw new Error('Bạn không có quyền truy cập')
      }
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách bài kiểm tra')
    }
  },

  // Tạo bài kiểm tra công khai
  async createPublicExam(subjectId: number, userId: number, examData: CreateExamData): Promise<Exam> {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Không tìm thấy token')
      }

      const response = await axios.post(
        `${API_URL}/exams/create/subject/${subjectId}/user/${userId}`,
        examData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      return response.data
    } catch (error: any) {
      console.error('Lỗi khi tạo bài kiểm tra:', error)
      throw new Error(error.response?.data?.message || 'Không thể tạo bài kiểm tra')
    }
  },

  // Tạo bài kiểm tra trong lớp học
  async createClassExam(classId: number, subjectId: number, userId: number, examData: CreateExamData): Promise<Exam> {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Không tìm thấy token')
      }

      const response = await axios.post(
        `${API_URL}/exams/create/class/${classId}/subject/${subjectId}/user/${userId}`,
        examData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      return response.data
    } catch (error: any) {
      console.error('Lỗi khi tạo bài kiểm tra:', error)
      throw new Error(error.response?.data?.message || 'Không thể tạo bài kiểm tra')
    }
  },

  // Lấy chi tiết bài kiểm tra
  async getExamById(examId: number, userId: number): Promise<Exam> {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Không tìm thấy token')
      }

      const response = await axios.get(`${API_URL}/exams/${examId}/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response.data
    } catch (error: any) {
      console.error('Lỗi khi lấy thông tin bài kiểm tra:', error)
      throw new Error(error.response?.data?.message || 'Không thể lấy thông tin bài kiểm tra')
    }
  },

  async getExams(classId: number): Promise<Exam[]> {
    const response = await axios.get(`${API_URL}/classes/${classId}/exams`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    return response.data
  },

  async getExam(examId: number): Promise<Exam> {
    const response = await axios.get(`${API_URL}/exams/${examId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    return response.data
  },

  async createExam(data: CreateExamData): Promise<Exam> {
    const response = await axios.post(`${API_URL}/exams`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    return response.data
  },

  async updateExam(examId: number, data: UpdateExamData): Promise<Exam> {
    const response = await axios.put(`${API_URL}/exams/${examId}`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    return response.data
  },

  async deleteExam(examId: number): Promise<void> {
    await axios.delete(`${API_URL}/exams/${examId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
  },

  async submitExam(submission: ExamSubmission): Promise<ExamResult> {
    const response = await axios.post(
      `${API_URL}/exams/${submission.examId}/submit`,
      submission,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    )
    return response.data
  },

  async getExamResults(examId: number): Promise<ExamResult[]> {
    const response = await axios.get(`${API_URL}/exams/${examId}/results`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    return response.data
  },
} 
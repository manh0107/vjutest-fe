import axios from 'axios'

const API_URL = 'http://localhost:8080/api'

export interface Question {
  id: number
  content: string
  options: string[]
  correctAnswer: number
  examId: number
}

export interface Exam {
  id: number
  title: string
  description: string
  duration: number
  classId: number
  createdAt: string
  updatedAt: string
  questions: Question[]
}

export interface CreateExamData {
  title: string
  description: string
  duration: number
  classId: number
  questions: Array<{
    content: string
    options: string[]
    correctAnswer: number
  }>
}

export interface UpdateExamData {
  title?: string
  description?: string
  duration?: number
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
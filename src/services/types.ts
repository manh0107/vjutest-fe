export type Role = 'ROLE_ADMIN' | 'ROLE_USER' | 'ROLE_TEACHER' | { name: string }

export interface User {
  id: number
  name: string
  email: string
  code: string
  phoneNumber: string | number
  className?: string
  gender?: string
  role: string | { id: number, name: string }
  password?: string
  createdAt?: string
  isEnabled: boolean
  image?: string
}

export interface Class {
  id: number
  name: string
  description: string
  subjectId: number
  subjectName: string
  teacherId: number
  teacherName: string
  studentCount: number
  createdAt: string
  updatedAt: string
}

export interface Subject {
  id: number
  name: string
  description: string
  createdAt: string
  updatedAt: string
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

export interface Question {
  id: number
  content: string
  type: string
  options: string[]
  correctAnswer: string
  examId: number
  createdAt: string
  updatedAt: string
}

export interface UserAnswer {
  id: number
  userId: number
  questionId: number
  answer: string
  isCorrect: boolean
  createdAt: string
  updatedAt: string
}

export interface ClassEntity {
  id: number
  name: string
  description: string
  classCode: string
  createdAt: string
  createdBy: User
  users: User[]
  teachers: User[]
  classSubjects: ClassSubject[]
}

export interface ClassSubject {
  id: number
  classEntity: ClassEntity
  subject: Subject
  documentUrl?: string
  googleDriveFolderId?: string
  exams: Exam[]
} 
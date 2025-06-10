export type Role = 'ROLE_ADMIN' | 'ROLE_USER' | 'ROLE_TEACHER' | 'admin' | 'teacher' | 'student' | { name: string }

export interface User {
  id: number
  name: string
  email: string
  code?: number
  phoneNumber?: number
  gender?: string
  imageUrl?: string
  role: Role
  password?: string
  className?: string
  department?: {
    id: number
    name: string
  }
  major?: {
    id: number
    name: string
  }
  isEnabled: boolean
  createdAt: string
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
  difficulty: string
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
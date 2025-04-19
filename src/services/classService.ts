import axios from 'axios'

const API_URL = 'http://localhost:8080'

export interface Class {
  id: number
  name: string
  description: string
  subjectName: string
  studentCount: number
  teacherName: string
  createdAt: string
}

export interface CreateClassData {
  name: string
  description: string
  subjectId: number
}

export interface UpdateClassData {
  name?: string
  description?: string
  subjectId?: number
}

export const classService = {
  async getClasses(): Promise<Class[]> {
    const response = await axios.get(`${API_URL}/classes`)
    return response.data
  },

  async getClass(id: number): Promise<Class> {
    const response = await axios.get(`${API_URL}/classes/${id}`)
    return response.data
  },

  async createClass(data: CreateClassData): Promise<Class> {
    const response = await axios.post(`${API_URL}/classes`, data)
    return response.data
  },

  async updateClass(id: number, data: UpdateClassData): Promise<Class> {
    const response = await axios.put(`${API_URL}/classes/${id}`, data)
    return response.data
  },

  async deleteClass(id: number): Promise<void> {
    await axios.delete(`${API_URL}/classes/${id}`)
  },

  async joinClass(classId: number): Promise<void> {
    await axios.post(`${API_URL}/classes/${classId}/join`)
  },

  async leaveClass(classId: number): Promise<void> {
    await axios.post(`${API_URL}/classes/${classId}/leave`)
  },
} 
import api from './axios'
import { authService } from './authService'

const API_URL = 'http://localhost:8080'

export interface Class {
  id: number
  name: string
  description: string
  classCode: string
  subjectName: string
  studentCount: number
  teacherName: string
  createdAt: string
  createdById: number
  createdByName: string
  createByImage: string | null
  userImage: string | null
  teacherImage: string | null
  users: {
    id: number
    name: string
    code: number
    phoneNumber: number
    className: string
    gender: string
    email: string
    image: string
    role: string
    classes: any[]
    joinRequests: any[]
    userAnswers: any[]
    createdAt: string
    isEnabled: boolean
  }[]
  teachers: {
    id: number
    name: string
    code: number
    phoneNumber: number
    className: string
    gender: string
    email: string
    image: string
    role: string
    createClasses: number[]
    createSubjects: any[]
    createdExams: any[]
    createdQuestions: any[]
    classes: any[]
    teacherOfClasses: number[]
    joinRequests: any[]
    userAnswers: any[]
    createdAt: string
    isEnabled: boolean
  }[]
  classSubjects: {
    id: number
    subject: {
      id: number
      name: string
      description: string
    }
    documentUrl?: string
  }[]
  exams: {
    id: number
    title: string
    description: string
  }[]
  joinRequests: JoinRequest[] | null
  visibility?: string
  departmentIds?: number
  majorIds?: number
}

export interface CreateClassData {
  name: string
  description: string
  classCode: string
  subjectId: number
}

export interface UpdateClassData {
  name: string
  description: string
  classCode: string
}

export interface JoinRequest {
  id: number
  user: {
    id: number
    name: string
  }
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
}

export const classService = {
  async getAllClasses() {
    try {
      const token = await authService.getValidToken();
      const userResponse = await api.get('/auth/me');
      const userId = userResponse.data.id;
      
      const response = await api.get(`/classes/all?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching classes:', error);
      throw error;
    }
  },

  async getClassById(id: number) {
    try {
      const response = await api.get(`/classes/find/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching class:', error);
      throw error;
    }
  },

  async createClass(data: any) {
    try {
      const response = await api.post('/classes/create', data);
      return response.data;
    } catch (error) {
      console.error('Error creating class:', error);
      throw error;
    }
  },

  async updateClass(id: number, data: any) {
    try {
      const response = await api.put(`/classes/update/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating class:', error);
      throw error;
    }
  },

  async deleteClass(id: number) {
    try {
      const response = await api.delete(`/classes/delete/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting class:', error);
      throw error;
    }
  },

  async addStudents(classId: number, studentIds: number[]) {
    try {
      const response = await api.post(`/classes/${classId}/add-students`, { studentIds });
      return response.data;
    } catch (error) {
      console.error('Error adding students:', error);
      throw error;
    }
  },

  async removeStudents(classId: number, studentIds: number[]) {
    try {
      const response = await api.post(`/classes/${classId}/remove-students`, { studentIds });
      return response.data;
    } catch (error) {
      console.error('Error removing students:', error);
      throw error;
    }
  },

  async removeSubjects(classId: number, subjectIds: number[]) {
    try {
      const response = await api.post(`/classes/${classId}/remove-subjects`, { subjectIds });
      return response.data;
    } catch (error) {
      console.error('Error removing subjects:', error);
      throw error;
    }
  },

  async joinClass(classId: number): Promise<void> {
    try {
      await api.post(`/classes/request?classId=${classId}`);
    } catch (error: any) {
      console.error('Lỗi khi tham gia lớp học:', error.response || error);
      throw new Error(error.response?.data || 'Không thể tham gia lớp học');
    }
  },

  async leaveClass(classId: number): Promise<void> {
    try {
      await api.delete(`/classes/${classId}/leave`);
    } catch (error: any) {
      console.error('Lỗi khi rời khỏi lớp học:', error.response || error);
      throw new Error(error.response?.data || 'Không thể rời khỏi lớp học');
    }
  },

  async addStudent(classId: number, userId: number): Promise<void> {
    try {
      await api.post(`/classes/${classId}/add-student?studentId=${userId}`);
    } catch (error: any) {
      console.error('Lỗi khi thêm học sinh:', error.response || error);
      throw new Error(error.response?.data || 'Không thể thêm học sinh');
    }
  },

  async removeStudent(classId: number, userId: number): Promise<void> {
    try {
      await api.delete(`/classes/${classId}/remove-student?studentId=${userId}`);
    } catch (error: any) {
      console.error('Lỗi khi xóa học sinh:', error.response || error);
      throw new Error(error.response?.data || 'Không thể xóa học sinh');
    }
  },

  async inviteTeacher(classId: number, teacherId: number): Promise<void> {
    try {
      await api.post(`/classes/${classId}/invite-teacher?inviteeId=${teacherId}`);
    } catch (error: any) {
      console.error('Lỗi khi mời giáo viên:', error.response || error);
      throw new Error(error.response?.data || 'Không thể mời giáo viên');
    }
  },

  async removeTeacher(classId: number, teacherId: number): Promise<void> {
    try {
      await api.delete(`/classes/${classId}/teachers/${teacherId}`);
    } catch (error: any) {
      console.error('Lỗi khi xóa giáo viên:', error.response || error);
      throw new Error(error.response?.data || 'Không thể xóa giáo viên');
    }
  },

  async getJoinRequests(classId: number): Promise<JoinRequest[]> {
    try {
      const response = await api.get(`/classes/${classId}/join-requests`);
      return response.data;
    } catch (error: any) {
      console.error('Lỗi khi lấy danh sách yêu cầu tham gia:', error.response || error);
      throw new Error(error.response?.data || 'Không thể lấy danh sách yêu cầu tham gia');
    }
  },

  async approveJoinRequest(classId: number, requestId: number): Promise<void> {
    try {
      await api.post(`/classes/${classId}/join-requests/${requestId}/approve`);
    } catch (error: any) {
      console.error('Lỗi khi chấp nhận yêu cầu:', error.response || error);
      throw new Error(error.response?.data || 'Không thể chấp nhận yêu cầu');
    }
  },

  async rejectJoinRequest(classId: number, requestId: number): Promise<void> {
    try {
      await api.post(`/classes/${classId}/join-requests/${requestId}/reject`);
    } catch (error: any) {
      console.error('Lỗi khi từ chối yêu cầu:', error.response || error);
      throw new Error(error.response?.data || 'Không thể từ chối yêu cầu');
    }
  },

  async removeTeachers(classId: number, teacherIds: number[]) {
    try {
      const response = await api.post(`/classes/${classId}/remove-teachers`, { teacherIds });
      return response.data;
    } catch (error) {
      console.error('Error removing teachers:', error);
      throw error;
    }
  },

  async deleteDocumentFromClass(classId: number, classSubjectId: number) {
    try {
      const response = await api.delete(`/classes/${classId}/documents/${classSubjectId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  addSubjectToClass: async (classId: number, subjectId: number) => {
    try {
      const token = await authService.getValidToken()
      const userResponse = await api.get('/auth/me')
      const userId = userResponse.data.id

      const response = await api.post(`/classes/add/${classId}/subjects/${subjectId}?userId=${userId}`)
      return response.data
    } catch (error) {
      console.error('Error adding subject to class:', error)
      throw error
    }
  },
};
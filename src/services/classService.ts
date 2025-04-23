import axios from 'axios'

const API_URL = 'http://localhost:8080'

// Tạo instance axios với cấu hình mặc định
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Thêm interceptor để tự động thêm token vào mỗi request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

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
    subjectName: string
  }[]
  exams: {
    id: number
    title: string
    description: string
  }[]
  joinRequests: JoinRequest[] | null
}

export interface CreateClassData {
  name: string
  description: string
  classCode: string
  subjectId: number
}

export interface UpdateClassData {
  name?: string
  description?: string
  classCode?: string
  subjectId?: number
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
  async getClasses(): Promise<Class[]> {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        throw new Error('Không tìm thấy token')
      }

      // Log token để debug
      console.log('Token:', token)
      
      try {
        // Gọi API /auth/me để lấy userId
        const userResponse = await axios.get(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true
        })
        
        const userId = userResponse.data.id
        console.log('User ID from /auth/me:', userId)
        
        // Log headers để debug
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
        console.log('Request headers:', headers)

        // Gọi API /classes/all với cả token và userId
        const response = await axios.get(`${API_URL}/classes/all?userId=${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true
        })

        console.log('Classes response:', response.data)
        return response.data
      } catch (parseError) {
        console.error('Lỗi khi lấy thông tin người dùng:', parseError)
        throw new Error('Không thể lấy thông tin người dùng')
      }
    } catch (error: any) {
      console.error('Lỗi khi lấy danh sách lớp học:', error.response || error)
      if (error.response?.status === 403) {
        // Log thêm thông tin về lỗi 403
        console.error('Chi tiết lỗi 403:', {
          status: error.response.status,
          headers: error.response.headers,
          data: error.response.data
        })
        throw new Error('Bạn không có quyền truy cập danh sách lớp học. Vui lòng kiểm tra lại quyền của tài khoản.')
      }
      throw new Error(error.response?.data || 'Không thể tải danh sách lớp học')
    }
  },

  async getClass(id: number): Promise<Class> {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Không tìm thấy token')
      }

      const response = await axios.get(`${API_URL}/classes/find/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response.data
    } catch (error: any) {
      console.error('Lỗi khi lấy thông tin lớp học:', error.response || error)
      throw new Error(error.response?.data || 'Không thể tải thông tin lớp học')
    }
  },

  async createClass(data: CreateClassData): Promise<Class> {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Không tìm thấy token')
      }

      const response = await axios.post(`${API_URL}/classes/create`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      return response.data
    } catch (error: any) {
      console.error('Lỗi khi tạo lớp học:', error.response || error)
      if (error.response?.status === 403) {
        throw new Error('Bạn không có quyền tạo lớp học mới')
      }
      throw new Error(error.response?.data || 'Không thể tạo lớp học')
    }
  },

  async updateClass(id: number, data: UpdateClassData): Promise<Class> {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Không tìm thấy token')
      }

      const response = await axios.put(`${API_URL}/classes/update/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      return response.data
    } catch (error: any) {
      console.error('Lỗi khi cập nhật lớp học:', error.response || error)
      throw new Error(error.response?.data || 'Không thể cập nhật lớp học')
    }
  },

  async deleteClass(id: number): Promise<void> {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Không tìm thấy token')
      }

      await axios.delete(`${API_URL}/classes/delete/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    } catch (error: any) {
      console.error('Lỗi khi xóa lớp học:', error.response || error)
      throw new Error(error.response?.data || 'Không thể xóa lớp học')
    }
  },

  async joinClass(classId: number): Promise<void> {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Không tìm thấy token')
      }

      await axios.post(`${API_URL}/classes/request?classId=${classId}`, null, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    } catch (error: any) {
      console.error('Lỗi khi tham gia lớp học:', error.response || error)
      throw new Error(error.response?.data || 'Không thể tham gia lớp học')
    }
  },

  async leaveClass(classId: number): Promise<void> {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Không tìm thấy token')
      }

      await axios.delete(`${API_URL}/classes/${classId}/leave`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    } catch (error: any) {
      console.error('Lỗi khi rời khỏi lớp học:', error.response || error)
      throw new Error(error.response?.data || 'Không thể rời khỏi lớp học')
    }
  },

  async addStudent(classId: number, userId: number): Promise<void> {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Không tìm thấy token')
      }

      await axios.post(`${API_URL}/classes/${classId}/add-student?studentId=${userId}`, null, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    } catch (error: any) {
      console.error('Lỗi khi thêm học sinh:', error.response || error)
      throw new Error(error.response?.data || 'Không thể thêm học sinh')
    }
  },

  async removeStudent(classId: number, userId: number): Promise<void> {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Không tìm thấy token')
      }

      await axios.delete(`${API_URL}/classes/${classId}/remove-student?studentId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    } catch (error: any) {
      console.error('Lỗi khi xóa học sinh:', error.response || error)
      throw new Error(error.response?.data || 'Không thể xóa học sinh')
    }
  },

  async inviteTeacher(classId: number, teacherId: number): Promise<void> {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Không tìm thấy token')
      }

      await axios.post(`${API_URL}/classes/${classId}/invite-teacher?inviteeId=${teacherId}`, null, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    } catch (error: any) {
      console.error('Lỗi khi mời giáo viên:', error.response || error)
      throw new Error(error.response?.data || 'Không thể mời giáo viên')
    }
  },

  async removeTeacher(classId: number, teacherId: number): Promise<void> {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Không tìm thấy token')
      }

      await axios.delete(`${API_URL}/classes/${classId}/teachers/${teacherId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    } catch (error: any) {
      console.error('Lỗi khi xóa giáo viên:', error.response || error)
      throw new Error(error.response?.data || 'Không thể xóa giáo viên')
    }
  },

  async getJoinRequests(classId: number): Promise<JoinRequest[]> {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Không tìm thấy token')
      }

      const response = await axios.get(`${API_URL}/classes/${classId}/join-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response.data
    } catch (error: any) {
      console.error('Lỗi khi lấy danh sách yêu cầu tham gia:', error.response || error)
      throw new Error(error.response?.data || 'Không thể lấy danh sách yêu cầu tham gia')
    }
  },

  async approveJoinRequest(classId: number, requestId: number): Promise<void> {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Không tìm thấy token')
      }

      await axios.post(`${API_URL}/classes/${classId}/join-requests/${requestId}/approve`, null, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    } catch (error: any) {
      console.error('Lỗi khi phê duyệt yêu cầu:', error.response || error)
      throw new Error(error.response?.data || 'Không thể phê duyệt yêu cầu')
    }
  },

  async rejectJoinRequest(classId: number, requestId: number): Promise<void> {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Không tìm thấy token')
      }

      await axios.post(`${API_URL}/classes/${classId}/join-requests/${requestId}/reject`, null, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    } catch (error: any) {
      console.error('Lỗi khi từ chối yêu cầu:', error.response || error)
      throw new Error(error.response?.data || 'Không thể từ chối yêu cầu')
    }
  },
} 
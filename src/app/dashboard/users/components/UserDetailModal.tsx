'use client'

import React, { useEffect, useState } from 'react'
import { User } from '@/services/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { userService } from '@/services/userService'
import { toast } from 'sonner'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Modal, Table, Tabs, Tag, Avatar, Tooltip, Row, Col, Typography } from 'antd'
import type { TabsProps } from 'antd'
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  IdcardOutlined,
  BankOutlined,
  TeamOutlined,
  BookOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  InboxOutlined
} from '@ant-design/icons'
import './UserDetailModal.css'

const { TabPane } = Tabs
const { Title, Text } = Typography

interface UserDetailModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ClassRequest {
  id: number
  name: string
  classCode: string
  description?: string
  createdAt: string
  departmentName?: string
  majorName?: string
  createdById: number
  createdByName: string
}

interface UserAnswer {
  id: number
  examName: string
  score: number
  submittedAt: string
}

interface Class {
  id: number
  name: string
  subject: string
  createdAt: string
}

interface Exam {
  id: number
  name: string
  subjectName: string
  duration: number
  createdAt: string
  isPublic: boolean
  maxScore: number
}

interface Subject {
  id: number
  name: string
  code: string
  description: string
  createdAt: string
}

interface Question {
  id: number
  content: string
  type: string
  difficulty: string
  createdAt: string
  point: number
  chapterName?: string
}

const getRoleName = (role: any): string => {
  if (!role) return "N/A";
  const roleMap: Record<string, string> = {
    'ROLE_USER': 'Sinh viên',
    'ROLE_TEACHER': 'Giảng viên',
    'ROLE_ADMIN': 'Quản trị viên',
    'student': 'Sinh viên',
    'teacher': 'Giảng viên',
    'admin': 'Quản trị viên'
  };
  if (typeof role === 'string') {
    return roleMap[role] || role;
  }
  return roleMap[role.name] || role.name;
};

const getRoleColor = (role: string): string => {
  switch (role) {
    case 'ROLE_ADMIN':
    case 'admin':
      return '#f50';
    case 'ROLE_TEACHER':
    case 'teacher':
      return '#108ee9';
    default:
      return '#87d068';
  }
};

const InfoItem = ({ 
  icon, 
  label, 
  value, 
  tooltip 
}: { 
  icon: React.ReactNode;
  label: string; 
  value: string | number | null | undefined;
  tooltip?: string;
}) => (
  <div className="info-item">
    {icon}
    <div>
      <div className="text-sm text-gray-500">{label}</div>
      <Tooltip title={tooltip}>
        <div className="font-medium truncate max-w-[200px]">
          {value?.toString() || 'N/A'}
        </div>
      </Tooltip>
    </div>
  </div>
);

const StatisticCard = ({ icon, title, value, color }: { icon: React.ReactNode, title: string, value: number, color: string }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4">
    <div className={`p-3 rounded-full ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  </div>
);

export function UserDetailModal({ user, isOpen, onClose }: UserDetailModalProps) {
  const [activeTab, setActiveTab] = useState('info')
  const [loading, setLoading] = useState(false)

  // Pagination config
  const pageSize = 5

  // Data states
  const [createdClasses, setCreatedClasses] = useState<ClassRequest[]>([])
  const [createdExams, setCreatedExams] = useState<Exam[]>([])
  const [createdQuestions, setCreatedQuestions] = useState<Question[]>([])
  const [teachingClasses, setTeachingClasses] = useState<ClassRequest[]>([])

  const [formData, setFormData] = useState<Partial<User>>({
    // ... existing code ...
  })

  const [imageUrl, setImageUrl] = useState<string>('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const isTeacherOrAdmin = user?.role === 'ROLE_TEACHER' || user?.role === 'teacher' || user?.role === 'ROLE_ADMIN' || user?.role === 'admin'

  // Check if content needs scrolling
  const needsScroll = createdClasses.length > pageSize || 
                     teachingClasses.length > pageSize || 
                     createdExams.length > pageSize || 
                     createdQuestions.length > pageSize

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: vi })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500'
      case 'APPROVED':
        return 'bg-green-500'
      case 'REJECTED':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Đang chờ'
      case 'APPROVED':
        return 'Đã duyệt'
      case 'REJECTED':
        return 'Từ chối'
      default:
        return status
    }
  }

  useEffect(() => {
    if (user?.image) {
      setImageUrl(user.image)
    }
  }, [user])

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
      setImageUrl(URL.createObjectURL(e.target.files[0]))
    }
  }

  const handleUpdateImage = async () => {
    if (!user?.id) return

    try {
      setIsUploading(true)
      const formData = new FormData()
      
      if (imageFile) {
        formData.append('file', imageFile)
      } else if (imageUrl) {
        formData.append('imageUrl', imageUrl)
      }

      await userService.updateUserImage(user.id, formData)
      toast.success('Cập nhật ảnh thành công')
      onClose()
    } catch (error) {
      console.error('Error updating image:', error)
      toast.error('Không thể cập nhật ảnh')
    } finally {
      setIsUploading(false)
    }
  }

  const loadUserData = async () => {
    if (!user) return
    setLoading(true)
    try {
      if (user.role === 'ROLE_TEACHER' || user.role === 'ROLE_ADMIN') {
        console.log('Loading data for teacher/admin:', user.id)
        const [classes, exams, questions, teaching] = await Promise.all([
          userService.getUserCreatedClasses(user.id),
          userService.getUserCreatedExams(user.id),
          userService.getUserCreatedQuestions(user.id),
          user.role === 'ROLE_TEACHER' ? userService.getTeacherClasses(user.id) : Promise.resolve([])
        ])

        console.log('Loaded data:', { classes, exams, questions, teaching })
        setCreatedClasses(classes)
        setCreatedExams(exams)
        setCreatedQuestions(questions)
        setTeachingClasses(teaching)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      toast.error('Không thể tải dữ liệu người dùng')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && user) {
      loadUserData()
    }
  }, [isOpen, user])

  const renderUserInfo = () => (
    <div className="space-y-8">
      {/* Header with avatar and basic info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start space-x-6">
          <div className="relative">
            <Avatar
              size={120}
              src={user?.image}
              icon={<UserOutlined />}
              className="border-4 border-gray-100 shadow-md"
            />
            <div className="absolute -bottom-2 -right-2">
              <Tag 
                color={user?.isEnabled ? 'success' : 'error'} 
                className="rounded-full px-3 shadow-sm"
              >
                {user?.isEnabled ? 'Hoạt động' : 'Vô hiệu hóa'}
              </Tag>
            </div>
          </div>
          <div className="flex-grow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-2 text-gray-800">{user?.name}</h2>
                <Tag 
                  color={getRoleColor(typeof user?.role === 'string' ? user?.role : '')} 
                  className="rounded-full px-4 py-1 text-sm font-medium"
                >
                  {getRoleName(user?.role)}
                </Tag>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MailOutlined className="text-lg text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Email</div>
                  <div className="font-medium text-gray-800">{user?.email}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                <div className="p-2 bg-green-100 rounded-lg">
                  <PhoneOutlined className="text-lg text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Số điện thoại</div>
                  <div className="font-medium text-gray-800">{user?.phoneNumber || 'Chưa cập nhật'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Information */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-6 pb-2 border-b border-gray-200 text-gray-800">
            Thông tin học tập
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
              <div className="p-2 bg-purple-100 rounded-lg">
                <IdcardOutlined className="text-lg text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Mã số</div>
                <div className="font-medium text-gray-800">{user?.code}</div>
              </div>
            </div>
            <div className="flex items-center space-x-4 bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BankOutlined className="text-lg text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Khoa</div>
                <div className="font-medium text-gray-800">{user?.department?.name || 'Chưa cập nhật'}</div>
              </div>
            </div>
            <div className="flex items-center space-x-4 bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <BookOutlined className="text-lg text-cyan-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Ngành</div>
                <div className="font-medium text-gray-800">{user?.major?.name || 'Chưa cập nhật'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-6 pb-2 border-b border-gray-200 text-gray-800">
            Thông tin cá nhân
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <TeamOutlined className="text-lg text-indigo-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Giới tính</div>
                <div className="font-medium text-gray-800">
                  {user?.gender === 'MALE' ? 'Nam' : user?.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4 bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
              <div className="p-2 bg-red-100 rounded-lg">
                <CalendarOutlined className="text-lg text-red-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Ngày tạo</div>
                <div className="font-medium text-gray-800">
                  {user?.createdAt ? format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: vi }) : 'N/A'}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4 bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockCircleOutlined className="text-lg text-yellow-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Thời gian tạo</div>
                <div className="font-medium text-gray-800">
                  {user?.createdAt ? format(new Date(user.createdAt), 'HH:mm', { locale: vi }) : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (!user) return null

  const isStudent = user.role === 'ROLE_STUDENT'
  const isTeacher = user.role === 'ROLE_TEACHER'
  const isAdmin = user.role === 'ROLE_ADMIN'

  const classColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: '80px',
    },
    {
      title: 'Tên lớp',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Tooltip title={text}>
          <span className="font-medium text-gray-800">{text}</span>
        </Tooltip>
      ),
    }
  ]

  const subjectColumns = [
    {
      title: 'Mã môn',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Tên môn học',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Tooltip title={text}>
          <span>{text.length > 30 ? `${text.substring(0, 30)}...` : text}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => (
        <Tooltip title={text}>
          <span>{text.length > 50 ? `${text.substring(0, 50)}...` : text}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
  ]

  const examColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: '80px',
    },
    {
      title: 'Tên bài kiểm tra',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Tooltip title={text}>
          <span className="font-medium text-gray-800">{text}</span>
        </Tooltip>
      ),
    }
  ]

  const questionColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: '80px',
    },
    {
      title: 'Nội dung câu hỏi',
      dataIndex: 'content',
      key: 'content',
      render: (text: string) => (
        <Tooltip title={text}>
          <span className="font-medium text-gray-800">
            {text.length > 100 ? `${text.substring(0, 100)}...` : text}
          </span>
        </Tooltip>
      ),
    }
  ]

  const tabItems = [
    {
      key: 'info',
      label: (
        <span className="flex items-center space-x-2">
          <UserOutlined />
          <span>Thông tin cá nhân</span>
        </span>
      ),
      children: renderUserInfo()
    }
  ]

  const emptyState = {
    emptyText: (
      <div className="flex flex-col items-center py-8">
        <InboxOutlined style={{ fontSize: '48px', color: '#ccc' }} />
        <span className="text-gray-500 mt-3">Không có dữ liệu</span>
      </div>
    )
  }

  // Thêm cấu hình phân trang chung
  const paginationConfig = {
    pageSize: 5,
    showSizeChanger: true,
    showTotal: (total: number, range: [number, number]) => 
      `${range[0]}-${range[1]} trên ${total} mục`,
    pageSizeOptions: ['5', '10', '20', '50'],
    locale: {
      items_per_page: '/ trang',
      jump_to: 'Đến trang',
      jump_to_confirm: 'Xác nhận',
      page: 'Trang',
      prev_page: 'Trang trước',
      next_page: 'Trang sau',
      prev_5: '5 trang trước',
      next_5: '5 trang sau',
      prev_3: '3 trang trước',
      next_3: '3 trang sau'
    }
  }

  const showTotal = (total: number, type: string) => `Tổng số: ${total} ${type}`;

  if (user?.role === 'ROLE_TEACHER' || user?.role === 'ROLE_ADMIN' || user?.role === 'teacher' || user?.role === 'admin') {
    tabItems.push(
      {
        key: 'classes',
        label: (
          <span className="flex items-center space-x-2">
            <TeamOutlined />
            <span>Lớp học đã tạo</span>
          </span>
        ),
        children: (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium flex items-center space-x-2">
                    <TeamOutlined className="text-blue-500" />
                    <span>Danh sách lớp học đã tạo</span>
                  </h3>
                  <Tag color="blue" className="rounded-full px-3">
                    {createdClasses.length} lớp
                  </Tag>
                </div>
              </div>
              <Table
                columns={classColumns}
                dataSource={createdClasses}
                pagination={{
                  ...paginationConfig,
                  total: createdClasses.length,
                  showTotal: (total: number) => showTotal(total, 'lớp học')
                }}
                loading={loading}
                rowKey="id"
                className="custom-table"
                locale={emptyState}
              />
            </div>
          </div>
        )
      },
      {
        key: 'exams',
        label: (
          <span className="flex items-center space-x-2">
            <FileTextOutlined />
            <span>Bài kiểm tra đã tạo</span>
          </span>
        ),
        children: (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium flex items-center space-x-2">
                    <FileTextOutlined className="text-green-500" />
                    <span>Danh sách bài kiểm tra đã tạo</span>
                  </h3>
                  <Tag color="green" className="rounded-full px-3">
                    {createdExams.length} bài
                  </Tag>
                </div>
              </div>
              <Table
                columns={examColumns}
                dataSource={createdExams}
                pagination={{
                  ...paginationConfig,
                  total: createdExams.length,
                  showTotal: (total: number) => showTotal(total, 'bài kiểm tra')
                }}
                loading={loading}
                rowKey="id"
                className="custom-table"
                locale={emptyState}
              />
            </div>
          </div>
        )
      },
      {
        key: 'questions',
        label: (
          <span className="flex items-center space-x-2">
            <QuestionCircleOutlined />
            <span>Câu hỏi đã tạo</span>
          </span>
        ),
        children: (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium flex items-center space-x-2">
                    <QuestionCircleOutlined className="text-purple-500" />
                    <span>Danh sách câu hỏi đã tạo</span>
                  </h3>
                  <Tag color="purple" className="rounded-full px-3">
                    {createdQuestions.length} câu
                  </Tag>
                </div>
              </div>
              <Table
                columns={questionColumns}
                dataSource={createdQuestions}
                pagination={{
                  ...paginationConfig,
                  total: createdQuestions.length,
                  showTotal: (total: number) => showTotal(total, 'câu hỏi')
                }}
                loading={loading}
                rowKey="id"
                className="custom-table"
                locale={emptyState}
              />
            </div>
          </div>
        )
      }
    )
  }

  if (user?.role === 'ROLE_TEACHER' || user?.role === 'teacher') {
    tabItems.push({
      key: 'teaching',
      label: (
        <span className="flex items-center space-x-2">
          <BookOutlined />
          <span>Lớp học đang dạy</span>
        </span>
      ),
      children: (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium flex items-center space-x-2">
                  <BookOutlined className="text-orange-500" />
                  <span>Danh sách lớp học đang dạy</span>
                </h3>
                <Tag color="orange" className="rounded-full px-3">
                  {teachingClasses.length} lớp
                </Tag>
              </div>
            </div>
            <Table
              columns={classColumns}
              dataSource={teachingClasses}
              pagination={{
                ...paginationConfig,
                total: teachingClasses.length,
                showTotal: (total: number) => showTotal(total, 'lớp học')
              }}
              loading={loading}
              rowKey="id"
              className="custom-table"
              locale={emptyState}
            />
          </div>
        </div>
      )
    })
  }

  return (
    <Modal
      title={
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <UserOutlined className="text-xl text-blue-600" />
          </div>
          <span className="text-xl font-semibold text-gray-800">Chi tiết người dùng</span>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={1000}
      styles={{
        mask: {
          backgroundColor: 'rgba(0, 0, 0, 0.45)'
        }
      }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        className="mt-6"
      />
    </Modal>
  )
} 
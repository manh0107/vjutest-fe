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
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { userService } from '@/services/userService'
import { toast } from 'sonner'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { X, User as UserIcon, Mail, Phone, CreditCard, Building2, Users, Book, Calendar, Clock, FileText, HelpCircle, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import './UserDetailModal.css'

interface UserDetailModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSuccess?: (updatedUser: User) => void;
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
      return 'bg-red-500';
    case 'ROLE_TEACHER':
    case 'teacher':
      return 'bg-blue-500';
    default:
      return 'bg-green-500';
  }
};

interface InfoItemProps {
  icon: React.ReactNode;
  label: string; 
  value: string | number | null | undefined;
  tooltip?: string;
}

const InfoItem = ({ icon, label, value, tooltip }: InfoItemProps) => (
  <div className="info-item">
    {icon}
    <div>
      <div className="text-sm text-gray-500">{label}</div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
        <div className="font-medium truncate max-w-[200px]">
          {value?.toString() || 'N/A'}
        </div>
          </TooltipTrigger>
          {tooltip && <TooltipContent>{tooltip}</TooltipContent>}
      </Tooltip>
      </TooltipProvider>
    </div>
  </div>
);

interface StatisticCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: string;
}

const StatisticCard = ({ icon, title, value, color }: StatisticCardProps) => (
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

export function UserDetailModal({ user, isOpen, onClose, onUpdateSuccess }: UserDetailModalProps) {
  const [activeTab, setActiveTab] = useState('info')
  const [loading, setLoading] = useState(false)

  // Pagination config
  const pageSize = 5

  // Data states
  const [createdClasses, setCreatedClasses] = useState<ClassRequest[]>([])
  const [createdExams, setCreatedExams] = useState<Exam[]>([])
  const [createdQuestions, setCreatedQuestions] = useState<Question[]>([])
  const [teachingClasses, setTeachingClasses] = useState<ClassRequest[]>([])

  const [formData, setFormData] = useState<Partial<User>>({})
  const [imageUrl, setImageUrl] = useState<string>('')
  const [imageFile, setImageFile] = useState<File | undefined>(undefined)
  const [isUploading, setIsUploading] = useState(false)

  const isTeacherOrAdmin = user?.role === 'ROLE_TEACHER' || user?.role === 'teacher' || user?.role === 'ROLE_ADMIN' || user?.role === 'admin'

  // Check if content needs scrolling
  const needsScroll = createdClasses.length > pageSize || 
                     teachingClasses.length > pageSize || 
                     createdExams.length > pageSize || 
                     createdQuestions.length > pageSize

  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: vi })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500'
      case 'INACTIVE':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Hoạt động'
      case 'INACTIVE':
        return 'Vô hiệu'
      default:
        return 'Không xác định'
    }
  }

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value
    setImageUrl(newUrl)
    // Khi thay đổi URL, reset file input
    setImageFile(undefined)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Chỉ được phép tải lên file ảnh!')
        return
      }
      setImageFile(file)
      // Khi chọn file mới, reset URL input
      setImageUrl('')
    }
  }

  const handleUpdateImage = async () => {
    if (!user?.id) return

    try {
      setIsUploading(true)
      
      // Nếu có file mới, ưu tiên sử dụng file
      if (imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)
        // Không gửi imageUrl khi có file mới
        formData.append('user', JSON.stringify({ ...user }))
        const updatedUser = await userService.updateUser(user.id, formData, user.id, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        // Kiểm tra response
        if (updatedUser) {
          // Gọi callback nếu có
          if (onUpdateSuccess) {
            onUpdateSuccess(updatedUser)
          }
          // Cập nhật lại imageUrl từ response
          setImageUrl(updatedUser.imageUrl)
          // Reset file input
          setImageFile(undefined)
          toast.success('Cập nhật ảnh thành công')
        } else {
          throw new Error('Không nhận được dữ liệu từ server')
        }
      } else if (imageUrl) {
        // Nếu không có file mới nhưng có URL mới, sử dụng URL
        const updatedUser = await userService.updateUser(user.id, { ...user, imageUrl }, user.id)
        if (updatedUser) {
          if (onUpdateSuccess) {
            onUpdateSuccess(updatedUser)
          }
          setImageUrl(updatedUser.imageUrl)
          toast.success('Cập nhật ảnh thành công')
        } else {
          throw new Error('Không nhận được dữ liệu từ server')
        }
      }
    } catch (error) {
      console.error('Error updating image:', error)
      toast.error('Không thể cập nhật ảnh')
    } finally {
      setIsUploading(false)
    }
  }

  const handleUpdateUserInfo = async (updatedUserData: Partial<User>) => {
    if (!user?.id) return

    try {
      setIsUploading(true)
      // Kết hợp dữ liệu hiện tại với dữ liệu mới
      const userData = {
        ...user,
        ...updatedUserData,
        // Giữ nguyên các trường quan trọng
        id: user.id,
        role: user.role,
        department: user.department,
        major: user.major,
        createdAt: user.createdAt
      }
      
      // Gọi API cập nhật
      const updatedUser = await userService.updateUser(user.id, userData, user.id)
      
      // Kiểm tra response
      if (updatedUser) {
        // Gọi callback nếu có
        if (onUpdateSuccess) {
          onUpdateSuccess(updatedUser)
        }
        // Đóng modal
        if (onClose) {
          onClose()
        }
        toast.success('Cập nhật thông tin thành công')
      } else {
        throw new Error('Không nhận được dữ liệu từ server')
      }
    } catch (error) {
      console.error('Error updating user info:', error)
      toast.error('Không thể cập nhật thông tin')
    } finally {
      setIsUploading(false)
    }
  }

  const handleUpdateUserAndImage = async (updatedUserData: Partial<User>) => {
    if (!user?.id) return

    try {
      setIsUploading(true)
      if (imageFile) {
        const formData = new FormData()
        formData.append('user', JSON.stringify(updatedUserData))
        formData.append('file', imageFile)
        await userService.updateUser(user.id, formData, user.id, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      } else {
        await userService.updateUser(user.id, updatedUserData, user.id)
      }
      toast.success('Cập nhật thông tin và ảnh thành công')
    } catch (error) {
      console.error('Error updating user and image:', error)
      toast.error('Không thể cập nhật thông tin và ảnh')
    } finally {
      setIsUploading(false)
    }
  }

  const loadUserData = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
        const [classes, exams, questions, teaching] = await Promise.all([
          userService.getUserCreatedClasses(user.id),
          userService.getUserCreatedExams(user.id),
          userService.getUserCreatedQuestions(user.id),
        isTeacherOrAdmin ? userService.getTeacherClasses(user.id) : Promise.resolve([])
        ])

        setCreatedClasses(classes)
        setCreatedExams(exams)
        setCreatedQuestions(questions)
        setTeachingClasses(teaching)
    } catch (error) {
      console.error('Error loading user data:', error)
      toast.error('Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const renderUserInfo = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="h-20 w-20 relative">
          <Avatar className="h-full w-full">
            <AvatarImage src={user?.imageUrl} alt={user?.name || ''} />
            <AvatarFallback>{user?.name?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
                </div>
                <div>
          <h3 className="text-xl font-semibold">{user?.name}</h3>
          <div className={cn("px-2 py-1 rounded-full text-sm font-medium", getRoleColor(user?.role as string), 'text-white')}>
            {getRoleName(user?.role)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InfoItem 
          icon={<UserIcon className="w-5 h-5" />} 
          label="Mã số" 
          value={user?.code} 
        />
        <InfoItem 
          icon={<Mail className="w-5 h-5" />} 
          label="Email" 
          value={user?.email} 
        />
        <InfoItem 
          icon={<Phone className="w-5 h-5" />} 
          label="Số điện thoại" 
          value={user?.phoneNumber} 
        />
        <InfoItem 
          icon={<Building2 className="w-5 h-5" />} 
          label="Khoa" 
          value={user?.department?.name} 
        />
        <InfoItem 
          icon={<Book className="w-5 h-5" />} 
          label="Ngành" 
          value={user?.major?.name} 
        />
        <InfoItem 
          icon={<Calendar className="w-5 h-5" />} 
          label="Ngày tạo" 
          value={user?.createdAt ? formatDate(user.createdAt) : undefined} 
        />
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Thông tin chi tiết người dùng</DialogTitle>
          <DialogDescription>
            Xem và quản lý thông tin người dùng
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="info">Thông tin</TabsTrigger>
            {isTeacherOrAdmin && (
              <>
                <TabsTrigger value="classes">Lớp học</TabsTrigger>
                <TabsTrigger value="exams">Bài kiểm tra</TabsTrigger>
                <TabsTrigger value="questions">Câu hỏi</TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="info">
            {renderUserInfo()}
          </TabsContent>

          {isTeacherOrAdmin && (
            <>
              <TabsContent value="classes">
          <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Lớp học đã tạo</h3>
                  <ScrollArea className="h-[300px]">
                    {createdClasses.map((classItem) => (
                      <Card key={classItem.id} className="mb-2">
                        <CardHeader>
                          <CardTitle>{classItem.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p>Mã lớp: {classItem.classCode}</p>
                          <p>Ngày tạo: {formatDate(classItem.createdAt)}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="exams">
          <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Bài kiểm tra đã tạo</h3>
                  <ScrollArea className="h-[300px]">
                    {createdExams.map((exam) => (
                      <Card key={exam.id} className="mb-2">
                        <CardHeader>
                          <CardTitle>{exam.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p>Môn học: {exam.subjectName}</p>
                          <p>Thời gian: {exam.duration} phút</p>
                          <p>Ngày tạo: {formatDate(exam.createdAt)}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="questions">
          <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Câu hỏi đã tạo</h3>
                  <ScrollArea className="h-[300px]">
                    {createdQuestions.map((question) => (
                      <Card key={question.id} className="mb-2">
                        <CardHeader>
                          <CardTitle>Câu hỏi #{question.id}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p>Nội dung: {question.content}</p>
                          <p>Độ khó: {question.difficulty}</p>
                          <p>Điểm: {question.point}</p>
                          <p>Ngày tạo: {formatDate(question.createdAt)}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </ScrollArea>
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 
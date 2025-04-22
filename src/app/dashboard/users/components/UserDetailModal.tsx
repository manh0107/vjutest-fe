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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { userService } from '@/services/userService'
import { toast } from 'react-hot-toast'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"

interface UserDetailModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ClassRequest {
  id: number
  className: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
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
  subject: string
  createdAt: string
}

interface Subject {
  id: number
  name: string
  code: string
}

interface Question {
  id: number
  content: string
  subject: string
  createdAt: string
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

const InfoItem = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
  <div className="space-y-1">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="font-medium">{value?.toString() || 'N/A'}</p>
  </div>
);

export function UserDetailModal({ user, isOpen, onClose }: UserDetailModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)

  // Reset page when changing tabs
  const handleTabChange = () => {
    setCurrentPage(1)
  }

  // State for student data
  const [enrolledClasses, setEnrolledClasses] = useState<Class[]>([])
  const [classRequests, setClassRequests] = useState<ClassRequest[]>([])
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([])

  // State for teacher data  
  const [createdClasses, setCreatedClasses] = useState<Class[]>([])
  const [teachingClasses, setTeachingClasses] = useState<Class[]>([])
  const [createdExams, setCreatedExams] = useState<Exam[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [questions, setQuestions] = useState<Question[]>([])

  const [imageUrl, setImageUrl] = useState<string>('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const isTeacher = user?.role === 'ROLE_TEACHER' || user?.role === 'teacher'

  // Check if content needs scrolling
  const needsScroll = createdClasses.length > itemsPerPage || 
                     teachingClasses.length > itemsPerPage || 
                     createdExams.length > itemsPerPage || 
                     questions.length > itemsPerPage ||
                     enrolledClasses.length > itemsPerPage ||
                     classRequests.length > itemsPerPage ||
                     userAnswers.length > itemsPerPage

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

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden p-4 md:p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl md:text-2xl font-semibold">Thông tin chi tiết người dùng</DialogTitle>
        </DialogHeader>

        <div className={cn(
          "mt-4 md:mt-6 space-y-6",
          "overflow-y-auto",
          needsScroll ? "h-[calc(90vh-120px)]" : "h-auto"
        )}>
          <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            <div className="w-full md:w-[200px] flex-shrink-0">
              <div className="aspect-square rounded-xl overflow-hidden border shadow-sm mx-auto md:mx-0 max-w-[200px]">
                <img 
                  src={user.image || '/placeholder-avatar.png'} 
                  alt="User avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex-1 min-w-0 space-y-4 md:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-3">
                <h2 className="text-xl md:text-2xl font-semibold truncate">{user.name}</h2>
                <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'} className="h-6 px-3 w-fit text-sm">
                  {getRoleName(user.role)}
                </Badge>
              </div>
              
              <p className="text-sm md:text-base text-muted-foreground break-all">{user.email}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <InfoItem label="Mã số sinh viên" value={user.code} />
                <InfoItem label="Lớp" value={user.className} />
                <InfoItem label="Số điện thoại" value={user.phoneNumber} />
                <InfoItem label="Giới tính" value={user.gender === 'MALE' ? 'Nam' : user.gender === 'FEMALE' ? 'Nữ' : user.gender || 'N/A'} />
                <InfoItem 
                  label="Ngày tạo" 
                  value={user.createdAt ? format(new Date(user.createdAt), "dd/MM/yyyy HH:mm", { locale: vi }) : 'N/A'} 
                />
                <InfoItem label="Trạng thái" value={user.isEnabled ? 'Đang hoạt động' : 'Vô hiệu hóa'} />
              </div>
            </div>
          </div>

          <Separator className="my-6 md:my-8" />

          <div className="flex-1">
            <Tabs defaultValue={isTeacher ? "classes" : "enrolled"} className="w-full" onValueChange={handleTabChange}>
              <TabsList className="w-full grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6">
                {isTeacher ? (
                  <>
                    <TabsTrigger value="classes">Lớp học</TabsTrigger>
                    <TabsTrigger value="exams">Bài kiểm tra</TabsTrigger>
                    <TabsTrigger value="questions">Câu hỏi</TabsTrigger>
                  </>
                ) : (
                  <>
                    <TabsTrigger value="enrolled">Lớp học đã tham gia</TabsTrigger>
                    <TabsTrigger value="requests">Yêu cầu tham gia</TabsTrigger>
                    <TabsTrigger value="answers">Bài làm</TabsTrigger>
                  </>
                )}
              </TabsList>

              {isTeacher ? (
                <>
                  <TabsContent value="classes">
                    <div className="space-y-6">
                      <Card>
                        <CardHeader className="p-4 md:p-6">
                          <CardTitle className="text-lg md:text-xl">Lớp học đã tạo</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6">
                          {createdClasses.length === 0 ? (
                            <p className="text-sm md:text-base text-muted-foreground">Chưa có lớp học nào</p>
                          ) : (
                            <>
                              <div className="space-y-3">
                                {createdClasses
                                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                  .map((cls) => (
                                    <div key={cls.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 md:p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                      <div className="mb-2 sm:mb-0">
                                        <p className="font-medium text-sm md:text-base">{cls.name}</p>
                                        <p className="text-xs md:text-sm text-muted-foreground">{cls.subject}</p>
                                      </div>
                                      <div className="text-xs md:text-sm text-muted-foreground">
                                        {format(new Date(cls.createdAt), "dd/MM/yyyy", { locale: vi })}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                              {createdClasses.length > itemsPerPage && (
                                <div className="mt-4 flex justify-center">
                                  <Pagination>
                                    <PaginationContent>
                                      <PaginationItem>
                                        <PaginationPrevious 
                                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                          disabled={currentPage === 1}
                                        />
                                      </PaginationItem>
                                      {Array.from({length: Math.ceil(createdClasses.length / itemsPerPage)}).map((_, i) => (
                                        <PaginationItem key={i}>
                                          <PaginationLink
                                            onClick={() => setCurrentPage(i + 1)}
                                            isActive={currentPage === i + 1}
                                          >
                                            {i + 1}
                                          </PaginationLink>
                                        </PaginationItem>
                                      ))}
                                      <PaginationItem>
                                        <PaginationNext 
                                          onClick={() => setCurrentPage(p => Math.min(Math.ceil(createdClasses.length / itemsPerPage), p + 1))}
                                          disabled={currentPage === Math.ceil(createdClasses.length / itemsPerPage)}
                                        />
                                      </PaginationItem>
                                    </PaginationContent>
                                  </Pagination>
                                </div>
                              )}
                            </>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="p-4 md:p-6">
                          <CardTitle className="text-lg md:text-xl">Lớp học đang dạy</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6">
                          {teachingClasses.length === 0 ? (
                            <p className="text-sm md:text-base text-muted-foreground">Chưa có lớp học nào</p>
                          ) : (
                            <>
                              <div className="space-y-3">
                                {teachingClasses
                                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                  .map((cls) => (
                                    <div key={cls.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 md:p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                      <div className="mb-2 sm:mb-0">
                                        <p className="font-medium text-sm md:text-base">{cls.name}</p>
                                        <p className="text-xs md:text-sm text-muted-foreground">{cls.subject}</p>
                                      </div>
                                      <div className="text-xs md:text-sm text-muted-foreground">
                                        {format(new Date(cls.createdAt), "dd/MM/yyyy", { locale: vi })}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                              {teachingClasses.length > itemsPerPage && (
                                <div className="mt-4 flex justify-center">
                                  <Pagination>
                                    <PaginationContent>
                                      <PaginationItem>
                                        <PaginationPrevious 
                                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                          disabled={currentPage === 1}
                                        />
                                      </PaginationItem>
                                      {Array.from({length: Math.ceil(teachingClasses.length / itemsPerPage)}).map((_, i) => (
                                        <PaginationItem key={i}>
                                          <PaginationLink
                                            onClick={() => setCurrentPage(i + 1)}
                                            isActive={currentPage === i + 1}
                                          >
                                            {i + 1}
                                          </PaginationLink>
                                        </PaginationItem>
                                      ))}
                                      <PaginationItem>
                                        <PaginationNext 
                                          onClick={() => setCurrentPage(p => Math.min(Math.ceil(teachingClasses.length / itemsPerPage), p + 1))}
                                          disabled={currentPage === Math.ceil(teachingClasses.length / itemsPerPage)}
                                        />
                                      </PaginationItem>
                                    </PaginationContent>
                                  </Pagination>
                                </div>
                              )}
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="exams">
                    <div className="space-y-6">
                      <Card>
                        <CardHeader className="p-4 md:p-6">
                          <CardTitle className="text-lg md:text-xl">Bài kiểm tra đã tạo</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6">
                          {createdExams.length === 0 ? (
                            <p className="text-sm md:text-base text-muted-foreground">Chưa có bài kiểm tra nào</p>
                          ) : (
                            <>
                              <div className="space-y-3">
                                {createdExams
                                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                  .map((exam) => (
                                    <div key={exam.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 md:p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                      <div className="mb-2 sm:mb-0">
                                        <p className="font-medium text-sm md:text-base">{exam.name}</p>
                                        <p className="text-xs md:text-sm text-muted-foreground">{exam.subject}</p>
                                      </div>
                                      <div className="text-xs md:text-sm text-muted-foreground">
                                        {format(new Date(exam.createdAt), "dd/MM/yyyy", { locale: vi })}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                              {createdExams.length > itemsPerPage && (
                                <div className="mt-4 flex justify-center">
                                  <Pagination>
                                    <PaginationContent>
                                      <PaginationItem>
                                        <PaginationPrevious 
                                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                          disabled={currentPage === 1}
                                        />
                                      </PaginationItem>
                                      {Array.from({length: Math.ceil(createdExams.length / itemsPerPage)}).map((_, i) => (
                                        <PaginationItem key={i}>
                                          <PaginationLink
                                            onClick={() => setCurrentPage(i + 1)}
                                            isActive={currentPage === i + 1}
                                          >
                                            {i + 1}
                                          </PaginationLink>
                                        </PaginationItem>
                                      ))}
                                      <PaginationItem>
                                        <PaginationNext 
                                          onClick={() => setCurrentPage(p => Math.min(Math.ceil(createdExams.length / itemsPerPage), p + 1))}
                                          disabled={currentPage === Math.ceil(createdExams.length / itemsPerPage)}
                                        />
                                      </PaginationItem>
                                    </PaginationContent>
                                  </Pagination>
                                </div>
                              )}
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="questions">
                    <div className="space-y-6">
                      <Card>
                        <CardHeader className="p-4 md:p-6">
                          <CardTitle className="text-lg md:text-xl">Câu hỏi đã tạo</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6">
                          {questions.length === 0 ? (
                            <p className="text-sm md:text-base text-muted-foreground">Chưa có câu hỏi nào</p>
                          ) : (
                            <>
                              <div className="space-y-3">
                                {questions
                                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                  .map((question) => (
                                    <div key={question.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 md:p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                      <div className="mb-2 sm:mb-0">
                                        <p className="font-medium text-sm md:text-base">{question.content}</p>
                                        <p className="text-xs md:text-sm text-muted-foreground">{question.subject}</p>
                                      </div>
                                      <div className="text-xs md:text-sm text-muted-foreground">
                                        {format(new Date(question.createdAt), "dd/MM/yyyy", { locale: vi })}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                              {questions.length > itemsPerPage && (
                                <div className="mt-4 flex justify-center">
                                  <Pagination>
                                    <PaginationContent>
                                      <PaginationItem>
                                        <PaginationPrevious 
                                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                          disabled={currentPage === 1}
                                        />
                                      </PaginationItem>
                                      {Array.from({length: Math.ceil(questions.length / itemsPerPage)}).map((_, i) => (
                                        <PaginationItem key={i}>
                                          <PaginationLink
                                            onClick={() => setCurrentPage(i + 1)}
                                            isActive={currentPage === i + 1}
                                          >
                                            {i + 1}
                                          </PaginationLink>
                                        </PaginationItem>
                                      ))}
                                      <PaginationItem>
                                        <PaginationNext 
                                          onClick={() => setCurrentPage(p => Math.min(Math.ceil(questions.length / itemsPerPage), p + 1))}
                                          disabled={currentPage === Math.ceil(questions.length / itemsPerPage)}
                                        />
                                      </PaginationItem>
                                    </PaginationContent>
                                  </Pagination>
                                </div>
                              )}
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </>
              ) : (
                <>
                  <TabsContent value="enrolled">
                    <Card>
                      <CardHeader className="p-4 md:p-6">
                        <CardTitle className="text-lg md:text-xl">Lớp học đã tham gia</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 md:p-6">
                        {enrolledClasses.length === 0 ? (
                          <p className="text-sm md:text-base text-muted-foreground">Chưa tham gia lớp học nào</p>
                        ) : (
                          <div className="space-y-3">
                            {enrolledClasses.map((cls) => (
                              <div key={cls.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 md:p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                <div className="mb-2 sm:mb-0">
                                  <p className="font-medium text-sm md:text-base">{cls.name}</p>
                                  <p className="text-xs md:text-sm text-muted-foreground">{cls.subject}</p>
                                </div>
                                <div className="text-xs md:text-sm text-muted-foreground">
                                  {format(new Date(cls.createdAt), "dd/MM/yyyy", { locale: vi })}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="requests">
                    <Card>
                      <CardHeader className="p-4 md:p-6">
                        <CardTitle className="text-lg md:text-xl">Yêu cầu tham gia lớp học</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 md:p-6">
                        {classRequests.length === 0 ? (
                          <p className="text-sm md:text-base text-muted-foreground">Chưa có yêu cầu nào</p>
                        ) : (
                          <div className="space-y-3">
                            {classRequests.map((request) => (
                              <div key={request.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 md:p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                <div className="mb-2 sm:mb-0">
                                  <p className="font-medium text-sm md:text-base">{request.className}</p>
                                  <Badge className={getStatusColor(request.status)}>
                                    {getStatusText(request.status)}
                                  </Badge>
                                </div>
                                <div className="text-xs md:text-sm text-muted-foreground">
                                  {format(new Date(request.createdAt), "dd/MM/yyyy", { locale: vi })}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="answers">
                    <Card>
                      <CardHeader className="p-4 md:p-6">
                        <CardTitle className="text-lg md:text-xl">Bài làm đã nộp</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 md:p-6">
                        {userAnswers.length === 0 ? (
                          <p className="text-sm md:text-base text-muted-foreground">Chưa có bài làm nào</p>
                        ) : (
                          <div className="space-y-3">
                            {userAnswers.map((answer) => (
                              <div key={answer.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 md:p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                <div className="mb-2 sm:mb-0">
                                  <p className="font-medium text-sm md:text-base">{answer.examName}</p>
                                  <p className="text-xs md:text-sm text-muted-foreground">Điểm: {answer.score}</p>
                                </div>
                                <div className="text-xs md:text-sm text-muted-foreground">
                                  {format(new Date(answer.submittedAt), "dd/MM/yyyy", { locale: vi })}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </>
              )}
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
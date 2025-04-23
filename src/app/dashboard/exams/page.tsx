'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Clock, Search, Plus, School2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'
import { examService, type Exam } from '@/services/examService'
import { useAuth } from '@/hooks/useAuth'
import { subjectService, type Subject } from '@/services/subjectService'
import { classService, type Class } from '@/services/classService'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from '@/components/ui/use-toast'

// Custom hook for fetching subjects
function useSubjects() {
  const [subjects, setSubjects] = useState<{ id: number; name: string }[]>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    let isMounted = true

    const fetchSubjects = async () => {
      try {
        const data = await subjectService.getAllSubjects()
        if (isMounted) {
          setSubjects(data.map(subject => ({
            id: subject.id,
            name: subject.name
          })))
          if (data.length > 0) {
            setSelectedSubjectId(data[0].id)
          }
        }
      } catch (error: any) {
        console.error('Error fetching subjects:', error)
        if (isMounted) {
          toast({
            variant: "destructive",
            title: "Lỗi",
            description: "Không thể tải danh sách môn học"
          })
        }
      }
    }

    fetchSubjects()

    return () => {
      isMounted = false
    }
  }, [toast])

  return { subjects, selectedSubjectId, setSelectedSubjectId }
}

// Custom hook for fetching classes
function useClasses(user: any) {
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([])
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    let isMounted = true

    const fetchClasses = async () => {
      if (!user) return
      try {
        console.log('Fetching classes for user:', user.id)
        const data = await classService.getClasses()
        if (isMounted) {
          console.log('Fetched classes:', data)
          setClasses(data.map(cls => ({
            id: cls.id,
            name: cls.name
          })))
          if (data.length > 0) {
            console.log('Setting initial selected class:', data[0])
            setSelectedClassId(data[0].id)
          }
        }
      } catch (error: any) {
        console.error('Error fetching classes:', error)
        if (isMounted) {
          toast({
            variant: "destructive",
            title: "Lỗi",
            description: "Không thể tải danh sách lớp học"
          })
        }
      }
    }

    fetchClasses()

    return () => {
      isMounted = false
    }
  }, [user, toast])

  // Add initial class selection logic directly in this hook
  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      console.log('Setting initial class from classes effect:', classes[0])
      setSelectedClassId(classes[0].id)
    }
  }, [classes, selectedClassId])

  return { classes, selectedClassId, setSelectedClassId }
}

// Custom hook for fetching exams
function useExams(user: any, selectedSubjectId: number | null, selectedClassId: number | null, activeTab: 'public' | 'class') {
  const [publicExams, setPublicExams] = useState<Exam[]>([])
  const [classExams, setClassExams] = useState<Exam[]>([])
  const [loadingState, setLoadingState] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    let isMounted = true

    const fetchExams = async () => {
      try {
        console.log('Debug conditions:', {
          user: !!user,
          selectedSubjectId,
          activeTab,
          selectedClassId
        })
        
        if (!user || !selectedSubjectId) return
        setLoadingState(true)

        if (activeTab === 'public') {
          console.log('Calling getPublicExams with subjectId:', selectedSubjectId)
          const data = await examService.getPublicExams(selectedSubjectId)
          if (isMounted) {
            console.log('Public exams response:', data)
            setPublicExams(data)
          }
        } else if (selectedClassId) {
          console.log('Calling getClassExams with classId:', selectedClassId, 'subjectId:', selectedSubjectId)
          const data = await examService.getClassExams(selectedClassId, selectedSubjectId, user.id)
          if (isMounted) {
            console.log('Class exams response:', data)
            setClassExams(data)
          }
        }
      } catch (error: any) {
        console.error('Error fetching exams:', error)
        if (isMounted) {
          toast({
            variant: "destructive",
            title: "Lỗi",
            description: error.message || "Không thể tải danh sách bài kiểm tra"
          })
        }
      } finally {
        if (isMounted) {
          setLoadingState(false)
        }
      }
    }

    fetchExams()

    return () => {
      isMounted = false
    }
  }, [activeTab, selectedSubjectId, selectedClassId, user, toast])

  return { publicExams, classExams, loadingState }
}

export default function ExamsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState<'public' | 'class'>('public')
  const [searchTerm, setSearchTerm] = useState('')
  const { subjects, selectedSubjectId, setSelectedSubjectId } = useSubjects()
  const { classes, selectedClassId, setSelectedClassId } = useClasses(user)
  const { publicExams, classExams, loadingState } = useExams(user, selectedSubjectId, selectedClassId, activeTab)

  // Add debug log for initial render
  useEffect(() => {
    console.log('ExamsPage mounted. User state:', {
      user,
      loading,
      token: localStorage.getItem('token')
    })
  }, [])

  // Add debug log for user changes
  useEffect(() => {
    console.log('User state changed:', {
      user,
      loading,
      token: localStorage.getItem('token')
    })
  }, [user, loading])

  // Add authentication check
  useEffect(() => {
    if (!loading && !user) {
      console.log('User not authenticated, redirecting to login')
      router.push('/login')
    }
  }, [loading, user, router])

  // If still loading or no user, show loading state
  if (loading || !user) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Đang tải...</div>
      </div>
    )
  }

  const showErrorToast = (message: string) => {
    toast({
      variant: "destructive",
      title: "Lỗi",
      description: message
    })
  }

  const filteredExams = (activeTab === 'public' ? publicExams : classExams)
    .filter(exam => 
      exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.examCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.subject.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

  const handleCreateExam = () => {
    router.push('/dashboard/exams/create')
  }

  const handleViewExam = (examId: number) => {
    router.push(`/dashboard/exams/${examId}`)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Bài kiểm tra</h1>
        <Button onClick={handleCreateExam}>
          <Plus className="w-4 h-4 mr-2" />
          Tạo bài kiểm tra
        </Button>
      </div>

      <Tabs defaultValue="public" className="w-full" onValueChange={(value) => setActiveTab(value as 'public' | 'class')}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <TabsList>
              <TabsTrigger value="public">Bài kiểm tra chung</TabsTrigger>
              <TabsTrigger value="class">Bài kiểm tra lớp học</TabsTrigger>
            </TabsList>
            
            <Select
              value={selectedSubjectId?.toString()}
              onValueChange={(value) => setSelectedSubjectId(Number(value))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Chọn môn học" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id.toString()}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {activeTab === 'class' && (
              <Select
                value={selectedClassId?.toString()}
                onValueChange={(value) => {
                  console.log('Selected class changed to:', value)
                  setSelectedClassId(Number(value))
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Chọn lớp học" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm bài kiểm tra..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <TabsContent value="public" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bài kiểm tra chung</CardTitle>
              <CardDescription>
                Danh sách các bài kiểm tra công khai cho tất cả học viên
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingState ? (
                <div className="text-center py-4">Đang tải...</div>
              ) : filteredExams.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  {searchTerm ? 'Không tìm thấy bài kiểm tra phù hợp' : 'Chưa có bài kiểm tra nào'}
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredExams.map((exam) => (
                    <div key={exam.id} className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{exam.name}</h3>
                            <Badge variant="secondary">Công khai</Badge>
                            <Badge variant={exam.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                              {exam.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Nháp'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Môn học: {exam.subject.name}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{exam.durationTime} phút</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <School2 className="w-4 h-4" />
                              <span>{exam.totalQuestions} câu hỏi</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" onClick={() => handleViewExam(exam.id)}>
                          Xem chi tiết
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="class" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bài kiểm tra lớp học</CardTitle>
              <CardDescription>
                Danh sách các bài kiểm tra trong các lớp học của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingState ? (
                <div className="text-center py-4">Đang tải...</div>
              ) : filteredExams.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  {searchTerm ? 'Không tìm thấy bài kiểm tra phù hợp' : 'Chưa có bài kiểm tra nào'}
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredExams.map((exam) => (
                    <div key={exam.id} className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{exam.name}</h3>
                            <Badge>Lớp học</Badge>
                            <Badge variant={exam.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                              {exam.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Nháp'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Môn học: {exam.subject.name}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{exam.durationTime} phút</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <School2 className="w-4 h-4" />
                              <span>{exam.totalQuestions} câu hỏi</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" onClick={() => handleViewExam(exam.id)}>
                          Xem chi tiết
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
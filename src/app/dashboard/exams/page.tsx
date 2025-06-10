'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search } from 'lucide-react'
import { ExamList } from './components/ExamList'
import { examService } from '@/services/examService'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { Exam, Subject, ClassEntity } from '@/services/types'
import { ExamCreateModal } from './components/ExamCreateModal'
import { Button } from '@/components/ui/button'
import { ClassExamCreateModal } from './components/ClassExamCreateModal'
import { useRouter } from 'next/navigation'
import { BarChart as ChartIcon } from 'lucide-react'

export default function ExamsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('public')
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null)
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [classes, setClasses] = useState<ClassEntity[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    if (user) {
      fetchSubjects()
      fetchClasses()
    }
  }, [user])

  useEffect(() => {
    if (user && selectedSubjectId) {
      fetchExams()
    }
  }, [activeTab, selectedSubjectId, selectedClassId, user])

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (selectedSubjectId && (activeTab === 'public' || (activeTab === 'class' && selectedClassId))) {
      fetchExams();

      intervalId = setInterval(() => {
        fetchExams();
      }, 5000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [activeTab, selectedClassId, selectedSubjectId]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchExams();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activeTab, selectedSubjectId, selectedClassId, user]);

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Không tìm thấy token')
      }

      const response = await fetch('http://localhost:8080/subjects/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Không thể tải danh sách môn học')
      }
      
      const data = await response.json()
      setSubjects(data)
      if (data.length > 0) {
        setSelectedSubjectId(data[0].id)
      }
    } catch (error: any) {
      console.error('Error fetching subjects:', error)
      toast.error(error.message)
    }
  }

  const fetchClasses = async () => {
    if (!user) return

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Không tìm thấy token')
      }

      const response = await fetch(`http://localhost:8080/classes/all?userId=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Không thể tải danh sách lớp học')
      }
      
      const data = await response.json()
      setClasses(data)
      if (data.length > 0) {
        setSelectedClassId(data[0].id)
      }
    } catch (error: any) {
      // Chỉ log lỗi, không hiển thị toast vì có thể user chưa có lớp học nào
      console.error('Error fetching classes:', error)
    }
  }

  const fetchExams = async () => {
    if (!user || !selectedSubjectId) return

    setLoading(true)
    try {
      let data
      if (activeTab === 'public') {
        data = await examService.getPublicExams(selectedSubjectId)
      } else {
        if (!selectedClassId) return
        data = await examService.getClassExams(selectedClassId, selectedSubjectId)
      }
      setExams(data)
    } catch (error) {
      console.error('Error fetching exams:', error)
      toast.error('Không thể tải danh sách bài kiểm tra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-[1200px] mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Quản lý bài kiểm tra</CardTitle>
          <p className="text-sm text-muted-foreground">
            Xem và quản lý các bài kiểm tra công khai hoặc trong lớp học
          </p>
        </div>
        <button
          className="ml-4 p-2 rounded-full bg-[#f7f8fa] hover:bg-[#e6eaf3] border border-gray-200 shadow transition flex items-center"
          title="Xem biểu đồ tổng quan điểm sinh viên"
          onClick={() => router.push('/dashboard/exams/overview')}
        >
          <ChartIcon className="h-7 w-7 text-[#b8021e]" />
        </button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="public" className="space-y-4" onValueChange={setActiveTab}>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <TabsList>
              <TabsTrigger value="public">Bài kiểm tra công khai</TabsTrigger>
              <TabsTrigger value="class">Bài kiểm tra trong lớp</TabsTrigger>
            </TabsList>

            <div className="flex gap-2 w-full sm:w-auto">
              <Select
                value={selectedSubjectId?.toString() || ""}
                onValueChange={(value) => setSelectedSubjectId(Number(value))}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
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
                  value={selectedClassId?.toString() || ""}
                  onValueChange={(value) => setSelectedClassId(Number(value))}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Chọn lớp học" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((class_) => (
                      <SelectItem key={class_.id} value={class_.id.toString()}>
                        {class_.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm bài kiểm tra..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              Tạo bài kiểm tra
            </Button>
          </div>

          <TabsContent value="public" className="m-0">
            <ExamList exams={exams} loading={loading} activeTab={activeTab} />
          </TabsContent>

          <TabsContent value="class" className="m-0">
            <ExamList exams={exams} loading={loading} activeTab={activeTab} />
          </TabsContent>
        </Tabs>
        {activeTab === 'class' ? (
          <ClassExamCreateModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onCreated={fetchExams}
          />
        ) : (
          <ExamCreateModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onCreated={fetchExams}
            isClassExam={false}
          />
        )}
      </CardContent>
    </Card>
  )
}
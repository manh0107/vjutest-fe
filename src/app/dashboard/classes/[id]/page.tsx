'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { classService, Class } from '@/services/classService'
import { examService, Exam } from '@/services/examService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import Link from 'next/link'
import { Users, Clock, BookOpen, Plus, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

interface Props {
  params: {
    id: string
  }
}

export default function ClassDetailPage({ params }: Props) {
  const [classData, setClassData] = useState<Class | null>(null)
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const classId = parseInt(params.id)

  useEffect(() => {
    loadClassData()
  }, [classId])

  const loadClassData = async () => {
    try {
      const [classResponse, examsResponse] = await Promise.all([
        classService.getClass(classId),
        examService.getExams(classId),
      ])
      setClassData(classResponse)
      setExams(examsResponse)
    } catch (error) {
      console.error('Error loading class data:', error)
      toast.error('Có lỗi xảy ra khi tải thông tin lớp học')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinClass = async () => {
    try {
      await classService.joinClass(classId)
      toast.success('Tham gia lớp học thành công')
      loadClassData()
    } catch (error) {
      console.error('Error joining class:', error)
      toast.error('Có lỗi xảy ra khi tham gia lớp học')
    }
  }

  const handleLeaveClass = async () => {
    try {
      await classService.leaveClass(classId)
      toast.success('Rời khỏi lớp học thành công')
      router.push('/dashboard/classes')
    } catch (error) {
      console.error('Error leaving class:', error)
      toast.error('Có lỗi xảy ra khi rời khỏi lớp học')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Đang tải thông tin lớp học...</span>
      </div>
    )
  }

  if (!classData) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <h3 className="text-lg font-semibold mb-2">
              Không tìm thấy lớp học
            </h3>
            <p className="text-muted-foreground mb-4">
              Lớp học này không tồn tại hoặc bạn không có quyền truy cập.
            </p>
            <Button onClick={() => router.push('/dashboard/classes')}>
              Quay lại danh sách lớp học
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Chi tiết lớp học</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/dashboard/classes')}>
            Quay lại
          </Button>
          <Button variant="outline" onClick={() => router.push(`/dashboard/classes/${classId}/edit`)}>
            Chỉnh sửa
          </Button>
        </div>
      </div>

      <div className="grid gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin chung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-1">Tên lớp</h3>
                  <p>{classData.name}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Mã lớp</h3>
                  <Badge variant="secondary">{classData.classCode}</Badge>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Mô tả</h3>
                <p className="text-muted-foreground">{classData.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Số học viên</p>
                    <p className="font-medium">{classData.studentCount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Môn học</p>
                    <p className="font-medium">{classData.subjectName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ngày tạo</p>
                    <p className="font-medium">{format(new Date(classData.createdAt), 'dd/MM/yyyy')}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Danh sách bài thi</CardTitle>
            <Button onClick={() => router.push(`/dashboard/classes/${classId}/exams/create`)}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm bài thi
            </Button>
          </CardHeader>
          <CardContent>
            {exams.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {exams.map((exam) => (
                  <Card key={exam.id}>
                    <CardContent className="pt-6">
                      <h4 className="font-semibold mb-2">{exam.title}</h4>
                      <p className="text-sm text-muted-foreground mb-4">{exam.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{exam.duration} phút</span>
                        </div>
                        <Button variant="outline" asChild>
                          <Link href={`/dashboard/exams/${exam.id}`}>
                            Xem chi tiết
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <h3 className="text-lg font-semibold mb-2">Chưa có bài thi nào</h3>
                <p className="text-muted-foreground mb-4">Bắt đầu bằng cách tạo bài thi mới.</p>
                <Button onClick={() => router.push(`/dashboard/classes/${classId}/exams/create`)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo bài thi
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 
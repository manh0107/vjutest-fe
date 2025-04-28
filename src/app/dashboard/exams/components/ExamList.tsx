import { Exam } from '@/services/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Clock, Calendar, BookOpen, Users2, School2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'

interface ExamListProps {
  exams: Exam[]
  loading: boolean
}

export function ExamList({ exams, loading }: ExamListProps) {
  const router = useRouter()

  const handleViewExam = (examId: number) => {
    router.push(`/dashboard/exams/${examId}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-500'
      case 'DRAFT':
        return 'bg-yellow-500'
      case 'CLOSED':
        return 'bg-gray-500'
      default:
        return 'bg-blue-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'Đã xuất bản'
      case 'DRAFT':
        return 'Bản nháp'
      case 'CLOSED':
        return 'Đã đóng'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-4 space-y-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (exams.length === 0) {
    return (
      <div className="text-center py-8">
        <School2 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Chưa có bài kiểm tra</h3>
        <p className="mt-2 text-sm text-gray-500">Bắt đầu bằng cách tạo bài kiểm tra mới.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {exams.map((exam) => (
        <Card
          key={exam.id}
          className="p-4 hover:shadow-lg transition-shadow cursor-pointer group"
          onClick={() => handleViewExam(exam.id)}
        >
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
                  {exam.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Mã: {exam.examCode}
                </p>
              </div>
              <Badge className={getStatusColor(exam.status) + " text-white"}>
                {getStatusText(exam.status)}
              </Badge>
            </div>

            {/* Subject Info */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span>{exam.subject.name} - {exam.subject.code}</span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{exam.durationTime} phút</span>
              </div>
              <div className="flex items-center gap-2">
                <School2 className="h-4 w-4 text-muted-foreground" />
                <span>{exam.totalQuestions} câu hỏi</span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users2 className="h-4 w-4" />
                <span>{exam.isPublic ? 'Công khai' : 'Lớp học'}</span>
              </div>
              <Button variant="ghost" size="sm" className="group-hover:bg-primary group-hover:text-white transition-colors">
                Xem chi tiết
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
} 
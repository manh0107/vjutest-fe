import { Exam } from '@/services/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Clock, Calendar, BookOpen, Users2, School2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ExamListProps {
  exams: Exam[]
  loading: boolean
  activeTab?: string
}

export function ExamList({ exams, loading, activeTab }: ExamListProps) {
  const router = useRouter()

  const handleViewExam = (examId: number) => {
    router.push(`/dashboard/exams/${examId}/complete`)
  }

  const filteredExams = exams.filter(exam => {
    if (activeTab === 'class') {
      return (exam as any).classSubject || (exam as any).classId;
    }
    return true;
  });

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

  if (filteredExams.length === 0) {
    return (
      <div className="text-center py-8">
        <School2 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Chưa có bài kiểm tra</h3>
        <p className="mt-2 text-sm text-gray-500">Bắt đầu bằng cách tạo bài kiểm tra mới.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredExams.map((exam) => (
        <Card
          key={exam.id}
          className="p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow cursor-pointer group border border-gray-200 bg-white"
          onClick={() => handleViewExam(exam.id)}
        >
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-xl group-hover:text-primary transition-colors line-clamp-2 mb-1">
                  {exam.name}
                </h3>
                <p className="text-xs text-gray-500">
                  Mã: <span className="font-mono">{exam.examCode}</span>
                </p>
              </div>
              <Badge className={getStatusColor(exam.status) + " text-white px-3 py-1 text-xs rounded-full shadow-sm"}>
                {getStatusText(exam.status)}
              </Badge>
            </div>

            {/* Subject Info */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <BookOpen className="h-4 w-4" />
              <span className="font-medium">{exam.subject.name}</span>
              <span className="text-xs text-gray-400">(Mã: {exam.subject.code})</span>
            </div>
            {/* Chapters Info */}
            {Array.isArray((exam as any).chapters) && (exam as any).chapters.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <span className="font-semibold">Chương:</span>
                <span>{(exam as any).chapters.map((c: any) => c.name).join(', ')}</span>
              </div>
            )}

            {/* Stats */}
            <div className="flex gap-6 text-sm">
              {exam.status !== 'DRAFT' && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{exam.durationTime} phút</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <School2 className="h-4 w-4 text-muted-foreground" />
                <span>{typeof (exam as any).questionsCount !== 'undefined' ? (exam as any).questionsCount : ((exam as any).totalQuestions || 0)} câu hỏi</span>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-gray-100 mt-2 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users2 className="h-4 w-4" />
                  <span className="font-semibold">{exam.isPublic ? 'Công khai' : 'Lớp học'}</span>
                </div>
                <Button variant="secondary" size="sm" className="hover:bg-primary hover:text-white transition-colors font-semibold px-3 py-1 rounded-lg shadow-sm" onClick={e => { e.stopPropagation(); handleViewExam(exam.id) }}>
                  Xem chi tiết
                </Button>
              </div>
              {exam.status === 'DRAFT' && (
                <div className="flex justify-end w-full">
                  <Button variant="outline" size="sm" className="w-full border-primary text-primary hover:bg-primary hover:text-white transition-colors font-semibold px-3 py-1 rounded-lg shadow-sm" onClick={e => { e.stopPropagation(); router.push(`/dashboard/exams/${exam.id}/complete`) }}>
                    Hoàn thành bài kiểm tra
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
} 
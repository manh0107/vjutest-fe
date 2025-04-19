'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { classService, Class } from '@/services/classService'
import { examService, Exam } from '@/services/examService'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Props {
  params: {
    id: string
  }
}

export default function ClassDetailPage({ params }: Props) {
  const [classData, setClassData] = useState<Class | null>(null)
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (!classData) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Không tìm thấy lớp học
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Lớp học này không tồn tại hoặc bạn không có quyền truy cập.
            </p>
            <div className="mt-6">
              <Button onClick={() => router.push('/dashboard/classes')}>
                Quay lại danh sách lớp học
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isTeacher = user?.role === 'TEACHER'

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <Card>
            <Card.Header>
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {classData.name}
                </h2>
                {!isTeacher && (
                  <Button
                    variant="outline"
                    onClick={handleLeaveClass}
                  >
                    Rời khỏi lớp
                  </Button>
                )}
              </div>
            </Card.Header>
            <Card.Body>
              <p className="text-gray-600">{classData.description}</p>
            </Card.Body>
          </Card>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Bài thi</h3>
            {isTeacher && (
              <Button
                onClick={() =>
                  router.push(`/dashboard/classes/${classId}/exams/create`)
                }
              >
                Tạo bài thi mới
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {exams.map((exam) => (
              <Card key={exam.id}>
                <Card.Body>
                  <h4 className="text-lg font-medium text-gray-900">
                    {exam.title}
                  </h4>
                  <p className="mt-1 text-sm text-gray-500">
                    {exam.description}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Thời gian: {exam.duration} phút
                  </p>
                  <div className="mt-4">
                    <Link
                      href={`/dashboard/exams/${exam.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {isTeacher ? 'Quản lý bài thi' : 'Làm bài thi'} →
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>

          {exams.length === 0 && (
            <div className="text-center py-12">
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Chưa có bài thi nào
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {isTeacher
                  ? 'Bắt đầu bằng cách tạo bài thi mới.'
                  : 'Giáo viên chưa tạo bài thi nào.'}
              </p>
              {isTeacher && (
                <div className="mt-6">
                  <Button
                    onClick={() =>
                      router.push(`/dashboard/classes/${classId}/exams/create`)
                    }
                  >
                    Tạo bài thi
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
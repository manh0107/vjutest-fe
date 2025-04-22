'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { classService, Class } from '@/services/classService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from "@/components/ui/input"
import { toast } from 'sonner'

export default function ClassesPage() {
  const { user } = useAuth()
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await classService.getClasses()
        setClasses(data)
      } catch (err) {
        setError('Không thể tải danh sách lớp học')
        console.error('Error fetching classes:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchClasses()
  }, [])

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.subjectName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div>Đang tải...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Lớp học</h1>
        {user?.role === 'TEACHER' && (
          <Button onClick={() => router.push('/dashboard/classes/create')}>
            Thêm lớp học mới
          </Button>
        )}
      </div>

      <div className="mb-6">
        <Input
          placeholder="Tìm kiếm lớp học..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((classItem) => (
          <Card key={classItem.id}>
            <CardHeader>
              <CardTitle>{classItem.name}</CardTitle>
              <CardDescription>{classItem.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>Môn học: {classItem.subjectName}</p>
                <p>Số học viên: {classItem.studentCount}</p>
                <p>Giáo viên: {classItem.teacherName}</p>
                <p>Ngày tạo: {new Date(classItem.createdAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 
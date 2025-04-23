'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { classService } from '@/services/classService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import axios from 'axios'

export default function CreateClassPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [subjects, setSubjects] = useState<{ id: number; name: string }[]>([])
  const [formData, setFormData] = useState({
    name: '',
    classCode: '',
    description: '',
    subjectId: ''
  })

  useEffect(() => {
    // Fetch subjects when component mounts
    const fetchSubjects = async () => {
      try {
        const response = await fetch('http://localhost:8080/subjects/all')
        const data = await response.json()
        setSubjects(data)
      } catch (error) {
        console.error('Lỗi tải danh sách môn học:', error)
        toast.error('Không thể tải danh sách môn học')
      }
    }
    fetchSubjects()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Vui lòng đăng nhập lại')
      }

      const response = await axios.post(
        `http://localhost:8080/classes/create?userId=${user?.id}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      router.push('/dashboard/classes')
    } catch (error) {
      console.error('Error creating class:', error)
      toast.error('Không thể tạo lớp học')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubjectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      subjectId: value
    }))
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Thêm lớp học mới</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Thông tin lớp học</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên lớp học</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nhập tên lớp học"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="classCode">Mã lớp học</Label>
              <Input
                id="classCode"
                name="classCode"
                value={formData.classCode}
                onChange={handleChange}
                placeholder="Nhập mã lớp học"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subjectId">Môn học</Label>
              <Select onValueChange={handleSubjectChange} required>
                <SelectTrigger>
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Nhập mô tả lớp học"
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Đang tạo...' : 'Tạo lớp học'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 
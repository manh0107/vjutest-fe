'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from 'sonner'
import { Class, classService } from '@/services/classService'
import { useParams } from 'next/navigation'

export default function EditClassPage() {
  const router = useRouter()
  const params = useParams()
  const classId = Number(params.id)

  const [formData, setFormData] = useState({
    name: '',
    classCode: '',
    description: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const classData = await classService.getClass(classId)
        setFormData({
          name: classData.name,
          classCode: classData.classCode,
          description: classData.description
        })
      } catch (error) {
        console.error('Error fetching class:', error)
        toast.error('Không thể tải thông tin lớp học')
        router.push('/dashboard/classes')
      }
    }

    fetchClass()
  }, [classId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await classService.updateClass(classId, formData)
      toast.success('Cập nhật lớp học thành công')
      router.push('/dashboard/classes')
    } catch (error) {
      console.error('Error updating class:', error)
      toast.error('Không thể cập nhật lớp học')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <Card className="max-w-[800px] mx-auto">
      <CardHeader>
        <CardTitle>Chỉnh sửa lớp học</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Tên lớp học
            </label>
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
            <label htmlFor="classCode" className="text-sm font-medium">
              Mã lớp
            </label>
            <Input
              id="classCode"
              name="classCode"
              value={formData.classCode}
              onChange={handleChange}
              placeholder="Nhập mã lớp"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Mô tả
            </label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả lớp học"
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/classes')}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 
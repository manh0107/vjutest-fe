"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Class, UpdateClassData } from '@/services/classService'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface ClassModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: UpdateClassData) => Promise<void>
  classData: Class | null
  isLoading: boolean
}

export function ClassModal({ isOpen, onClose, onSubmit, classData, isLoading }: ClassModalProps) {
  const [formData, setFormData] = useState<UpdateClassData>({
    name: '',
    classCode: '',
    description: ''
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (classData) {
      setFormData({
        name: classData.name,
        classCode: classData.classCode,
        description: classData.description
      })
    } else {
      setFormData({
        name: '',
        classCode: '',
        description: ''
      })
    }
    setError(null)
  }, [classData, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    try {
      await onSubmit(formData)
      toast.success('Cập nhật lớp học thành công')
      onClose()
    } catch (error: any) {
      console.error('Lỗi khi lưu lớp học:', error)
      setError(error.response?.data?.message || error.message || 'Không thể lưu lớp học')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Cập nhật lớp học
          </DialogTitle>
          <DialogDescription>
            Chỉnh sửa thông tin lớp học hiện tại.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Tên lớp học</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Nhập tên lớp học"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="classCode">Mã lớp</Label>
            <Input
              id="classCode"
              name="classCode"
              value={formData.classCode}
              onChange={handleChange}
              required
              placeholder="Nhập mã lớp"
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">Mã lớp học sẽ tự động thêm tiền tố "C-"</p>
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
              className={`w-full ${formData.description.length > 500 ? 'border-red-500' : ''}`}
            />
            {formData.description.length > 500 && (
              <p className="text-sm text-red-500">Mô tả không được vượt quá 500 ký tự</p>
            )}
            <p className="text-sm text-muted-foreground">
              {formData.description.length}/500 ký tự
            </p>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Đang lưu...' : 'Cập nhật'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Subject, CreateSubjectData, UpdateSubjectData } from '@/services/subjectService'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface SubjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateSubjectData | UpdateSubjectData) => Promise<void>
  subject: Subject | null
  isLoading: boolean
}

export function SubjectModal({ isOpen, onClose, onSubmit, subject, isLoading }: SubjectModalProps) {
  const [formData, setFormData] = useState<CreateSubjectData>({
    name: '',
    subjectCode: '',
    description: '',
    creditHour: 3
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (subject) {
      setFormData({
        name: subject.name,
        subjectCode: subject.subjectCode,
        description: subject.description,
        creditHour: subject.creditHour
      })
    } else {
      setFormData({
        name: '',
        subjectCode: '',
        description: '',
        creditHour: 3
      })
    }
    // Reset error when modal opens/closes
    setError(null)
  }, [subject, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'creditHour' ? parseInt(value) || 0 : value
    }))
    // Clear error when user starts typing
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    try {
      await onSubmit(formData)
      toast.success(subject ? 'Cập nhật môn học thành công' : 'Tạo môn học thành công')
      onClose()
    } catch (error: any) {
      console.error('Lỗi khi lưu môn học:', error)
      // Hiển thị lỗi từ server hoặc lỗi mặc định
      setError(error.response?.data?.message || error.message || 'Không thể lưu môn học')
      // KHÔNG đóng modal khi có lỗi
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {subject ? 'Cập nhật môn học' : 'Tạo môn học mới'}
          </DialogTitle>
          <DialogDescription>
            {subject ? 'Chỉnh sửa thông tin môn học hiện tại.' : 'Thêm một môn học mới vào hệ thống.'}
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
            <Label htmlFor="name">Tên môn học</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Nhập tên môn học"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subjectCode">Mã môn học</Label>
            <Input
              id="subjectCode"
              name="subjectCode"
              value={formData.subjectCode}
              onChange={handleChange}
              required
              placeholder="Nhập mã môn học"
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">Mã môn học sẽ tự động thêm tiền tố "S-"</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="creditHour">Số tín chỉ</Label>
            <Input
              id="creditHour"
              name="creditHour"
              type="number"
              min="1"
              max="10"
              value={formData.creditHour}
              onChange={handleChange}
              required
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả môn học"
              rows={4}
              className="w-full"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Đang lưu...' : subject ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
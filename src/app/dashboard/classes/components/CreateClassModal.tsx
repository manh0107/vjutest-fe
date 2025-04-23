'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import axios from 'axios'

interface CreateClassModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateClassModal({ isOpen, onClose, onSuccess }: CreateClassModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    classCode: '',
    description: ''
  })
  const [errors, setErrors] = useState<{
    name?: string;
    classCode?: string;
    description?: string;
    server?: string;
  }>({})
  const [loading, setLoading] = useState(false)

  const validateForm = () => {
    const newErrors: typeof errors = {}
    let isValid = true

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Tên lớp học không được để trống'
      isValid = false
    } else if (formData.name.length < 3) {
      newErrors.name = 'Tên lớp học phải có ít nhất 3 ký tự'
      isValid = false
    } else if (formData.name.length > 100) {
      newErrors.name = 'Tên lớp học không được vượt quá 100 ký tự'
      isValid = false
    }

    // Validate class code
    if (!formData.classCode.trim()) {
      newErrors.classCode = 'Mã lớp học không được để trống'
      isValid = false
    } else if (!/^[a-zA-Z0-9-]+$/.test(formData.classCode)) {
      newErrors.classCode = 'Mã lớp học chỉ được chứa chữ cái, số và dấu gạch ngang'
      isValid = false
    } else if (formData.classCode.length > 20) {
      newErrors.classCode = 'Mã lớp học không được vượt quá 20 ký tự'
      isValid = false
    }

    // Validate description
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Mô tả không được vượt quá 500 ký tự'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

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

      toast.success('Tạo lớp học thành công', {
        description: `Đã tạo lớp học "${formData.name}"`
      })
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error creating class:', error)
      console.error('Error response:', error.response?.data)
      const errorMessage = error.response?.data?.message || error.message
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        if (errorMessage.includes('classCode')) {
          setErrors({
            ...errors,
            classCode: 'Mã lớp học đã được sử dụng'
          })
        } else if (errorMessage.includes('name')) {
          setErrors({
            ...errors,
            name: 'Tên lớp học đã tồn tại'
          })
        } else {
          setErrors({
            ...errors,
            server: `Lỗi: ${errorMessage}`
          })
        }
      } else if (error.response?.status === 403) {
        toast.error('Không có quyền truy cập', {
          description: 'Bạn không có quyền tạo lớp học mới'
        })
      } else {
        toast.error('Có lỗi xảy ra', {
          description: 'Không thể tạo lớp học. Vui lòng thử lại sau.'
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo lớp học mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên lớp học</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên lớp học"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
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
          {errors.server && (
            <p className="text-sm text-red-500 mt-2">{errors.server}</p>
          )}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Đang tạo...' : 'Tạo lớp học'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
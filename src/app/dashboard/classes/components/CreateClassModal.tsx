'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import axios from 'axios'
import { majorService, Major } from '@/services/majorService'
import { departmentService, Department } from '@/services/departmentService'
import { MultiSelect } from '@/components/ui/multiselect'

interface CreateClassModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface FormData {
  name: string
  classCode: string
  description: string
  visibility: 'PUBLIC' | 'DEPARTMENT' | 'MAJOR'
  departmentIds: number[]
  majorIds: number[]
}

export function CreateClassModal({ isOpen, onClose, onSuccess }: CreateClassModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    classCode: '',
    description: '',
    visibility: 'PUBLIC',
    departmentIds: [],
    majorIds: []
  })
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<string[]>([])
  const [selectedMajorIds, setSelectedMajorIds] = useState<string[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [majors, setMajors] = useState<Major[]>([])
  const [filteredMajors, setFilteredMajors] = useState<Major[]>([])
  const [errors, setErrors] = useState<{
    name?: string;
    classCode?: string;
    description?: string;
    departmentIds?: string;
    majorIds?: string;
    server?: string;
  }>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const [majorsData, departmentsData] = await Promise.all([
        majorService.getAllMajors(),
        departmentService.getAllDepartments()
      ])
      setMajors(majorsData)
      setDepartments(departmentsData)
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (formData.visibility === 'MAJOR' && selectedDepartmentIds.length > 0) {
      const filtered = majors.filter(major => 
        selectedDepartmentIds.includes(major.departmentId.toString())
      )
      setFilteredMajors(filtered)
    } else {
      setFilteredMajors([])
    }
  }, [selectedDepartmentIds, majors, formData.visibility])

  const handleVisibilityChange = (value: FormData['visibility']) => {
    setFormData(prev => ({...prev, visibility: value}))
    setSelectedDepartmentIds([])
    setSelectedMajorIds([])
  }

  const validateForm = () => {
    const newErrors: typeof errors = {}
    let isValid = true

    if (!formData.name.trim()) {
      newErrors.name = 'Tên lớp học không được để trống'
      isValid = false
    }

    if (!formData.classCode.trim()) {
      newErrors.classCode = 'Mã lớp học không được để trống'
      isValid = false
    }

    if (formData.visibility === 'DEPARTMENT' && selectedDepartmentIds.length === 0) {
      newErrors.departmentIds = 'Vui lòng chọn ít nhất một khoa'
      isValid = false
    }

    if (formData.visibility === 'MAJOR') {
      if (selectedDepartmentIds.length === 0) {
        newErrors.departmentIds = 'Vui lòng chọn ít nhất một khoa'
        isValid = false
      }
      if (selectedMajorIds.length === 0) {
        newErrors.majorIds = 'Vui lòng chọn ít nhất một ngành'
        isValid = false
      }
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
      console.log('Token:', token) // Debug token
      
      if (!token) {
        throw new Error('Vui lòng đăng nhập lại')
      }

      const payload = {
        ...formData,
        departmentIds: selectedDepartmentIds.map(Number),
        majorIds: selectedMajorIds.map(Number)
      }
      console.log('Payload:', payload) // Debug payload

      const response = await axios.post(
        `http://localhost:8080/classes/create?userId=${user?.id}`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      console.log('Response:', response) // Debug response

      toast.success('Tạo lớp học thành công', {
        description: `Đã tạo lớp học "${formData.name}"`
      })
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error creating class:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error headers:', error.response?.headers) // Debug headers
      console.error('Error config:', error.config) // Debug request config
      
      const errorMessage = error.response?.data?.message || error.message
      
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
          description: 'Bạn không có quyền tạo lớp học mới. Vui lòng kiểm tra lại token hoặc đăng nhập lại.'
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
          <div className="space-y-2">
            <Label htmlFor="visibility">Phạm vi truy cập</Label>
            <select
              id="visibility"
              name="visibility"
              value={formData.visibility}
              onChange={(e) => handleVisibilityChange(e.target.value as FormData['visibility'])}
              className="w-full p-2 border rounded"
            >
              <option value="PUBLIC">Toàn trường</option>
              <option value="DEPARTMENT">Theo khoa</option>
              <option value="MAJOR">Theo ngành</option>
            </select>
          </div>
          {formData.visibility === 'DEPARTMENT' && (
            <div className="space-y-2">
              <Label>Khoa</Label>
              <MultiSelect
                options={departments.map(d => ({ value: d.id.toString(), label: d.name }))}
                selected={selectedDepartmentIds}
                onChange={setSelectedDepartmentIds}
                placeholder="Chọn khoa"
              />
              {errors.departmentIds && (
                <p className="text-sm text-red-500">{errors.departmentIds}</p>
              )}
            </div>
          )}
          {formData.visibility === 'MAJOR' && (
            <>
              <div className="space-y-2">
                <Label>Khoa</Label>
                <MultiSelect
                  options={departments.map(d => ({ value: d.id.toString(), label: d.name }))}
                  selected={selectedDepartmentIds}
                  onChange={setSelectedDepartmentIds}
                  placeholder="Chọn khoa"
                />
                {errors.departmentIds && (
                  <p className="text-sm text-red-500">{errors.departmentIds}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Ngành</Label>
                <MultiSelect
                  options={filteredMajors.map(m => ({ value: m.id.toString(), label: m.name }))}
                  selected={selectedMajorIds}
                  onChange={setSelectedMajorIds}
                  placeholder="Chọn ngành"
                />
                {errors.majorIds && (
                  <p className="text-sm text-red-500">{errors.majorIds}</p>
                )}
              </div>
            </>
          )}
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
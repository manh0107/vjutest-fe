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
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { majorService, Major } from '@/services/majorService'
import { departmentService, Department } from '@/services/departmentService'
import { MultiSelect } from '@/components/ui/multiselect'

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
    creditHour: 1,
    visibility: 'PUBLIC',
  })
  const [error, setError] = useState<string | null>(null)
  const [visibility, setVisibility] = useState<'PUBLIC' | 'DEPARTMENT' | 'MAJOR'>('PUBLIC')
  const [departments, setDepartments] = useState<Department[]>([])
  const [majors, setMajors] = useState<Major[]>([])
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<string[]>([])
  const [selectedMajorIds, setSelectedMajorIds] = useState<string[]>([])

  useEffect(() => {
    if (subject) {
      setFormData({
        name: subject.name || '',
        subjectCode: subject.subjectCode || '',
        description: subject.description || '',
        creditHour: subject.creditHour || 0,
        majorIds: subject.majorIds || [0],
        visibility: subject.visibility as 'PUBLIC' | 'DEPARTMENT' | 'MAJOR',
      })
      setSelectedMajorIds(subject.majorIds ? subject.majorIds.map(String) : [])
    } else {
      setFormData({
        name: '',
        subjectCode: '',
        description: '',
        creditHour: 0,
        majorIds: [0],
        visibility: 'PUBLIC',
      })
      setSelectedMajorIds([])
    }
    // Reset error when modal opens/closes
    setError(null)
  }, [subject, isOpen])

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'creditHour' ? Number(value) : value,
      majorId: Number(selectedMajorIds[0]) || 0,
    }))
    // Clear error when user starts typing
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.name.trim()) {
      setError('Tên môn học không được để trống')
      return
    }
    if (!formData.subjectCode.trim()) {
      setError('Mã môn học không được để trống')
      return
    }
    if (formData.creditHour < 1 || formData.creditHour > 10) {
      setError('Số tín chỉ phải từ 1 đến 10')
      return
    }
    if (!formData.description.trim()) {
      setError('Mô tả không được để trống')
      return
    }
    if (formData.description.length > 500) {
      setError('Mô tả không được vượt quá 500 ký tự')
      return
    }

    // Kiểm tra visibility và các trường liên quan
    if (visibility === 'DEPARTMENT' && selectedDepartmentIds.length === 0) {
      setError('Vui lòng chọn ít nhất một khoa')
      return
    }
    if (visibility === 'MAJOR' && (selectedDepartmentIds.length === 0 || selectedMajorIds.length === 0)) {
      setError('Vui lòng chọn ít nhất một khoa và một ngành')
      return
    }

    try {
      const submitData: CreateSubjectData = {
        name: formData.name.trim(),
        subjectCode: formData.subjectCode.trim(),
        description: formData.description.trim(),
        creditHour: formData.creditHour,
        visibility: visibility,
      }

      // Xử lý departmentIds và majorIds theo visibility
      if (visibility === 'DEPARTMENT') {
        // Khi chọn theo khoa, chỉ gửi departmentIds
        submitData.departmentIds = selectedDepartmentIds.map(Number)
      } else if (visibility === 'MAJOR') {
        // Khi chọn theo ngành, gửi cả departmentIds và majorIds
        submitData.departmentIds = selectedDepartmentIds.map(Number)
        submitData.majorIds = selectedMajorIds.map(Number)
      }

      await onSubmit(submitData)
      toast.success(subject ? 'Cập nhật môn học thành công' : 'Tạo môn học thành công')
      onClose()
    } catch (error: any) {
      console.error('Lỗi khi lưu môn học:', error)
      setError(error.response?.data?.message || error.message || 'Không thể lưu môn học')
    }
  }

  const filteredMajors = selectedDepartmentIds.length > 0 ? majors.filter(m => selectedDepartmentIds.includes(String(m.departmentId))) : majors

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
            <Label htmlFor="visibility">Phạm vi hiển thị</Label>
            <Select value={visibility} onValueChange={v => setVisibility(v as any)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn phạm vi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PUBLIC">Toàn trường</SelectItem>
                <SelectItem value="DEPARTMENT">Theo khoa</SelectItem>
                <SelectItem value="MAJOR">Theo ngành</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {visibility !== 'PUBLIC' && (
            <div className="space-y-2">
              <Label htmlFor="departments">Khoa</Label>
              <MultiSelect
                options={departments.map(d => ({ label: d.name, value: String(d.id) }))}
                selected={selectedDepartmentIds}
                onChange={setSelectedDepartmentIds}
                placeholder="Chọn một hoặc nhiều khoa"
              />
            </div>
          )}
          {visibility === 'MAJOR' && (
            <div className="space-y-2">
              <Label htmlFor="majors">Ngành</Label>
              <MultiSelect
                options={majors.map(m => ({ label: m.name, value: String(m.id) }))}
                selected={selectedMajorIds}
                onChange={setSelectedMajorIds}
                placeholder="Chọn một hoặc nhiều ngành"
              />
            </div>
          )}
          <div className="flex justify-end gap-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700"
              disabled={isLoading || formData.description.length > 500}
            >
              {isLoading ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
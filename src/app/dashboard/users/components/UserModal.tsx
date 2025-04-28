'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { User } from '@/services/types'
import { ImageIcon, Upload } from 'lucide-react'
import React from 'react'
import { useUserForm } from '@/hooks/useUserForm'
import { departmentService } from '@/services/departmentService'
import { majorService } from '@/services/majorService'

interface Department {
  id: number;
  name: string;
}

interface Major {
  id: number;
  name: string;
  departmentId: number;
}

// Extended User type to include form fields
interface UserFormData extends Partial<User> {
  password?: string;
}

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (user: UserFormData) => Promise<void>
  user?: User
  title: string
}

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  code?: string;
  phoneNumber?: string;
  department?: string;
  major?: string;
}

const roleOptions = [
  { value: 'ROLE_USER', label: 'Sinh viên' },
  { value: 'ROLE_TEACHER', label: 'Giảng viên' },
  { value: 'ROLE_ADMIN', label: 'Quản trị viên' }
] as const

const genderOptions = [
  { value: 'MALE', label: 'Nam' },
  { value: 'FEMALE', label: 'Nữ' },
  { value: 'OTHER', label: 'Khác' }
] as const

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_BASE64_LENGTH = 500 * 1024; // 500KB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

export function UserModal({ isOpen, onClose, onSubmit, user, title }: UserModalProps) {
  const { formData, setFormData, validationErrors, setValidationErrors, validateForm, resetForm } = useUserForm(user)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [majors, setMajors] = useState<Major[]>([])
  const [filteredMajors, setFilteredMajors] = useState<Major[]>([])

  useEffect(() => {
    const loadDepartmentsAndMajors = async () => {
      try {
        const [depsData, majorsData] = await Promise.all([
          departmentService.getAllDepartments(),
          majorService.getAllMajors()
        ]);
        setDepartments(depsData);
        setMajors(majorsData);
      } catch (error) {
        console.error('Error loading departments and majors:', error);
        setError('Không thể tải danh sách khoa và ngành');
      }
    };

    if (isOpen) {
      loadDepartmentsAndMajors();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.department?.id) {
      setFilteredMajors(majors.filter(major => major.departmentId === formData.department?.id));
    } else {
      setFilteredMajors([]);
    }
  }, [formData.department, majors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setValidationErrors({})
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit(formData)
      resetForm()
      onClose()
    } catch (err: any) {
      const errorMessage = err.message;
      
      // Xử lý các loại lỗi validation cụ thể
      if (errorMessage.includes('Email đã tồn tại')) {
        setValidationErrors(prev => ({
          ...prev,
          email: 'Email này đã được sử dụng, vui lòng sử dụng email khác'
        }))
      } else if (errorMessage.includes('Mã số đã tồn tại')) {
        setValidationErrors(prev => ({
          ...prev,
          code: 'Mã số này đã được sử dụng, vui lòng chọn mã số khác'
        }))
      } else if (errorMessage.includes('Mật khẩu không đủ mạnh')) {
        setValidationErrors(prev => ({
          ...prev,
          password: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số'
        }))
      } else if (errorMessage.includes('Số điện thoại không hợp lệ')) {
        setValidationErrors(prev => ({
          ...prev,
          phoneNumber: 'Số điện thoại không hợp lệ, vui lòng kiểm tra lại'
        }))
      } else if (errorMessage.includes('Email không hợp lệ')) {
        setValidationErrors(prev => ({
          ...prev,
          email: 'Email không hợp lệ, vui lòng kiểm tra lại định dạng'
        }))
      } else if (errorMessage.includes('Tên không hợp lệ')) {
        setValidationErrors(prev => ({
          ...prev,
          name: 'Tên không được để trống và phải có ít nhất 2 ký tự'
        }))
      } else {
        // Hiển thị thông báo lỗi chung nếu không phải lỗi validation
        setError(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError('Chỉ chấp nhận file ảnh định dạng JPG, PNG, GIF hoặc WebP')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('Kích thước file không được vượt quá 5MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setFormData(prev => ({ ...prev, image: result }))
      setImagePreview(result)
    }
    reader.readAsDataURL(file)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
          <DialogDescription className="text-gray-500">
            {user ? 'Chỉnh sửa thông tin người dùng. Để trống mật khẩu nếu không muốn thay đổi.' : 'Thêm người dùng mới vào hệ thống.'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Cột trái */}
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Họ và tên</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  disabled={isSubmitting}
                />
                {validationErrors.name && (
                  <p className="text-sm text-red-500">{validationErrors.name}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="code">Mã số</Label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Nhập mã số"
                  value={formData.code || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setFormData(prev => ({ ...prev, code: value ? parseInt(value) : undefined }));
                  }}
                  required
                  disabled={isSubmitting}
                />
                {validationErrors.code && (
                  <p className="text-sm text-red-500">{validationErrors.code}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required={!user}
                  disabled={isSubmitting}
                  placeholder={user ? "Để trống nếu không muốn thay đổi" : ""}
                />
                {validationErrors.password && (
                  <p className="text-sm text-red-500">{validationErrors.password}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label>Vai trò</Label>
                <Select
                  value={(() => {
                    if (typeof formData.role === 'string') return formData.role;
                    if (typeof formData.role === 'object' && formData.role?.id) {
                      switch (formData.role.id) {
                        case 1: return 'ROLE_ADMIN';
                        case 2: return 'ROLE_TEACHER';
                        case 3: return 'ROLE_USER';
                        default: return '';
                      }
                    }
                    return '';
                  })()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Cột phải */}
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  disabled={isSubmitting}
                />
                {validationErrors.email && (
                  <p className="text-sm text-red-500">{validationErrors.email}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label>Khoa</Label>
                <Select
                  value={formData.department?.id?.toString() || ""}
                  onValueChange={(value) => {
                    const departmentId = parseInt(value);
                    const selectedDepartment = departments.find(d => d.id === departmentId);
                    setFormData(prev => ({
                      ...prev,
                      department: selectedDepartment ? { id: departmentId, name: selectedDepartment.name } : undefined,
                      major: undefined // Reset major when department changes
                    }));
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn khoa" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Ngành</Label>
                <Select
                  value={formData.major?.id?.toString() || ""}
                  onValueChange={(value) => {
                    const majorId = parseInt(value);
                    const selectedMajor = majors.find(m => m.id === majorId);
                    setFormData(prev => ({
                      ...prev,
                      major: selectedMajor ? { id: majorId, name: selectedMajor.name } : undefined
                    }));
                  }}
                  disabled={isSubmitting || !formData.department}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.department ? "Chọn ngành" : "Vui lòng chọn khoa trước"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredMajors.map(major => (
                      <SelectItem key={major.id} value={major.id.toString()}>
                        {major.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phoneNumber">Số điện thoại</Label>
                <Input
                  id="phoneNumber"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Nhập số điện thoại"
                  value={formData.phoneNumber || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setFormData(prev => ({ ...prev, phoneNumber: value ? parseInt(value) : undefined }));
                  }}
                  disabled={isSubmitting}
                />
                {validationErrors.phoneNumber && (
                  <p className="text-sm text-red-500">{validationErrors.phoneNumber}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label>Giới tính</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn giới tính" />
                  </SelectTrigger>
                  <SelectContent>
                    {genderOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Trạng thái</Label>
                <Select
                  value={formData.isEnabled?.toString() || "true"}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, isEnabled: value === "true" }))}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Hoạt động</SelectItem>
                    <SelectItem value="false">Vô hiệu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Phần upload ảnh */}
          <div className="grid gap-4">
            <Label>Ảnh đại diện</Label>
            
            {/* Tùy chọn nhập URL */}
            <div className="grid gap-2">
              <Label className="text-sm text-gray-500">Nhập URL ảnh</Label>
              <Input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.image}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Hoặc</span>
              </div>
            </div>

            {/* Tùy chọn tải ảnh từ máy */}
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 border rounded-lg overflow-hidden">
                {imagePreview || formData.image ? (
                  <img
                    src={imagePreview || formData.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Tải ảnh từ máy
                </Button>
                <p className="text-xs text-gray-500">
                  Định dạng: JPG, PNG, GIF, WebP. Tối đa 5MB
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : user ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
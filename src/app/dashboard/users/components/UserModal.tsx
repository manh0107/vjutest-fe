'use client'

import { useState, useEffect, useRef } from 'react'
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
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

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
  imageUrl?: string;
}

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (user: UserFormData, file?: File) => Promise<void>
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | undefined>(undefined)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [majors, setMajors] = useState<Major[]>([])
  const [filteredMajors, setFilteredMajors] = useState<Major[]>([])

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

    // Cập nhật imageFile state
    setImageFile(file)

    // Chỉ hiển thị preview
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setImagePreview(result)
    }
    reader.readAsDataURL(file)
  }

  const getRoleId = (role: string | undefined) => {
    switch(role) {
      case 'ROLE_ADMIN': return 1;
      case 'ROLE_TEACHER': return 2;
      case 'ROLE_USER': return 3;
      default: return 3;
    }
  };

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
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const userData = {
        ...formData,
        name: formData.name,
        email: formData.email,
        code: formData.code ? Number(formData.code) : undefined,
        phoneNumber: formData.phoneNumber ? Number(formData.phoneNumber) : undefined,
        gender: formData.gender,
        isEnabled: formData.isEnabled,
        department: formData.department?.id ? { id: formData.department.id, name: formData.department.name } : undefined,
        major: formData.major?.id ? { id: formData.major.id, name: formData.major.name } : undefined,
        role: { id: getRoleId(typeof formData.role === 'string' ? formData.role : '') }
      };

      const formDataToSend = new FormData();
      formDataToSend.append('user', JSON.stringify(userData));
      if (imageFile) {
        formDataToSend.append('file', imageFile);
      }

      await onSubmit(userData, imageFile);

      resetForm();
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi lưu dữ liệu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetForm();
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
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
                    // Ưu tiên lấy từ formData nếu đã chọn
                    if (typeof formData.role === 'string') {
                      if (["ROLE_USER", "ROLE_TEACHER", "ROLE_ADMIN"].includes(formData.role)) return formData.role;
                      if (formData.role === 'student') return 'ROLE_USER';
                      if (formData.role === 'teacher') return 'ROLE_TEACHER';
                      if (formData.role === 'admin') return 'ROLE_ADMIN';
                    }
                    if (typeof formData.role === 'object' && formData.role?.id) {
                      switch (formData.role.id) {
                        case 1: return 'ROLE_ADMIN';
                        case 2: return 'ROLE_TEACHER';
                        case 3: return 'ROLE_USER';
                        default: return '';
                      }
                    }
                    // Nếu đang cập nhật user, lấy từ user.role
                    if (user) {
                      if (typeof user.role === 'string') {
                        if (["ROLE_USER", "ROLE_TEACHER", "ROLE_ADMIN"].includes(user.role)) return user.role;
                        if (user.role === 'student') return 'ROLE_USER';
                        if (user.role === 'teacher') return 'ROLE_TEACHER';
                        if (user.role === 'admin') return 'ROLE_ADMIN';
                      }
                      if (typeof user.role === 'object' && user.role?.id) {
                        switch (user.role.id) {
                          case 1: return 'ROLE_ADMIN';
                          case 2: return 'ROLE_TEACHER';
                          case 3: return 'ROLE_USER';
                          default: return '';
                        }
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

          {/* Phần upload ảnh - chỉ hiển thị khi cập nhật */}
          {user && (
            <div className="grid gap-4">
              <Label>Ảnh đại diện</Label>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 border rounded-lg overflow-hidden">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <div className="space-y-2">
                        <div className="flex items-center justify-center">
                          <Upload className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-600">
                          Kéo thả ảnh vào đây hoặc
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="ml-1 text-blue-600 hover:text-blue-500 font-medium"
                          >
                            chọn ảnh
                          </button>
                        </p>
                        <p className="text-xs text-gray-500">
                          Định dạng: JPG, PNG, GIF, WebP. Tối đa 5MB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

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
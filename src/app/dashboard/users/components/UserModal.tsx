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

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (user: Partial<User>) => Promise<void>
  user?: User
  title: string
}

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  code?: string;
  phoneNumber?: string;
  className?: string;
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

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_BASE64_LENGTH = 500 * 1024; // 500KB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export function UserModal({ isOpen, onClose, onSubmit, user, title }: UserModalProps) {
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    code: '',
    phoneNumber: '',
    role: 'ROLE_USER',
    isEnabled: true,
    password: '',
    className: '',
    gender: 'MALE',
    image: ''
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      code: '',
      phoneNumber: '',
      role: 'ROLE_USER',
      isEnabled: true,
      password: '',
      className: '',
      gender: 'MALE',
      image: ''
    })
    setImagePreview(null)
    setError(null)
    setValidationErrors({})
  }

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        code: user.code || '',
        phoneNumber: user.phoneNumber || '',
        role: typeof user.role === 'string' ? user.role : user.role?.name || 'ROLE_USER',
        isEnabled: user.isEnabled ?? true,
        password: '',
        className: user.className || '',
        gender: user.gender || 'MALE',
        image: user.image || ''
      })
      if (user.image) {
        setImagePreview(user.image)
      }
    } else {
      resetForm()
    }
  }, [user])

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}

    // Validate name
    if (!formData.name?.trim()) {
      errors.name = 'Tên không được để trống'
    }

    // Validate email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
    if (!formData.email?.trim()) {
      errors.email = 'Email không được để trống'
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Email không hợp lệ'
    }

    // Validate password for new user
    if (!user && (!formData.password || formData.password.length < 8 || formData.password.length > 25)) {
      errors.password = 'Mật khẩu phải từ 8-25 ký tự'
    }

    // Validate code
    if (!formData.code?.toString().trim()) {
      errors.code = 'Mã số không được để trống'
    } else if (formData.code.toString().length !== 8) {
      errors.code = 'Mã số phải đúng 8 ký tự'
    }

    // Validate phone number
    if (!formData.phoneNumber?.toString().trim()) {
      errors.phoneNumber = 'Số điện thoại không được để trống'
    } else if (formData.phoneNumber.toString().length !== 10) {
      errors.phoneNumber = 'Số điện thoại phải đúng 10 ký tự'
    }

    // Validate class name
    if (!formData.className?.trim()) {
      errors.className = 'Lớp không được để trống'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Validate và chuẩn hóa dữ liệu trước khi gửi
      const submissionData = {
        ...formData,
        className: formData.className?.toString().trim() || undefined,
        gender: formData.gender || undefined,
        phoneNumber: formData.phoneNumber 
          ? (typeof formData.phoneNumber === 'string' 
              ? formData.phoneNumber.trim() 
              : formData.phoneNumber.toString())
          : undefined
      }

      await onSubmit(submissionData)
      // Chỉ reset form và đóng modal khi thành công
      resetForm()
      onClose()
    } catch (err: any) {
      // Hiển thị lỗi từ server hoặc lỗi mặc định
      const errorMessage = err.message || 'Có lỗi xảy ra khi lưu thông tin'
      setError(errorMessage)
      // Không đóng modal và giữ nguyên dữ liệu đã nhập
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRoleLabel = (roleValue: string) => {
    return roleOptions.find(role => role.value === roleValue)?.label || roleValue
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      setError('Kích thước file không được vượt quá 2MB')
      return
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError('Chỉ chấp nhận file ảnh định dạng: JPG, PNG, GIF, WEBP')
      return
    }

    try {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        if (base64String.length > MAX_BASE64_LENGTH) {
          setError('Ảnh quá lớn, vui lòng chọn ảnh nhỏ hơn')
          return
        }
        setImagePreview(base64String)
        setFormData({ ...formData, image: base64String })
        setError(null)
      }
      reader.onerror = () => {
        setError('Có lỗi khi đọc file ảnh')
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError('Có lỗi khi xử lý ảnh')
    }
  }

  const handleImageUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setFormData({ ...formData, image: url })
    
    if (url) {
      try {
        const response = await fetch(url)
        if (!response.ok) throw new Error('Không thể tải ảnh từ URL')
        
        const contentType = response.headers.get('content-type')
        if (!contentType || !ALLOWED_FILE_TYPES.includes(contentType)) {
          throw new Error('URL không phải là ảnh hợp lệ')
        }

        setImagePreview(url)
        setError(null)
      } catch (err: any) {
        setError('URL ảnh không hợp lệ hoặc không thể truy cập')
        setImagePreview(null)
      }
    } else {
      setImagePreview(null)
      setError(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetForm()
        onClose()
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
          <div className="grid gap-6">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right font-medium">
                Tên
              </Label>
              <div className="col-span-3">
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={validationErrors.name ? "border-red-500" : ""}
                  required
                  disabled={isSubmitting}
                />
                {validationErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right font-medium">
                Email
              </Label>
              <div className="col-span-3">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={validationErrors.email ? "border-red-500" : ""}
                  required
                  disabled={isSubmitting}
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                )}
              </div>
            </div>

            {!user && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right font-medium">
                  Mật khẩu
                </Label>
                <div className="col-span-3">
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={validationErrors.password ? "border-red-500" : ""}
                    required={!user}
                    disabled={isSubmitting}
                    placeholder={user ? 'Để trống nếu không đổi mật khẩu' : 'Nhập mật khẩu cho người dùng mới'}
                  />
                  {validationErrors.password && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right font-medium">
                Mã số
              </Label>
              <div className="col-span-3">
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className={validationErrors.code ? "border-red-500" : ""}
                  required
                  disabled={isSubmitting}
                  maxLength={8}
                />
                {validationErrors.code && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.code}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phoneNumber" className="text-right font-medium">
                Số điện thoại
              </Label>
              <div className="col-span-3">
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className={validationErrors.phoneNumber ? "border-red-500" : ""}
                  required
                  disabled={isSubmitting}
                  maxLength={10}
                  type="tel"
                />
                {validationErrors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.phoneNumber}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="className" className="text-right font-medium">
                Lớp
              </Label>
              <div className="col-span-3">
                <Input
                  id="className"
                  value={formData.className || ''}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  className={validationErrors.className ? "border-red-500" : ""}
                  required
                  disabled={isSubmitting}
                />
                {validationErrors.className && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.className}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gender" className="text-right font-medium">
                Giới tính
              </Label>
              <Select
                value={formData.gender || 'MALE'}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
                disabled={isSubmitting}
              >
                <SelectTrigger className="col-span-3">
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

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right font-medium">
                Vai trò
              </Label>
              <Select
                value={formData.role?.toString()}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
                disabled={isSubmitting}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn vai trò">
                    {formData.role && getRoleLabel(formData.role.toString())}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right font-medium">
                Trạng thái
              </Label>
              <Select
                value={formData.isEnabled ? "active" : "inactive"}
                onValueChange={(value) => setFormData({ ...formData, isEnabled: value === "active" })}
                disabled={isSubmitting}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Vô hiệu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Phần upload ảnh chỉ hiển thị khi đang cập nhật người dùng */}
            {user && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image" className="text-right font-medium">
                  Ảnh đại diện
                </Label>
                <div className="col-span-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSubmitting}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Tải ảnh lên
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                  </div>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={formData.image}
                    onChange={handleImageUrlChange}
                    placeholder="Hoặc nhập URL ảnh"
                    disabled={isSubmitting}
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-20 w-20 rounded-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
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
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
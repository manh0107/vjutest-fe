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

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (user: Partial<User>) => Promise<void>
  user?: User
  title: string
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
    gender: 'MALE'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      gender: 'MALE'
    })
    setError(null)
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
        gender: user.gender || 'MALE'
      })
    } else {
      resetForm()
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      if (!user && !formData.password) {
        throw new Error('Vui lòng nhập mật khẩu cho người dùng mới')
      }

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
      resetForm()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi lưu thông tin')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRoleLabel = (roleValue: string) => {
    return roleOptions.find(role => role.value === roleValue)?.label || roleValue
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
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="col-span-3"
                required
                disabled={isSubmitting}
              />
            </div>

            {!user && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right font-medium">
                  Mật khẩu
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="col-span-3"
                  required={!user}
                  disabled={isSubmitting}
                  placeholder={user ? 'Để trống nếu không đổi mật khẩu' : 'Nhập mật khẩu cho người dùng mới'}
                />
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right font-medium">
                Mã số
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="col-span-3"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phoneNumber" className="text-right font-medium">
                Số điện thoại
              </Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="col-span-3"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="className" className="text-right font-medium">
                Lớp
              </Label>
              <Input
                id="className"
                value={formData.className || ''}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                className="col-span-3"
                required
                disabled={isSubmitting}
              />
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
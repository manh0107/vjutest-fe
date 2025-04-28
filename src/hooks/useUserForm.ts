import { useState, useEffect } from 'react'
import { User } from '@/services/types'

interface UserFormData extends Partial<User> {
  password?: string;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  code?: string;
  phoneNumber?: string;
  role?: string;
  department?: string;
  major?: string;
}

export function useUserForm(initialUser?: User) {
  const initialFormData: UserFormData = {
    name: '',
    email: '',
    code: undefined,
    phoneNumber: undefined,
    role: 'ROLE_USER',
    isEnabled: true,
    password: '',
    gender: 'MALE',
    image: '',
    department: undefined,
    major: undefined
  }

  const [formData, setFormData] = useState<UserFormData>(initialFormData)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  useEffect(() => {
    if (initialUser) {
      setFormData({
        ...initialFormData,
        ...initialUser,
        role: (() => {
          if (typeof initialUser.role === 'object' && initialUser.role?.id) {
            return { id: initialUser.role.id };
          }
          return initialUser.role || 'ROLE_USER';
        })(),
        password: '',
        department: initialUser.department ?? undefined,
        major: initialUser.major ?? undefined,
      })
    } else {
      setFormData(initialFormData)
    }
  }, [initialUser])

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}

    if (!formData.name?.trim()) {
      errors.name = 'Tên không được để trống'
    }

    if (!formData.email?.trim()) {
      errors.email = 'Email không được để trống'
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      errors.email = 'Email không hợp lệ'
    }

    if (!initialUser && !formData.password?.trim()) {
      errors.password = 'Mật khẩu không được để trống'
    } else if (formData.password && formData.password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    }

    if (!formData.code) {
      errors.code = 'Mã số không được để trống'
    }

    if (!formData.phoneNumber) {
      errors.phoneNumber = 'Số điện thoại không được để trống'
    }

    if (!formData.role) {
      errors.role = 'Vai trò không được để trống'
    }

    if (!formData.department) {
      errors.department = 'Khoa không được để trống'
    }

    if (!formData.major) {
      errors.major = 'Ngành không được để trống'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setValidationErrors({})
  }

  return {
    formData,
    setFormData,
    validationErrors,
    setValidationErrors,
    validateForm,
    resetForm
  }
} 
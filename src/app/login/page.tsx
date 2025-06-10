'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import axios from 'axios'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const { user, login } = useAuth()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}
    
    if (!email) {
      newErrors.email = 'Vui lòng nhập email'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không hợp lệ'
    }
    
    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu'
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await login(email, password)
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error('Đăng nhập thất bại', {
        description: error.message || 'Vui lòng kiểm tra lại thông tin đăng nhập'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7f8fa] to-[#e6eaf3] py-8 px-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
        {/* Ảnh minh họa full bên trái, luôn hiển thị toàn bộ ảnh */}
        <div className="md:w-1/2 h-64 md:h-auto flex-shrink-0 flex items-center justify-center bg-white relative">
          <img src="/login.png" alt="Login Illustration" className="max-h-full max-w-full object-contain" style={{ width: '100%', height: '100%' }} />
        </div>
        {/* Form đăng nhập */}
        <div className="md:w-1/2 flex flex-col justify-center p-8">
          <h2 className="text-3xl font-extrabold text-[#b8021e] text-center mb-6">Đăng nhập vào hệ thống</h2>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block font-medium mb-1 text-[#b8021e]">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`w-full px-4 py-2 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:border-[#b8021e] focus:ring-2 focus:ring-[#b8021e]/20 outline-none text-gray-900 bg-gray-50`}
                placeholder="Nhập email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setErrors({ ...errors, email: undefined })
                }}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="block font-medium mb-1 text-[#b8021e]">Mật khẩu</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className={`w-full px-4 py-2 rounded-lg border ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:border-[#b8021e] focus:ring-2 focus:ring-[#b8021e]/20 outline-none text-gray-900 bg-gray-50`}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setErrors({ ...errors, password: undefined })
                  }}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 rounded-full bg-[#b8021e] text-white font-semibold text-lg shadow hover:bg-[#a00018] transition disabled:opacity-60 flex items-center justify-center"
            >
              {isLoading ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></span> : null}
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
            <div className="flex flex-col items-center gap-2 mt-2">
              <a href="/forgot-password" className="text-sm text-[#b8021e] hover:underline font-medium">Quên mật khẩu?</a>
              <Link
                href="/register"
                className="font-medium text-[#b8021e] hover:underline text-sm"
              >
                Chưa có tài khoản? Đăng ký ngay
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 
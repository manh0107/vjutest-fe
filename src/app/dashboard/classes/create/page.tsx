'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { classService } from '@/services/classService'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { useForm } from '@/hooks/useForm'
import { toast } from 'sonner'

interface CreateClassForm {
  name: string
  description: string
}

export default function CreateClassPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { values, errors, handleChange, handleSubmit } = useForm<CreateClassForm>({
    initialValues: {
      name: '',
      description: '',
    },
    validate: (values) => {
      const errors: Partial<CreateClassForm> = {}
      if (!values.name) {
        errors.name = 'Vui lòng nhập tên lớp học'
      }
      if (!values.description) {
        errors.description = 'Vui lòng nhập mô tả lớp học'
      }
      return errors
    },
    onSubmit: async (values) => {
      if (!user || user.role !== 'TEACHER') {
        toast.error('Bạn không có quyền tạo lớp học')
        return
      }

      setIsSubmitting(true)
      try {
        await classService.createClass(values)
        toast.success('Tạo lớp học thành công')
        router.push('/dashboard/classes')
      } catch (error) {
        console.error('Error creating class:', error)
        toast.error('Có lỗi xảy ra khi tạo lớp học')
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="max-w-3xl mx-auto">
          <Card>
            <Card.Header>
              <h2 className="text-lg font-medium text-gray-900">
                Tạo lớp học mới
              </h2>
            </Card.Header>
            <Card.Body>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Tên lớp học"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  error={errors.name}
                  required
                />

                <Input
                  label="Mô tả"
                  name="description"
                  value={values.description}
                  onChange={handleChange}
                  error={errors.description}
                  required
                />

                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                  >
                    Tạo lớp học
                  </Button>
                </div>
              </form>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  )
} 
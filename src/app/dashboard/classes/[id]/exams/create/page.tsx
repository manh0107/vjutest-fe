'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { examService } from '@/services/examService'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { useForm } from '@/hooks/useForm'
import { toast } from 'sonner'

interface Props {
  params: {
    id: string
  }
}

interface Question {
  content: string
  options: string[]
  correctAnswer: number
}

interface CreateExamForm {
  title: string
  description: string
  duration: string
  questions: Question[]
}

interface FormErrors {
  title?: string
  description?: string
  duration?: string
  questions?: string
}

export default function CreateExamPage({ params }: Props) {
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const classId = parseInt(params.id)

  const { values, errors, handleChange, handleSubmit, setValue } = useForm<CreateExamForm, FormErrors>({
    initialValues: {
      title: '',
      description: '',
      duration: '60',
      questions: [
        {
          content: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
        },
      ],
    },
    validate: (values) => {
      const errors: FormErrors = {}
      if (!values.title) {
        errors.title = 'Vui lòng nhập tiêu đề bài thi'
      }
      if (!values.description) {
        errors.description = 'Vui lòng nhập mô tả bài thi'
      }
      if (!values.duration || parseInt(values.duration) < 1) {
        errors.duration = 'Thời gian thi phải lớn hơn 0'
      }
      return errors
    },
    onSubmit: async (values) => {
      if (!user || user.role !== 'TEACHER') {
        toast.error('Bạn không có quyền tạo bài thi')
        return
      }

      setIsSubmitting(true)
      try {
        await examService.createExam({
          ...values,
          duration: parseInt(values.duration),
          classId,
        })
        toast.success('Tạo bài thi thành công')
        router.push(`/dashboard/classes/${classId}`)
      } catch (error) {
        console.error('Error creating exam:', error)
        toast.error('Có lỗi xảy ra khi tạo bài thi')
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  const addQuestion = () => {
    setValue('questions', [
      ...values.questions,
      {
        content: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
      },
    ])
  }

  const removeQuestion = (index: number) => {
    setValue(
      'questions',
      values.questions.filter((_, i) => i !== index)
    )
  }

  const updateQuestion = (index: number, field: keyof Question, value: string | number) => {
    setValue(
      'questions',
      values.questions.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      )
    )
  }

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    setValue(
      'questions',
      values.questions.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              options: q.options.map((opt, j) =>
                j === optionIndex ? value : opt
              ),
            }
          : q
      )
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="max-w-3xl mx-auto">
          <Card>
            <Card.Header>
              <h2 className="text-lg font-medium text-gray-900">
                Tạo bài thi mới
              </h2>
            </Card.Header>
            <Card.Body>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Tiêu đề bài thi"
                  name="title"
                  value={values.title}
                  onChange={handleChange}
                  error={errors.title}
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

                <Input
                  label="Thời gian làm bài (phút)"
                  name="duration"
                  type="number"
                  min="1"
                  value={values.duration}
                  onChange={handleChange}
                  error={errors.duration}
                  required
                />

                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">
                      Câu hỏi
                    </h3>
                    <Button type="button" onClick={addQuestion}>
                      Thêm câu hỏi
                    </Button>
                  </div>

                  {values.questions.map((question, questionIndex) => (
                    <Card key={questionIndex}>
                      <Card.Body>
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <Input
                              label={`Câu hỏi ${questionIndex + 1}`}
                              value={question.content}
                              onChange={(e) =>
                                updateQuestion(
                                  questionIndex,
                                  'content',
                                  e.target.value
                                )
                              }
                              required
                            />
                            {values.questions.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => removeQuestion(questionIndex)}
                                className="ml-4"
                              >
                                Xóa
                              </Button>
                            )}
                          </div>

                          <div className="space-y-2">
                            {question.options.map((option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="radio"
                                  name={`question-${questionIndex}-correct`}
                                  checked={question.correctAnswer === optionIndex}
                                  onChange={() =>
                                    updateQuestion(
                                      questionIndex,
                                      'correctAnswer',
                                      optionIndex
                                    )
                                  }
                                  required
                                />
                                <Input
                                  placeholder={`Đáp án ${optionIndex + 1}`}
                                  value={option}
                                  onChange={(e) =>
                                    updateOption(
                                      questionIndex,
                                      optionIndex,
                                      e.target.value
                                    )
                                  }
                                  required
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>

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
                    Tạo bài thi
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Question } from '@/services/questionService'
import { useState, useEffect, useRef } from 'react'
import { X, Image as ImageIcon } from 'lucide-react'
import { answerService } from '@/services/answerService'
import { toast } from 'sonner'
import { AnswerManagement } from './AnswerManagement'
import { Answer } from '@/services/answerService'

interface EditQuestionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  question: Question
  onSubmit: (questionId: number, formData: FormData) => Promise<void>
  onAnswerChange: (questionId: number) => Promise<void>
}

interface QuestionForm {
  name: string
  difficulty: number
  image: File | null
}

export function EditQuestionDialog({
  open,
  onOpenChange,
  question,
  onSubmit,
  onAnswerChange
}: EditQuestionDialogProps) {
  const [form, setForm] = useState<QuestionForm>({
    name: question?.name || '',
    difficulty: question?.difficulty || 1,
    image: null
  })
  const [questionImage, setQuestionImage] = useState<File | null>(null)
  const [questionImagePreview, setQuestionImagePreview] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAnswerDialogOpen, setIsAnswerDialogOpen] = useState(false)

  useEffect(() => {
    if (open) {
      setForm({
        name: question.name,
        difficulty: question.difficulty,
        image: null
      })
      setQuestionImagePreview(question.imageUrl || null)
      setError('')
      // Load answers when dialog opens
      const loadAnswers = async () => {
        try {
          const data = await answerService.getAnswersByQuestion(question.id)
          setAnswers(data)
        } catch (error) {
          console.error('Error loading answers:', error)
          toast.error('Không thể tải danh sách đáp án')
        }
      }
      loadAnswers()
    }
  }, [open, question])

  // Xử lý upload ảnh câu hỏi
  const handleQuestionImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setQuestionImage(file)
    setForm(prev => ({ ...prev, image: file }))
    setQuestionImagePreview(file ? URL.createObjectURL(file) : null)
  }

  // Validate
  const validate = () => {
    if (!form.name.trim()) {
      setError('Vui lòng nhập nội dung câu hỏi')
      return false
    }
    if (answers.length < 2) {
      setError('Cần ít nhất 2 đáp án')
      return false
    }
    if (answers.some(a => !a.answerName.trim())) {
      setError('Vui lòng nhập đầy đủ nội dung đáp án')
      return false
    }
    if (answers.filter(a => a.isCorrect).length !== 1) {
      setError('Phải có duy nhất một đáp án đúng')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      // 1. Xử lý các thay đổi đáp án trước
      // Cập nhật các đáp án đã sửa
      const editedAnswers = answers.filter(a => a.isEdited && !a.isNew && !a.isDeleted)
      for (const answer of editedAnswers) {
        const formData = new FormData()
        const answerData = {
          id: answer.id,
          answerName: answer.answerName,
          isCorrect: answer.isCorrect,
          questionId: question.id
        }
        formData.append('answer', new Blob([JSON.stringify(answerData)], { type: 'application/json' }))
        if (answer.image) {
          formData.append('imageFile', answer.image)
        }
        await answerService.updateAnswer(answer.id, formData, question.id)
      }

      // Thêm các đáp án mới
      const newAnswers = answers.filter(a => a.isNew && !a.isDeleted)
      for (const answer of newAnswers) {
        const formData = new FormData()
        const answerData = {
          answerName: answer.answerName,
          isCorrect: answer.isCorrect,
          questionId: question.id
        }
        formData.append('answer', new Blob([JSON.stringify(answerData)], { type: 'application/json' }))
        if (answer.image) {
          formData.append('imageFile', answer.image)
        }
        await answerService.createSingleAnswer(question.id, formData)
      }

      // Xóa các đáp án đã đánh dấu
      const deletedAnswers = answers.filter(a => a.isDeleted)
      for (const answer of deletedAnswers) {
        await answerService.deleteAnswer(answer.id)
      }

      // 2. Cuối cùng cập nhật câu hỏi
      const questionFormData = new FormData()
      const questionData = {
        name: form.name,
        difficulty: form.difficulty
      }
      questionFormData.append('question', new Blob([JSON.stringify(questionData)], { type: 'application/json' }))

      if (form.image) {
        questionFormData.append('imageFile', form.image)
      }

      await onSubmit(question.id, questionFormData)
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating question:', error)
      setError('Không thể cập nhật câu hỏi')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Xử lý thay đổi danh sách đáp án
  const handleAnswersChange = (newAnswers: Answer[]) => {
    // Chỉ cập nhật state local, không gửi request
    setAnswers(newAnswers)
  }

  // Xử lý sự kiện khi click vào overlay
  const handleOverlayClick = (e: React.MouseEvent) => {
    // Nếu đang mở dialog con thì ngăn không cho đóng dialog cha
    if (isAnswerDialogOpen) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        // Chỉ kiểm tra khi đang submit
        if (isSubmitting) {
          return
        }
        onOpenChange(newOpen)
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa câu hỏi</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {question ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label>Nội dung câu hỏi</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nhập nội dung câu hỏi"
                    className="flex-1"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleQuestionImageChange}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    onClick={() => fileInputRef.current?.click()}
                    title="Thêm ảnh cho câu hỏi"
                  >
                    <ImageIcon className="h-5 w-5" />
                  </Button>
                </div>
                {questionImagePreview && (
                  <div className="relative">
                    <img src={questionImagePreview} alt="Preview" className="max-h-32 rounded border object-contain mt-2" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1"
                      onClick={() => {
                        setQuestionImage(null)
                        setQuestionImagePreview(null)
                        setForm(prev => ({ ...prev, image: null }))
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <Label>Độ khó</Label>
                <Select
                  value={form.difficulty.toString()}
                  onValueChange={(value) => setForm(prev => ({ ...prev, difficulty: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn độ khó" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Dễ</SelectItem>
                    <SelectItem value="2">Trung bình</SelectItem>
                    <SelectItem value="3">Khó</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Quản lý đáp án</h3>
                </div>
                <AnswerManagement
                  questionId={question.id}
                  answers={answers}
                  onAnswersChange={handleAnswersChange}
                  parentDialogOpen={open}
                  onAnswerChange={onAnswerChange}
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
                </Button>
              </div>
            </form>
          ) : (
            <div>Loading...</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
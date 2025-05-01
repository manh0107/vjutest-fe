import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, X, Image as ImageIcon } from 'lucide-react'
import { questionService } from '@/services/questionService'
import { answerService } from '@/services/answerService'
import { toast } from 'sonner'

interface CreateQuestionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  chapterId: number
  onCreated: () => void
}

interface AnswerForm {
  answerName: string
  isCorrect: boolean
  image?: File | null
}

export function CreateQuestionDialog({ open, onOpenChange, chapterId, onCreated }: CreateQuestionDialogProps) {
  const [name, setName] = useState('')
  const [difficulty, setDifficulty] = useState(1)
  const [questionImage, setQuestionImage] = useState<File | null>(null)
  const [questionImagePreview, setQuestionImagePreview] = useState<string | null>(null)
  const [answers, setAnswers] = useState<AnswerForm[]>([
    { answerName: '', isCorrect: true, image: null },
    { answerName: '', isCorrect: false, image: null }
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Xử lý upload ảnh câu hỏi
  const handleQuestionImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setQuestionImage(file)
    setQuestionImagePreview(file ? URL.createObjectURL(file) : null)
  }

  // Xử lý upload ảnh đáp án
  const handleAnswerImageChange = (idx: number, file: File | null) => {
    setAnswers(prev => prev.map((a, i) => i === idx ? { ...a, image: file } : a))
  }

  // Thêm đáp án
  const handleAddAnswer = () => {
    if (answers.length < 4) {
      setAnswers(prev => [...prev, { answerName: '', isCorrect: false, image: null }])
    }
  }

  // Xóa đáp án
  const handleRemoveAnswer = (idx: number) => {
    if (answers.length > 2) {
      setAnswers(prev => prev.filter((_, i) => i !== idx))
    }
  }

  // Chọn đáp án đúng
  const handleCorrectChange = (idx: number) => {
    setAnswers(prev => prev.map((a, i) => ({ ...a, isCorrect: i === idx })))
  }

  // Validate
  const validate = () => {
    if (!name.trim()) {
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

  // Xử lý submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate form
      if (!validate()) {
        setLoading(false)
        return
      }

      // Create question data
      const questionData = {
        name,
        difficulty,
        chapterId
      }

      // Create form data for question
      const formData = new FormData()
      formData.append('question', new Blob([JSON.stringify(questionData)], { type: 'application/json' }))
      formData.append('chapterId', chapterId.toString())
      if (questionImage) {
        formData.append('imageFile', questionImage)
      }

      // Create question
      const question = await questionService.createQuestion(formData)

      // Create answers data
      const answersData = answers.map(answer => ({
        answerName: answer.answerName,
        isCorrect: answer.isCorrect,
        questionId: question.id
      }))

      // Create form data for answers
      const answerFormData = new FormData()
      answerFormData.append('answers', new Blob([JSON.stringify(answersData)], { type: 'application/json' }))
      answerFormData.append('questionId', question.id.toString())
      
      // Add all answer images
      answers.forEach((answer, index) => {
        if (answer.image) {
          answerFormData.append('imageFiles', answer.image)
        }
      })

      // Create all answers at once
      await answerService.createAnswers(question.id, answerFormData)

      toast.success('Tạo câu hỏi thành công')
      onCreated()
      onOpenChange(false)
      
      // Reset form
      setName('')
      setDifficulty(1)
      setQuestionImage(null)
      setQuestionImagePreview(null)
      setAnswers([
        { answerName: '', isCorrect: true, image: null },
        { answerName: '', isCorrect: false, image: null }
      ])
    } catch (error: any) {
      console.error('Error creating question:', error)
      setError(error.message || 'Có lỗi xảy ra khi tạo câu hỏi')
      toast.error(error.message || 'Có lỗi xảy ra khi tạo câu hỏi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>Thêm câu hỏi mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="question-content">Nội dung câu hỏi</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="question-content"
                value={name}
                onChange={e => setName(e.target.value)}
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
              <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} title="Thêm ảnh cho câu hỏi">
                <ImageIcon className="h-5 w-5" />
              </Button>
            </div>
            {questionImagePreview && (
              <img src={questionImagePreview} alt="Preview" className="max-h-32 rounded border object-contain mt-2" />
            )}
          </div>
          <div>
            <Label>Độ khó</Label>
            <Select
              value={difficulty.toString()}
              onValueChange={v => setDifficulty(parseInt(v))}
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
          <div>
            <Label>Đáp án</Label>
            <div className="flex flex-col gap-2">
              {answers.map((ans, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-2 items-center border rounded p-2 bg-white">
                  <input
                    type="radio"
                    checked={ans.isCorrect}
                    onChange={() => handleCorrectChange(idx)}
                    className="h-4 w-4 mt-1"
                  />
                  <Input
                    value={ans.answerName}
                    onChange={e => setAnswers(prev => prev.map((a, i) => i === idx ? { ...a, answerName: e.target.value } : a))}
                    placeholder={`Đáp án ${idx + 1}`}
                    className="flex-1"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id={`answer-image-${idx}`}
                    onChange={e => handleAnswerImageChange(idx, e.target.files?.[0] || null)}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={() => document.getElementById(`answer-image-${idx}`)?.click()} title="Thêm ảnh đáp án">
                    <ImageIcon className="h-5 w-5" />
                  </Button>
                  {ans.image && (
                    <img src={URL.createObjectURL(ans.image)} alt="Preview" className="max-h-16 rounded border object-contain" />
                  )}
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveAnswer(idx)} disabled={answers.length <= 2}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {answers.length < 4 && (
                <Button type="button" variant="outline" onClick={handleAddAnswer} className="w-full">
                  <Plus className="h-4 w-4 mr-2" /> Thêm đáp án
                </Button>
              )}
            </div>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Đang tạo...' : 'Tạo câu hỏi'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
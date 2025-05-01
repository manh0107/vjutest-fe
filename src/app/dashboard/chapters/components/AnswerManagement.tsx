import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Answer } from '@/services/answerService'
import { toast } from 'sonner'
import { Plus, X, Image as ImageIcon, Pencil, Trash2, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { answerService } from '@/services/answerService'

interface AnswerManagementProps {
  questionId: number
  answers: Answer[]
  onAnswersChange: (answers: Answer[]) => void
  parentDialogOpen: boolean
  onAnswerChange: (questionId: number) => Promise<void>
}

export function AnswerManagement({ questionId, answers: initialAnswers, onAnswersChange, parentDialogOpen, onAnswerChange }: AnswerManagementProps) {
  // State để lưu trạng thái tạm thời
  const [localAnswers, setLocalAnswers] = useState<Answer[]>(initialAnswers)
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [createForm, setCreateForm] = useState({
    answerName: '',
    isCorrect: false,
    image: null as File | null
  })
  const [editForm, setEditForm] = useState({
    answerName: '',
    isCorrect: false,
    image: null as File | null
  })
  const [error, setError] = useState('')

  // Reset local state khi dialog mở
  useEffect(() => {
    if (parentDialogOpen) {
      setLocalAnswers(initialAnswers)
      setIsCreating(false)
      setEditingId(null)
      setCreateForm({ answerName: '', isCorrect: false, image: null })
      setEditForm({ answerName: '', isCorrect: false, image: null })
      setError('')
    }
  }, [parentDialogOpen, initialAnswers])

  const handleCreateAnswer = () => {
    if (!createForm.answerName.trim()) {
      setError('Vui lòng nhập nội dung đáp án')
      return
    }

    // Kiểm tra số lượng đáp án (không tính các đáp án đã xóa)
    const activeAnswers = localAnswers.filter(a => !a.isDeleted)
    if (activeAnswers.length >= 4) {
      setError('Chỉ được tạo tối đa 4 đáp án')
      return
    }

    // Kiểm tra đáp án đúng nếu đang thêm đáp án đúng
    if (createForm.isCorrect && activeAnswers.some(a => a.isCorrect)) {
      setError('Đã có đáp án đúng, không thể thêm đáp án đúng khác')
      return
    }

    // Thêm đáp án mới vào state local với temp ID
    const newAnswer: Answer = {
      id: Date.now(), // Temporary ID
      answerName: createForm.answerName,
      isCorrect: createForm.isCorrect,
      questionId,
      imageUrl: undefined,
      image: createForm.image,
      isNew: true // Đánh dấu là đáp án mới
    }

    setLocalAnswers(prev => [...prev, newAnswer])
    onAnswersChange([...localAnswers, newAnswer]) // Cập nhật lên parent
    setCreateForm({ answerName: '', isCorrect: false, image: null })
    setIsCreating(false)
    setError('')
  }

  const handleUpdateAnswer = () => {
    if (!editForm.answerName.trim()) {
      setError('Vui lòng nhập nội dung đáp án')
      return
    }

    // Kiểm tra đáp án đúng nếu đang sửa thành đáp án đúng
    if (editForm.isCorrect && localAnswers.some(a => a.isCorrect && a.id !== editingId && !a.isDeleted)) {
      setError('Đã có đáp án đúng, không thể có nhiều đáp án đúng')
      return
    }

    // Cập nhật đáp án trong state local
    const updatedAnswers = localAnswers.map(a => 
      a.id === editingId 
        ? { 
            ...a, 
            answerName: editForm.answerName,
            isCorrect: editForm.isCorrect,
            image: editForm.image,
            isEdited: true // Đánh dấu là đã chỉnh sửa
          }
        : a
    )

    setLocalAnswers(updatedAnswers)
    onAnswersChange(updatedAnswers) // Cập nhật lên parent
    setEditForm({ answerName: '', isCorrect: false, image: null })
    setEditingId(null)
    setError('')
  }

  const handleDeleteAnswer = async (answerId: number) => {
    const answer = localAnswers.find(a => a.id === answerId)
    if (!answer) return

    const confirmMessage = `
      Bạn có chắc chắn muốn xóa đáp án này?
      
      Nội dung: ${answer.answerName}
      ${answer.isCorrect ? '✓ Đáp án đúng' : '✗ Đáp án sai'}
    `

    if (window.confirm(confirmMessage)) {
      // Đánh dấu đáp án là đã xóa trong state local
      const updatedAnswers = localAnswers.map(a => 
        a.id === answerId ? { ...a, isDeleted: true } : a
      )
      setLocalAnswers(updatedAnswers)
      onAnswersChange(updatedAnswers)
    }
  }

  const renderAnswerForm = (type: 'create' | 'edit', answer?: Answer) => {
    const form = type === 'create' ? createForm : editForm
    const setForm = type === 'create' 
      ? (value: typeof createForm) => setCreateForm(value)
      : (value: typeof editForm) => setEditForm(value)

    return (
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`${type}AnswerName`}>Nội dung đáp án</Label>
              <Input
                id={`${type}AnswerName`}
                value={form.answerName}
                onChange={(e) => setForm({ ...form, answerName: e.target.value })}
                placeholder="Nhập nội dung đáp án"
              />
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor={`${type}IsCorrect`}>Đáp án đúng</Label>
              <Switch
                id={`${type}IsCorrect`}
                checked={form.isCorrect}
                onCheckedChange={(checked) => setForm({ ...form, isCorrect: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${type}Image`}>Hình ảnh (tùy chọn)</Label>
              <Input
                id={`${type}Image`}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null
                  if (file) {
                    // Kiểm tra file type
                    if (!file.type.startsWith('image/')) {
                      setError('Chỉ được phép tải lên file ảnh!')
                      return
                    }
                    // Kiểm tra file size (ví dụ: max 5MB)
                    if (file.size > 5 * 1024 * 1024) {
                      setError('Kích thước file không được vượt quá 5MB!')
                      return
                    }
                  }
                  setForm({ ...form, image: file })
                }}
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                if (type === 'create') {
                  setIsCreating(false)
                } else {
                  setEditingId(null)
                }
                setError('')
              }}>
                Hủy
              </Button>
              <Button onClick={type === 'create' ? handleCreateAnswer : handleUpdateAnswer}>
                {type === 'create' ? 'Thêm' : 'Cập nhật'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {localAnswers.filter(a => !a.isDeleted).map(answer => (
          <div key={answer.id} className="flex items-center justify-between p-2 border rounded">
            {editingId === answer.id ? (
              renderAnswerForm('edit', answer)
            ) : (
              <>
                <div className="flex items-center gap-2">
                  {answer.imageUrl && (
                    <img src={answer.imageUrl} alt="answer" className="h-6 w-6 object-cover rounded" />
                  )}
                  <span className={answer.isCorrect ? 'font-semibold text-green-600' : ''}>
                    {answer.answerName}
                  </span>
                  {answer.isCorrect && <span className="text-xs text-green-600">(Đúng)</span>}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingId(answer.id)
                      setEditForm({
                        answerName: answer.answerName,
                        isCorrect: answer.isCorrect,
                        image: null
                      })
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteAnswer(answer.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {!isCreating ? (
        <Button onClick={() => setIsCreating(true)} disabled={localAnswers.filter(a => !a.isDeleted).length >= 4}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm đáp án
        </Button>
      ) : (
        renderAnswerForm('create')
      )}
    </div>
  )
}
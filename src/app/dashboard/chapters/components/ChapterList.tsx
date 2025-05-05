import { Chapter } from '@/services/chapterService'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, ChevronDown, Check, X } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useState } from 'react'
import Collapse from '@mui/material/Collapse'
import { Input } from '@/components/ui/input'
import Pagination from '@mui/material/Pagination'
import { Question, questionService } from '@/services/questionService'
import { Answer, answerService } from '@/services/answerService'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CreateQuestionDialog } from './CreateQuestionDialog'
import { EditQuestionDialog } from './EditQuestionDialog'
import { toast } from 'sonner'

interface ChapterListProps {
  chapters: Chapter[]
  loading?: boolean
  onChapterClick: (chapter: Chapter) => void
  onEdit: (chapter: Chapter) => void
  onDelete: (chapter: Chapter) => Promise<void>
}

export const ChapterList: React.FC<ChapterListProps> = ({ chapters, onChapterClick, onEdit, onDelete }) => {
  const [expandedChapterId, setExpandedChapterId] = useState<number | null>(null)
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null)
  const [questions, setQuestions] = useState<Record<number, Question[]>>({})
  const [answers, setAnswers] = useState<Record<number, Answer[]>>({})
  const [loadingQuestions, setLoadingQuestions] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [questionForm, setQuestionForm] = useState({ name: '', difficulty: 1 })
  const [createError, setCreateError] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const QUESTIONS_PER_PAGE = 5

  const handleExpandChapter = async (chapterId: number | string) => {
    const id = typeof chapterId === 'string' ? parseInt(chapterId, 10) : chapterId
    if (expandedChapterId === id) {
      setExpandedChapterId(null)
      setSearch('')
      setCurrentPage(1)
      return
    }
    setExpandedChapterId(id)
    setSearch('')
    setCurrentPage(1)
    if (!questions[id]) {
      setLoadingQuestions(id)
      try {
        const data = await questionService.getQuestionsByChapter(id)
        setQuestions(prev => ({ ...prev, [id]: data }))
      } catch {
        // handle error
      } finally {
        setLoadingQuestions(null)
      }
    }
  }

  const handleExpandQuestion = async (questionId: number | string) => {
    const id = typeof questionId === 'string' ? parseInt(questionId, 10) : questionId
    if (expandedQuestionId === id) {
      setExpandedQuestionId(null)
      return
    }
    setExpandedQuestionId(id)
    if (!answers[id]) {
      try {
        const data = await answerService.getAnswersByQuestion(id)
        setAnswers(prev => ({ ...prev, [id]: data }))
      } catch (error: any) {
        console.error('Error loading answers:', error)
        toast.error(error.message || 'Không thể tải danh sách đáp án')
      }
    }
  }

  const handleCreateQuestion = async (chapterId: number) => {
    setCreateError('')
    if (!questionForm.name.trim()) {
      setCreateError('Vui lòng nhập nội dung câu hỏi')
      return
    }
    setIsCreating(true)
    try {
      const formData = new FormData()
      formData.append('question', JSON.stringify({
        name: questionForm.name,
        difficulty: questionForm.difficulty
      }))
      formData.append('chapterId', chapterId.toString())
      await questionService.createQuestion(formData)
      setQuestionForm({ name: '', difficulty: 1 })
      setIsCreateModalOpen(false)
      // Reload questions for this chapter
      const data = await questionService.getQuestionsByChapter(chapterId)
      setQuestions(prev => ({ ...prev, [chapterId]: data }))
    } catch (e) {
      setCreateError('Không thể tạo câu hỏi')
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditQuestion = (question: Question) => {
    setSelectedQuestion(question)
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setSelectedQuestion(null)
  }

  const handleAnswerDelete = async (questionId: number) => {
    try {
      const updatedAnswers = await answerService.getAnswersByQuestion(questionId)
      setAnswers(prev => ({ ...prev, [questionId]: updatedAnswers }))
    } catch (error) {
      console.error('Error updating answers after delete:', error)
    }
  }

  const handleAnswerChange = async (questionId: number, shouldCloseDialog: boolean = false) => {
    try {
      const updatedAnswers = await answerService.getAnswersByQuestion(questionId)
      setAnswers(prev => ({ ...prev, [questionId]: updatedAnswers }))
      if (shouldCloseDialog) {
        handleCloseEditModal()
        toast.success('Cập nhật câu hỏi thành công')
      }
    } catch (error) {
      console.error('Error updating answers:', error)
    }
  }

  const handleSubmitEdit = async (questionId: number, formData: FormData) => {
    try {
      await questionService.updateQuestion(questionId, formData)
      
      // Reload questions for the current chapter
      if (expandedChapterId) {
        const data = await questionService.getQuestionsByChapter(expandedChapterId)
        setQuestions(prev => ({ ...prev, [expandedChapterId]: data }))
      }

      // Reload answers và đóng dialog
      await handleAnswerChange(questionId, true)
    } catch (error) {
      console.error('Error updating question:', error)
      toast.error('Không thể cập nhật câu hỏi')
    }
  }

  return (
    <div className="space-y-4">
      {chapters.map((chapter, idx) => (
        <div key={chapter.id}>
          <div
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onChapterClick(chapter)}
          >
            <div className="flex-1">
              <h3 className="text-lg font-medium">Chương {idx + 1}: {chapter.name}</h3>
              <p className="text-sm text-gray-500">{chapter.subject.name}</p>
            </div>
            <div className="flex gap-2 items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={e => {
                  e.stopPropagation()
                  handleExpandChapter(chapter.id)
                }}
                title="Xem câu hỏi của chương"
              >
                <ChevronDown className={`transform transition-transform ${expandedChapterId === Number(chapter.id) ? 'rotate-180' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={e => {
                  e.stopPropagation()
                  onEdit(chapter)
                }}
                title="Sửa chương"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={e => {
                  e.stopPropagation()
                  onDelete(chapter)
                }}
                title="Xóa chương"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Collapse in={expandedChapterId === Number(chapter.id)}>
            <div className="mt-2 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <Input
                  placeholder="Tìm kiếm câu hỏi..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="max-w-xs"
                />
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  Thêm câu hỏi
                </Button>
              </div>
              {loadingQuestions === Number(chapter.id) ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <div className="space-y-2">
                  {questions[Number(chapter.id)]?.filter((q: Question) => 
                    q.name.toLowerCase().includes(search.toLowerCase())
                  ).slice(
                    (currentPage - 1) * QUESTIONS_PER_PAGE,
                    currentPage * QUESTIONS_PER_PAGE
                  ).map((question: Question) => (
                    <div key={question.id} className="bg-white p-4 rounded-lg shadow">
                      <div className="flex items-start gap-4">
                        {question.imageUrl && (
                          <div className="relative group flex-shrink-0">
                            <div className="overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                              <img 
                                src={question.imageUrl} 
                                alt="Câu hỏi" 
                                className="w-20 h-20 object-contain object-center transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                              />
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-lg" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{question.name}</p>
                            {question.isCompleted ? (
                              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                Đã hoàn thành
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                                Chưa hoàn thành
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">Độ khó: {question.difficulty}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleExpandQuestion(question.id)}
                            title="Xem đáp án"
                          >
                            <ExpandMoreIcon className={`transform transition-transform ${expandedQuestionId === Number(question.id) ? 'rotate-180' : ''}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditQuestion(question)}
                            title="Sửa câu hỏi"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Collapse in={expandedQuestionId === Number(question.id)}>
                        <div className="mt-2 pl-4 border-l-2 border-gray-200">
                          {answers[Number(question.id)]?.map((answer: Answer) => (
                            <div key={answer.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 py-2">
                              <div className="flex items-center gap-2 w-full">
                                {answer.imageUrl && (
                                  <div className="relative group flex-shrink-0">
                                    <div className="overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                                      <img 
                                        src={answer.imageUrl} 
                                        alt="Đáp án" 
                                        className="w-14 h-14 object-contain object-center transition-transform duration-300 group-hover:scale-105"
                                        loading="lazy"
                                      />
                                    </div>
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-lg" />
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    checked={answer.isCorrect}
                                    readOnly
                                    className="h-4 w-4"
                                  />
                                  <span className="font-medium">{answer.answerName}</span>
                                  {answer.isCorrect ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <X className="h-4 w-4 text-red-500" />
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Collapse>
                    </div>
                  ))}
                  {questions[Number(chapter.id)]?.length > QUESTIONS_PER_PAGE && (
                    <div className="flex justify-center mt-4">
                      <Pagination
                        count={Math.ceil(questions[Number(chapter.id)].length / QUESTIONS_PER_PAGE)}
                        page={currentPage}
                        onChange={(_, page) => setCurrentPage(page)}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </Collapse>
        </div>
      ))}
      <CreateQuestionDialog
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        chapterId={expandedChapterId || 0}
        onCreated={() => {
          if (expandedChapterId) {
            questionService.getQuestionsByChapter(expandedChapterId)
              .then(data => setQuestions(prev => ({ ...prev, [expandedChapterId]: data })))
              .catch(error => console.error('Error loading questions:', error))
          }
        }}
      />
      {selectedQuestion && (
        <EditQuestionDialog
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          question={selectedQuestion}
          onSubmit={handleSubmitEdit}
          onAnswerChange={handleAnswerChange}
        />
      )}
    </div>
  )
}
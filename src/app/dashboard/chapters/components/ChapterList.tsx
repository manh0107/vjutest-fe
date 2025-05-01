import { Chapter } from '@/services/chapterService'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, ChevronDown } from 'lucide-react'
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
  loading: boolean
  onEdit: (chapter: Chapter) => void
  onDelete: (chapter: Chapter) => void
  onChapterClick: (chapter: Chapter) => void
}

export function ChapterList({
  chapters,
  loading,
  onEdit,
  onDelete,
  onChapterClick
}: ChapterListProps) {
  const [expandedChapterId, setExpandedChapterId] = useState<number | null>(null)
  const [questions, setQuestions] = useState<Record<number, Question[]>>({})
  const [loadingQuestions, setLoadingQuestions] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null)
  const [answers, setAnswers] = useState<Record<number, Answer[]>>({})
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const QUESTIONS_PER_PAGE = 5
  const [questionForm, setQuestionForm] = useState({ name: '', difficulty: 1 })
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const handleExpandChapter = async (chapterId: number | string) => {
    const id = Number(chapterId)
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
    const id = Number(questionId)
    if (expandedQuestionId === id) {
      setExpandedQuestionId(null)
      return
    }
    setExpandedQuestionId(id)
    if (!answers[id]) {
      try {
        const data = await answerService.getAnswersByQuestion(id)
        setAnswers(prev => ({ ...prev, [id]: data }))
      } catch {
        // handle error
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
      const data = await questionService.getQuestionsByChapter(Number(chapterId))
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
                <ChevronDown className={`h-5 w-5 transition-transform ${expandedChapterId === Number(chapter.id) ? 'rotate-180' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(chapter)
                }}
              >
                <Pencil className="h-4 w-4 text-black" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(chapter)
                }}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
          <Collapse in={expandedChapterId === Number(chapter.id)} timeout="auto" unmountOnExit>
            <div className="bg-gray-50 border rounded-b-lg p-4">
              {loadingQuestions === Number(chapter.id) ? (
                <div>Đang tải câu hỏi...</div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Input
                      placeholder="Tìm kiếm câu hỏi..."
                      value={search}
                      onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
                      className="w-64"
                    />
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                      Thêm câu hỏi
                    </Button>
                  </div>
                  {/* Danh sách câu hỏi, phân trang, xổ đáp án */}
                  {questions[Number(chapter.id)] && questions[Number(chapter.id)].length > 0 ? (
                    <>
                      {questions[Number(chapter.id)]
                        .filter(q => q.name.toLowerCase().includes(search.toLowerCase()))
                        .slice((currentPage-1)*QUESTIONS_PER_PAGE, currentPage*QUESTIONS_PER_PAGE)
                        .map(q => (
                          <div key={q.id}>
                            <div className="border rounded mb-2 flex items-center justify-between p-2">
                              <div className="flex-1 flex items-center gap-2">
                                {q.imageUrl && (
                                  <img src={q.imageUrl} alt="question" className="h-8 w-8 object-cover rounded mr-2" />
                                )}
                                <span>{q.name}</span>
                                {q.isCompleted ? (
                                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 font-semibold">Đã hoàn thành</span>
                                ) : (
                                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-gray-200 text-gray-600">Chưa hoàn thành</span>
                                )}
                              </div>
                              <div className="flex gap-1 items-center ml-2">
                                <Button size="icon" variant="ghost" onClick={() => handleExpandQuestion(q.id)}>
                                  <ExpandMoreIcon className={`transition-transform ${expandedQuestionId === Number(q.id) ? 'rotate-180' : ''}`} />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleEditQuestion(q)}
                                >
                                  <Pencil className="h-4 w-4 text-black" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    if (window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
                                      try {
                                        await questionService.deleteQuestion(Number(q.id));
                                        // Reload questions for this chapter
                                        const data = await questionService.getQuestionsByChapter(Number(chapter.id));
                                        setQuestions(prev => ({ ...prev, [chapter.id]: data }));
                                        toast.success('Xóa câu hỏi thành công');
                                      } catch (error) {
                                        toast.error('Không thể xóa câu hỏi');
                                      }
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                            <Collapse in={expandedQuestionId === Number(q.id)} timeout="auto" unmountOnExit>
                              <div className="pl-4 pb-2">
                                {answers[Number(q.id)] ? (
                                  <ul className="space-y-2">
                                    {answers[Number(q.id)].map(ans => (
                                      <li key={ans.id} className="flex items-center gap-2">
                                        {ans.imageUrl && (
                                          <img src={ans.imageUrl} alt="answer" className="h-6 w-6 object-cover rounded mr-1" />
                                        )}
                                        <span className={ans.isCorrect ? 'font-semibold text-green-600' : ''}>{ans.answerName}</span>
                                        {ans.isCorrect && <span className="text-xs text-green-600">(Đúng)</span>}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <div>Đang tải đáp án...</div>
                                )}
                              </div>
                            </Collapse>
                          </div>
                        ))}
                      <div className="flex justify-center mt-2">
                        <Pagination
                          count={Math.ceil(questions[Number(chapter.id)].filter(q => q.name.toLowerCase().includes(search.toLowerCase())).length / QUESTIONS_PER_PAGE)}
                          page={currentPage}
                          onChange={(_e, page) => setCurrentPage(page)}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-gray-500 py-4">Không có câu hỏi nào</div>
                  )}
                </>
              )}
            </div>
          </Collapse>
        </div>
      ))}
      {/* Thêm Dialog popup tạo câu hỏi */}
      <CreateQuestionDialog
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        chapterId={expandedChapterId || 0}
        onCreated={async () => {
          // Reload questions for this chapter
          if (expandedChapterId) {
            const data = await questionService.getQuestionsByChapter(expandedChapterId)
            setQuestions(prev => ({ ...prev, [expandedChapterId]: data }))
          }
        }}
      />

      {/* Dialog chỉnh sửa câu hỏi */}
      {selectedQuestion && (
        <EditQuestionDialog
          open={isEditModalOpen}
          onOpenChange={handleCloseEditModal}
          question={selectedQuestion}
          onSubmit={handleSubmitEdit}
          onAnswerChange={handleAnswerDelete}
        />
      )}
    </div>
  )
} 
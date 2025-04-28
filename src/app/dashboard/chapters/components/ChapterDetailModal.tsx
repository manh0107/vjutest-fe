import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Chapter } from "@/services/chapterService"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { useEffect, useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

interface Question {
  id: string
  content: string
  difficulty: string
  point: number
  createdAt: string
}

interface ChapterDetailModalProps {
  isOpen: boolean
  onClose: () => void
  chapter: Chapter | null
}

export function ChapterDetailModal({
  isOpen,
  onClose,
  chapter
}: ChapterDetailModalProps) {
  const [tab, setTab] = useState("info")
  const [questions, setQuestions] = useState<Question[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(false)

  useEffect(() => {
    if (tab === "questions" && chapter) {
      fetchQuestions()
    }
    // eslint-disable-next-line
  }, [tab, chapter])

  const fetchQuestions = async () => {
    if (!chapter) return
    setLoadingQuestions(true)
    try {
      // Giả sử có API: /chapters/{chapterId}/questions
      const res = await fetch(`/api/chapters/${chapter.id}/questions`)
      if (!res.ok) throw new Error("Không thể tải danh sách câu hỏi")
      const data = await res.json()
      setQuestions(data)
    } catch (e) {
      toast.error("Không thể tải danh sách câu hỏi")
      setQuestions([])
    } finally {
      setLoadingQuestions(false)
    }
  }

  if (!chapter) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-2xl font-bold">Chi tiết chương học</DialogTitle>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab} className="px-6 pt-2 pb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="info">Thông tin chương học</TabsTrigger>
            <TabsTrigger value="questions">Danh sách câu hỏi</TabsTrigger>
          </TabsList>
          <TabsContent value="info">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <div className="mb-2 text-gray-500 font-semibold">Tên chương học</div>
                <div className="text-lg font-medium">{chapter.name}</div>
              </div>
              <div>
                <div className="mb-2 text-gray-500 font-semibold">Môn học</div>
                <div className="text-lg font-medium">{chapter.subject.name}</div>
              </div>
              <div>
                <div className="mb-2 text-gray-500 font-semibold">Ngày tạo</div>
                <div>{format(new Date(chapter.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}</div>
              </div>
              <div>
                <div className="mb-2 text-gray-500 font-semibold">Ngày cập nhật</div>
                <div>{format(new Date(chapter.modifiedAt), "dd/MM/yyyy HH:mm", { locale: vi })}</div>
              </div>
              <div>
                <div className="mb-2 text-gray-500 font-semibold">Người tạo</div>
                <div>{chapter.createdByName}</div>
              </div>
              <div>
                <div className="mb-2 text-gray-500 font-semibold">Số câu hỏi</div>
                <div>{chapter.questionTotal}</div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="questions">
            {loadingQuestions ? (
              <div className="space-y-2">
                {[1,2,3].map(i => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center text-gray-500 italic py-8">Chưa có câu hỏi nào cho chương học này</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-3 py-2 border">#</th>
                      <th className="px-3 py-2 border text-left">Nội dung</th>
                      <th className="px-3 py-2 border">Độ khó</th>
                      <th className="px-3 py-2 border">Điểm</th>
                      <th className="px-3 py-2 border">Ngày tạo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questions.map((q, idx) => (
                      <tr key={q.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 border text-center">{idx+1}</td>
                        <td className="px-3 py-2 border">{q.content}</td>
                        <td className="px-3 py-2 border text-center">{q.difficulty}</td>
                        <td className="px-3 py-2 border text-center">{q.point}</td>
                        <td className="px-3 py-2 border text-center">{format(new Date(q.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 
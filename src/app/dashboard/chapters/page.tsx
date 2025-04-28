"use client"

import { useEffect, useState } from 'react'
import { Chapter, chapterService } from '@/services/chapterService'
import { Subject, subjectService } from '@/services/subjectService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'
import { ChapterList } from './components/ChapterList'
import { ChapterModal } from './components/ChapterModal'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChapterDetailModal } from './components/ChapterDetailModal'

export default function ChaptersPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('')
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editChapter, setEditChapter] = useState<Chapter | null>(null)
  const [detailChapter, setDetailChapter] = useState<Chapter | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const fetchSubjects = async () => {
    try {
      const data = await subjectService.getAllSubjects()
      setSubjects(data)
    } catch (error) {
      console.error('Error fetching subjects:', error)
      toast.error('Không thể tải danh sách môn học')
    }
  }

  const fetchChapters = async () => {
    if (!selectedSubjectId) {
      setChapters([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await chapterService.getChapters(selectedSubjectId)
      setChapters(data)
    } catch (error) {
      console.error('Error fetching chapters:', error)
      toast.error('Không thể tải danh sách chương học')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubjects()
  }, [])

  useEffect(() => {
    fetchChapters()
  }, [selectedSubjectId])

  const filteredChapters = chapters.filter(chapter =>
    chapter.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreate = async (name: string, subjectId: string) => {
    try {
      setIsSubmitting(true)
      await chapterService.createChapter(name, subjectId)
      toast.success('Tạo chương học thành công')
      setIsCreateModalOpen(false)
      fetchChapters()
    } catch (error) {
      console.error('Error creating chapter:', error)
      toast.error('Không thể tạo chương học')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (name: string, subjectId: string) => {
    if (!editChapter) return
    try {
      setIsSubmitting(true)
      await chapterService.updateChapter(editChapter.id, name)
      toast.success('Cập nhật chương học thành công')
      setEditChapter(null)
      fetchChapters()
    } catch (error) {
      console.error('Error updating chapter:', error)
      toast.error('Không thể cập nhật chương học')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (chapter: Chapter) => {
    try {
      setIsSubmitting(true)
      await chapterService.deleteChapter(chapter.id)
      toast.success('Xóa chương học thành công')
      fetchChapters()
    } catch (error) {
      console.error('Error deleting chapter:', error)
      toast.error('Không thể xóa chương học')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChapterClick = (chapter: Chapter) => {
    setDetailChapter(chapter)
    setIsDetailModalOpen(true)
  }

  const handleEditClick = (chapter: Chapter) => {
    setEditChapter(chapter)
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Chương học</h1>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={!selectedSubjectId}
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm chương học
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="w-64">
            <Select
              value={selectedSubjectId}
              onValueChange={setSelectedSubjectId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn môn học" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id.toString()}>
                    {subject.name} ({subject.subjectCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm chương học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full max-w-md"
              disabled={!selectedSubjectId}
            />
          </div>
        </div>

        {!selectedSubjectId ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 italic">Vui lòng chọn môn học để xem danh sách chương học</p>
          </div>
        ) : (
          <ChapterList
            chapters={filteredChapters}
            loading={loading}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            onChapterClick={handleChapterClick}
          />
        )}
      </div>

      <ChapterModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        loading={isSubmitting}
        subjectId={selectedSubjectId}
      />

      {editChapter && (
        <ChapterModal
          isOpen={!!editChapter}
          onClose={() => setEditChapter(null)}
          onSubmit={handleEdit}
          initialData={editChapter}
          loading={isSubmitting}
          subjectId={selectedSubjectId}
        />
      )}

      <ChapterDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false) || setDetailChapter(null)}
        chapter={detailChapter}
      />
    </div>
  )
} 
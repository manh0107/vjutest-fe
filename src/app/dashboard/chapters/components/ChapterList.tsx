import { Chapter } from '@/services/chapterService'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

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
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
            <Skeleton className="h-6 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (chapters.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500 italic">Không có chương học nào</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {chapters.map((chapter, idx) => (
        <div
          key={chapter.id}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onChapterClick(chapter)}
        >
          <div className="flex-1">
            <h3 className="text-lg font-medium">Chương {idx + 1}: {chapter.name}</h3>
            <p className="text-sm text-gray-500">{chapter.subject.name}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(chapter)
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(chapter)
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
} 
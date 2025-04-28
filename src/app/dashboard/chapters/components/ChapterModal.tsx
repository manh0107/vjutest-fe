import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Chapter } from "@/services/chapterService"
import { useState } from "react"

interface ChapterModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (name: string, subjectId: string) => Promise<void>
  initialData?: Chapter
  loading?: boolean
  subjectId: string
}

export function ChapterModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading = false,
  subjectId
}: ChapterModalProps) {
  const [name, setName] = useState(initialData?.name || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(name, subjectId)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Chỉnh sửa chương học' : 'Tạo chương học mới'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên chương học</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên chương học"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Đang xử lý...' : initialData ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
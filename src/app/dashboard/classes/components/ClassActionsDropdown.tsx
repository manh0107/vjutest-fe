import { Class } from '@/services/classService'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreVertical, Eye, Pencil, Trash2, BookOpen, Users, UserCog, FileText, Settings } from 'lucide-react'

interface ClassActionsDropdownProps {
  classItem: Class
  onView: (classItem: Class) => void
  onEdit: (classItem: Class) => void
  onDelete: (classItem: Class) => void
  onManage: (tab: 'subjects' | 'students' | 'teachers' | 'documents') => void
}

export function ClassActionsDropdown({ classItem, onView, onEdit, onDelete, onManage }: ClassActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Mở menu</span>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onView(classItem)}>
          <Eye className="mr-2 h-4 w-4" />
          Xem chi tiết
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(classItem)}>
          <Pencil className="mr-2 h-4 w-4" />
          Chỉnh sửa
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete(classItem)}>
          <Trash2 className="mr-2 h-4 w-4" />
          Xóa
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Settings className="mr-2 h-4 w-4" />
            Quản lý
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => onManage('subjects')}>
              <BookOpen className="mr-2 h-4 w-4" />
              Môn học
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onManage('students')}>
              <Users className="mr-2 h-4 w-4" />
              Sinh viên
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onManage('teachers')}>
              <UserCog className="mr-2 h-4 w-4" />
              Giảng viên
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onManage('documents')}>
              <FileText className="mr-2 h-4 w-4" />
              Tài liệu
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 
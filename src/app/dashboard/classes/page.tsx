'use client'

import { useState, useEffect } from 'react'
import { classService, Class, UpdateClassData } from '@/services/classService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Pencil, Trash2, Search, Plus } from 'lucide-react'
import Link from 'next/link'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ClassDetailModal } from './components/ClassDetailModal'
import { CreateClassModal } from './components/CreateClassModal'
import { ClassModal } from './components/ClassModal'

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [classToDelete, setClassToDelete] = useState<Class | null>(null)
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await classService.getClasses()
      setClasses(data)
    } catch (error) {
      setError('Không thể tải danh sách lớp học. Vui lòng kiểm tra kết nối hoặc thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (classItem: Class) => {
    setClassToDelete(classItem)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteClass = async () => {
    if (!classToDelete?.id) return
    try {
      await classService.deleteClass(classToDelete.id)
      setClasses(classes.filter(c => c.id !== classToDelete.id))
      toast.success('Đã xóa lớp học thành công', {
        description: `Đã xóa lớp học ${classToDelete.name}`
      })
    } catch (error) {
      console.error('Error deleting class:', error)
      toast.error('Không thể xóa lớp học')
    } finally {
      setIsDeleteDialogOpen(false)
      setClassToDelete(null)
    }
  }

  const handleViewClass = (classItem: Class) => {
    setSelectedClass(classItem)
    setIsDetailModalOpen(true)
  }

  const handleCreateSuccess = () => {
    fetchClasses()
  }

  const handleEdit = (classItem: Class) => {
    setSelectedClass(classItem)
    setIsEditModalOpen(true)
  }

  const handleUpdateClass = async (data: UpdateClassData) => {
    setIsLoading(true)
    try {
      if (!selectedClass) return
      await classService.updateClass(selectedClass.id, data)
      fetchClasses()
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const filteredClasses = classes.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.classCode.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <Card className="max-w-[1200px] mx-auto">
        <CardContent className="p-6">
          <div className="flex h-[400px] items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-[1200px] mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Quản lý lớp học</CardTitle>
          <Button onClick={() => setIsCreateModalOpen(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Tạo lớp học mới
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên, mã lớp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">ID</TableHead>
                <TableHead className="w-[100px]">Mã lớp</TableHead>
                <TableHead className="w-[250px]">Tên lớp</TableHead>
                <TableHead className="w-[150px]">Người tạo</TableHead>
                <TableHead className="w-[80px] text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClasses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Không tìm thấy lớp học nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredClasses.map((c) => (
                  <TableRow 
                    key={c.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewClass(c)}
                  >
                    <TableCell className="font-medium">{c.id}</TableCell>
                    <TableCell>
                      {c.classCode}
                    </TableCell>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.createdByName || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 mr-1 hover:bg-muted"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(c);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-muted text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(c);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Điều này sẽ xóa vĩnh viễn lớp học
              {classToDelete?.name && ` "${classToDelete.name}"`} và tất cả dữ liệu liên quan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteClass}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ClassDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedClass(null)
        }}
        classData={selectedClass}
      />

      <CreateClassModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <ClassModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedClass(null)
        }}
        onSubmit={handleUpdateClass}
        classData={selectedClass}
        isLoading={isLoading}
      />
    </Card>
  )
} 
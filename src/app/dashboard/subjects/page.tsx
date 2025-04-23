"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SubjectModal } from './components/SubjectModal'
import { SubjectDetailModal } from './components/SubjectDetailModal'
import { Subject, subjectService, CreateSubjectData, UpdateSubjectData } from '@/services/subjectService'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { toast } from 'sonner'
import { Pencil, Trash2, Plus, Search } from 'lucide-react'
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { ColumnDef } from "@tanstack/react-table"
import { PencilIcon, TrashIcon } from "lucide-react"

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null)
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const fetchSubjects = async () => {
    try {
      const data = await subjectService.getAllSubjects()
      setSubjects(data)
    } catch (error) {
      console.error('Lỗi khi lấy danh sách môn học:', error)
      toast.error('Không thể lấy danh sách môn học')
    }
  }

  useEffect(() => {
    fetchSubjects()
  }, [])

  const handleCreateSubject = async (data: CreateSubjectData) => {
    try {
      setIsLoading(true)
      await subjectService.createSubject(data)
      toast.success('Tạo môn học thành công!')
      fetchSubjects()
      handleCloseModal()
    } catch (error) {
      console.error('Error creating subject:', error)
      toast.error('Có lỗi xảy ra khi tạo môn học!')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateSubject = async (data: UpdateSubjectData) => {
    try {
      if (!selectedSubject) return
      setIsLoading(true)
      await subjectService.updateSubject(selectedSubject.id, data)
      toast.success('Cập nhật môn học thành công!')
      fetchSubjects()
      handleCloseModal()
    } catch (error) {
      console.error('Error updating subject:', error)
      toast.error('Có lỗi xảy ra khi cập nhật môn học!')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteSubject = async () => {
    if (!subjectToDelete) return

    try {
      await subjectService.deleteSubject(subjectToDelete.id)
      toast.success('Xóa môn học thành công', {
        description: `Đã xóa môn học ${subjectToDelete.name}`
      })
      fetchSubjects()
    } catch (error: any) {
      console.error('Lỗi khi xóa môn học:', error)
      toast.error('Không thể xóa môn học', {
        description: error.response?.data?.message || error.message
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setSubjectToDelete(null)
    }
  }

  const handleEdit = (subject: Subject) => {
    setSelectedSubject(subject)
    setIsModalOpen(true)
  }

  const handleViewSubject = (subject: Subject) => {
    setSelectedSubject(subject)
    setIsDetailModalOpen(true)
  }

  const filteredSubjects = subjects.filter(subject =>
    (subject.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (subject.subjectCode?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSubjects.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedSubject(null)
  }

  const handleSubmit = async (data: CreateSubjectData | UpdateSubjectData) => {
    setIsLoading(true)
    try {
      if (selectedSubject) {
        await subjectService.updateSubject(selectedSubject.id, data as UpdateSubjectData)
      } else {
        await subjectService.createSubject(data as CreateSubjectData)
      }
      setIsModalOpen(false)
      fetchSubjects()
    } catch (error) {
      console.error('Error submitting subject:', error)
      toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.')
    } finally {
      setIsLoading(false)
    }
  }

  const columns: ColumnDef<Subject>[] = [
    {
      accessorKey: "subjectCode",
      header: "Mã môn học",
    },
    {
      accessorKey: "name",
      header: "Tên môn học",
    },
    {
      accessorKey: "creditHour",
      header: "Số tín chỉ",
    },
    {
      accessorKey: "createdBy",
      header: "Người tạo",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const subject = row.original
        return (
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => handleEdit(subject)}
            >
              <span className="sr-only">Edit</span>
              <PencilIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => {
                setSubjectToDelete(subject);
                setIsDeleteDialogOpen(true);
              }}
            >
              <span className="sr-only">Delete</span>
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <Card className="max-w-[1200px] mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Quản lý môn học</CardTitle>
          <Button onClick={() => {
            setSelectedSubject(null)
            setIsModalOpen(true)
          }} className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" />
            Thêm môn học
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm môn học..."
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
                <TableHead>Mã môn học</TableHead>
                <TableHead>Tên môn học</TableHead>
                <TableHead>Số tín chỉ</TableHead>
                <TableHead>Người tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Không tìm thấy môn học nào
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map((subject) => (
                  <TableRow 
                    key={subject.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewSubject(subject)}
                  >
                    <TableCell className="font-medium">{subject.id}</TableCell>
                    <TableCell>{subject.subjectCode}</TableCell>
                    <TableCell>{subject.name}</TableCell>
                    <TableCell>{subject.creditHour}</TableCell>
                    <TableCell>{subject.createdByName || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 mr-1 hover:bg-muted"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(subject);
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
                          setSubjectToDelete(subject);
                          setIsDeleteDialogOpen(true);
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          isActive={currentPage === page}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  return null;
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>

      <SubjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        subject={selectedSubject}
        isLoading={isLoading}
      />

      <SubjectDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedSubject(null)
        }}
        subject={selectedSubject}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Môn học này sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSubject} className="bg-red-500 hover:bg-red-600">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
} 
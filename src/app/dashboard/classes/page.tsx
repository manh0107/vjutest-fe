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
import { Pencil, Trash2, Search, Plus, Check, Square, X } from 'lucide-react'
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
import { majorService, Major } from '@/services/majorService'
import { departmentService, Department } from '@/services/departmentService'
import { ClassActionsDropdown } from './components/ClassActionsDropdown'
import { subjectService, Subject } from '@/services/subjectService'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [majorsList, setMajorsList] = useState<Major[]>([])
  const [departmentsList, setDepartmentsList] = useState<Department[]>([])
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
  const [expandedClassId, setExpandedClassId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'subjects' | 'students' | 'teachers' | 'documents' | null>(null)
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false)
  const [subjectSearchTerm, setSubjectSearchTerm] = useState('')
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([])
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([])

  useEffect(() => {
    fetchClasses()
    fetchMajorsAndDepartments()
  }, [])

  const fetchClasses = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await classService.getAllClasses()
      setClasses(data)
    } catch (error) {
      setError('Không thể tải danh sách lớp học. Vui lòng kiểm tra kết nối hoặc thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  const fetchMajorsAndDepartments = async () => {
    try {
      const [majors, departments] = await Promise.all([
        majorService.getAllMajors(),
        departmentService.getAllDepartments()
      ])
      setMajorsList(majors)
      setDepartmentsList(departments)
    } catch (error) {
      // ignore
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

  const handleManageClick = (classItem: Class, tab: 'subjects' | 'students' | 'teachers' | 'documents') => {
    if (expandedClassId === classItem.id && activeTab === tab) {
      setExpandedClassId(null)
      setActiveTab(null)
    } else {
      setExpandedClassId(classItem.id)
      setActiveTab(tab)
    }
  }

  const handleAddSubjectClick = (classItem: Class) => {
    setSelectedClass(classItem)
    setIsAddSubjectModalOpen(true)
    fetchAvailableSubjects()
  }

  const fetchAvailableSubjects = async () => {
    try {
      const subjects = await subjectService.getAllSubjects()
      setAvailableSubjects(subjects)
    } catch (error) {
      console.error('Error fetching subjects:', error)
      toast.error('Không thể tải danh sách môn học')
    }
  }

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubjects(prev => {
      const isSelected = prev.some(s => s.id === subject.id)
      if (isSelected) {
        return prev.filter(s => s.id !== subject.id)
      } else {
        return [...prev, subject]
      }
    })
  }

  const handleAddSubject = async () => {
    if (!selectedClass || selectedSubjects.length === 0) return

    try {
      for (const subject of selectedSubjects) {
        await classService.addSubjectToClass(selectedClass.id, subject.id)
      }
      toast.success(`Đã thêm ${selectedSubjects.length} môn học vào lớp thành công`)
      setIsAddSubjectModalOpen(false)
      setSelectedSubjects([])
      fetchClasses() // Refresh the class list to show the new subjects
    } catch (error) {
      console.error('Error adding subjects:', error)
      toast.error('Không thể thêm môn học vào lớp')
    }
  }

  const filteredClasses = classes.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.classCode.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredSubjects = availableSubjects.filter(subject =>
    subject.name.toLowerCase().includes(subjectSearchTerm.toLowerCase()) ||
    subject.description.toLowerCase().includes(subjectSearchTerm.toLowerCase())
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
                filteredClasses.map((classItem) => (
                  <>
                    <TableRow key={classItem.id}>
                      <TableCell>{classItem.id}</TableCell>
                      <TableCell>{classItem.classCode}</TableCell>
                      <TableCell>{classItem.name}</TableCell>
                      <TableCell>{classItem.createdByName}</TableCell>
                      <TableCell className="text-right">
                        <ClassActionsDropdown
                          classItem={classItem}
                          onView={handleViewClass}
                          onEdit={handleEdit}
                          onDelete={handleDeleteClick}
                          onManage={(tab) => handleManageClick(classItem, tab)}
                        />
                      </TableCell>
                    </TableRow>
                    {expandedClassId === classItem.id && (
                      <TableRow>
                        <TableCell colSpan={5} className="p-0">
                          <div className="border-t">
                            {activeTab === 'subjects' && (
                              <div className="p-4">
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className="text-lg font-semibold">Quản lý môn học trong lớp</h3>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleAddSubjectClick(classItem)}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Thêm môn học
                                  </Button>
                                </div>
                                <div className="relative mb-4">
                                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="Tìm kiếm môn học..."
                                    className="pl-8"
                                  />
                                </div>
                                <div className="space-y-2">
                                  {classItem.classSubjects?.map((subject) => (
                                    <div key={subject.id} className="flex items-center justify-between p-2 border rounded-lg">
                                      <div>
                                        <p className="font-medium">{subject.subject.name}</p>
                                        <p className="text-sm text-muted-foreground">{subject.subject.description}</p>
                                      </div>
                                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {activeTab === 'students' && (
                              <div className="p-4">
                                <h3 className="text-lg font-semibold mb-4">Quản lý sinh viên trong lớp</h3>
                                {/* Add student management UI here */}
                              </div>
                            )}
                            {activeTab === 'teachers' && (
                              <div className="p-4">
                                <h3 className="text-lg font-semibold mb-4">Quản lý giảng viên trong lớp</h3>
                                {/* Add teacher management UI here */}
                              </div>
                            )}
                            {activeTab === 'documents' && (
                              <div className="p-4">
                                <h3 className="text-lg font-semibold mb-4">Quản lý tài liệu trong lớp</h3>
                                {/* Add document management UI here */}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
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
        majorsList={majorsList}
        departmentsList={departmentsList}
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

      <Dialog open={isAddSubjectModalOpen} onOpenChange={setIsAddSubjectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm môn học vào lớp</DialogTitle>
            <DialogDescription>
              Chọn một hoặc nhiều môn học để thêm vào lớp
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm môn học..."
                value={subjectSearchTerm}
                onChange={(e) => setSubjectSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {filteredSubjects.map((subject) => {
                const isSelected = selectedSubjects.some(s => s.id === subject.id)
                return (
                  <div
                    key={subject.id}
                    className={`flex items-center justify-between p-2 border rounded-lg cursor-pointer ${
                      isSelected ? 'bg-accent' : ''
                    }`}
                    onClick={() => handleSubjectSelect(subject)}
                  >
                    <div className="flex items-center gap-2">
                      {isSelected ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Square className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div>
                        <p className="font-medium">{subject.name}</p>
                        <p className="text-sm text-muted-foreground">{subject.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            {selectedSubjects.length > 0 && (
              <div className="border rounded-lg p-2">
                <p className="text-sm font-medium mb-2">Đã chọn {selectedSubjects.length} môn học:</p>
                <div className="space-y-1">
                  {selectedSubjects.map(subject => (
                    <div key={subject.id} className="flex items-center justify-between text-sm">
                      <span>{subject.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleSubjectSelect(subject)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddSubjectModalOpen(false)
              setSelectedSubjects([])
            }}>
              Hủy
            </Button>
            <Button 
              onClick={handleAddSubject} 
              disabled={selectedSubjects.length === 0}
            >
              Thêm {selectedSubjects.length > 0 ? `(${selectedSubjects.length})` : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
} 
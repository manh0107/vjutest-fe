'use client'

import { useState, useEffect, useRef } from 'react'
import { classService, Class, UpdateClassData } from '@/services/classService'
import api from '@/services/axios'
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
import { Pencil, Trash2, Search, Plus, Check, Square, X, UploadCloud, FileText, File, FileImage, Info } from 'lucide-react'
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
import { userService } from '@/services/userService'
import { User } from '@/services/types'
import { authService } from '@/services/authService'

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
  const [showClassDetail, setShowClassDetail] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [expandedClassId, setExpandedClassId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'subjects' | 'students' | 'teachers' | 'documents' | null>(null)
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false)
  const [subjectSearchTerm, setSubjectSearchTerm] = useState('')
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([])
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([])
  const [subjectsInClassMap, setSubjectsInClassMap] = useState<{ [classId: number]: Subject[] }>({})
  const [subjectsLoadingMap, setSubjectsLoadingMap] = useState<{ [classId: number]: boolean }>({})
  const [documents, setDocuments] = useState<any[]>([])
  const [documentsLoading, setDocumentsLoading] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadSubjects, setUploadSubjects] = useState<any[]>([])
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false)
  const [allStudents, setAllStudents] = useState<User[]>([])
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([])
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [addStudentsLoading, setAddStudentsLoading] = useState(false)
  const [studentsInClassMap, setStudentsInClassMap] = useState<{ [classId: number]: User[] }>({})
  const [studentsTabLoadingMap, setStudentsTabLoadingMap] = useState<{ [classId: number]: boolean }>({})

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

  const handleClassClick = (classData: Class) => {
    setSelectedClass(classData)
    setShowClassDetail(true)
  }

  const handleSubjectsUpdated = (classId: number) => {
    fetchClasses();
    if (expandedClassId === classId && activeTab === 'subjects') {
      fetchSubjectsInClass(classId);
    }
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
      await fetchClasses(); // Refresh the class list to show the new subjects
      // Refetch chi tiết lớp nếu đang mở modal chi tiết
      if (showClassDetail && selectedClass) {
        const updatedClass = await classService.getClassById(selectedClass.id);
        setSelectedClass(updatedClass);
      }
      // Refresh phần expand nếu đang mở tab môn học
      if (expandedClassId === selectedClass.id && activeTab === 'subjects') {
        fetchSubjectsInClass(selectedClass.id);
      }
    } catch (error) {
      console.error('Error adding subjects:', error)
      toast.error('Không thể thêm môn học vào lớp')
    }
  }

  const fetchSubjectsInClass = async (classId: number) => {
    setSubjectsLoadingMap(prev => ({ ...prev, [classId]: true }))
    try {
      const subjects = await subjectService.getSubjectsInClass(classId)
      setSubjectsInClassMap(prev => ({ ...prev, [classId]: subjects }))
    } catch (error) {
      toast.error('Không thể tải danh sách môn học trong lớp')
    } finally {
      setSubjectsLoadingMap(prev => ({ ...prev, [classId]: false }))
    }
  }

  const handleRemoveSubjectFromClass = async (classId: number, subjectId: number) => {
    try {
      await classService.removeSubjects(classId, [subjectId])
      toast.success('Đã xóa môn học khỏi lớp thành công')
      fetchSubjectsInClass(classId)
    } catch (error) {
      toast.error('Không thể xóa môn học khỏi lớp')
    }
  }

  useEffect(() => {
    if (expandedClassId && activeTab === 'subjects') {
      fetchSubjectsInClass(expandedClassId)
    }
    // eslint-disable-next-line
  }, [expandedClassId, activeTab])

  const fetchDocuments = async (classId: number) => {
    setDocumentsLoading(true);
    try {
      const docs = await classService.getDocumentsInClass(classId);
      setDocuments(docs);
    } catch (error) {
      toast.error('Không thể tải danh sách tài liệu');
    } finally {
      setDocumentsLoading(false);
    }
  };

  useEffect(() => {
    if (expandedClassId && activeTab === 'documents') {
      fetchDocuments(expandedClassId);
    }
    // eslint-disable-next-line
  }, [expandedClassId, activeTab]);

  const filteredClasses = classes.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.classCode.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredSubjects = availableSubjects.filter(subject =>
    subject.name.toLowerCase().includes(subjectSearchTerm.toLowerCase()) ||
    subject.description.toLowerCase().includes(subjectSearchTerm.toLowerCase())
  )

  const handleUploadDocument = async () => {
    if (!expandedClassId || !selectedSubjectId || !selectedFile) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      // Giả sử folderId là rỗng hoặc lấy từ BE nếu cần
      formData.append('folderId', '')
      await api.post(`/class-subjects/${expandedClassId}/${selectedSubjectId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Tải tài liệu lên thành công')
      setIsUploadDialogOpen(false)
      setSelectedFile(null)
      fetchDocuments(expandedClassId)
    } catch (error) {
      toast.error('Không thể tải tài liệu lên')
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    if (isUploadDialogOpen && expandedClassId) {
      classService.getSubjectsInClass(expandedClassId)
        .then(setUploadSubjects)
        .catch(() => setUploadSubjects([]))
    }
  }, [isUploadDialogOpen, expandedClassId])

  // Helper: icon theo loại file
  const getFileIcon = (fileName: string) => {
    if (!fileName) return <File className="h-5 w-5 text-gray-400" />
    const ext = fileName.split('.').pop()?.toLowerCase()
    if (['pdf'].includes(ext!)) return <FileText className="h-5 w-5 text-red-500" />
    if (['doc', 'docx'].includes(ext!)) return <FileText className="h-5 w-5 text-blue-500" />
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(ext!)) return <FileImage className="h-5 w-5 text-green-500" />
    return <FileText className="h-5 w-5 text-gray-500" />
  }

  const fetchStudentsInClass = async (classId: number) => {
    setStudentsTabLoadingMap(prev => ({ ...prev, [classId]: true }))
    try {
      const students = await classService.getStudentsInClass(classId)
      setStudentsInClassMap(prev => ({ ...prev, [classId]: students }))
    } catch (error) {
      toast.error('Không thể tải danh sách sinh viên trong lớp')
    } finally {
      setStudentsTabLoadingMap(prev => ({ ...prev, [classId]: false }))
    }
  }

  useEffect(() => {
    if (expandedClassId && activeTab === 'students') {
      fetchStudentsInClass(expandedClassId)
    }
    // eslint-disable-next-line
  }, [expandedClassId, activeTab])

  const openAddStudentModal = async () => {
    setIsAddStudentModalOpen(true)
    setStudentsLoading(true)
    try {
      const users = await userService.getUsers()
      setAllStudents(users.filter((u: User) => (typeof u.role === 'string' ? u.role.includes('student') : u.role?.name?.includes('student'))))
    } catch (error) {
      toast.error('Không thể tải danh sách sinh viên')
    } finally {
      setStudentsLoading(false)
    }
  }

  const handleStudentSelect = (id: number) => {
    setSelectedStudentIds(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id])
  }

  const handleAddStudents = async () => {
    if (!expandedClassId || selectedStudentIds.length === 0) return
    setAddStudentsLoading(true)
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        toast.error('Không tìm thấy thông tin người dùng');
        return;
      }

      const classItem = classes.find(c => c.id === expandedClassId);
      if (!classItem) {
        toast.error('Không tìm thấy thông tin lớp học');
        return;
      }

      // Check if user is a teacher of the class
      const isTeacher = classItem.teachers.some(t => t.id === user.id) || classItem.createdById === user.id;
      if (!isTeacher) {
        toast.error('Bạn không có quyền thêm sinh viên vào lớp này');
        return;
      }

      await classService.addStudents(expandedClassId, selectedStudentIds)
      toast.success('Đã thêm sinh viên vào lớp thành công')
      setIsAddStudentModalOpen(false)
      setSelectedStudentIds([])
      fetchStudentsInClass(expandedClassId)
      fetchClasses()
    } catch (error) {
      toast.error('Không thể thêm sinh viên vào lớp')
    } finally {
      setAddStudentsLoading(false)
    }
  }

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
                          onView={handleClassClick}
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
                                  {subjectsLoadingMap[classItem.id] ? (
                                    <div>Đang tải...</div>
                                  ) : (
                                    (subjectsInClassMap[classItem.id] || []).map((subject) => (
                                      <div key={subject.id} className="flex items-center justify-between p-2 border rounded-lg">
                                        <div>
                                          <p className="font-medium">{subject.name}</p>
                                          <p className="text-sm text-muted-foreground">{subject.description}</p>
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleRemoveSubjectFromClass(classItem.id, subject.id)}>
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            )}
                            {activeTab === 'students' && (
                              <div className="p-4">
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className="text-lg font-semibold">Quản lý sinh viên trong lớp</h3>
                                  <Button variant="outline" size="sm" onClick={openAddStudentModal}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Thêm sinh viên
                                  </Button>
                                </div>
                                {studentsTabLoadingMap[classItem.id] ? (
                                  <div>Đang tải danh sách sinh viên...</div>
                                ) : (
                                  <div className="space-y-2">
                                    {(studentsInClassMap[classItem.id] || []).length === 0 ? (
                                      <div className="text-muted-foreground">Chưa có sinh viên nào trong lớp này.</div>
                                    ) : (
                                      (studentsInClassMap[classItem.id] || []).map(student => (
                                        <div key={student.id} className="flex items-center justify-between p-2 border rounded-lg">
                                          <div>
                                            <p className="font-medium">{student.name}</p>
                                            <p className="text-sm text-muted-foreground">{student.email}</p>
                                          </div>
                                          <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="text-red-600 hover:text-red-700"
                                            onClick={async () => {
                                              if (window.confirm('Bạn có chắc chắn muốn xóa sinh viên này khỏi lớp?')) {
                                                try {
                                                  await classService.removeStudent(classItem.id, student.id);
                                                  toast.success('Đã xóa sinh viên khỏi lớp thành công');
                                                  fetchStudentsInClass(classItem.id);
                                                  fetchClasses();
                                                } catch (error) {
                                                  toast.error('Không thể xóa sinh viên khỏi lớp');
                                                }
                                              }
                                            }}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                )}
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
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className="text-lg font-semibold">Quản lý tài liệu trong lớp</h3>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => setIsUploadDialogOpen(true)}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    <UploadCloud className="h-4 w-4" />
                                    Thêm tài liệu
                                  </Button>
                                </div>
                                {documentsLoading ? (
                                  <div>Đang tải tài liệu...</div>
                                ) : (
                                  <>
                                    {documents.length === 0 ? (
                                      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                        <Info className="h-12 w-12 mb-2" />
                                        <div className="font-medium mb-1">Chưa có tài liệu nào cho lớp học này.</div>
                                        <div className="text-sm">Hãy nhấn <b>Thêm tài liệu</b> để upload file cho lớp học.</div>
                                      </div>
                                    ) : (
                                      <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden shadow-sm">
                                          <thead className="bg-gray-50">
                                            <tr>
                                              <th className="px-4 py-2 text-left font-semibold">Loại</th>
                                              <th className="px-4 py-2 text-left font-semibold">Tên tài liệu</th>
                                              <th className="px-4 py-2 text-left font-semibold">Môn học</th>
                                              <th className="px-4 py-2 text-left font-semibold">Hành động</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {documents.map((doc) => (
                                              <tr key={doc.id} className="hover:bg-blue-50 transition">
                                                <td className="px-4 py-2 align-middle">{getFileIcon(doc.fileName)}</td>
                                                <td className="px-4 py-2 align-middle max-w-xs truncate" title={doc.fileName}>
                                                  {doc.documentUrl ? (
                                                    <a
                                                      href={doc.documentUrl}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="text-[#2563eb] font-medium hover:text-[#1d4ed8] focus:outline-none"
                                                      style={{ textDecoration: 'none' }}
                                                    >
                                                      {doc.fileName || 'Xem tài liệu'}
                                                    </a>
                                                  ) : (
                                                    <span className="text-gray-400">Chưa có</span>
                                                  )}
                                                </td>
                                                <td className="px-4 py-2 align-middle">{doc.subject?.name}</td>
                                                <td className="px-4 py-2 align-middle">
                                                  {doc.documentUrl && (
                                                    <Button
                                                      variant="ghost"
                                                      size="icon"
                                                      className="hover:bg-red-50"
                                                      onClick={async () => {
                                                        if (window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) {
                                                          try {
                                                            await classService.deleteDocumentFromClass(expandedClassId, doc.id);
                                                            fetchDocuments(expandedClassId);
                                                            toast.success('Đã xóa tài liệu thành công');
                                                          } catch (error) {
                                                            toast.error('Không thể xóa tài liệu');
                                                          }
                                                        }
                                                      }}
                                                    >
                                                      <Trash2 className="h-5 w-5 text-red-600" />
                                                    </Button>
                                                  )}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    )}
                                  </>
                                )}
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

      {selectedClass && (
        <ClassDetailModal
          isOpen={showClassDetail}
          onClose={() => setShowClassDetail(false)}
          classData={selectedClass}
          majorsList={majorsList}
          departmentsList={departmentsList}
          onSubjectsUpdated={handleSubjectsUpdated}
        />
      )}

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

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm tài liệu vào lớp</DialogTitle>
            <DialogDescription>Chọn môn học và file tài liệu để upload lên Google Drive</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <select
              className="w-full border rounded p-2"
              value={selectedSubjectId ?? ''}
              onChange={e => setSelectedSubjectId(Number(e.target.value))}
            >
              <option value="">Chọn môn học</option>
              {uploadSubjects.map(subject => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>
            <input
              type="file"
              className="w-full"
              onChange={e => setSelectedFile(e.target.files?.[0] || null)}
              accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/*"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)} disabled={uploading}>Hủy</Button>
            <Button onClick={handleUploadDocument} disabled={!selectedSubjectId || !selectedFile || uploading}>
              {uploading ? 'Đang tải lên...' : 'Tải lên'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddStudentModalOpen} onOpenChange={setIsAddStudentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm sinh viên vào lớp</DialogTitle>
            <DialogDescription>Chọn một hoặc nhiều sinh viên để thêm vào lớp</DialogDescription>
          </DialogHeader>
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {studentsLoading ? (
              <div>Đang tải danh sách sinh viên...</div>
            ) : (
              allStudents.map(student => (
                <div
                  key={student.id}
                  className={`flex items-center justify-between p-2 border rounded-lg cursor-pointer ${selectedStudentIds.includes(student.id) ? 'bg-accent' : ''}`}
                  onClick={() => handleStudentSelect(student.id)}
                >
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </div>
                  {selectedStudentIds.includes(student.id) ? <Check className="h-4 w-4 text-green-600" /> : <Square className="h-4 w-4 text-muted-foreground" />}
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddStudentModalOpen(false)} disabled={addStudentsLoading}>Hủy</Button>
            <Button onClick={handleAddStudents} disabled={selectedStudentIds.length === 0 || addStudentsLoading}>
              {addStudentsLoading ? 'Đang thêm...' : `Thêm${selectedStudentIds.length > 0 ? ` (${selectedStudentIds.length})` : ''}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
} 
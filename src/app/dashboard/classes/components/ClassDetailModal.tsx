'use client'

import { Class } from '@/services/classService'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserPlus, Users, Clock, FileText, UserCheck, UserX, BookOpen, GraduationCap, ClipboardList, UserCog, Pencil, Trash2, Upload, Download, Plus, Minus } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useState, useEffect } from 'react'
import { classService } from '@/services/classService'
import { toast } from 'sonner'
import { subjectService, Subject } from '@/services/subjectService'

interface ClassDetailModalProps {
  isOpen: boolean
  onClose: () => void
  classData: Class | null
  majorsList: { id: number; name: string }[]
  departmentsList: { id: number; name: string }[]
  onSubjectsUpdated?: (classId: number) => void
}

export function ClassDetailModal({ isOpen, onClose, classData, majorsList = [], departmentsList = [], onSubjectsUpdated }: ClassDetailModalProps) {
  if (!classData) return null

  console.log('Class Data:', classData)
  console.log('Creator:', { name: classData.createdByName, image: classData.createByImage })
  console.log('Teachers:', classData.teachers?.map(t => ({ name: t.name, image: t.image })))

  const createdAt = classData.createdAt ? new Date(classData.createdAt) : null
  const studentCount = classData.users?.length || 0
  const teacherCount = classData.teachers?.length || 0
  const subjectCount = classData.classSubjects?.length || 0
  const examCount = classData.exams?.length || 0
  const joinRequestCount = classData.joinRequests?.length || 0

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Reset page when changing tabs
  const handleTabChange = () => {
    setCurrentPage(1)
  }

  // Get paginated items
  const getPaginatedItems = (items: any[] = [], page: number) => {
    const startIndex = (page - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return items.slice(startIndex, endIndex)
  }

  // Get total pages
  const getTotalPages = (totalItems: number) => {
    return Math.ceil(totalItems / itemsPerPage)
  }

  const [subjectsInClass, setSubjectsInClass] = useState<Subject[]>([])
  const [subjectsLoading, setSubjectsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && classData?.id) {
      fetchSubjectsInClass(classData.id)
    }
    // eslint-disable-next-line
  }, [isOpen, classData?.id])

  const fetchSubjectsInClass = async (classId: number) => {
    setSubjectsLoading(true)
    try {
      const subjects = await subjectService.getSubjectsInClass(classId)
      setSubjectsInClass(subjects)
    } catch (error) {
      toast.error('Không thể tải danh sách môn học trong lớp')
    } finally {
      setSubjectsLoading(false)
    }
  }

  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([])
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleAddSubjects = async () => {
    if (!selectedSubjects.length) {
      toast.error('Vui lòng chọn ít nhất một môn học');
      return;
    }

    if (loading) return;

    try {
      setLoading(true);
      
      // Lọc ra những môn học chưa tồn tại trong lớp
      const existingSubjects = subjectsInClass.map(s => s.id);
      const newSubjects = selectedSubjects.filter(id => !existingSubjects.includes(id));

      if (newSubjects.length === 0) {
        toast.error('Tất cả môn học đã được chọn đã tồn tại trong lớp');
        setSelectedSubjects([]);
        setShowAddSubjectModal(false);
        return;
      }

      const results = await Promise.allSettled(
        newSubjects.map(subjectId =>
          classService.addSubjectToClass(classData.id, subjectId)
            .catch((error) => error) // Bắt lỗi để xử lý từng môn
        )
      );

      let scopeErrorCount = 0;
      let existErrorCount = 0;
      let otherErrorCount = 0;

      results.forEach((result) => {
        if (result.status === 'rejected') {
          const reason = result.reason;
          const message = reason?.response?.data?.message || reason?.message || '';
          if (message.includes('không thuộc cùng khoa') || message.includes('không thuộc cùng ngành')) {
            scopeErrorCount++;
          } else if (message.includes('đã tồn tại trong lớp')) {
            existErrorCount++;
          } else {
            otherErrorCount++;
          }
        }
      });

      const successCount = results.filter(r => r.status === 'fulfilled').length;

      if (successCount > 0) {
        toast.success(`Đã thêm thành công ${successCount} môn học`);
        await fetchSubjectsInClass(classData.id);
        if (classData) {
          classData.classSubjects = [...(classData.classSubjects || [])];
        }
        onSubjectsUpdated?.(classData.id);
      }
      if (scopeErrorCount > 0) {
        toast.error(`${scopeErrorCount} môn học không cùng phạm vi với lớp học, không thể thêm.`);
      }
      if (existErrorCount > 0) {
        toast.error(`${existErrorCount} môn học đã tồn tại trong lớp.`);
      }
      if (otherErrorCount > 0) {
        toast.error(`Có ${otherErrorCount} lỗi khác khi thêm môn học.`);
      }

      setSelectedSubjects([]);
      setShowAddSubjectModal(false);
    } catch (error) {
      console.error('Error adding subjects:', error);
      toast.error('Có lỗi xảy ra khi thêm môn học');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSubject = async (subjectId: number) => {
    try {
      await classService.removeSubjects(classData.id, [subjectId])
      toast.success('Xóa môn học thành công')
      await fetchSubjectsInClass(classData.id)
    } catch (error) {
      toast.error('Không thể xóa môn học')
    }
  }

  const handleAddStudent = async () => {
    try {
      // TODO: Show student selection modal
      toast.success('Thêm sinh viên thành công')
    } catch (error) {
      toast.error('Không thể thêm sinh viên')
    }
  }

  const handleRemoveStudent = async (studentId: number) => {
    try {
      await classService.removeStudents(classData.id, [studentId])
      toast.success('Xóa sinh viên thành công')
    } catch (error) {
      toast.error('Không thể xóa sinh viên')
    }
  }

  const handleInviteTeacher = async () => {
    try {
      // TODO: Show teacher selection modal
      toast.success('Mời giáo viên thành công')
    } catch (error) {
      toast.error('Không thể mời giáo viên')
    }
  }

  const handleRemoveTeacher = async (teacherId: number) => {
    try {
      await classService.removeTeacher(classData.id, teacherId)
      toast.success('Xóa giáo viên thành công')
    } catch (error) {
      toast.error('Không thể xóa giáo viên')
    }
  }

  const handleUploadDocument = async () => {
    try {
      // TODO: Show document upload modal
      toast.success('Tải lên tài liệu thành công')
    } catch (error) {
      toast.error('Không thể tải lên tài liệu')
    }
  }

  const handleDeleteDocument = async (classSubjectId: number) => {
    try {
      await classService.deleteDocumentFromClass(classData.id, classSubjectId)
      toast.success('Xóa tài liệu thành công')
    } catch (error) {
      toast.error('Không thể xóa tài liệu')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Chi tiết lớp học</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1">
          <div className="pr-4">
            <div className="grid grid-cols-5 gap-4 mb-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Sinh viên</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{studentCount}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Giáo viên</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{teacherCount}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Môn học</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{subjectCount}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Bài kiểm tra</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{examCount}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Yêu cầu</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{joinRequestCount}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Thông tin lớp học
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Mã lớp</div>
                    <div className="font-medium">{classData.classCode}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Người tạo</div>
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarFallback>{classData.createdByName?.charAt(0)?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span>{classData.createdByName || '-'}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Ngày tạo</div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {createdAt ? format(createdAt, 'HH:mm:ss dd/MM/yyyy', { locale: vi }) : '-'}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Mô tả</div>
                  <div className="text-xs">{classData.description || 'Không có mô tả'}</div>
                  {classData.visibility === 'PUBLIC' && (
                    <div className="mt-2">
                      <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-medium">Phạm vi: Toàn trường</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="info" className="mt-4" onValueChange={handleTabChange}>
              <TabsList className="grid grid-cols-5">
                <TabsTrigger value="info">Thông tin</TabsTrigger>
                <TabsTrigger value="subjects">Môn học</TabsTrigger>
                <TabsTrigger value="students">Sinh viên</TabsTrigger>
                <TabsTrigger value="teachers">Giáo viên</TabsTrigger>
                <TabsTrigger value="documents">Tài liệu</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base font-medium">Danh sách khoa & ngành</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Danh sách khoa</div>
                          <div className="flex flex-wrap gap-2">
                            {Array.isArray(classData.departmentIds)
                              ? classData.departmentIds.length > 0
                                ? classData.departmentIds.map((id: number) => {
                                    const dept = departmentsList.find(d => d.id === id);
                                    return <span key={id} className="text-sm font-normal">{dept ? dept.name : `#${id}`}</span>;
                                  })
                                : <span className="text-xs text-gray-400">Không có khoa nào</span>
                              : classData.departmentIds
                                ? (() => {
                                    const dept = departmentsList.find(d => d.id === classData.departmentIds);
                                    return <span className="text-sm font-normal">{dept ? dept.name : `#${classData.departmentIds}`}</span>;
                                  })()
                                : <span className="text-xs text-gray-400">Không có khoa nào</span>
                            }
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Danh sách ngành</div>
                          <div className="flex flex-wrap gap-2">
                            {Array.isArray(classData.majorIds)
                              ? classData.majorIds.length > 0
                                ? classData.majorIds.map((id: number) => {
                                    const major = majorsList.find(m => m.id === id);
                                    return <span key={id} className="text-sm font-normal">{major ? major.name : `#${id}`}</span>;
                                  })
                                : <span className="text-xs text-gray-400">Không có ngành nào</span>
                              : classData.majorIds
                                ? (() => {
                                    const major = majorsList.find(m => m.id === classData.majorIds);
                                    return <span className="text-sm font-normal">{major ? major.name : `#${classData.majorIds}`}</span>;
                                  })()
                                : <span className="text-xs text-gray-400">Không có ngành nào</span>
                            }
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

              <TabsContent value="subjects" className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Danh sách môn học</h3>
                  <Button variant="outline" size="sm" onClick={() => setShowAddSubjectModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm môn học
                  </Button>
                </div>
                <div className="space-y-4">
                  {subjectsLoading ? (
                    <div>Đang tải...</div>
                  ) : (
                    getPaginatedItems(subjectsInClass, currentPage).map((subject) => (
                      <Card key={subject.id}>
                        <CardContent className="p-4 flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{subject.name}</h4>
                            <p className="text-sm text-muted-foreground">{subject.description}</p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => handleRemoveSubject(subject.id)}>
                            <Minus className="w-4 h-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
                <Pagination className="mt-4">
                  {/* ... existing pagination ... */}
                </Pagination>
              </TabsContent>

              <TabsContent value="students" className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Danh sách sinh viên</h3>
                  <Button variant="outline" size="sm" onClick={handleAddStudent}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Thêm sinh viên
                  </Button>
                </div>
                <div className="space-y-4">
                  {getPaginatedItems(classData.users, currentPage).map((student) => (
                    <Card key={student.id}>
                      <CardContent className="p-4 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  <Avatar>
                            <AvatarImage src={student.image} />
                            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                            <h4 className="font-medium">{student.name}</h4>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                                    </div>
                                  </div>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveStudent(student.id)}>
                          <UserX className="w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                                </div>
                <Pagination className="mt-4">
                  {/* ... existing pagination ... */}
                </Pagination>
              </TabsContent>

              <TabsContent value="teachers" className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Danh sách giáo viên</h3>
                  <Button variant="outline" size="sm" onClick={handleInviteTeacher}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Mời giáo viên
                                  </Button>
                </div>
                <div className="space-y-4">
                  {getPaginatedItems(classData.teachers, currentPage).map((teacher) => (
                    <Card key={teacher.id}>
                      <CardContent className="p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={teacher.image} />
                            <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{teacher.name}</h4>
                            <p className="text-sm text-muted-foreground">{teacher.email}</p>
                                </div>
                              </div>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveTeacher(teacher.id)}>
                          <UserX className="w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Pagination className="mt-4">
                  {/* ... existing pagination ... */}
                                </Pagination>
              </TabsContent>

              <TabsContent value="documents" className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Tài liệu lớp học</h3>
                  <Button variant="outline" size="sm" onClick={handleUploadDocument}>
                    <Upload className="w-4 h-4 mr-2" />
                    Tải lên tài liệu
                  </Button>
                              </div>
                <div className="space-y-4">
                  {getPaginatedItems(classData.classSubjects?.filter(cs => cs.documentUrl), currentPage).map((classSubject) => (
                    <Card key={classSubject.id}>
                      <CardContent className="p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5" />
                          <div>
                            <h4 className="font-medium">{classSubject.subject.name}</h4>
                            <p className="text-sm text-muted-foreground">{classSubject.documentUrl}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => window.open(classSubject.documentUrl, '_blank')}>
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteDocument(classSubject.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                      </div>
                    </CardContent>
                  </Card>
                  ))}
                </div>
                <Pagination className="mt-4">
                  {/* ... existing pagination ... */}
                </Pagination>
                </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 
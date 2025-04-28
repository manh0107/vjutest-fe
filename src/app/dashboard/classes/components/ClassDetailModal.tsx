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
import { UserPlus, Users, Clock, FileText, UserCheck, UserX, BookOpen, GraduationCap, ClipboardList, UserCog, Pencil, Trash2 } from 'lucide-react'
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
import { useState } from 'react'

interface ClassDetailModalProps {
  isOpen: boolean
  onClose: () => void
  classData: Class | null
  majorsList: { id: number; name: string }[]
  departmentsList: { id: number; name: string }[]
}

export function ClassDetailModal({ isOpen, onClose, classData, majorsList = [], departmentsList = [] }: ClassDetailModalProps) {
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

            <Tabs defaultValue="students" className="w-full" onValueChange={handleTabChange}>
              <TabsList className="w-full justify-start">
                <TabsTrigger value="students" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Sinh viên
                </TabsTrigger>
                <TabsTrigger value="teachers" className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Giảng viên
                </TabsTrigger>
                <TabsTrigger value="subjects" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Môn học
                </TabsTrigger>
                <TabsTrigger value="exams" className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Bài kiểm tra
                </TabsTrigger>
                <TabsTrigger value="info" className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Khoa & Ngành
                </TabsTrigger>
                <TabsTrigger value="requests" className="flex items-center gap-2">
                  <UserCog className="h-4 w-4" />
                  Yêu cầu tham gia
                </TabsTrigger>
              </TabsList>

              <div className="mt-2">
                <TabsContent value="students" className="m-0">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-base font-medium">Danh sách sinh viên</CardTitle>
                      <Button variant="outline" size="sm" className="h-8">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Thêm sinh viên
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {classData.users && classData.users.length > 0 ? (
                          <>
                            {getPaginatedItems(classData.users, currentPage).map((user) => (
                              <div key={user.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarFallback>{user.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{user.name}</div>
                                  </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                  <UserX className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            {classData.users.length > itemsPerPage && (
                              <div className="mt-4 flex justify-center">
                                <Pagination>
                                  <PaginationContent>
                                    <PaginationItem>
                                      <PaginationPrevious 
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                      />
                                    </PaginationItem>
                                    {Array.from({length: getTotalPages(classData.users.length)}).map((_, i) => (
                                      <PaginationItem key={i}>
                                        <PaginationLink
                                          onClick={() => setCurrentPage(i + 1)}
                                          isActive={currentPage === i + 1}
                                        >
                                          {i + 1}
                                        </PaginationLink>
                                      </PaginationItem>
                                    ))}
                                    <PaginationItem>
                                      <PaginationNext 
                                        onClick={() => setCurrentPage(p => Math.min(getTotalPages(classData.users.length), p + 1))}
                                        disabled={currentPage === getTotalPages(classData.users.length)}
                                      />
                                    </PaginationItem>
                                  </PaginationContent>
                                </Pagination>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center text-sm text-muted-foreground py-4">
                            Chưa có sinh viên nào trong lớp
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="teachers" className="m-0">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-base font-medium">Danh sách giảng viên</CardTitle>
                      <Button variant="outline" size="sm" className="h-8">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Thêm giảng viên
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {classData.teachers && classData.teachers.length > 0 ? (
                          <>
                            {getPaginatedItems(classData.teachers, currentPage).map((teacher) => (
                              <div key={teacher.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarFallback>{teacher.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{teacher.name}</div>
                                  </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                  <UserX className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            {classData.teachers.length > itemsPerPage && (
                              <div className="mt-4 flex justify-center">
                                <Pagination>
                                  <PaginationContent>
                                    <PaginationItem>
                                      <PaginationPrevious 
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                      />
                                    </PaginationItem>
                                    {Array.from({length: getTotalPages(classData.teachers.length)}).map((_, i) => (
                                      <PaginationItem key={i}>
                                        <PaginationLink
                                          onClick={() => setCurrentPage(i + 1)}
                                          isActive={currentPage === i + 1}
                                        >
                                          {i + 1}
                                        </PaginationLink>
                                      </PaginationItem>
                                    ))}
                                    <PaginationItem>
                                      <PaginationNext 
                                        onClick={() => setCurrentPage(p => Math.min(getTotalPages(classData.teachers.length), p + 1))}
                                        disabled={currentPage === getTotalPages(classData.teachers.length)}
                                      />
                                    </PaginationItem>
                                  </PaginationContent>
                                </Pagination>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center text-sm text-muted-foreground py-4">
                            Chưa có giảng viên nào trong lớp
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="subjects" className="m-0">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-base font-medium">Danh sách môn học</CardTitle>
                      <Button variant="outline" size="sm" className="h-8">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Thêm môn học
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {classData.classSubjects && classData.classSubjects.length > 0 ? (
                          <>
                            {getPaginatedItems(classData.classSubjects, currentPage).map((subject) => (
                              <div key={subject.id} className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">{subject.subjectName}</div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                  <UserX className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            {classData.classSubjects.length > itemsPerPage && (
                              <div className="mt-4 flex justify-center">
                                <Pagination>
                                  <PaginationContent>
                                    <PaginationItem>
                                      <PaginationPrevious 
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                      />
                                    </PaginationItem>
                                    {Array.from({length: getTotalPages(classData.classSubjects.length)}).map((_, i) => (
                                      <PaginationItem key={i}>
                                        <PaginationLink
                                          onClick={() => setCurrentPage(i + 1)}
                                          isActive={currentPage === i + 1}
                                        >
                                          {i + 1}
                                        </PaginationLink>
                                      </PaginationItem>
                                    ))}
                                    <PaginationItem>
                                      <PaginationNext 
                                        onClick={() => setCurrentPage(p => Math.min(getTotalPages(classData.classSubjects.length), p + 1))}
                                        disabled={currentPage === getTotalPages(classData.classSubjects.length)}
                                      />
                                    </PaginationItem>
                                  </PaginationContent>
                                </Pagination>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center text-sm text-muted-foreground py-4">
                            Chưa có môn học nào trong lớp
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="exams" className="m-0">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-base font-medium">Danh sách bài kiểm tra</CardTitle>
                      <Button variant="outline" size="sm" className="h-8">
                        <ClipboardList className="h-4 w-4 mr-2" />
                        Thêm bài kiểm tra
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {classData.exams && classData.exams.length > 0 ? (
                          <>
                            {getPaginatedItems(classData.exams, currentPage).map((exam) => (
                              <div key={exam.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                <div>
                                  <div className="font-medium">{exam.title}</div>
                                  <div className="text-sm text-muted-foreground">{exam.description}</div>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                            {classData.exams.length > itemsPerPage && (
                              <div className="mt-4 flex justify-center">
                                <Pagination>
                                  <PaginationContent>
                                    <PaginationItem>
                                      <PaginationPrevious 
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                      />
                                    </PaginationItem>
                                    {Array.from({length: getTotalPages(classData.exams.length)}).map((_, i) => (
                                      <PaginationItem key={i}>
                                        <PaginationLink
                                          onClick={() => setCurrentPage(i + 1)}
                                          isActive={currentPage === i + 1}
                                        >
                                          {i + 1}
                                        </PaginationLink>
                                      </PaginationItem>
                                    ))}
                                    <PaginationItem>
                                      <PaginationNext 
                                        onClick={() => setCurrentPage(p => Math.min(getTotalPages(classData.exams.length), p + 1))}
                                        disabled={currentPage === getTotalPages(classData.exams.length)}
                                      />
                                    </PaginationItem>
                                  </PaginationContent>
                                </Pagination>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center text-sm text-muted-foreground py-4">
                            Chưa có bài kiểm tra nào trong lớp
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="info" className="m-0">
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

                <TabsContent value="requests" className="m-0">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-base font-medium">Danh sách yêu cầu tham gia</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {classData.joinRequests && classData.joinRequests.length > 0 ? (
                          <>
                            {getPaginatedItems(classData.joinRequests, currentPage).map((request) => (
                              <div key={request.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarFallback>{request.user?.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{request.user?.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {format(new Date(request.createdAt), 'HH:mm:ss dd/MM/yyyy', { locale: vi })}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" className="h-8">
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Chấp nhận
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-8 text-destructive">
                                    <UserX className="h-4 w-4 mr-2" />
                                    Từ chối
                                  </Button>
                                </div>
                              </div>
                            ))}
                            {classData.joinRequests.length > itemsPerPage && (
                              <div className="mt-4 flex justify-center">
                                <Pagination>
                                  <PaginationContent>
                                    <PaginationItem>
                                      <PaginationPrevious 
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                      />
                                    </PaginationItem>
                                    {Array.from({length: getTotalPages(classData.joinRequests?.length || 0)}).map((_, i) => (
                                      <PaginationItem key={i}>
                                        <PaginationLink
                                          onClick={() => setCurrentPage(i + 1)}
                                          isActive={currentPage === i + 1}
                                        >
                                          {i + 1}
                                        </PaginationLink>
                                      </PaginationItem>
                                    ))}
                                    <PaginationItem>
                                      <PaginationNext 
                                        onClick={() => setCurrentPage(p => Math.min(getTotalPages(classData.joinRequests?.length || 0), p + 1))}
                                        disabled={currentPage === getTotalPages(classData.joinRequests?.length || 0)}
                                      />
                                    </PaginationItem>
                                  </PaginationContent>
                                </Pagination>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center text-sm text-muted-foreground py-4">
                            Chưa có yêu cầu tham gia nào
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 
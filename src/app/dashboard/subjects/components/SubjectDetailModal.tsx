"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Subject } from '@/services/subjectService'

interface SubjectDetailModalProps {
  isOpen: boolean
  onClose: () => void
  subject: Subject | null
}

export function SubjectDetailModal({ isOpen, onClose, subject }: SubjectDetailModalProps) {
  const [activeTab, setActiveTab] = useState('info')

  if (!subject) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Chi tiết môn học</DialogTitle>
          <DialogDescription>
            Xem thông tin chi tiết và danh sách bài kiểm tra của môn học.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Thông tin cơ bản */}
          <div className="md:col-span-1 space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Mã môn học</h3>
              <p className="text-muted-foreground">{subject.subjectCode}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Tên môn học</h3>
              <p className="text-muted-foreground">{subject.name}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Số tín chỉ</h3>
              <p className="text-muted-foreground">{subject.creditHour}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Người tạo</h3>
              <p className="text-muted-foreground">{subject.createdByName}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Ngày tạo</h3>
              <p className="text-muted-foreground">
                {format(new Date(subject.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
              </p>
            </div>
          </div>

          {/* Chi tiết và danh sách */}
          <div className="md:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="info">Thông tin chi tiết</TabsTrigger>
                <TabsTrigger value="exams">Danh sách bài kiểm tra</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="mt-4">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Mô tả</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">{subject.description}</p>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="exams" className="mt-4">
                <ScrollArea className="h-[400px] pr-4">
                  {subject.exams && subject.exams.length > 0 ? (
                    <div className="space-y-4">
                      {subject.exams.map((exam) => (
                        <div
                          key={exam.id}
                          className="p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{exam.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                Thời gian: {format(new Date(exam.startTime), 'dd/MM/yyyy HH:mm', { locale: vi })}
                              </p>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {exam.duration} phút
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      Chưa có bài kiểm tra nào
                    </p>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
"use client"

import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Subject } from '@/services/subjectService'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SubjectDetailModalProps {
  isOpen: boolean
  onClose: () => void
  subject: Subject | null
  majorsList: { id: number; name: string }[]
  departmentsList: { id: number; name: string }[]
}

export function SubjectDetailModal({ isOpen, onClose, subject, majorsList = [], departmentsList = [] }: SubjectDetailModalProps) {
  const [activeTab, setActiveTab] = useState('info')
  const router = useRouter()

  // Lấy danh sách khoa từ ngành nếu departmentIds không có
  const derivedDepartmentIds = useMemo(() => {
    if (subject?.departmentIds && subject.departmentIds.length > 0) {
      return subject.departmentIds;
    }
    // Lấy departmentId từ các major đã chọn
    if (subject?.majorIds && subject.majorIds.length > 0) {
      const deptIds = subject.majorIds
        .map(majorId => {
          const major = majorsList.find(m => m.id === majorId);
          return (major as any)?.departmentId;
        })
        .filter((id): id is number => !!id);
      // Loại trùng lặp
      return Array.from(new Set(deptIds));
    }
    return [];
  }, [subject, majorsList]);

  const handleBackToList = () => {
    onClose()
    router.push('/dashboard/subjects')
  }

  if (!subject) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full max-h-[95vh] p-0 sm:p-0 rounded-xl border border-gray-200 shadow-xl bg-white">
        <DialogHeader className="px-10 pt-8 pb-4 border-b border-gray-100 bg-white">
          <DialogTitle className="text-[1.3rem] sm:text-2xl font-bold text-gray-900">Chi tiết môn học</DialogTitle>
          <DialogDescription className="mt-1 text-[0.98rem] text-gray-500">
            Xem thông tin chi tiết, ngành, khoa và các bài kiểm tra của môn học.
          </DialogDescription>
        </DialogHeader>
        <div className="px-10 py-8 bg-white">
          <div className="flex flex-col md:grid md:grid-cols-2 gap-12 md:gap-20">
            {/* Thông tin cơ bản */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 text-[0.98rem]">
                <span className="font-semibold text-gray-600 w-36">Mã môn học:</span>
                <span className="text-base font-mono text-gray-800 border border-gray-200 px-3 py-1 rounded">{subject.subjectCode}</span>
              </div>
              <div className="flex items-center gap-3 text-[0.98rem]">
                <span className="font-semibold text-gray-600 w-36">Tên môn học:</span>
                <span className="text-base font-medium text-gray-900">{subject.name}</span>
              </div>
              <div className="flex items-center gap-3 text-[0.98rem]">
                <span className="font-semibold text-gray-600 w-36">Số tín chỉ:</span>
                <span className="inline-block rounded text-green-700 px-3 py-1 font-semibold border border-gray-200 text-base">{subject.creditHour}</span>
              </div>
              <div className="flex items-center gap-3 text-[0.98rem]">
                <span className="font-semibold text-gray-600 w-36">Người tạo:</span>
                <span className="text-base text-gray-800 font-medium">{subject.createdByName}</span>
              </div>
              <div className="flex items-center gap-3 text-[0.98rem]">
                <span className="font-semibold text-gray-600 w-36">Ngày tạo:</span>
                <span className="text-base text-gray-700">{format(new Date(subject.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
              </div>
            </div>
            {/* Tabs chi tiết */}
            <div>
              <div className="flex w-full mb-6 gap-2">
                {[
                  { key: 'info', label: 'Thông tin chi tiết' },
                  { key: 'majors', label: 'Ngành & Khoa' },
                  { key: 'exams', label: 'Bài kiểm tra' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-md text-[0.98rem] font-medium transition-all border
                      ${activeTab === tab.key
                        ? 'bg-gray-100 border-gray-300 text-blue-700 shadow-sm'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="w-full">
                {activeTab === 'info' && (
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-base font-semibold text-gray-700 mb-1">Mô tả</h3>
                      <div className="rounded border px-3 py-2 text-gray-800 text-[0.98rem] whitespace-pre-wrap min-h-[48px]">
                        {subject.description || <span className="text-gray-400">Không có mô tả</span>}
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'majors' && (
                  <div>
                    <div className="mb-2 font-semibold text-gray-700">Danh sách ngành:</div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {subject?.majorIds && subject.majorIds.length > 0 ? (
                        subject.majorIds.map((id: number) => {
                          const major = majorsList.find(m => m.id === id);
                          return <Badge key={id} variant="secondary" className="px-3 py-1 text-[0.98rem] bg-white text-blue-800 border border-gray-200">{major ? major.name : `#${id}`}</Badge>;
                        })
                      ) : <span className="text-gray-400">Không có ngành nào</span>}
                    </div>
                    <div className="mb-2 font-semibold text-gray-700">Danh sách khoa:</div>
                    <div className="flex flex-wrap gap-2">
                      {derivedDepartmentIds.length > 0 ? (
                        derivedDepartmentIds.map((id: number) => {
                          const dept = departmentsList.find(d => d.id === id);
                          return <Badge key={id} variant="outline" className="px-3 py-1 text-[0.98rem] bg-white text-green-800 border border-gray-200">{dept ? dept.name : `#${id}`}</Badge>;
                        })
                      ) : <span className="text-gray-400">Không có khoa nào</span>}
                    </div>
                  </div>
                )}
                {activeTab === 'exams' && (
                  <ScrollArea className="h-[200px] pr-2">
                    {subject.exams && subject.exams.length > 0 ? (
                      <div className="space-y-4">
                        {subject.exams.map((exam) => (
                          <div
                            key={exam.id}
                            className="p-4 rounded border hover:bg-gray-50 transition-colors flex flex-col gap-1"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium text-gray-900 text-base">{exam.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Thời gian: {format(new Date(exam.startTime), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                </p>
                              </div>
                              <div className="text-sm text-blue-700 font-semibold">
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
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
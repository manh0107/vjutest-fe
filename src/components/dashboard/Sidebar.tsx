'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  FileText, 
  GraduationCap,
  BarChart,
  Landmark,
  Layers
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Subject, subjectService } from '@/services/subjectService'
import { SubjectDetailModal } from '@/app/dashboard/subjects/components/SubjectDetailModal'

const navigation = [
  { name: 'Tổng quan', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Người dùng', href: '/dashboard/users', icon: Users },
  { name: 'Lớp học', href: '/dashboard/classes', icon: GraduationCap },
  { name: 'Bài kiểm tra', href: '/dashboard/exams', icon: FileText },
  { name: 'Môn học', href: '/dashboard/subjects', icon: BookOpen },
  { name: 'Kết quả', href: '/dashboard/results', icon: BarChart },
  { name: 'Khoa', href: '/dashboard/departments', icon: Landmark },
  { name: 'Ngành', href: '/dashboard/majors', icon: Layers },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab') || 'subjects'
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [showSubjectMenu, setShowSubjectMenu] = useState(false)

  useEffect(() => {
    subjectService.getAllSubjects().then(setSubjects)
  }, [])

  useEffect(() => {
    if (!pathname.startsWith('/dashboard/subjects') && !pathname.startsWith('/dashboard/chapters')) {
      setShowSubjectMenu(false)
    }
  }, [pathname])

  return (
    <div className="hidden border-r bg-gray-100/40 lg:block lg:w-60">
      <div className="flex h-full flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <span>VJUTest</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              if (item.name === 'Môn học') {
                return (
                  <div key={item.name}>
                    <div
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 cursor-pointer",
                        isActive && "bg-gray-100 text-gray-900"
                      )}
                      onClick={() => setShowSubjectMenu((prev) => !prev)}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </div>
                    {showSubjectMenu && (
                      <div className="ml-8 mt-1 flex flex-col gap-1">
                        <Link
                          href="/dashboard/subjects"
                          className={cn(
                            "text-left px-2 py-1 rounded hover:bg-gray-200 text-gray-700",
                            pathname === "/dashboard/subjects" && "font-semibold bg-gray-200"
                          )}
                        >
                          Thông tin môn học
                        </Link>
                        <Link
                          href="/dashboard/chapters"
                          className={cn(
                            "text-left px-2 py-1 rounded hover:bg-gray-200 text-gray-700",
                            pathname === "/dashboard/chapters" && "font-semibold bg-gray-200"
                          )}
                        >
                          Chương học
                        </Link>
                      </div>
                    )}
                  </div>
                )
              }
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900",
                    isActive && "bg-gray-100 text-gray-900"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
      {isDetailModalOpen && selectedSubject && (
        <SubjectDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          subject={selectedSubject}
          majorsList={[]}
          departmentsList={[]}
        />
      )}
    </div>
  )
} 
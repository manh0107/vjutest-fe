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
import Image from 'next/image'

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
    <div className="hidden bg-white lg:block lg:w-60 shadow-md fixed top-0 left-0 h-screen z-30">
      <div className="flex h-full flex-col gap-2">
        <div className="flex h-16 items-center border-b-2 border-[#e53935] px-4 bg-white justify-center">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <img 
              src="/vju_logo.svg" 
              alt="VJU Logo" 
              width={36} 
              height={36} 
              className="rounded-full bg-white p-1 border border-[#e53935]"
            />
            <span className="text-2xl font-bold text-[#e53935]">VJUTest</span>
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
                        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all cursor-pointer",
                        isActive ? "bg-[#fdeaea] text-[#e53935] font-bold" : "text-gray-500 hover:text-[#e53935]"
                      )}
                      onClick={() => setShowSubjectMenu((prev) => !prev)}
                    >
                      <item.icon className={isActive ? "h-4 w-4 text-[#e53935]" : "h-4 w-4"} />
                      {item.name}
                    </div>
                    {showSubjectMenu && (
                      <div className="ml-8 mt-1 flex flex-col gap-1">
                        <Link
                          href="/dashboard/subjects"
                          className={cn(
                            "text-left px-2 py-1 rounded hover:bg-[#fdeaea] hover:text-[#e53935]",
                            pathname === "/dashboard/subjects" && "font-bold bg-[#fdeaea] text-[#e53935]"
                          )}
                        >
                          Thông tin môn học
                        </Link>
                        <Link
                          href="/dashboard/chapters"
                          className={cn(
                            "text-left px-2 py-1 rounded hover:bg-[#fdeaea] hover:text-[#e53935]",
                            pathname === "/dashboard/chapters" && "font-bold bg-[#fdeaea] text-[#e53935]"
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
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                    isActive ? "bg-[#fdeaea] text-[#e53935] font-bold" : "text-gray-500 hover:text-[#e53935]"
                  )}
                >
                  <item.icon className={isActive ? "h-4 w-4 text-[#e53935]" : "h-4 w-4"} />
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
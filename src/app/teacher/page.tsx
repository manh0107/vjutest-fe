"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, GraduationCap, FileText, Users, ListChecks } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { classService } from '@/services/classService';
import { subjectService } from '@/services/subjectService';
import { examService } from '@/services/examService';

export default function TeacherDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [showAllSubjects, setShowAllSubjects] = useState(false);
  const [showAllClasses, setShowAllClasses] = useState(false);
  const [showAllExams, setShowAllExams] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'teacher') {
      router.push('/login');
      return;
    }
    // Get classes
    setLoadingClasses(true);
    classService.getTeacherClasses()
      .then(data => setClasses(data))
      .finally(() => setLoadingClasses(false));
    // Get subjects
    setLoadingSubjects(true);
    subjectService.getTeacherSubjects()
      .then(data => setSubjects(data))
      .finally(() => setLoadingSubjects(false));
  }, [user, authLoading, router]);

  // Get exams
  useEffect(() => {
    if (!authLoading && !loadingSubjects && user && user.role === 'teacher' && subjects.length > 0) {
      const fetchExams = async () => {
        setLoading(true);
        try {
          let allExams: any[] = [];
          for (const subject of subjects) {
            const data = await examService.getTeacherExams(subject.id);
            if (Array.isArray(data)) {
              allExams = allExams.concat(data);
            }
          }
          setExams(allExams);
        } catch {
          setExams([]);
        } finally {
          setLoading(false);
        }
      };
      fetchExams();
    }
  }, [authLoading, loadingSubjects, user, subjects]);

  if (authLoading || !user || user.role !== 'teacher') {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="pb-16 max-w-6xl mx-auto px-2 md:px-0">
      {/* Classes Section */}
      <section className="mt-10 mb-16">
        <h2 className="text-3xl font-extrabold text-[#b8021e] mb-2 text-center tracking-tight">Lớp học của bạn</h2>
        <p className="text-center text-gray-500 mb-10">Quản lý các lớp học mà bạn phụ trách.</p>
        {loadingClasses ? (
          <div className="text-gray-400 text-center">Đang tải danh sách lớp học...</div>
        ) : classes.length === 0 ? (
          <div className="text-gray-400 text-center">Bạn chưa có lớp học nào.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {(showAllClasses ? classes : classes.slice(0,3)).map((cls) => (
                <Card key={cls.id} className="rounded-3xl shadow-xl border-t-4 border-blue-400">
                  <CardHeader className="flex flex-col items-center">
                    <Users className="w-10 h-10 text-blue-500 mb-2" />
                    <CardTitle className="text-xl font-bold text-blue-700 text-center">{cls.name}</CardTitle>
                    <CardDescription className="text-gray-500 text-sm">Mã lớp: <b>{cls.classCode}</b></CardDescription>
                    <CardDescription className="text-gray-500 text-sm">Số học viên: <b>{cls.studentCount || 0}</b></CardDescription>
                  </CardHeader>
                  <CardFooter className="w-full flex justify-center">
                    <button 
                      className="w-full py-2 rounded-full bg-blue-600 text-white font-semibold text-base shadow hover:bg-blue-700 transition"
                      onClick={() => router.push(`/teacher/classes/${cls.id}`)}
                    >
                      Quản lý lớp
                    </button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            {classes.length > 3 && (
              <div className="flex justify-center mt-6">
                <button 
                  className="px-6 py-2 rounded-full border-2 border-blue-600 text-blue-600 font-semibold bg-white hover:bg-blue-600 hover:text-white transition"
                  onClick={() => setShowAllClasses(v => !v)}
                >
                  {showAllClasses ? 'Ẩn bớt' : 'Xem thêm'}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Subjects Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-extrabold text-[#b8021e] mb-2 text-center tracking-tight">Môn học của bạn</h2>
        <p className="text-center text-gray-500 mb-10">Quản lý các môn học bạn phụ trách.</p>
        {loadingSubjects ? (
          <div className="text-gray-400 text-center">Đang tải danh sách môn học...</div>
        ) : subjects.length === 0 ? (
          <div className="text-gray-400 text-center">Bạn chưa có môn học nào.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {(showAllSubjects ? subjects : subjects.slice(0,3)).map((subject) => (
                <Card key={subject.id} className="rounded-3xl shadow-xl border-t-4 border-green-400">
                  <CardHeader className="flex flex-col items-center">
                    <BookOpen className="w-10 h-10 text-green-500 mb-2" />
                    <CardTitle className="text-xl font-bold text-green-700 text-center">{subject.name}</CardTitle>
                    <CardDescription className="text-gray-500 text-sm">Mã môn: <b>{subject.subjectCode}</b></CardDescription>
                    <CardDescription className="text-gray-500 text-sm">Số tín chỉ: <b>{subject.creditHour}</b></CardDescription>
                  </CardHeader>
                  <CardFooter className="w-full flex justify-center">
                    <button
                      className="w-full py-2 rounded-full border-2 border-green-600 text-green-600 font-semibold text-base bg-white hover:bg-green-600 hover:text-white transition"
                      onClick={() => router.push(`/teacher/subjects/${subject.id}`)}
                    >
                      Quản lý môn học
                    </button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            {subjects.length > 3 && (
              <div className="flex justify-center mt-6">
                <button 
                  className="px-6 py-2 rounded-full border-2 border-green-600 text-green-600 font-semibold bg-white hover:bg-green-600 hover:text-white transition"
                  onClick={() => setShowAllSubjects(v => !v)}
                >
                  {showAllSubjects ? 'Ẩn bớt' : 'Xem thêm'}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Exams Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-extrabold text-[#b8021e] mb-2 text-center tracking-tight">Bài kiểm tra của bạn</h2>
        <p className="text-center text-gray-500 mb-10">Quản lý các bài kiểm tra bạn đã tạo.</p>
        {loading ? (
          <div className="text-gray-400 text-center">Đang tải danh sách bài kiểm tra...</div>
        ) : exams.length === 0 ? (
          <div className="text-gray-400 text-center">Bạn chưa có bài kiểm tra nào.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {(showAllExams ? exams : exams.slice(0,3)).map((exam) => (
                <Card key={exam.id} className="rounded-3xl shadow-xl border-t-4 border-red-400">
                  <CardHeader className="flex flex-col items-center">
                    <FileText className="w-10 h-10 text-red-500 mb-2" />
                    <CardTitle className="text-xl font-bold text-red-700 text-center">{exam.name}</CardTitle>
                    <CardDescription className="text-gray-500 text-sm">Môn: <b>{exam.subjectName}</b></CardDescription>
                    <CardDescription className="text-gray-500 text-sm">Thời gian: <b>{exam.durationTime} phút</b></CardDescription>
                  </CardHeader>
                  <CardFooter className="w-full flex justify-center">
                    <button
                      className="w-full py-2 rounded-full bg-red-600 text-white font-semibold text-base shadow hover:bg-red-700 transition"
                      onClick={() => router.push(`/teacher/exams/${exam.id}`)}
                    >
                      Quản lý bài kiểm tra
                    </button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            {exams.length > 3 && (
              <div className="flex justify-center mt-6">
                <button 
                  className="px-6 py-2 rounded-full border-2 border-red-600 text-red-600 font-semibold bg-white hover:bg-red-600 hover:text-white transition"
                  onClick={() => setShowAllExams(v => !v)}
                >
                  {showAllExams ? 'Ẩn bớt' : 'Xem thêm'}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
} 
"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FaCheckCircle } from 'react-icons/fa';
import { FaClock } from 'react-icons/fa';
import { FaBookOpen } from 'react-icons/fa';
import { FaUserGraduate } from 'react-icons/fa';
import { FaRocket } from 'react-icons/fa';
import { FaRegSmile } from 'react-icons/fa';
import { classService } from '@/services/classService';
import { subjectService } from '@/services/subjectService';
import { examService } from '@/services/examService';
import { BookOpen, GraduationCap, FileText, Clock, CheckCircle, Users, ListChecks } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

interface Exam {
  id: number;
  name: string;
  subjectName: string;
  durationTime: number;
  status: string;
  startAt: string;
  endAt: string;
  hasSubmitted?: boolean;
}

export default function StudentHomePage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [showAllSubjects, setShowAllSubjects] = useState(false);
  const [showAllClasses, setShowAllClasses] = useState(false);
  const [showAllExams, setShowAllExams] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'student') {
      router.push('/login');
      return;
    }
    // Lấy danh sách lớp học
    setLoadingClasses(true);
    classService.getAllClasses()
      .then(data => setClasses(data))
      .finally(() => setLoadingClasses(false));
    // Lấy danh sách môn học
    setLoadingSubjects(true);
    subjectService.getAllSubjects()
      .then(data => setSubjects(data))
      .finally(() => setLoadingSubjects(false));
  }, [user, authLoading, router]);

  // Lấy danh sách bài kiểm tra
  useEffect(() => {
    if (!authLoading && !loadingSubjects && user && user.role === 'student' && subjects.length > 0) {
      const fetchExams = async () => {
        setLoading(true);
        try {
          let allExams: any[] = [];
          for (const subject of subjects) {
            // Sử dụng service chuẩn
            const data = await examService.getPublicExams(subject.id);
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

  if (authLoading || !user || user.role !== 'student') {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
      </div>
    );
  }

  // Helper: icon circle
  const IconCircle = ({icon, color}: {icon: string, color: string}) => (
    <span className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${color === 'red' ? 'bg-[#e53935]/10 text-[#e53935]' : 'bg-[#1f701f]/10 text-[#1f701f]'}`}
      style={{fontSize: '1.7rem'}}>{icon}</span>
  );

  return (
    <div className="pb-16 max-w-6xl mx-auto px-2 md:px-0">
      {/* Section lớp học */}
      <section className="mt-10 mb-16">
        <h2 className="text-3xl font-extrabold text-[#b8021e] mb-2 text-center tracking-tight">Lớp học của bạn</h2>
        <p className="text-center text-gray-500 mb-10">Danh sách các lớp học mà bạn đã tham gia.</p>
        {loadingClasses ? (
          <div className="text-gray-400 text-center">Đang tải danh sách lớp học...</div>
        ) : classes.length === 0 ? (
          <div className="text-gray-400 text-center">Bạn chưa tham gia lớp học nào.</div>
        ) : (
          <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {(showAllClasses ? classes : classes.slice(0,3)).map((cls) => (
              <Card key={cls.id} className="rounded-3xl shadow-xl border-t-4 border-blue-400 flex flex-col items-center">
                <CardHeader className="flex flex-col items-center">
                  <Users className="w-10 h-10 text-blue-500 mb-2" />
                  <CardTitle className="text-xl font-bold text-blue-700 text-center">{cls.name}</CardTitle>
                  <CardDescription className="text-gray-500 text-sm">Mã lớp: <b>{cls.classCode}</b></CardDescription>
                  <CardDescription className="text-gray-500 text-sm">GV: {cls.teacherName || (cls.teachers && cls.teachers[0]?.name)}</CardDescription>
                  <CardDescription className="text-gray-400 text-xs">Ngày tạo: {cls.createdAt ? new Date(cls.createdAt).toLocaleDateString() : ''}</CardDescription>
                </CardHeader>
                <CardFooter className="w-full flex justify-center">
                  <button className="w-full py-2 rounded-full bg-blue-600 text-white font-semibold text-base shadow hover:bg-blue-700 transition">Xem thêm</button>
                </CardFooter>
              </Card>
            ))}
          </div>
          {classes.length > 3 && (
            <div className="flex justify-center mt-6">
              <button className="px-6 py-2 rounded-full border-2 border-blue-600 text-blue-600 font-semibold bg-white hover:bg-blue-600 hover:text-white transition" onClick={()=>setShowAllClasses(v=>!v)}>
                {showAllClasses ? 'Ẩn bớt' : 'Xem thêm'}
              </button>
            </div>
          )}
          </>
        )}
      </section>

      {/* Section môn học */}
      <section className="mb-16">
        <h2 className="text-3xl font-extrabold text-[#b8021e] mb-2 text-center tracking-tight">Môn học của bạn</h2>
        <p className="text-center text-gray-500 mb-10">Danh sách các môn học bạn có thể truy cập.</p>
        {loadingSubjects ? (
          <div className="text-gray-400 text-center">Đang tải danh sách môn học...</div>
        ) : subjects.length === 0 ? (
          <div className="text-gray-400 text-center">Không có môn học nào.</div>
        ) : (
          <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {(showAllSubjects ? subjects : subjects.slice(0,3)).map((subject) => (
              <Card key={subject.id} className="rounded-3xl shadow-xl border-t-4 border-green-400 flex flex-col items-center">
                <CardHeader className="flex flex-col items-center">
                  <BookOpen className="w-10 h-10 text-green-500 mb-2" />
                  <CardTitle className="text-xl font-bold text-green-700 text-center">{subject.name}</CardTitle>
                  <CardDescription className="text-gray-500 text-sm">Mã môn: <b>{subject.subjectCode}</b></CardDescription>
                  <CardDescription className="text-gray-500 text-sm">Số tín chỉ: <b>{subject.creditHour}</b></CardDescription>
                  <CardDescription className="text-gray-400 text-xs">{subject.description}</CardDescription>
                </CardHeader>
                <CardFooter className="w-full flex justify-center">
                  <button
                    className="w-full py-2 rounded-full border-2 border-green-600 text-green-600 font-semibold text-base bg-white hover:bg-green-600 hover:text-white transition"
                    onClick={() => router.push(`/student/subjects/${subject.id}`)}
                  >
                    Xem thêm
                  </button>
                </CardFooter>
              </Card>
            ))}
          </div>
          {subjects.length > 3 && (
            <div className="flex justify-center mt-6">
              <button className="px-6 py-2 rounded-full border-2 border-green-600 text-green-600 font-semibold bg-white hover:bg-green-600 hover:text-white transition" onClick={()=>setShowAllSubjects(v=>!v)}>
                {showAllSubjects ? 'Ẩn bớt' : 'Xem thêm'}
              </button>
            </div>
          )}
          </>
        )}
      </section>

      {/* Section bài kiểm tra */}
      <section className="mb-16">
        <h2 className="text-3xl font-extrabold text-[#b8021e] mb-2 text-center tracking-tight">Bài kiểm tra của bạn</h2>
        <p className="text-center text-gray-500 mb-10">Luyện tập và kiểm tra chất lượng với đề thi thực tế.</p>
        {loading ? (
          <div className="text-gray-400 text-center">Đang tải danh sách bài kiểm tra...</div>
        ) : exams.length === 0 ? (
          <div className="text-gray-400 text-center">Không có bài kiểm tra nào đang mở.</div>
        ) : (
          <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {(showAllExams ? exams : exams.slice(0,3)).map((exam) => (
              <Card key={exam.id} className="rounded-3xl shadow-xl border-t-4 border-red-400 flex flex-col items-center">
                <CardHeader className="flex flex-col items-center">
                  <FileText className="w-10 h-10 text-red-500 mb-2" />
                  <CardTitle className="text-xl font-bold text-red-700 text-center">{exam.name || exam.title}</CardTitle>
                  <CardDescription className="text-gray-500 text-sm">Môn: <b>{exam.subjectName || exam.subject?.name}</b></CardDescription>
                  <CardDescription className="text-gray-500 text-sm flex items-center gap-1"><Clock className="w-4 h-4 mr-1" />Thời gian: <b>{exam.durationTime || exam.duration} phút</b></CardDescription>
                  <CardDescription className="text-gray-400 text-xs">{exam.startAt ? new Date(exam.startAt).toLocaleString() : ''} {exam.endAt ? ' - ' + new Date(exam.endAt).toLocaleString() : ''}</CardDescription>
                </CardHeader>
                <CardFooter className="w-full flex justify-center">
                  {exam.hasSubmitted ? (
                    <button
                      className="w-full py-2 rounded-full border-2 border-red-600 text-red-600 font-semibold text-base bg-white hover:bg-red-600 hover:text-white transition"
                      onClick={() => router.push(`/student/exams/${exam.id}/result`)}
                    >
                      Xem kết quả
                    </button>
                  ) : (
                    <button
                      className="w-full py-2 rounded-full bg-red-600 text-white font-semibold text-base shadow hover:bg-red-700 transition"
                      onClick={() => router.push(`/student/exams/${exam.id}`)}
                    >
                      Bắt đầu làm bài
                    </button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
          {exams.length > 3 && (
            <div className="flex justify-center mt-6">
              <button className="px-6 py-2 rounded-full border-2 border-red-600 text-red-600 font-semibold bg-white hover:bg-red-600 hover:text-white transition" onClick={()=>setShowAllExams(v=>!v)}>
                {showAllExams ? 'Ẩn bớt' : 'Xem thêm'}
              </button>
            </div>
          )}
          </>
        )}
      </section>

      {/* Section lý do chọn VJUTest */}
      <section className="bg-gray-100 rounded-3xl p-10 mt-20">
        <h2 className="text-3xl font-extrabold text-[#b8021e] mb-10 text-center tracking-tight">Tại sao nên sử dụng VJUTest?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="flex flex-col items-center text-center">
            <IconCircle icon="⏰" color="red" />
            <span className="font-semibold text-lg mb-1">Làm bài kiểm tra tự tin, dễ dàng</span>
            <span className="text-gray-500">Giao diện thân thiện, thao tác đơn giản, phù hợp mọi thiết bị.</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <IconCircle icon="🎓" color="green" />
            <span className="font-semibold text-lg mb-1">Hoàn toàn miễn phí</span>
            <span className="text-gray-500">VJUTest là nền tảng mở, không thu phí người học, không quảng cáo.</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <IconCircle icon="😊" color="red" />
            <span className="font-semibold text-lg mb-1">Nâng cao kết quả học tập</span>
            <span className="text-gray-500">Kho đề phong phú, cập nhật liên tục, giúp bạn luyện tập hiệu quả.</span>
          </div>
        </div>
      </section>
    </div>
  );
} 
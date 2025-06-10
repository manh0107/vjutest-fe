"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart as PieChartComp, Pie, Cell } from "recharts";
import api from '@/services/axios';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { examService } from '@/services/examService';
import { useAuth } from '@/hooks/useAuth';
import { Subject, ClassEntity } from '@/services/types';
import { questionService } from '@/services/questionService';
import { answerService } from '@/services/answerService';

interface Exam {
  id: number;
  name: string;
  examCode: string;
  status: string;
}

interface ScoreStat {
  score: number;
  count: number;
}

interface Question {
  id: number;
  name: string;
  order: number;
}

interface Answer {
  id: number;
  content: string;
  isCorrect: boolean;
  percentChosen?: number;
}

export default function ExamsOverviewPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassEntity[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const [scoreStats, setScoreStats] = useState<ScoreStat[]>([]);
  const [pieStats, setPieStats] = useState<{name: string, value: number, color: string}[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, Answer[]>>({});
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubjectsAndClasses();
    }
  }, [user]);

  useEffect(() => {
    if (selectedExamId) {
      fetchStats(selectedExamId);
      fetchQuestions(selectedExamId);
    }
  }, [selectedExamId]);

  const fetchSubjectsAndClasses = async () => {
    if (!user) return;
    try {
      // Lấy danh sách môn học
      const token = localStorage.getItem('token');
      const resSubjects = await fetch('http://localhost:8080/subjects/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const subjectsData = await resSubjects.json();
      setSubjects(subjectsData);
      // Lấy danh sách lớp học nếu là giáo viên
      let classesData: ClassEntity[] = [];
      if (user && (user.role === 'teacher' || user.role === 'ROLE_TEACHER' || user.role === 'admin' || user.role === 'ROLE_ADMIN')) {
        const resClasses = await fetch(`http://localhost:8080/classes/all?userId=${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        classesData = await resClasses.json();
        setClasses(classesData);
      }
      // Lấy tất cả bài kiểm tra đã xuất bản (công khai + trong lớp)
      let allExams: Exam[] = [];
      // Lấy bài kiểm tra công khai theo từng môn
      for (const subject of subjectsData) {
        try {
          const publicExams = await examService.getPublicExams(subject.id);
          allExams = allExams.concat(publicExams.filter(e => e.status === 'PUBLISHED'));
        } catch {}
      }
      // Lấy bài kiểm tra trong lớp theo từng lớp/môn
      for (const classItem of classesData) {
        for (const subject of subjectsData) {
          try {
            const classExams = await examService.getClassExams(classItem.id, subject.id);
            allExams = allExams.concat(classExams.filter(e => e.status === 'PUBLISHED'));
          } catch {}
        }
      }
      // Loại trùng id
      const uniqueExams = Array.from(new Map(allExams.map(e => [e.id, e])).values());
      setExams(uniqueExams);
      if (uniqueExams.length > 0) setSelectedExamId(uniqueExams[0].id);
    } catch (e) {
      setExams([]);
      toast.error('Không thể tải danh sách bài kiểm tra');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (examId: number) => {
    try {
      const res = await api.get(`/api/exams/statistics/${examId}`);
      setScoreStats(res.data.scoreDistribution || []);
      // Pie chart: tổng số sinh viên đạt/không đạt (giả sử có trường passedCount, failedCount)
      setPieStats([
        { name: 'Đạt', value: res.data.passedCount || 0, color: '#1f701f' },
        { name: 'Không đạt', value: res.data.failedCount || 0, color: '#b8021e' },
      ]);
    } catch (e) {
      setScoreStats([]);
      setPieStats([]);
    }
  };

  const fetchQuestions = async (examId: number) => {
    setQuestions([]);
    setAnswers({});
    try {
      const data = await questionService.getQuestionsByExam(examId);
      // Map lại cho đúng interface Question của trang overview
      const mapped = (data || []).map((q: any, idx: number) => ({
        id: q.id,
        name: q.name || q.content || '',
        order: typeof q.order !== 'undefined' ? q.order : idx + 1,
      }));
      setQuestions(mapped);
    } catch (e) {
      setQuestions([]);
    }
  };

  const fetchAnswers = async (questionId: number) => {
    try {
      const data = await answerService.getAnswersByQuestion(questionId);
      // Map lại cho đúng interface Answer của trang overview
      const mapped = (data || []).map((a: any) => ({
        id: a.id,
        content: a.content || a.answerName || '',
        isCorrect: a.isCorrect,
        percentChosen: a.percentChosen,
      }));
      setAnswers(prev => ({ ...prev, [questionId]: mapped }));
    } catch (e) {
      setAnswers(prev => ({ ...prev, [questionId]: [] }));
    }
  };

  const handleExpand = (qid: number) => {
    setExpanded(prev => ({ ...prev, [qid]: !prev[qid] }));
    if (!answers[qid]) fetchAnswers(qid);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold text-[#b8021e] mb-6 text-center">Tổng quan điểm bài kiểm tra</h1>
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-center">
        <Select value={selectedExamId?.toString() || ''} onValueChange={v => setSelectedExamId(Number(v))}>
          <SelectTrigger className="w-[320px]">
            <SelectValue placeholder="Chọn bài kiểm tra" />
          </SelectTrigger>
          <SelectContent>
            {exams.map(exam => (
              <SelectItem key={exam.id} value={exam.id.toString()}>
                {exam.name} (Mã: {exam.examCode})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {selectedExamId && (
        <>
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            <Card className="flex-1 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#b8021e]">Biểu đồ cột phân phối điểm</CardTitle>
              </CardHeader>
              <CardContent>
                {scoreStats.length > 0 ? (
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={scoreStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="score" label={{ value: 'Điểm', position: 'insideBottom', fontSize: 14, fontWeight: 600 }} />
                        <YAxis allowDecimals={false} label={{ value: 'Số lượng', angle: -90, position: 'insideLeft', fontSize: 14, fontWeight: 600 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#b8021e" name="Số lượng sinh viên" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-gray-400 text-center">Chưa có dữ liệu điểm.</div>
                )}
              </CardContent>
            </Card>
            <Card className="flex-1 shadow-lg rounded-2xl flex flex-col items-center justify-center">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#b8021e]">Biểu đồ tròn tỉ lệ đạt</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center">
                {pieStats.reduce((a, b) => a + b.value, 0) > 0 ? (
                  <PieChartComp width={220} height={220}>
                    <Pie
                      data={pieStats}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {pieStats.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChartComp>
                ) : (
                  <div className="text-gray-400 text-center">Chưa có dữ liệu tỉ lệ đạt.</div>
                )}
              </CardContent>
            </Card>
          </div>
          {/* Danh sách câu hỏi */}
          <Card className="shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-[#b8021e]">Danh sách câu hỏi</CardTitle>
            </CardHeader>
            <CardContent>
              {questions.length === 0 ? (
                <div className="text-gray-400 text-center">Chưa có câu hỏi nào.</div>
              ) : (
                <div className="space-y-4">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="border rounded-xl p-4 bg-gradient-to-r from-[#f7f8fa] to-[#e6eaf3]">
                      <div className="flex items-center justify-between cursor-pointer" onClick={() => handleExpand(q.id)}>
                        <div className="font-semibold text-base text-[#b8021e]">Câu {idx + 1}: {q.name}</div>
                        {expanded[q.id] ? <ChevronUp /> : <ChevronDown />}
                      </div>
                      {expanded[q.id] && (
                        <div className="mt-3 space-y-2">
                          {answers[q.id]?.length > 0 ? answers[q.id].map((a) => (
                            <div key={a.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg ${a.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                              <span className={`font-medium ${a.isCorrect ? 'text-green-700' : 'text-red-700'}`}>{a.content}</span>
                              {typeof a.percentChosen === 'number' && (
                                <span className={`ml-auto text-sm font-semibold ${a.isCorrect ? 'text-green-700' : 'text-red-700'}`}>{a.percentChosen}% chọn</span>
                              )}
                            </div>
                          )) : <div className="text-gray-400">Chưa có đáp án.</div>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
} 
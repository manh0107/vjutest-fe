"use client"
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { chapterService } from '@/services/chapterService';
import { questionService } from '@/services/questionService';
import { answerService } from '@/services/answerService';
import { ChevronDown, ChevronRight, BookOpen, Check, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Chapter } from '@/services/chapterService';

export default function StudentSubjectDetailPage() {
  const router = useRouter();
  const { subjectId } = useParams();
  const subjectIdStr = Array.isArray(subjectId) ? subjectId[0] : subjectId;
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [subject, setSubject] = useState<{ name: string; subjectCode?: string; description?: string } | null>(null);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Record<string, any[]>>({});
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState<string | null>(null);
  const [loadingAnswers, setLoadingAnswers] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const chaps = await chapterService.getChapters(subjectIdStr);
        setChapters(chaps);
        if (chaps.length > 0) {
          setSubject(chaps[0].subject);
        } else {
          setSubject(null);
        }
      } catch {
        setChapters([]);
        setSubject(null);
      } finally {
        setLoading(false);
        setLoadingChapters(false);
      }
    }
    if (subjectIdStr) fetchData();
  }, [subjectIdStr]);

  const handleExpandChapter = async (chapterId: string) => {
    setExpandedChapter(expandedChapter === chapterId ? null : chapterId);
    if (!questions[chapterId]) {
      setLoadingQuestions(chapterId);
      try {
        const qs = await questionService.getQuestionsByChapter(Number(chapterId));
        setQuestions(prev => ({ ...prev, [chapterId]: qs }));
      } finally {
        setLoadingQuestions(null);
      }
    }
  };

  const handleExpandQuestion = async (questionId: string, chapterId: string) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
    if (!answers[questionId]) {
      setLoadingAnswers(questionId);
      try {
        const ans = await answerService.getAnswersByQuestion(Number(questionId));
        setAnswers(prev => ({ ...prev, [questionId]: ans }));
      } finally {
        setLoadingAnswers(null);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-2 md:px-0">
      <button className="mb-6 text-[#b8021e] hover:underline" onClick={() => router.back()}>&larr; Quay lại</button>
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#b8021e] border-t-transparent" />
        </div>
      ) : subject ? (
        <>
          <Card className="mb-8 p-6 rounded-3xl shadow-xl border-t-4 border-green-400 bg-white">
            <div className="flex items-center gap-4 mb-2">
              <BookOpen className="w-10 h-10 text-green-600" />
              <h1 className="text-2xl font-bold text-green-700">{subject.name}</h1>
            </div>
            {subject.subjectCode && <div className="text-gray-500 mb-1">Mã môn: <b>{subject.subjectCode}</b></div>}
            {subject.description && <div className="text-gray-400 text-sm mb-2">{subject.description}</div>}
          </Card>
          <h2 className="text-xl font-bold text-[#b8021e] mb-4">Danh sách chương</h2>
          {loadingChapters ? (
            <div className="text-gray-400">Đang tải chương học...</div>
          ) : chapters.length === 0 ? (
            <div className="text-gray-400">Không có chương học nào.</div>
          ) : (
            <div className="space-y-4">
              {chapters.map((chapter, idx) => (
                <div key={chapter.id} className="bg-white rounded-2xl shadow border-l-4 border-green-300">
                  <button
                    className="w-full flex items-center justify-between px-6 py-4 focus:outline-none hover:bg-green-50 rounded-2xl transition"
                    onClick={() => handleExpandChapter(chapter.id)}
                  >
                    <div className="flex items-center gap-3">
                      <ChevronRight className={`w-5 h-5 text-green-600 transition-transform ${expandedChapter === chapter.id ? 'rotate-90' : ''}`} />
                      <span className="font-semibold text-lg text-green-700">Chương {idx + 1}: {chapter.name}</span>
                    </div>
                    <span className="text-gray-400 text-sm">{chapter.questionTotal} câu hỏi</span>
                  </button>
                  {expandedChapter === chapter.id && (
                    <div className="px-8 pb-4">
                      {loadingQuestions === chapter.id ? (
                        <div className="text-gray-400 py-4">Đang tải câu hỏi...</div>
                      ) : (questions[chapter.id]?.length === 0 ? (
                        <div className="text-gray-400 py-4">Chưa có câu hỏi nào.</div>
                      ) : (
                        <div className="space-y-3 mt-2">
                          {questions[chapter.id]?.map((q, qidx) => (
                            <div key={q.id} className="bg-gray-50 rounded-xl p-4 shadow-sm border-l-4 border-[#b8021e] mb-2">
                              <button
                                className="flex items-center gap-2 font-medium text-base text-[#b8021e] hover:underline"
                                onClick={() => handleExpandQuestion(q.id, chapter.id)}
                              >
                                <ChevronDown className={`w-4 h-4 transition-transform ${expandedQuestion === q.id ? 'rotate-180' : ''}`} />
                                <span>Câu {qidx + 1}: {q.name}</span>
                              </button>
                              {q.imageUrl && (
                                <div className="flex justify-center my-2">
                                  <img src={q.imageUrl} alt="Hình câu hỏi" className="max-h-40 rounded-lg object-contain" />
                                </div>
                              )}
                              <div className="text-gray-500 text-sm mb-1">Độ khó: {q.difficulty}</div>
                              {expandedQuestion === q.id && (
                                <div className="mt-2 pl-4 border-l-2 border-gray-200">
                                  {loadingAnswers === q.id ? (
                                    <div className="text-gray-400">Đang tải đáp án...</div>
                                  ) : (answers[q.id]?.length === 0 ? (
                                    <div className="text-gray-400">Chưa có đáp án nào.</div>
                                  ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {answers[q.id]?.map((ans, aidx) => (
                                        <div key={ans.id} className={`flex items-center gap-3 p-3 rounded-lg border ${ans.isCorrect ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}>
                                          <span className={`font-bold text-lg ${ans.isCorrect ? 'text-green-700' : 'text-gray-500'}`}>{String.fromCharCode(65 + aidx)}</span>
                                          <span className="flex-1">{ans.answerName}</span>
                                          {ans.imageUrl && (
                                            <img src={ans.imageUrl} alt="Hình đáp án" className="max-h-12 max-w-20 rounded object-contain ml-2" />
                                          )}
                                          {ans.isCorrect ? <Check className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-gray-300" />}
                                        </div>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-gray-400">Không tìm thấy môn học.</div>
      )}
    </div>
  );
} 
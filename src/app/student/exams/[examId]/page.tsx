"use client"
import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { questionService } from '@/services/questionService';
import { authService } from '@/services/authService';
import { examService } from '@/services/examService';
import api from '@/services/axios';
import { answerService } from '@/services/answerService';
import { ArrowLeftCircle, ArrowRightCircle, Power, BookOpen, Clock, CheckCircle, FileText } from "lucide-react";
import dayjs from 'dayjs';
import React from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

// Ẩn navbar/footer khi vào trang này
if (typeof window !== 'undefined') {
  const hideLayout = () => {
    const navbar = document.getElementById('navbar');
    const footer = document.getElementById('footer');
    if (navbar) navbar.style.display = 'none';
    if (footer) footer.style.display = 'none';
  };
  hideLayout();
}

interface Option {
  id: number;
  content: string;
  imageUrl?: string;
}

interface Question {
  id: number;
  name: string;
  content?: string;
  options: Option[];
  imageUrl?: string;
}

interface Exam {
  id: number;
  name: string;
  subjectName: string;
  durationTime: number;
  questions: Question[];
}

export default function StudentExamPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.examId;
  const [exam, setExam] = useState<Exam | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: number]: number | null }>({});
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [bookmarks, setBookmarks] = useState<{ [questionId: number]: boolean }>({});
  const [answersByQuestionId, setAnswersByQuestionId] = useState<{ [questionId: number]: Option[] }>({});
  const [endTime, setEndTime] = useState<number | null>(null); // timestamp ms
  const [imagePopup, setImagePopup] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Bắt đầu làm bài và lấy câu hỏi
  useEffect(() => {
    async function fetchOrStartExam() {
      setLoading(true);
      setError(null);
      try {
        let result;
        try {
          // Ưu tiên lấy kết quả đang làm dở
          result = await api.get(`/exams/current-result`, { params: { examId } });
          result = result.data;
        } catch (err: any) {
          // Nếu bất kỳ lỗi nào, thử bắt đầu làm bài mới
          try {
            const res = await api.post(`/exams/start-exam/${examId}`);
            result = res.data;
          } catch (err2: any) {
            // Nếu vẫn lỗi, mới hiển thị lỗi
            if (err2.response?.status === 403) {
              setError('Bạn không có quyền truy cập bài kiểm tra này');
            } else if (err2.response?.data?.message) {
              setError(err2.response.data.message);
            } else {
              setError('Có lỗi xảy ra khi tải bài kiểm tra');
            }
            setLoading(false);
            return;
          }
        }
        // Lấy endTime từ result
        setEndTime(dayjs(result.endTime).valueOf());
        // Lấy thông tin bài kiểm tra
        const examInfo = await examService.getExamById(Number(examId));
        // Lấy danh sách câu hỏi
        const questions = await questionService.getQuestionsByExam(Number(examId));
        setExam({
          id: Number(examId),
          name: examInfo.name,
          subjectName: examInfo.subject?.name || '',
          durationTime: examInfo.durationTime,
          questions: questions.map((q: any) => ({
            id: q.id,
            name: q.name,
            content: q.content || q.name,
            options: q.answers ? q.answers.map((a: any) => ({ id: a.id, content: a.content, imageUrl: a.imageUrl })) : [],
            imageUrl: q.imageUrl,
          })),
        });
      } catch (e: any) {
        if (e.response?.status === 403) {
          setError('Bạn không có quyền truy cập bài kiểm tra này');
        } else if (e.response?.data?.message) {
          setError(e.response.data.message);
        } else {
          setError('Có lỗi xảy ra khi tải bài kiểm tra');
        }
      } finally {
        setLoading(false);
      }
    }
    if (examId) fetchOrStartExam();
    return () => clearInterval(timerRef.current!);
  }, [examId]);

  // Đếm ngược thời gian
  useEffect(() => {
    if (!endTime) return;
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const left = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimeLeft(left);
      if (left <= 0) {
        clearInterval(timerRef.current!);
        handleSubmit();
      }
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [endTime]);

  // Lấy đáp án cho câu hỏi hiện tại khi current hoặc exam thay đổi
  useEffect(() => {
    if (!exam) return;
    const question = exam.questions[current];
    if (!question) return;
    if (answersByQuestionId[question.id]) return; // Đã có đáp án
    answerService.getAnswersByQuestion(question.id)
      .then((data) => {
        setAnswersByQuestionId((prev) => ({ ...prev, [question.id]: data.map((a: any) => ({ id: a.id, content: a.answerName, imageUrl: a.imageUrl })) }));
      })
      .catch((err) => {
        // Có thể show lỗi nếu muốn
      });
  }, [current, exam]);

  const handleSelect = async (questionId: number, optionId: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    // Gọi API lưu đáp án
    try {
      await api.post(`/exams/select-answer/${examId}`, null, {
        params: {
          questionId,
          answerId: optionId
        }
      });
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setLoading(true);
    try {
      await api.post(`/exams/submit-exam/${examId}`);
      router.push(`/student/exams/${examId}/result`);
    } catch (error: any) {
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Nộp bài thất bại!');
      }
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Thoát khỏi bài kiểm tra
  const handleExit = () => {
    if (confirm('Bạn có chắc chắn muốn thoát khỏi bài kiểm tra?')) {
      router.push('/student');
    }
  };

  // Đánh dấu hoặc bỏ đánh dấu bookmark cho câu hỏi hiện tại
  const handleBookmark = (questionId: number) => {
    setBookmarks((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  if (loading) return <div className="text-gray-400">Đang tải dữ liệu...</div>;
  if (error) return <div className="text-red-600 font-semibold">{error}</div>;
  if (!exam) return null;

  if (submitting) return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-40">
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-xl border-t-8 border-indigo-500">
        <LoadingSpinner />
        <div className="mt-6 text-xl font-bold text-indigo-700 animate-pulse">Đang nộp bài, vui lòng chờ hệ thống chấm điểm...</div>
        <div className="mt-2 text-gray-500 text-base">Đừng tắt trình duyệt hoặc rời khỏi trang này!</div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      {/* Popup hiển thị ảnh lớn */}
      {imagePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={() => setImagePopup(null)}>
          <img src={imagePopup} alt="Xem ảnh lớn" className="max-h-[80vh] max-w-[90vw] rounded-lg shadow-2xl border-4 border-white" />
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-[2000px] justify-center items-start px-1 sm:px-2 md:px-8">
        {/* Thanh navbar tên bài kiểm tra và tên môn học */}
        <div className="fixed top-0 left-0 w-full z-30 bg-white shadow border-b border-gray-200">
          <div className="flex flex-row justify-between items-center px-2 sm:px-4 md:px-8 py-3 max-w-5xl mx-auto">
            <div className="flex items-center gap-2 text-gray-800 font-semibold text-base md:text-lg">
              <BookOpen className="w-5 h-5 text-indigo-600 mr-1" />
              <span className="text-gray-500 font-medium">Tên bài kiểm tra:</span>
              <span className="text-red-700 font-bold">{exam.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <FileText className="w-5 h-5 text-blue-600 mr-1" />
              <span className="text-gray-500 font-medium">Tên môn học:</span>
              <span className="text-blue-700 font-bold">{exam.subjectName}</span>
              <button
                className="ml-4 p-2 rounded-full hover:bg-red-100 transition flex items-center justify-center"
                title="Thoát khỏi bài kiểm tra"
                onClick={() => setShowExitConfirm(true)}
              >
                <Power size={28} className="text-red-600" />
              </button>
            </div>
          </div>
        </div>
        {/* Dialog xác nhận thoát */}
        {showExitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center gap-6 min-w-[320px]">
              <div className="text-xl font-semibold text-gray-800 mb-2">Bạn có chắc chắn muốn thoát khỏi bài kiểm tra?</div>
              <div className="flex gap-4 mt-2">
                <button
                  className="px-6 py-2 rounded-lg bg-red-600 text-white font-bold shadow hover:bg-red-700 transition"
                  onClick={() => { setShowExitConfirm(false); handleExit(); }}
                >
                  Thoát
                </button>
                <button
                  className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-bold shadow hover:bg-gray-300 transition"
                  onClick={() => setShowExitConfirm(false)}
                >
                  Ở lại
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="h-8 md:h-12" /> {/* Spacer nhỏ hơn để main content gần navbar hơn */}
        {/* Main content */}
        <div className="flex-1 flex justify-center items-start w-full">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border-t-8 border-red-600 p-4 sm:p-6 md:p-10 flex flex-col items-center gap-3 min-h-[600px] mx-auto" style={{marginTop:0, height: '80vh'}}>
            <div className="flex flex-col items-center w-full">
              <div className="flex justify-center items-center mb-1">
                <span className="text-base text-gray-500 mr-2">Câu hỏi</span>
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-600 font-bold text-xl shadow border-2 border-red-200 mx-1">
                  {current + 1}
                </span>
              </div>
              {/* Box câu hỏi */}
              <div className="bg-red-50 rounded-2xl shadow p-3 sm:p-4 mb-2 min-h-[80px] flex flex-col items-center justify-center w-full max-w-full" style={{ fontSize: '1.08rem', fontWeight: 600 }}>
                <span className="text-gray-800 text-center w-full mb-2 break-words">{exam.questions[current].content}</span>
                {exam.questions[current].imageUrl && (
                  <div className="flex justify-center w-full">
                    <img
                      src={exam.questions[current].imageUrl}
                      alt="Câu hỏi"
                      className="w-24 h-24 sm:w-32 sm:h-32 object-contain rounded-lg border bg-white max-w-full cursor-pointer hover:scale-110 transition-transform mx-auto"
                      loading="lazy"
                      onClick={e => { e.stopPropagation(); setImagePopup(exam.questions[current].imageUrl!); }}
                      style={{ width: '100%', maxWidth: 128 }}
                    />
                  </div>
                )}
              </div>
            </div>
            {/* Đáp án */}
            {(() => {
              const options = answersByQuestionId[exam.questions[current].id] || [];
              const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
              const gridClass = options.length === 4 ? 'grid-cols-1 sm:grid-cols-2' : (options.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : options.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3');
              return (
                <div className={`grid ${gridClass} gap-3 sm:gap-4 mb-2 w-full max-w-full justify-items-center`}>
                  {options.map((opt, idx) => (
                    <label
                      key={opt.id}
                      className={
                        `flex flex-col justify-between items-center cursor-pointer transition-all duration-200
                        rounded-2xl shadow-md border-2 p-3 sm:p-5 text-base sm:text-lg font-medium select-none w-full h-full
                        ${answers[exam.questions[current].id] === opt.id
                          ? 'border-red-600 bg-red-100 text-red-700 scale-105 ring-2 ring-red-200'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-red-400 hover:shadow-lg'}
                        `
                      }
                      style={{ minHeight: 70, wordBreak: 'break-word', maxWidth: '100%' }}
                    >
                      <input
                        type="radio"
                        name={`question-${exam.questions[current].id}`}
                        checked={answers[exam.questions[current].id] === opt.id}
                        onChange={() => handleSelect(exam.questions[current].id, opt.id)}
                        className="hidden"
                      />
                      <div className="flex flex-col w-full flex-1 items-center">
                        <span className="font-bold text-base mb-1 break-words whitespace-pre-line text-center" style={{wordBreak: 'break-word'}}>
                          {(labels[idx] || String.fromCharCode(65 + idx)) + ". "}{opt.content}
                        </span>
                        {opt.imageUrl && (
                          <div className="w-full flex justify-center mt-1">
                            <img
                              src={opt.imageUrl}
                              alt="Đáp án"
                              className="w-12 h-12 sm:w-16 sm:h-16 object-contain rounded-lg border bg-white max-w-full cursor-pointer hover:scale-110 transition-transform"
                              loading="lazy"
                              onClick={e => { e.stopPropagation(); setImagePopup(opt.imageUrl!); }}
                            />
                          </div>
                        )}
                      </div>
                      {answers[exam.questions[current].id] === opt.id && (
                        <svg width="24" height="24" fill="none" stroke="#e11d48" strokeWidth="3" viewBox="0 0 24 24" className="ml-2 mt-2">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </label>
                  ))}
                </div>
              );
            })()}
            {/* Nút trước/sau và bookmark nằm giữa, căn giữa card */}
            <div className="flex flex-row items-center justify-center mt-2 gap-6 w-full">
              <button
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold text-lg shadow hover:bg-red-100 hover:text-red-700 transition-all border-2 border-gray-200 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={() => setCurrent((prev) => Math.max(0, prev - 1))}
                disabled={current === 0}
              >
                <ArrowLeftCircle size={28} className="mr-1" />
                Trước
              </button>
              <button
                title={bookmarks[exam.questions[current].id] ? 'Bỏ đánh dấu câu hỏi này' : 'Đánh dấu câu hỏi này'}
                onClick={() => handleBookmark(exam.questions[current].id)}
                className={`flex items-center justify-center px-3 py-2 rounded-full border transition h-12 w-12 text-yellow-500 bg-yellow-100 border-yellow-300 shadow hover:bg-yellow-200 ${bookmarks[exam.questions[current].id] ? 'ring-2 ring-yellow-400' : ''}`}
                style={{ minWidth: 48, minHeight: 48 }}
              >
                <svg width="28" height="28" fill={bookmarks[exam.questions[current].id] ? '#facc15' : 'none'} stroke="#facc15" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2v19l6-5 6 5V2z"/></svg>
              </button>
              <button
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold text-lg shadow hover:bg-red-100 hover:text-red-700 transition-all border-2 border-gray-200 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={() => setCurrent((prev) => Math.min(exam.questions.length - 1, prev + 1))}
                disabled={current === exam.questions.length - 1}
              >
                Tiếp
                <ArrowRightCircle size={28} className="ml-1" />
              </button>
            </div>
          </div>
        </div>
        {/* Sidebar */}
        <div className="w-full md:w-[340px] bg-white rounded-2xl shadow-lg p-8 border-t-8 border-red-600 flex flex-col items-center mx-auto mt-8 md:mt-0 md:ml-auto md:mr-0" style={{ minHeight: '600px', height: '80vh' }}>
          {/* Thời gian làm bài */}
          <div className="mb-6 flex flex-col items-center w-full">
            <span className="text-gray-700 font-semibold text-base mb-1 flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-500" /> Thời gian làm bài:
            </span>
            <span className="text-red-600 font-bold text-2xl">{formatTime(timeLeft)}</span>
          </div>
          <div className="mb-4 font-semibold text-gray-700 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" /> Trạng thái câu hỏi
          </div>
          <div className="grid grid-cols-5 gap-2 mb-6">
            {exam.questions.map((q, idx) => (
              <div key={q.id} className="relative">
                <button
                  className={`w-12 h-12 rounded-full font-bold border-2 text-lg transition-all flex items-center justify-center shadow-sm
                    ${current === idx ? 'border-red-600 bg-red-100 text-red-700 scale-110 shadow-md' : answers[q.id] ? 'border-red-400 bg-red-200 text-red-700' : 'border-gray-200 bg-white text-gray-500 hover:border-red-400'}
                  `}
                  onClick={() => setCurrent(idx)}
                  title={bookmarks[q.id] ? 'Câu hỏi đã được đánh dấu' : undefined}
                >
                  {idx + 1}
                </button>
                {bookmarks[q.id] && (
                  <span className="absolute -top-2 -right-2 bg-yellow-300 rounded-full p-1 shadow-md">
                    <svg width="18" height="18" fill="#facc15" viewBox="0 0 24 24"><path d="M6 2v19l6-5 6 5V2z"/></svg>
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="text-gray-500 text-sm mt-2">Số câu đã trả lời: <span className="font-semibold text-red-600">{Object.keys(answers).length}</span> / {exam.questions.length}</div>
          {/* Nút nộp bài ở cuối sidebar */}
          <div className="flex-1 flex flex-col justify-end w-full">
            <div className="flex justify-center mt-8">
              <button
                className="px-8 py-3 rounded-lg bg-red-600 text-white font-bold text-lg shadow hover:bg-red-700 transition w-full max-w-xs disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                onClick={handleSubmit}
                disabled={submitting || loading}
              >
                {submitting ? <span className="flex items-center gap-2"><LoadingSpinner /> Đang nộp bài...</span> : <><CheckCircle className="w-5 h-5 text-white" /> Nộp bài</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
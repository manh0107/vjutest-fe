"use client"
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import Pagination from '@mui/material/Pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { examService } from '@/services/examService';
import { CheckCircle, Rocket, ArrowLeft, ChevronDown, ChevronUp, Edit, Trash2, Check, X, Copy } from 'lucide-react';
import CreateQuestionDialog from './CreateQuestionDialog';
import { chapterService } from '@/services/chapterService';
import { questionService } from '@/services/questionService';
import { answerService } from '@/services/answerService';
import { EditExamQuestionDialog } from '@/app/dashboard/exams/components/EditExamQuestionDialog';
import QuestionOverviewDialog from './QuestionOverviewDialog';
// Bạn cần tạo các service questionService, answerService tương tự như phần chapter

export default function CompleteExamPage({ params }: { params: { id: string } }) {
  const examId = Number(params.id);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [duration, setDuration] = useState(30);
  const [completing, setCompleting] = useState(false);
  const [passPercent, setPassPercent] = useState(60);
  const [startTime, setStartTime] = useState<string>('');
  const [showRevertDialog, setShowRevertDialog] = useState(false);
  const QUESTIONS_PER_PAGE = 5;
  const router = useRouter();
  const [chapters, setChapters] = useState<{ id: number; name: string }[]>([]);
  const [exam, setExam] = useState<any>(null);
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});
  const [answers, setAnswers] = useState<Record<string, any[]>>({});
  const [loadingAnswers, setLoadingAnswers] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [questionsOverview, setQuestionsOverview] = useState<{ id: number; content: string; order: number }[]>([]);
  // TODO: Lấy thông tin exam (name, code) từ API nếu cần
  // const examName = "Tên bài kiểm tra"; // Thay bằng dữ liệu thực tế nếu có
  // const examCode = "E-xxxxxx"; // Thay bằng dữ liệu thực tế nếu có

  useEffect(() => {
    fetchExamAndChapters();
    fetchQuestions();
  }, [examId]);

  const fetchExamAndChapters = async () => {
    try {
      const examData = await examService.getExamById(examId);
      setExam(examData);
      if (examData?.subject?.id) {
        const chapterList = await chapterService.getChapters(String(examData.subject.id));
        setChapters(chapterList.map((c: any) => ({ id: Number(c.id), name: c.name })));
      }
    } catch (error) {
      toast.error('Không thể tải thông tin bài kiểm tra hoặc chương học');
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      // Ưu tiên lấy theo examId
      try {
        const data = await questionService.getQuestionsByExam(examId);
        setQuestions(data);
      } catch (err: any) {
        // Nếu bị 403 hoặc không có quyền, thử lấy theo từng chương
        if (chapters.length > 0) {
          let allQuestions: any[] = [];
          for (const chap of chapters) {
            try {
              const qs = await questionService.getQuestionsByChapter(chap.id);
              allQuestions = allQuestions.concat(qs);
            } catch {}
          }
          setQuestions(allQuestions);
        } else {
          setQuestions([]);
        }
      }
    } catch (error) {
      toast.error('Không thể tải danh sách câu hỏi');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteExam = async () => {
    setCompleting(true);
    setError(null);
    try {
      let startAt: string | undefined, endAt: string | undefined;
      
      if (exam?.isPublic) {
        // Bài kiểm tra public: có thể làm bất kỳ lúc nào
        startAt = undefined;
        endAt = undefined;
      } else {
        // Bài kiểm tra không public: cần set thời gian cụ thể
        if (!startTime) {
          setError('Vui lòng nhập thời gian bắt đầu');
          setCompleting(false);
          return;
        }
        startAt = startTime;
        endAt = new Date(new Date(startTime).getTime() + duration * 60000).toISOString();
      }
      
      await examService.updateExamStatus(examId, 'PUBLISHED', startAt, endAt, passPercent, duration);
      toast.success('Bài kiểm tra đã được hoàn thành!');
      setShowCompleteModal(false);
      
      // Thêm delay nhỏ để đảm bảo backend đã cập nhật xong
      setTimeout(() => {
        router.push('/dashboard/exams');
      }, 500);
    } catch (error: any) {
      console.error('Error completing exam:', error);
      if (error.response?.status === 403) {
        setError('Bạn không có quyền hoàn thành bài kiểm tra này');
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Không thể hoàn thành bài kiểm tra');
      }
    } finally {
      setCompleting(false);
    }
  };

  const handleRevertToDraft = async () => {
    try {
      await examService.revertToDraft(examId);
      toast.success('Đã chuyển về bản nháp!');
      setShowRevertDialog(false);
      fetchExamAndChapters();
    } catch (e) {
      toast.error('Không thể chuyển về bản nháp');
    }
  };

  const filteredQuestions = questions.filter(q =>
    q.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredQuestions.length / QUESTIONS_PER_PAGE);
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * QUESTIONS_PER_PAGE,
    currentPage * QUESTIONS_PER_PAGE
  );

  const toggleExpandRow = async (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
    if (!answers[id]) {
      setLoadingAnswers(id);
      try {
        const data = await answerService.getAnswersByQuestion(Number(id));
        setAnswers(prev => ({ ...prev, [id]: data }));
      } catch (e) {
        setAnswers(prev => ({ ...prev, [id]: [] }));
      } finally {
        setLoadingAnswers(null);
      }
    }
  };

  const handleEditQuestion = (question: any) => {
    setEditQuestion(question);
  };

  const handleQuestionUpdated = () => {
    // Fetch questions again to update the UI
    fetchQuestions();
    // Refresh answers for all expanded questions
    Object.keys(expandedRows).forEach(async (questionId) => {
      if (expandedRows[questionId]) {
        try {
          const data = await answerService.getAnswersByQuestion(Number(questionId));
          setAnswers(prev => ({ ...prev, [questionId]: data }));
        } catch (e) {
          console.error('Error refreshing answers:', e);
        }
      }
    });
  };

  const handleDeleteQuestion = (question: any) => {
    setQuestionToDelete(question);
    setShowDeleteDialog(true);
  };

  const confirmDeleteQuestion = async () => {
    if (!questionToDelete) return;
    try {
      await questionService.deleteQuestionFromExam(questionToDelete.id, examId);
      toast.success('Xóa câu hỏi thành công!');
      fetchQuestions();
    } catch (error) {
      toast.error('Không thể xóa câu hỏi');
    } finally {
      setShowDeleteDialog(false);
      setQuestionToDelete(null);
    }
  };

  const handleDuplicateQuestion = async (question: any) => {
    try {
      await questionService.duplicateQuestion(examId, question.id);
      toast.success('Nhân bản câu hỏi thành công!');
      fetchQuestions();
    } catch (error) {
      console.error('Error duplicating question:', error);
      toast.error('Không thể nhân bản câu hỏi');
    }
  };

  return (
    <div className="container mx-auto pt-6 pb-10 max-w-6xl relative">
      {/* Header: Quay lại + tên + mã + nút hoàn thành */}
      <div className="flex items-center justify-between mb-14 pt-2 gap-16">
        <div className="flex items-center gap-3">
          <button
            className="p-2 rounded-full hover:bg-gray-100 transition"
            onClick={() => router.push('/dashboard/exams')}
            title="Quay lại danh sách bài kiểm tra"
          >
            <ArrowLeft className="w-6 h-6 text-gray-500" />
          </button>
          <span className="font-bold text-xl text-primary">{exam?.name || ''}</span>
          <span className="ml-2 text-xs font-mono text-gray-500 bg-gray-100 rounded px-2 py-1">{exam?.examCode || exam?.code || ''}</span>
          {/* Nút chuyển về bản nháp */}
          {['PUBLISHED', 'CLOSED'].includes(exam?.status) && (
            <Button
              className="ml-4 bg-yellow-500 text-white font-semibold px-4 py-1 rounded"
              onClick={() => setShowRevertDialog(true)}
            >
              Chuyển về bản nháp
            </Button>
          )}
        </div>
        {/* Ẩn nút hoàn thành nếu không phải DRAFT */}
        {exam?.status === 'DRAFT' && (
          <Button
            className="bg-green-600 text-white font-semibold px-7 py-2 rounded-xl shadow-lg text-base hover:bg-green-700 transition flex items-center gap-2 drop-shadow-md"
            onClick={() => setShowCompleteModal(true)}
          >
            <Rocket className="w-5 h-5" />
            Hoàn thành bài kiểm tra
          </Button>
        )}
      </div>
      <h1 className="text-3xl font-bold mb-2 text-center text-primary">Hoàn thành bài kiểm tra</h1>
      <p className="text-center text-gray-500 mb-10">Thêm câu hỏi và đáp án cho bài kiểm tra của bạn. Khi đã sẵn sàng, hãy nhấn nút <span className='font-semibold text-green-600'>Hoàn thành bài kiểm tra</span> để xuất bản.</p>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8 mb-10 mt-6">
        <Input
          type="text"
          placeholder="Tìm kiếm câu hỏi..."
          value={search}
          onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
          className="w-full sm:w-96 shadow-sm"
        />
        {exam?.status === 'DRAFT' && (
          <Button onClick={() => setShowCreateModal(true)} className="bg-primary text-white font-semibold px-8 py-2 rounded-lg shadow">
            Thêm câu hỏi
          </Button>
        )}
      </div>
      {exam?.status === 'DRAFT' && (
        <CreateQuestionDialog
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onCreated={fetchQuestions}
          examId={examId}
          chapters={chapters}
          examIsPublic={exam?.isPublic}
        />
      )}
      {/* Danh sách câu hỏi */}
      <div className="min-h-[300px] space-y-4">
        {paginatedQuestions.map((q) => {
          const originalIndex = questions.findIndex(item => item.id === q.id);
          let point = '-';
          if (q.examQuestions && Array.isArray(q.examQuestions)) {
            const eq = q.examQuestions.find((eq: any) => eq.exam && eq.exam.id === examId);
            if (eq && typeof eq.point !== 'undefined') point = eq.point;
          }
          return (
            <div key={q.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                {q.imageUrl && (
                  <div className="relative group flex-shrink-0">
                    <div className="overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                      <img 
                        src={q.imageUrl} 
                        alt="Câu hỏi" 
                        className="w-20 h-20 object-contain object-center transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-lg" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary">Câu {originalIndex + 1}:</span>
                    <span className="font-medium">{q.name}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-gray-500">Độ khó: {q.difficulty || '-'}</span>
                    <span className="text-sm text-gray-500">Điểm: {point}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleExpandRow(q.id)}
                    title="Xem đáp án"
                  >
                    {expandedRows[q.id] ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                  </Button>
                  {exam?.status === 'DRAFT' && (
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="text-blue-600 hover:bg-blue-50" title="Sửa" onClick={() => handleEditQuestion(q)}>
                        <Edit className="h-5 w-5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-green-600 hover:bg-green-50" title="Nhân bản" onClick={() => handleDuplicateQuestion(q)}>
                        <Copy className="h-5 w-5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-red-500 hover:bg-red-50" title="Xóa" onClick={() => handleDeleteQuestion(q)}>
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              {expandedRows[q.id] && (
                <div className="mt-3 pl-4 border-l-2 border-gray-200 bg-gray-50 rounded">
                  <div className="font-semibold mb-2 text-gray-700">Danh sách đáp án:</div>
                  {loadingAnswers === q.id ? (
                    <div className="text-gray-400 italic py-2">Đang tải đáp án...</div>
                  ) : answers[q.id] && answers[q.id].length > 0 ? (
                    <ul className="space-y-2">
                      {answers[q.id].map((a: any, idx: number) => (
                        <li key={a.id || idx} className="flex items-center gap-3 py-1">
                          {a.imageUrl && (
                            <img src={a.imageUrl} alt="Đáp án" className="w-10 h-10 object-contain rounded border" />
                          )}
                          <input
                            type="radio"
                            checked={a.isCorrect}
                            readOnly
                            className="h-4 w-4"
                          />
                          <span className="font-medium">{String.fromCharCode(65 + idx)}. {a.content || a.answerName}</span>
                          {a.isCorrect ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-gray-500 italic py-2">Chưa có đáp án</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {!loading && paginatedQuestions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <CheckCircle className="w-16 h-16 mb-2 text-gray-300 mx-auto" />
            <div className="text-lg font-semibold mb-1">Chưa có câu hỏi nào</div>
            <div className="text-sm">Hãy nhấn <span className='font-semibold text-primary'>Thêm câu hỏi</span> để bắt đầu xây dựng bài kiểm tra.</div>
          </div>
        )}
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            color="primary"
          />
        </div>
      )}
      {/* Modal nhập thời gian làm bài */}
      <Dialog open={showCompleteModal} onOpenChange={setShowCompleteModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl">Hoàn thành bài kiểm tra</DialogTitle>
            <p className="text-gray-500 text-sm mt-1">Nhập thông tin để xuất bản bài kiểm tra.</p>
          </DialogHeader>
          {!exam?.isPublic && (
            <div className="mb-4">
              <label className="block font-medium mb-1">Thời gian bắt đầu</label>
              <Input
                type="datetime-local"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                min={new Date(Date.now() + 30 * 60000).toISOString().slice(0, 16)}
                required
              />
              <p className="text-sm text-gray-500 mt-1">Thời gian bắt đầu phải cách thời gian hiện tại ít nhất 30 phút</p>
            </div>
          )}
          <div className="mb-4">
            <label className="block font-medium mb-1">Thời gian làm bài (phút)</label>
            <Input
              type="number"
              min={1}
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              placeholder="Nhập số phút"
              autoFocus
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Phần trăm điểm để qua (%)</label>
            <Input
              type="number"
              min={1}
              max={100}
              value={passPercent}
              onChange={e => setPassPercent(Number(e.target.value))}
              placeholder="Nhập phần trăm (VD: 60)"
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm mb-4">{error}</div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCompleteModal(false);
              setError(null);
            }} disabled={completing}>
              Hủy
            </Button>
            <Button onClick={handleCompleteExam} disabled={completing || duration < 1 || passPercent < 1 || passPercent > 100 || (!exam?.isPublic && !startTime)} className="bg-green-600 text-white font-semibold px-6 py-2 rounded-lg">
              {completing ? 'Đang hoàn thành...' : 'Xác nhận'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Dialog sửa câu hỏi */}
      {editQuestion && (
        <EditExamQuestionDialog
          question={editQuestion}
          examId={examId}
          isOpen={!!editQuestion}
          onClose={() => setEditQuestion(null)}
          onSuccess={handleQuestionUpdated}
        />
      )}
      {/* Dialog xác nhận xóa */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Bạn có chắc muốn xóa câu hỏi này?</DialogTitle>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Hủy</Button>
            <Button variant="destructive" onClick={confirmDeleteQuestion}>Xóa</Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Dialog xác nhận chuyển trạng thái về bản nháp */}
      <Dialog open={showRevertDialog} onOpenChange={setShowRevertDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Xác nhận chuyển về bản nháp</DialogTitle>
          </DialogHeader>
          <div className="mb-4 text-gray-700">Nếu bạn đồng ý, bài kiểm tra này sẽ về trạng thái <b>bản nháp</b> để bạn chỉnh sửa và sẽ ẩn đi với các sinh viên khác. Bạn có muốn chuyển đổi trạng thái không?</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRevertDialog(false)}>Hủy</Button>
            <Button className="bg-yellow-500 text-white" onClick={handleRevertToDraft}>Đồng ý</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <QuestionOverviewDialog
        open={isOverviewOpen}
        onOpenChange={setIsOverviewOpen}
        questions={questionsOverview}
        onQuestionsChange={setQuestionsOverview}
        examId={Number(params.id)}
      />
    </div>
  );
} 
"use client"
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { questionService } from '@/services/questionService';
import { answerService } from '@/services/answerService';
import { ImagePlus, Trash2, Plus, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface Answer {
  id?: number;
  content: string;
  isCorrect: boolean;
  image?: File | null;
  imageUrl?: string;
}

interface EditQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (question: any) => void;
  examId: number;
  question: any;
  chapters: { id: number; name: string }[];
}

export default function EditQuestionDialog({ open, onOpenChange, onUpdated, examId, question, chapters }: EditQuestionDialogProps) {
  const [content, setContent] = useState(question.name || '');
  const [score, setScore] = useState(question.examQuestions?.[0]?.point || 1);
  const [difficulty, setDifficulty] = useState(question.difficulty === 1 ? 'EASY' : question.difficulty === 2 ? 'MEDIUM' : 'HARD');
  const [isPublic, setIsPublic] = useState(question.isPublic || false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [chapterId, setChapterId] = useState<number | null>(question.chapterId || null);
  const [questionImagePreview, setQuestionImagePreview] = useState<string | null>(question.imageUrl || null);
  const [answerImagePreviews, setAnswerImagePreviews] = useState<{ [key: number]: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const [answersError, setAnswersError] = useState<string | null>(null);
  const [correctAnswerError, setCorrectAnswerError] = useState<string | null>(null);
  const [chapterError, setChapterError] = useState<string | null>(null);

  // Map difficulty string to number
  const difficultyMap: Record<string, number> = {
    'EASY': 1,
    'MEDIUM': 2,
    'HARD': 3,
  };

  useEffect(() => {
    if (question) {
      setContent(question.name || '');
      setScore(question.examQuestions?.[0]?.point || 1);
      setDifficulty(question.difficulty === 1 ? 'EASY' : question.difficulty === 2 ? 'MEDIUM' : 'HARD');
      setIsPublic(question.isPublic || false);
      setChapterId(question.chapterId || null);
      setQuestionImagePreview(question.imageUrl || null);
      
      // Chuyển đổi answers từ API sang định dạng state
      const formattedAnswers = question.answers?.map((ans: any) => ({
        id: ans.id,
        content: ans.answerName,
        isCorrect: ans.isCorrect,
        image: null,
        imageUrl: ans.imageUrl
      })) || [];
      setAnswers(formattedAnswers);

      // Set preview cho ảnh đáp án
      const previews: { [key: number]: string } = {};
      formattedAnswers.forEach((ans: Answer, idx: number) => {
        if (ans.imageUrl) {
          previews[idx] = ans.imageUrl;
        }
      });
      setAnswerImagePreviews(previews);
    }
  }, [question]);

  const handleAddAnswer = () => {
    if (answers.length < 4) {
      // Kiểm tra xem đã có đáp án đúng nào chưa
      const hasCorrect = answers.some(a => a.isCorrect);
      if (hasCorrect) {
        setCorrectAnswerError('Mỗi câu hỏi chỉ được có một đáp án đúng');
        return;
      }
      setCorrectAnswerError(null);
      setAnswers([...answers, { content: '', isCorrect: false, image: null }]);
    }
  };

  const handleRemoveAnswer = (idx: number) => setAnswers(answers.filter((_, i) => i !== idx));

  const handleAnswerChange = (idx: number, value: string) => {
    setAnswers(answers.map((a, i) => i === idx ? { ...a, content: value } : a));
  };

  const handleAnswerImageChange = (idx: number, file: File | null) => {
    setAnswers(answers.map((a, i) => i === idx ? { ...a, image: file } : a));
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAnswerImagePreviews(prev => ({ ...prev, [idx]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } else {
      setAnswerImagePreviews(prev => {
        const newPreviews = { ...prev };
        delete newPreviews[idx];
        return newPreviews;
      });
    }
  };

  const handleCorrectChange = (idx: number) => {
    // Kiểm tra xem đã có đáp án đúng nào khác chưa
    const hasOtherCorrect = answers.some((a, i) => i !== idx && a.isCorrect);
    if (hasOtherCorrect) {
      setCorrectAnswerError('Mỗi câu hỏi chỉ được có một đáp án đúng');
      return;
    }
    setCorrectAnswerError(null);
    setAnswers(answers.map((a, i) => ({ ...a, isCorrect: i === idx })));
  };

  const handleQuestionImageChange = (file: File | null) => {
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQuestionImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setQuestionImagePreview(null);
    }
  };

  const removeQuestionImage = () => {
    setImage(null);
    setQuestionImagePreview(null);
  };

  const removeAnswerImage = (idx: number) => {
    setAnswers(answers.map((a, i) => i === idx ? { ...a, image: null, imageUrl: undefined } : a));
    setAnswerImagePreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[idx];
      return newPreviews;
    });
  };

  const validateForm = () => {
    let isValid = true;
    setContentError(null);
    setAnswersError(null);
    setCorrectAnswerError(null);
    setChapterError(null);

    // Validate nội dung câu hỏi
    if (!content.trim()) {
      setContentError('Vui lòng nhập nội dung câu hỏi');
      isValid = false;
    }

    // Validate số lượng đáp án
    if (answers.length < 2) {
      setAnswersError('Cần ít nhất 2 đáp án cho câu hỏi');
      isValid = false;
    }

    // Validate nội dung đáp án
    if (answers.some(a => !a.content.trim())) {
      setAnswersError('Vui lòng nhập đầy đủ nội dung cho tất cả đáp án');
      isValid = false;
    }

    // Validate đáp án đúng
    if (!answers.some(a => a.isCorrect)) {
      setCorrectAnswerError('Vui lòng chọn đáp án đúng');
      isValid = false;
    }

    if (answers.filter(a => a.isCorrect).length > 1) {
      setCorrectAnswerError('Mỗi câu hỏi chỉ được có một đáp án đúng');
      isValid = false;
    }

    // Validate chương học
    if (!chapterId) {
      setChapterError('Vui lòng chọn chương học cho câu hỏi');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e?: any) => {
    if (e) e.preventDefault();
    setFormError(null);

    // Validate form trước khi submit
    if (!validateForm()) {
      return; // Dừng lại nếu có lỗi
    }

    setLoading(true);
    try {
      // 1. Cập nhật câu hỏi
      const questionData = {
        name: content,
        difficulty: difficultyMap[difficulty] || 1,
        isPublic,
        examQuestions: [{ point: score }],
        chapterId,
      };
      const formData = new FormData();
      formData.append('question', new Blob([JSON.stringify(questionData)], { type: 'application/json' }));
      formData.append('chapterId', String(chapterId));
      formData.append('examId', String(examId));
      if (image) formData.append('imageFile', image);
      const updatedQuestion = await questionService.updateQuestion(question.id, formData);

      // 2. Cập nhật đáp án
      // Cập nhật từng đáp án một
      for (const answer of answers) {
        if (answer.id) {
          const singleAnswerFormData = new FormData();
          singleAnswerFormData.append('answer', new Blob([JSON.stringify({
            answerName: answer.content,
            isCorrect: answer.isCorrect,
            questionId: updatedQuestion.id,
          })], { type: 'application/json' }));
          if (answer.image) {
            singleAnswerFormData.append('imageFile', answer.image);
          }
          await answerService.updateAnswer(answer.id, singleAnswerFormData, updatedQuestion.id);
        } else {
          // Nếu là đáp án mới, tạo mới
          const newAnswerFormData = new FormData();
          newAnswerFormData.append('answer', new Blob([JSON.stringify({
            answerName: answer.content,
            isCorrect: answer.isCorrect,
            questionId: updatedQuestion.id,
          })], { type: 'application/json' }));
          if (answer.image) {
            newAnswerFormData.append('imageFile', answer.image);
          }
          await answerService.createSingleAnswer(updatedQuestion.id, newAnswerFormData);
        }
      }

      toast.success('Cập nhật câu hỏi thành công!');
      // Cập nhật lại dữ liệu câu hỏi trước khi đóng form
      const updatedQuestionWithAnswers = await questionService.getQuestionById(question.id);
      onUpdated(updatedQuestionWithAnswers); // Truyền dữ liệu cập nhật vào callback
      onOpenChange(false); // Chỉ đóng form khi cập nhật thành công
    } catch (error) {
      toast.error('Không thể cập nhật câu hỏi');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen === false) {
      // Kiểm tra xem có lỗi nào không
      if (contentError || answersError || correctAnswerError || chapterError) {
        return; // Không cho phép đóng form khi có lỗi
      }
      // Nếu đang trong quá trình loading, không cho phép đóng
      if (loading) {
        return;
      }
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="flex flex-col h-[80vh]">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-lg font-semibold text-gray-800">Chỉnh sửa câu hỏi</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                {formError && (
                  <div className="text-red-500 text-sm font-medium mb-2">{formError}</div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung câu hỏi</label>
                  <Textarea 
                    value={content} 
                    onChange={e => setContent(e.target.value)} 
                    required 
                    disabled={loading}
                    className={contentError ? "border-red-500" : "min-h-[80px] resize-none text-sm"}
                    placeholder="Nhập nội dung câu hỏi..."
                  />
                  {contentError && <p className="text-red-500 text-sm mt-1">{contentError}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh minh họa câu hỏi (nếu có)</label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1">
                      <div className="flex items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                        <div className="flex flex-col items-center">
                          <ImagePlus className="w-5 h-5 text-gray-400" />
                          <p className="text-xs text-gray-500 mt-1">Nhấn để tải ảnh</p>
                        </div>
                        <Input 
                          type="file" 
                          accept="image/*" 
                          onChange={e => handleQuestionImageChange(e.target.files?.[0] || null)} 
                          disabled={loading}
                          className="hidden"
                        />
                      </div>
                    </label>
                    {questionImagePreview && (
                      <div className="relative w-20 h-20">
                        <img 
                          src={questionImagePreview} 
                          alt="Preview" 
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={removeQuestionImage}
                          className="absolute -top-2 -left-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Điểm</label>
                    <Input 
                      type="number" 
                      min={1} 
                      value={score} 
                      onChange={e => setScore(Number(e.target.value))} 
                      required 
                      disabled={loading}
                      className="w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Độ khó</label>
                    <select
                      className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      value={difficulty}
                      onChange={e => setDifficulty(e.target.value)}
                      disabled={loading}
                    >
                      <option value="EASY">Dễ</option>
                      <option value="MEDIUM">Trung bình</option>
                      <option value="HARD">Khó</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chương học</label>
                  <select
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${chapterError ? "border-red-500" : ""}`}
                    value={chapterId ?? ''}
                    onChange={e => setChapterId(Number(e.target.value))}
                    disabled={loading}
                  >
                    <option value="">Chọn chương học</option>
                    {chapters.map(chap => (
                      <option key={chap.id} value={chap.id}>{chap.name}</option>
                    ))}
                  </select>
                  {chapterError && <p className="text-red-500 text-sm mt-1">{chapterError}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đáp án</label>
                  {answers.map((ans, idx) => (
                    <div key={idx} className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <Input
                          value={ans.content}
                          onChange={e => handleAnswerChange(idx, e.target.value)}
                          placeholder={`Đáp án ${idx + 1}`}
                          required
                          disabled={loading}
                          className={answersError ? "border-red-500" : "w-full text-sm"}
                        />
                        <Checkbox
                          checked={ans.isCorrect}
                          onCheckedChange={() => handleCorrectChange(idx)}
                          disabled={loading}
                          className={correctAnswerError ? "border-red-500" : "h-4 w-4"}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveAnswer(idx)}
                          disabled={loading}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex-1">
                          <div className="flex items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                            <div className="flex flex-col items-center">
                              <ImagePlus className="w-5 h-5 text-gray-400" />
                              <p className="text-xs text-gray-500 mt-1">Nhấn để tải ảnh</p>
                            </div>
                            <Input 
                              type="file" 
                              accept="image/*" 
                              onChange={e => handleAnswerImageChange(idx, e.target.files?.[0] || null)} 
                              disabled={loading}
                              className="hidden"
                            />
                          </div>
                        </label>
                        {answerImagePreviews[idx] && (
                          <div className="relative w-20 h-20">
                            <img 
                              src={answerImagePreviews[idx]} 
                              alt="Preview" 
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeAnswerImage(idx)}
                              className="absolute -top-2 -left-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {(answersError || correctAnswerError) && (
                    <p className="text-red-500 text-sm mt-1">{answersError || correctAnswerError}</p>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddAnswer}
                    disabled={loading || answers.length >= 4}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm đáp án
                  </Button>
                </div>
              </div>
            </form>
          </div>

          <div className="border-t px-6 py-4 bg-gray-50">
            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => {
                  if (!loading && !contentError && !answersError && !correctAnswerError && !chapterError) {
                    onOpenChange(false);
                  }
                }}
                disabled={loading}
                className="w-full sm:w-auto text-sm"
              >
                Hủy
              </Button>
              <Button 
                type="button" 
                disabled={loading}
                onClick={handleSubmit}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-sm"
              >
                {loading ? 'Đang cập nhật...' : 'Cập nhật câu hỏi'}
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
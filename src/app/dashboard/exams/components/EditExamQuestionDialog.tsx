import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { questionService } from '@/services/questionService';
import { Question } from '@/types/question';
import { Image as ImageIcon, X } from 'lucide-react';
import { answerService } from '@/services/answerService';
import { Answer } from '@/services/answerService';
import { AnswerManagement } from '@/app/dashboard/chapters/components/AnswerManagement';

interface QuestionFormData {
  name: string;
  difficulty: number;
  point: number;
  isPublic: boolean;
  image?: File;
}

interface EditExamQuestionDialogProps {
  question: Question;
  examId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditExamQuestionDialog({ question, examId, isOpen, onClose, onSuccess }: EditExamQuestionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<QuestionFormData>({
    name: question.name,
    difficulty: question.difficulty,
    point: question.examQuestions?.[0]?.point || 1,
    isPublic: question.isPublic,
  });
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isAnswerDialogOpen, setIsAnswerDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: question.name,
        difficulty: question.difficulty,
        point: question.examQuestions?.[0]?.point || 1,
        isPublic: question.isPublic,
      });
      setImagePreview(question.imageUrl || null);
      // Load answers when dialog opens
      const loadAnswers = async () => {
        try {
          const data = await answerService.getAnswersByQuestion(question.id);
          setAnswers(data);
        } catch (error: any) {
          console.error('Error loading answers:', error);
          const errorMessage = error.response?.status === 403 
            ? 'Bạn không có quyền truy cập danh sách đáp án'
            : 'Không thể tải danh sách đáp án';
          toast.error(errorMessage);
        }
      };
      loadAnswers();
    }
  }, [isOpen, question]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: undefined }));
    setImagePreview(null);
  };

  const validate = () => {
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập nội dung câu hỏi');
      return false;
    }
    if (answers.length < 2) {
      toast.error('Cần ít nhất 2 đáp án');
      return false;
    }
    if (answers.some(a => !a.answerName.trim())) {
      toast.error('Vui lòng nhập đầy đủ nội dung đáp án');
      return false;
    }
    const correctAnswers = answers.filter(a => a.isCorrect);
    if (correctAnswers.length !== 1) {
      toast.error('Phải có duy nhất một đáp án đúng');
      return false;
    }
    return true;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      // 1. Xử lý các thay đổi đáp án trước
      // Cập nhật các đáp án đã sửa
      const editedAnswers = answers.filter(a => a.isEdited && !a.isNew && !a.isDeleted);
      for (const answer of editedAnswers) {
        const formData = new FormData();
        const answerData = {
          id: answer.id,
          answerName: answer.answerName,
          isCorrect: answer.isCorrect,
          questionId: question.id
        };
        formData.append('answer', new Blob([JSON.stringify(answerData)], { type: 'application/json' }));
        if (answer.image) {
          formData.append('imageFile', answer.image);
        }
        await answerService.updateAnswer(answer.id, formData, question.id);
      }

      // Thêm các đáp án mới
      const newAnswers = answers.filter(a => a.isNew && !a.isDeleted);
      for (const answer of newAnswers) {
        const formData = new FormData();
        const answerData = {
          answerName: answer.answerName,
          isCorrect: answer.isCorrect,
          questionId: question.id
        };
        formData.append('answer', new Blob([JSON.stringify(answerData)], { type: 'application/json' }));
        if (answer.image) {
          formData.append('imageFile', answer.image);
        }
        await answerService.createSingleAnswer(question.id, formData);
      }

      // Xóa các đáp án đã đánh dấu
      const deletedAnswers = answers.filter(a => a.isDeleted);
      for (const answer of deletedAnswers) {
        await answerService.deleteAnswer(answer.id);
      }

      // 2. Cuối cùng cập nhật câu hỏi
      const questionData = {
        name: formData.name || '',
        difficulty: formData.difficulty ?? 1,
        isPublic: formData.isPublic,
        examQuestions: [{
          point: formData.point ?? 1
        }]
      };

      await questionService.updateQuestionInExam(question.id, examId, questionData, formData.image);

      // 3. Cập nhật lại danh sách đáp án
      const updatedAnswers = await answerService.getAnswersByQuestion(question.id);
      setAnswers(updatedAnswers);

      toast.success('Cập nhật câu hỏi thành công');
      onClose();
      onSuccess();
    } catch (error: any) {
      console.error('Error updating question:', error);
      const errorMessage = error.response?.data?.message || 'Cập nhật câu hỏi thất bại';
      toast.error(errorMessage);
      setIsLoading(false);
      return;
    }
  };

  const handleAnswersChange = (newAnswers: Answer[]) => {
    setAnswers(newAnswers);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cập nhật câu hỏi</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên câu hỏi</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Độ khó</Label>
              <Select
                value={String(formData.difficulty)}
                onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: Number(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn độ khó" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Dễ</SelectItem>
                  <SelectItem value="2">Trung bình</SelectItem>
                  <SelectItem value="3">Khó</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="point">Điểm</Label>
              <Input
                id="point"
                type="number"
                min="1"
                value={formData.point}
                onChange={(e) => setFormData(prev => ({ ...prev, point: Number(e.target.value) }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Hình ảnh câu hỏi</Label>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-20">
                <div className="relative h-full">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="h-full flex items-center justify-center border rounded-md bg-muted/50">
                    <span className="text-sm text-muted-foreground">Chọn ảnh</span>
                  </div>
                </div>
              </div>
              {imagePreview && (
                <div className="flex items-center gap-2">
                  <div className="w-20 h-20">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-contain rounded-md border"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveImage}
                    className="text-red-500 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Label>Quản lý đáp án</Label>
            <AnswerManagement
              questionId={question.id}
              answers={answers}
              onAnswersChange={handleAnswersChange}
              parentDialogOpen={isOpen}
              onAnswerChange={async () => {
                const data = await answerService.getAnswersByQuestion(question.id);
                setAnswers(data);
              }}
              showAnswerImages={true}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
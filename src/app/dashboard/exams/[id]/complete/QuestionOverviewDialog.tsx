"use client"
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown, Copy, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { questionService } from '@/services/questionService';

interface Question {
  id: number;
  content: string;
  order: number;
}

interface QuestionOverviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
  examId: number;
}

export default function QuestionOverviewDialog({ 
  open, 
  onOpenChange, 
  questions, 
  onQuestionsChange,
  examId 
}: QuestionOverviewDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleMoveQuestion = async (index: number, direction: 'up' | 'down') => {
    if (loading) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;

    setLoading(true);
    try {
      // Tạo mảng mới với thứ tự mới
      const newQuestions = [...questions];
      const [movedQuestion] = newQuestions.splice(index, 1);
      newQuestions.splice(newIndex, 0, movedQuestion);

      // Cập nhật thứ tự cho tất cả câu hỏi
      const updatedQuestions = newQuestions.map((q, i) => ({
        ...q,
        order: i + 1
      }));

      // Gọi API cập nhật thứ tự
      await questionService.updateQuestionsOrder(examId, updatedQuestions.map(q => q.id));
      
      onQuestionsChange(updatedQuestions);
      toast.success('Đã cập nhật thứ tự câu hỏi');
    } catch (error) {
      toast.error('Không thể cập nhật thứ tự câu hỏi');
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicateQuestion = async (questionId: number) => {
    if (loading) return;
    
    setLoading(true);
    try {
      // 1. Gọi API để duplicate câu hỏi trong database
      const duplicatedQuestion = await questionService.duplicateQuestion(examId, questionId);
      
      // 2. Lấy thông tin đầy đủ của câu hỏi mới từ database
      const fullQuestion = await questionService.getQuestionById(duplicatedQuestion.id);
      
      // 3. Cập nhật state với câu hỏi mới
      const newQuestions = [...questions, fullQuestion];
      onQuestionsChange(newQuestions);
      
      toast.success('Đã sao chép câu hỏi');
    } catch (error) {
      console.error('Error duplicating question:', error);
      toast.error('Không thể sao chép câu hỏi');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (loading) return;
    
    setLoading(true);
    try {
      await questionService.deleteQuestionFromExam(examId, questionId);
      const newQuestions = questions.filter(q => q.id !== questionId);
      onQuestionsChange(newQuestions);
      toast.success('Đã xóa câu hỏi');
    } catch (error) {
      toast.error('Không thể xóa câu hỏi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Tổng quan câu hỏi</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">STT</TableHead>
                <TableHead>Nội dung câu hỏi</TableHead>
                <TableHead className="w-[200px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map((question, index) => (
                <TableRow key={question.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="max-w-[500px] truncate">{question.content}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveQuestion(index, 'up')}
                        disabled={loading || index === 0}
                      >
                        <ArrowUpDown className="h-4 w-4 rotate-180" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveQuestion(index, 'down')}
                        disabled={loading || index === questions.length - 1}
                      >
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDuplicateQuestion(question.id)}
                        disabled={loading}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteQuestion(question.id)}
                        disabled={loading}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
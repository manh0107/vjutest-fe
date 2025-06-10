"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { examService } from '@/services/examService';
import { subjectService } from '@/services/subjectService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function ExamsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [exams, setExams] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newExam, setNewExam] = useState({
    name: '',
    description: '',
    durationTime: '',
    passScore: '',
    subjectId: '',
    isPublic: 'true'
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'teacher') {
      router.push('/login');
      return;
    }
    loadSubjects();
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!loadingSubjects && subjects.length > 0) {
      loadExams();
    }
  }, [loadingSubjects, subjects]);

  const loadSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const data = await subjectService.getTeacherSubjects();
      setSubjects(data);
    } catch (error) {
      console.error('Error loading subjects:', error);
      toast.error('Không thể tải danh sách môn học');
    } finally {
      setLoadingSubjects(false);
    }
  };

  const loadExams = async () => {
    try {
      setLoading(true);
      let allExams: any[] = [];
      for (const subject of subjects) {
        const data = await examService.getTeacherExams(subject.id);
        if (Array.isArray(data)) {
          allExams = allExams.concat(data);
        }
      }
      setExams(allExams);
    } catch (error) {
      console.error('Error loading exams:', error);
      toast.error('Không thể tải danh sách bài kiểm tra');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = async () => {
    try {
      if (!newExam.name || !newExam.durationTime || !newExam.passScore || !newExam.subjectId) {
        toast.error('Vui lòng điền đầy đủ thông tin');
        return;
      }
      await examService.createPublicExam(
        parseInt(newExam.subjectId),
        {
          name: newExam.name,
          description: newExam.description,
          durationTime: parseInt(newExam.durationTime),
          passScore: parseInt(newExam.passScore),
          isPublic: newExam.isPublic === 'true'
        }
      );
      toast.success('Tạo bài kiểm tra thành công');
      setIsCreateDialogOpen(false);
      setNewExam({
        name: '',
        description: '',
        durationTime: '',
        passScore: '',
        subjectId: '',
        isPublic: 'true'
      });
      loadExams();
    } catch (error) {
      console.error('Error creating exam:', error);
      toast.error('Không thể tạo bài kiểm tra');
    }
  };

  const filteredExams = exams.filter(exam =>
    exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.examCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || !user || user.role !== 'teacher') {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#b8021e]">Quản lý bài kiểm tra</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#b8021e] hover:bg-[#b8021e]/90">
              Tạo bài kiểm tra mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo bài kiểm tra mới</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Tên bài kiểm tra</Label>
                <Input
                  id="name"
                  value={newExam.name}
                  onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
                  placeholder="Nhập tên bài kiểm tra"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subjectId">Môn học</Label>
                <Select
                  value={newExam.subjectId}
                  onValueChange={(value) => setNewExam({ ...newExam, subjectId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn môn học" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id.toString()}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="durationTime">Thời gian làm bài (phút)</Label>
                <Input
                  id="durationTime"
                  type="number"
                  value={newExam.durationTime}
                  onChange={(e) => setNewExam({ ...newExam, durationTime: e.target.value })}
                  placeholder="Nhập thời gian làm bài"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="passScore">Điểm đạt (0-100)</Label>
                <Input
                  id="passScore"
                  type="number"
                  min="0"
                  max="100"
                  value={newExam.passScore}
                  onChange={(e) => setNewExam({ ...newExam, passScore: e.target.value })}
                  placeholder="Nhập điểm đạt"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="isPublic">Phạm vi</Label>
                <Select
                  value={newExam.isPublic}
                  onValueChange={(value) => setNewExam({ ...newExam, isPublic: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phạm vi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Công khai</SelectItem>
                    <SelectItem value="false">Riêng tư</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={newExam.description}
                  onChange={(e) => setNewExam({ ...newExam, description: e.target.value })}
                  placeholder="Nhập mô tả bài kiểm tra"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleCreateExam} className="bg-[#b8021e] hover:bg-[#b8021e]/90">
                Tạo bài kiểm tra
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <Input
          type="text"
          placeholder="Tìm kiếm bài kiểm tra..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          {searchTerm ? 'Không tìm thấy bài kiểm tra nào' : 'Bạn chưa có bài kiểm tra nào'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => (
            <Card key={exam.id} className="rounded-3xl shadow-xl border-t-4 border-red-400 bg-white">
              <CardHeader>
                <CardTitle className="text-xl">{exam.name}</CardTitle>
                <CardDescription>Mã bài kiểm tra: {exam.examCode}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-2">{exam.description}</p>
                <div className="text-sm">
                  <p>Môn học: {exam.subject.name}</p>
                  <p>Thời gian: {exam.durationTime} phút</p>
                  <p>Điểm đạt: {exam.passScore}</p>
                  <p>Trạng thái: {
                    exam.status === 'DRAFT' ? 'Nháp' :
                    exam.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Đã đóng'
                  }</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/teacher/exams/${exam.id}`)}
                >
                  Chi tiết
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  onClick={async () => {
                    if (confirm('Bạn có chắc chắn muốn xóa bài kiểm tra này?')) {
                      try {
                        await examService.deleteExam(exam.id);
                        toast.success('Xóa bài kiểm tra thành công');
                        loadExams();
                      } catch (error) {
                        console.error('Error deleting exam:', error);
                        toast.error('Không thể xóa bài kiểm tra');
                      }
                    }
                  }}
                >
                  Xóa
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 
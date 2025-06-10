import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import api from '@/services/axios';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { subjectService } from '@/services/subjectService';

interface ClassExamCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

interface ClassItem {
  id: number;
  name: string;
  classCode: string;
}

interface Subject {
  id: number;
  name: string;
}

interface Chapter {
  id: number;
  name: string;
}

export function ClassExamCreateModal({ isOpen, onClose, onCreated }: ClassExamCreateModalProps) {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapters, setSelectedChapters] = useState<number[]>([]);
  const [name, setName] = useState('');
  const [examCode, setExamCode] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      const token = localStorage.getItem('token');
      api.get(`/classes/all?userId=${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
        .then(res => setClasses(res.data))
        .catch(() => toast.error('Không thể tải danh sách lớp học'));
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (selectedClass) {
      subjectService.getSubjectsInClass(selectedClass)
        .then(setSubjects)
        .catch(() => toast.error('Không thể tải danh sách môn học của lớp'));
      setSelectedSubject(null);
      setChapters([]);
      setSelectedChapters([]);
    } else {
      setSubjects([]);
      setSelectedSubject(null);
      setChapters([]);
      setSelectedChapters([]);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedSubject) {
      api.get(`/chapters/subject/${selectedSubject}/all`)
        .then(res => setChapters(res.data))
        .catch(() => toast.error('Không thể tải danh sách chương học'));
      setSelectedChapters([]);
    } else {
      setChapters([]);
      setSelectedChapters([]);
    }
  }, [selectedSubject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !selectedSubject || selectedChapters.length === 0 || !name || !examCode) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name,
        examCode,
        description,
        isPublic: isPublic,
        chapterIds: selectedChapters,
      };
      await api.post(`/exams/create?classId=${selectedClass}&subjectId=${selectedSubject}`, payload);
      toast.success('Tạo bài kiểm tra thành công');
      onCreated();
      onClose();
      // Reset form
      setName('');
      setExamCode('');
      setDescription('');
      setIsPublic(false);
      setSelectedClass(null);
      setSelectedSubject(null);
      setSelectedChapters([]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể tạo bài kiểm tra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Tạo bài kiểm tra trong lớp học</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Lớp học</Label>
            <Select value={selectedClass?.toString() || ''} onValueChange={v => setSelectedClass(Number(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn lớp học" />
              </SelectTrigger>
              <SelectContent>
                {classes.map(cls => (
                  <SelectItem key={cls.id} value={cls.id.toString()}>{cls.name} ({cls.classCode})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Môn học</Label>
            <Select value={selectedSubject?.toString() || ''} onValueChange={v => setSelectedSubject(Number(v))} disabled={!selectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn môn học" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(sub => (
                  <SelectItem key={sub.id} value={sub.id.toString()}>{sub.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Chương học</Label>
            <ScrollArea className="h-32 border rounded">
              <div className="flex flex-col gap-2 p-2">
                {chapters.map(chap => (
                  <label key={chap.id} className="flex items-center gap-2">
                    <Checkbox checked={selectedChapters.includes(chap.id)} onCheckedChange={checked => {
                      setSelectedChapters(prev => checked ? [...prev, chap.id] : prev.filter(id => id !== chap.id));
                    }} />
                    {chap.name}
                  </label>
                ))}
                {chapters.length === 0 && <span className="text-xs text-muted-foreground">Chưa có chương học</span>}
              </div>
            </ScrollArea>
          </div>
          <div>
            <Label>Tên bài kiểm tra</Label>
            <Input value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <Label>Mã bài kiểm tra</Label>
            <Input value={examCode} onChange={e => setExamCode(e.target.value)} required />
          </div>
          <div>
            <Label>Mô tả</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={isPublic} onCheckedChange={checked => setIsPublic(Boolean(checked))} id="isPublic" />
            <Label htmlFor="isPublic">Công khai (Public)</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Hủy</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Đang tạo...' : 'Tạo bài kiểm tra'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
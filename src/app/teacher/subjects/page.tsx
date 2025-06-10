"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { subjectService } from '@/services/subjectService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function SubjectsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: '',
    subjectCode: '',
    description: '',
    creditHour: '',
    visibility: 'PUBLIC'
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'teacher') {
      router.push('/login');
      return;
    }
    loadSubjects();
  }, [user, authLoading, router]);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const data = await subjectService.getTeacherSubjects();
      setSubjects(data);
    } catch (error) {
      console.error('Error loading subjects:', error);
      toast.error('Không thể tải danh sách môn học');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async () => {
    try {
      if (!newSubject.name || !newSubject.subjectCode || !newSubject.creditHour) {
        toast.error('Vui lòng điền đầy đủ thông tin');
        return;
      }
      await subjectService.createSubject({
        name: newSubject.name,
        subjectCode: newSubject.subjectCode,
        description: newSubject.description,
        creditHour: parseInt(newSubject.creditHour),
        visibility: newSubject.visibility as 'PUBLIC' | 'DEPARTMENT' | 'MAJOR'
      });
      toast.success('Tạo môn học thành công');
      setIsCreateDialogOpen(false);
      setNewSubject({ name: '', subjectCode: '', description: '', creditHour: '', visibility: 'PUBLIC' });
      loadSubjects();
    } catch (error) {
      console.error('Error creating subject:', error);
      toast.error('Không thể tạo môn học');
    }
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.subjectCode.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-3xl font-bold text-[#b8021e]">Quản lý môn học</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#b8021e] hover:bg-[#b8021e]/90">
              Tạo môn học mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo môn học mới</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Tên môn học</Label>
                <Input
                  id="name"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  placeholder="Nhập tên môn học"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subjectCode">Mã môn học</Label>
                <Input
                  id="subjectCode"
                  value={newSubject.subjectCode}
                  onChange={(e) => setNewSubject({ ...newSubject, subjectCode: e.target.value })}
                  placeholder="Nhập mã môn học"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="creditHour">Số tín chỉ</Label>
                <Input
                  id="creditHour"
                  type="number"
                  value={newSubject.creditHour}
                  onChange={(e) => setNewSubject({ ...newSubject, creditHour: e.target.value })}
                  placeholder="Nhập số tín chỉ"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="visibility">Phạm vi</Label>
                <Select
                  value={newSubject.visibility}
                  onValueChange={(value) => setNewSubject({ ...newSubject, visibility: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phạm vi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">Công khai</SelectItem>
                    <SelectItem value="DEPARTMENT">Theo khoa</SelectItem>
                    <SelectItem value="MAJOR">Theo ngành</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={newSubject.description}
                  onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                  placeholder="Nhập mô tả môn học"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleCreateSubject} className="bg-[#b8021e] hover:bg-[#b8021e]/90">
                Tạo môn học
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <Input
          type="text"
          placeholder="Tìm kiếm môn học..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          {searchTerm ? 'Không tìm thấy môn học nào' : 'Bạn chưa có môn học nào'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((subject) => (
            <Card key={subject.id} className="rounded-3xl shadow-xl border-t-4 border-green-400 bg-white">
              <CardHeader>
                <CardTitle className="text-xl">{subject.name}</CardTitle>
                <CardDescription>Mã môn: {subject.subjectCode}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-2">{subject.description}</p>
                <div className="text-sm">
                  <p>Số tín chỉ: {subject.creditHour}</p>
                  <p>Phạm vi: {
                    subject.visibility === 'PUBLIC' ? 'Công khai' :
                    subject.visibility === 'DEPARTMENT' ? 'Theo khoa' : 'Theo ngành'
                  }</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/teacher/subjects/${subject.id}`)}
                >
                  Chi tiết
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  onClick={async () => {
                    if (confirm('Bạn có chắc chắn muốn xóa môn học này?')) {
                      try {
                        await subjectService.deleteSubject(subject.id);
                        toast.success('Xóa môn học thành công');
                        loadSubjects();
                      } catch (error) {
                        console.error('Error deleting subject:', error);
                        toast.error('Không thể xóa môn học');
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
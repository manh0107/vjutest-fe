"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { classService } from '@/services/classService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function ClassesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newClass, setNewClass] = useState({
    name: '',
    description: '',
    classCode: '',
    subjectId: ''
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'teacher') {
      router.push('/login');
      return;
    }
    loadClasses();
  }, [user, authLoading, router]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const data = await classService.getTeacherClasses();
      setClasses(data);
    } catch (error) {
      console.error('Error loading classes:', error);
      toast.error('Không thể tải danh sách lớp học');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async () => {
    try {
      if (!newClass.name || !newClass.classCode || !newClass.subjectId) {
        toast.error('Vui lòng điền đầy đủ thông tin');
        return;
      }
      await classService.createClass({
        name: newClass.name,
        description: newClass.description,
        classCode: newClass.classCode,
        subjectId: parseInt(newClass.subjectId)
      });
      toast.success('Tạo lớp học thành công');
      setIsCreateDialogOpen(false);
      setNewClass({ name: '', description: '', classCode: '', subjectId: '' });
      loadClasses();
    } catch (error) {
      console.error('Error creating class:', error);
      toast.error('Không thể tạo lớp học');
    }
  };

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.classCode.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-3xl font-bold text-[#b8021e]">Quản lý lớp học</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#b8021e] hover:bg-[#b8021e]/90">
              Tạo lớp học mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo lớp học mới</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Tên lớp</Label>
                <Input
                  id="name"
                  value={newClass.name}
                  onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                  placeholder="Nhập tên lớp"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="classCode">Mã lớp</Label>
                <Input
                  id="classCode"
                  value={newClass.classCode}
                  onChange={(e) => setNewClass({ ...newClass, classCode: e.target.value })}
                  placeholder="Nhập mã lớp"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subjectId">ID Môn học</Label>
                <Input
                  id="subjectId"
                  type="number"
                  value={newClass.subjectId}
                  onChange={(e) => setNewClass({ ...newClass, subjectId: e.target.value })}
                  placeholder="Nhập ID môn học"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={newClass.description}
                  onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                  placeholder="Nhập mô tả lớp học"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleCreateClass} className="bg-[#b8021e] hover:bg-[#b8021e]/90">
                Tạo lớp học
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <Input
          type="text"
          placeholder="Tìm kiếm lớp học..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          {searchTerm ? 'Không tìm thấy lớp học nào' : 'Bạn chưa có lớp học nào'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => (
            <Card key={cls.id} className="rounded-3xl shadow-xl border-t-4 border-blue-400 bg-white">
              <CardHeader>
                <CardTitle className="text-xl">{cls.name}</CardTitle>
                <CardDescription>Mã lớp: {cls.classCode}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-2">{cls.description}</p>
                <div className="text-sm">
                  <p>Số học viên: {cls.studentCount || 0}</p>
                  <p>Môn học: {cls.subjectName}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/teacher/classes/${cls.id}`)}
                >
                  Chi tiết
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  onClick={async () => {
                    if (confirm('Bạn có chắc chắn muốn xóa lớp học này?')) {
                      try {
                        await classService.deleteClass(cls.id);
                        toast.success('Xóa lớp học thành công');
                        loadClasses();
                      } catch (error) {
                        console.error('Error deleting class:', error);
                        toast.error('Không thể xóa lớp học');
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
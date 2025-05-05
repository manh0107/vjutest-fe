import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { subjectService } from '@/services/subjectService';
import { departmentService } from '@/services/departmentService';
import { majorService } from '@/services/majorService';
import { chapterService } from '@/services/chapterService';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import api from '@/services/axios';
import { examService } from '@/services/examService';

interface Subject {
  id: number;
  name: string;
  departmentIds?: number[];
  majorIds?: number[];
}

interface Chapter {
  id: number;
  name: string;
}

interface Question {
  id: number;
  content: string;
  isCompleted: boolean;
}

interface Department {
  id: number;
  name: string;
}

interface Major {
  id: number;
  name: string;
  departmentId: number;
}

interface ExamCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  isClassExam: boolean;
}

const visibilityOptions = [
  { value: 'PUBLIC', label: 'Công khai' },
  { value: 'DEPARTMENT', label: 'Theo khoa' },
  { value: 'MAJOR', label: 'Theo ngành' },
];

export function ExamCreateModal({ isOpen, onClose, onCreated, isClassExam }: ExamCreateModalProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [selectedChapters, setSelectedChapters] = useState<number[]>([]);
  const [visibility, setVisibility] = useState<string>('');
  const [name, setName] = useState('');
  const [examCode, setExamCode] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<number[]>([]);
  const [selectedMajors, setSelectedMajors] = useState<number[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [classes, setClasses] = useState<any[]>([]);

  const API_URL = 'http://localhost:8080';

  // Load departments và majors khi mở modal
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const [departmentsData, majorsData] = await Promise.all([
            api.get('/departments/all'),
            api.get('/majors/all')
          ]);
          setDepartments(departmentsData.data);
          setMajors(majorsData.data);
        } catch (error) {
          toast.error('Không thể tải danh sách khoa và ngành');
        }
      };
      fetchData();
    }
  }, [isOpen]);

  // Load classes when modal opens for class exam
  useEffect(() => {
    if (isOpen && isClassExam) {
      const fetchClasses = async () => {
        try {
          const response = await api.get('/classes/all');
          setClasses(response.data);
        } catch (error) {
          toast.error('Không thể tải danh sách lớp học');
        }
      };
      fetchClasses();
    }
  }, [isOpen, isClassExam]);

  // Load subjects dựa trên visibility và selected departments/majors
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await api.get('/subjects/all');
        let allSubjects = response.data;
        
        // Lọc subjects theo phạm vi
        if (visibility === 'DEPARTMENT' && selectedDepartments.length > 0) {
          allSubjects = allSubjects.filter((s: Subject) => 
            s.departmentIds && s.departmentIds.some((id: number) => selectedDepartments.includes(id))
          );
        }
        if (visibility === 'MAJOR' && selectedMajors.length > 0) {
          allSubjects = allSubjects.filter((s: Subject) => 
            s.majorIds && s.majorIds.some((id: number) => selectedMajors.includes(id))
          );
        }
        
        setSubjects(allSubjects);
      } catch (error) {
        toast.error('Không thể tải danh sách môn học');
      }
    };

    if (visibility === 'PUBLIC') {
      fetchSubjects();
    } else if (visibility === 'DEPARTMENT' && selectedDepartments.length > 0) {
      fetchSubjects();
    } else if (visibility === 'MAJOR' && selectedMajors.length > 0) {
      fetchSubjects();
    } else {
      setSubjects([]);
    }
    setSelectedSubject(null);
    setSelectedChapters([]);
  }, [visibility, selectedDepartments, selectedMajors]);

  // Load chapters khi chọn subject
  useEffect(() => {
    if (selectedSubject) {
      const fetchChapters = async () => {
        try {
          const response = await api.get(`/chapters/subject/${selectedSubject}/all`);
          
          if (Array.isArray(response.data)) {
            setChapters(response.data);
          } else {
            console.error('Invalid chapters data format:', response.data);
            toast.error('Dữ liệu chương học không hợp lệ');
          }
        } catch (error: any) {
          console.error('Error fetching chapters:', error);
          if (error.response?.status === 403) {
            toast.error('Bạn không có quyền truy cập danh sách chương của môn học này. Vui lòng kiểm tra lại phạm vi truy cập của môn học.');
            return;
          }
          toast.error('Không thể tải danh sách chương');
        }
      };
      fetchChapters();
    } else {
      setChapters([]);
    }
    setSelectedChapters([]);
  }, [selectedSubject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!selectedSubject || selectedChapters.length === 0 || !name || !examCode) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    
    if (visibility === 'DEPARTMENT' && selectedDepartments.length === 0) {
      toast.error('Vui lòng chọn ít nhất một khoa');
      return;
    }
    
    if (visibility === 'MAJOR' && selectedMajors.length === 0) {
      toast.error('Vui lòng chọn ít nhất một ngành');
      return;
    }

    setLoading(true);
    try {
      const examData = {
        name,
        examCode,
        description,
        visibility: visibility as 'PUBLIC' | 'DEPARTMENT' | 'MAJOR',
        isPublic: true,
        status: 'DRAFT',
        maxAttempts: 1,
        randomQuestions: false,
        startAt: '',
        endAt: '',
        subjectId: selectedSubject,
        classId: isClassExam ? selectedClass || undefined : undefined,
        selectedDepartments: visibility === 'DEPARTMENT' ? selectedDepartments : undefined,
        selectedMajors: visibility === 'MAJOR' ? selectedMajors : undefined,
        durationTime: 0,
        passScore: 0,
        maxScore: 100,
        questionsCount: 0,
        chapterIds: selectedChapters
      };

      if (isClassExam) {
        await examService.createClassExam(selectedClass!, selectedSubject, examData);
      } else {
        await examService.createPublicExam(selectedSubject, examData, selectedDepartments, selectedMajors);
      }
      
      toast.success('Tạo bài kiểm tra thành công!');
      onCreated();
      onClose();
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error('Bạn không có quyền tạo bài kiểm tra');
        return;
      }
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  // Lọc majors theo departments đã chọn
  const filteredMajors = selectedDepartments.length > 0 
    ? majors.filter(m => selectedDepartments.includes(m.departmentId))
    : majors;

  const handleVisibilityChange = (value: string) => {
    setVisibility(value);
    setSelectedDepartments([]);
    setSelectedMajors([]);
    setSelectedSubject(null);
    setSelectedChapters([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isClassExam ? 'Tạo bài kiểm tra trong lớp học' : 'Tạo bài kiểm tra ngoài lớp học'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Thông tin cơ bản */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tên bài kiểm tra</Label>
              <Input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                disabled={loading} 
              />
            </div>
            <div>
              <Label>Mã bài kiểm tra</Label>
              <Input 
                value={examCode} 
                onChange={e => setExamCode(e.target.value)} 
                required 
                disabled={loading}
                placeholder="VD: 2024-001" 
              />
              <p className="text-sm text-muted-foreground mt-1">
                Mã bài kiểm tra sẽ tự động thêm tiền tố "E-"
              </p>
            </div>
          </div>

          <div>
            <Label>Mô tả</Label>
            <Textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              disabled={loading} 
            />
          </div>

          <div>
            <Label>Phạm vi</Label>
            <Select 
              value={visibility} 
              onValueChange={handleVisibilityChange}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn phạm vi" />
              </SelectTrigger>
              <SelectContent>
                {visibilityOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Chọn khoa/ngành */}
          {visibility === 'DEPARTMENT' && (
            <div>
              <Label>Chọn khoa</Label>
              <ScrollArea className="h-32 border rounded-md p-2">
                <div className="space-y-2">
                  {departments.map(d => (
                    <div key={d.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`dept-${d.id}`}
                        checked={selectedDepartments.includes(d.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedDepartments(prev => [...prev, d.id]);
                          } else {
                            setSelectedDepartments(prev => prev.filter(id => id !== d.id));
                            setSelectedMajors(prev => prev.filter(id => 
                              !majors.find(m => m.id === id && m.departmentId === d.id)
                            ));
                          }
                        }}
                      />
                      <label htmlFor={`dept-${d.id}`}>{d.name}</label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {visibility === 'MAJOR' && (
            <>
              <div>
                <Label>Chọn khoa</Label>
                <ScrollArea className="h-32 border rounded-md p-2">
                  <div className="space-y-2">
                    {departments.map(d => (
                      <div key={d.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`dept-${d.id}`}
                          checked={selectedDepartments.includes(d.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedDepartments(prev => [...prev, d.id]);
                            } else {
                              setSelectedDepartments(prev => prev.filter(id => id !== d.id));
                              setSelectedMajors(prev => prev.filter(id => 
                                !majors.find(m => m.id === id && m.departmentId === d.id)
                              ));
                            }
                          }}
                        />
                        <label htmlFor={`dept-${d.id}`}>{d.name}</label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div>
                <Label>Chọn ngành</Label>
                <ScrollArea className="h-32 border rounded-md p-2">
                  <div className="space-y-2">
                    {filteredMajors.map(m => (
                      <div key={m.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`major-${m.id}`}
                          checked={selectedMajors.includes(m.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedMajors(prev => [...prev, m.id]);
                            } else {
                              setSelectedMajors(prev => prev.filter(id => id !== m.id));
                            }
                          }}
                        />
                        <label htmlFor={`major-${m.id}`}>{m.name}</label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}

          {/* Chọn môn học và chương */}
          {visibility && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Môn học</Label>
                <Select 
                  value={selectedSubject?.toString() || ''} 
                  onValueChange={v => setSelectedSubject(Number(v))} 
                  disabled={subjects.length === 0 || loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn môn học" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(sub => (
                      <SelectItem key={sub.id} value={sub.id.toString()}>
                        {sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Chương</Label>
                <ScrollArea className="h-32 border rounded-md p-2">
                  <div className="space-y-2">
                    {chapters.map(chap => (
                      <div key={chap.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`chapter-${chap.id}`}
                          checked={selectedChapters.includes(chap.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedChapters(prev => [...prev, chap.id]);
                            } else {
                              setSelectedChapters(prev => prev.filter(id => id !== chap.id));
                            }
                          }}
                          disabled={loading || !selectedSubject}
                        />
                        <label htmlFor={`chapter-${chap.id}`}>{chap.name}</label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Đang tạo...' : 'Tạo mới'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
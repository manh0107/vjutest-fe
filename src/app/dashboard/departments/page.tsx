"use client"

import { useEffect, useState, useMemo } from 'react';
import { departmentService, Department } from '@/services/departmentService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const PAGE_SIZE = 5;

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [name, setName] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [formError, setFormError] = useState('');

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const data = await departmentService.getAllDepartments();
      setDepartments(data);
    } catch (err) {
      toast.error('Không thể tải danh sách khoa');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Lọc theo tìm kiếm
  const filteredDepartments = useMemo(() => {
    return departments.filter(dept =>
      dept.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [departments, search]);

  // Phân trang
  const totalPages = Math.ceil(filteredDepartments.length / PAGE_SIZE);
  const paginatedDepartments = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredDepartments.slice(start, start + PAGE_SIZE);
  }, [filteredDepartments, currentPage]);

  // Reset trang về 1 khi tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const openAddModal = () => {
    setModalMode('add');
    setName('');
    setSelectedDepartment(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setModalMode('edit');
    setName(dept.name);
    setSelectedDepartment(dept);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleModalSubmit = async () => {
    if (!name.trim()) {
      setFormError('Tên khoa không được để trống');
      return;
    }
    try {
      if (modalMode === 'add') {
        await departmentService.createDepartment(name.trim());
        toast.success('Thêm khoa thành công');
      } else if (modalMode === 'edit' && selectedDepartment) {
        await departmentService.updateDepartment(selectedDepartment.id, name.trim());
        toast.success('Cập nhật khoa thành công');
      }
      setIsModalOpen(false);
      fetchDepartments();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await departmentService.deleteDepartment(deleteId);
      toast.success('Xóa khoa thành công');
      setIsDeleteDialogOpen(false);
      fetchDepartments();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể xóa khoa');
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <div className="bg-white rounded-xl shadow p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1 text-center md:text-left">Quản lý Khoa</h1>
            <p className="text-gray-500 text-sm">Danh sách các khoa trong hệ thống</p>
          </div>
          <div className="flex gap-2 items-center">
            <Input
              className="w-56"
              placeholder="Tìm kiếm tên khoa..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Button onClick={openAddModal} className="h-10">+ Thêm khoa</Button>
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-16">ID</TableHead>
                <TableHead className="min-w-[200px]">Tên khoa</TableHead>
                <TableHead className="min-w-[150px]">Người tạo</TableHead>
                <TableHead className="min-w-[120px]">Ngày tạo</TableHead>
                <TableHead className="text-right min-w-[120px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex justify-center items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-400 border-t-transparent" />
                      <span>Đang tải...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedDepartments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">Không có khoa nào</TableCell>
                </TableRow>
              ) : paginatedDepartments.map(dept => (
                <TableRow key={dept.id}>
                  <TableCell>{dept.id}</TableCell>
                  <TableCell>{dept.name}</TableCell>
                  <TableCell>{dept.createdByName}</TableCell>
                  <TableCell>{new Date(dept.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModal(dept)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setDeleteId(dept.id); setIsDeleteDialogOpen(true); }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              Trang trước
            </Button>
            <span className="text-gray-700 font-medium">Trang {currentPage} / {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              Trang sau
            </Button>
          </div>
        )}
      </div>
      {/* Modal thêm/sửa khoa */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modalMode === 'add' ? 'Thêm khoa' : 'Cập nhật khoa'}</DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            <Input
              placeholder="Tên khoa"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={100}
            />
            {formError && <div className="text-red-500 text-sm mt-1">{formError}</div>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button onClick={handleModalSubmit}>{modalMode === 'add' ? 'Thêm' : 'Cập nhật'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Xác nhận xóa */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa khoa</DialogTitle>
          </DialogHeader>
          <p>Bạn có chắc chắn muốn xóa khoa này không?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Hủy</Button>
            <Button variant="destructive" onClick={handleDelete}>Xóa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { userService } from '@/services/userService'
import { User } from '@/services/types'
import { toast } from 'sonner'
import { UserModal } from './components/UserModal'
import { Pencil, Trash2, UserPlus, Search, Eye } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { UserDetailModal } from './components/UserDetailModal'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useRouter } from 'next/navigation'
import { axiosInstance } from '@/services/axiosInstance'

interface Role {
  name: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const router = useRouter()

  const [currentUser, setCurrentUser] = useState<User | null>(null)

  const fetchUsers = async () => {
    try {
      const [usersData, currentUserData] = await Promise.all([
        userService.getUsers(),
        userService.getCurrentUser()
      ]);
      setUsers(usersData);
      setCurrentUser(currentUserData);
    } catch (error) {
      console.error('Error initializing:', error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (userData: Partial<User>, imageFile?: File) => {
    if (!currentUser?.id) {
      toast.error('Bạn cần đăng nhập để thực hiện thao tác này');
      return;
    }

    try {
      const { department, major, ...rest } = userData;
      
      const getRoleId = (role: string | undefined) => {
        switch(role) {
          case 'ROLE_ADMIN': return 1;
          case 'ROLE_TEACHER': return 2;
          case 'ROLE_USER': return 3;
          default: return 3;
        }
      };

      const dataToSend = {
        name: rest.name,
        email: rest.email,
        code: rest.code ? Number(rest.code) : undefined,
        phoneNumber: rest.phoneNumber ? Number(rest.phoneNumber) : undefined,
        password: rest.password,
        gender: rest.gender,
        imageUrl: rest.imageUrl || undefined,
        isEnabled: rest.isEnabled === undefined ? true : rest.isEnabled,
        department: department?.id ? { id: department.id, name: department.name } : undefined,
        major: major?.id ? { id: major.id, name: major.name } : undefined,
        role: { id: getRoleId(typeof rest.role === 'string' ? rest.role : '') }
      }
      
      const newUser = await userService.createUser(dataToSend, currentUser.id)
      setUsers(prevUsers => [...prevUsers, newUser])
      toast.success('Tạo người dùng thành công')
      return true
    } catch (error: any) {
      console.error('Lỗi khi tạo người dùng:', error)
      
      // Xử lý các loại lỗi cụ thể từ API
      const errorMessage = error.response?.data?.message;
      
      if (errorMessage) {
        // Xử lý các trường hợp lỗi cụ thể
        if (errorMessage.includes('Email')) {
          throw new Error(`Email ${userData.email} đã được sử dụng bởi người dùng khác. Vui lòng sử dụng email khác.`);
        }
        if (errorMessage.includes('Mã số')) {
          throw new Error(`Mã số ${userData.code} đã tồn tại trong hệ thống. Vui lòng sử dụng mã số khác.`);
        }
        if (errorMessage.includes('Số điện thoại')) {
          throw new Error(`Số điện thoại ${userData.phoneNumber} đã được đăng ký. Vui lòng sử dụng số điện thoại khác.`);
        }
        // Nếu là lỗi khác, trả về message gốc từ API
        throw new Error(errorMessage);
      }
      
      // Xử lý các lỗi HTTP status
      if (error.response?.status === 400) {
        throw new Error('Thông tin không hợp lệ. Vui lòng kiểm tra lại các trường bắt buộc và định dạng dữ liệu.');
      } else if (error.response?.status === 401) {
        throw new Error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (error.response?.status === 403) {
        throw new Error('Bạn không có quyền thực hiện thao tác này.');
      } else if (error.response?.status === 404) {
        throw new Error('Không tìm thấy tài nguyên yêu cầu. Vui lòng thử lại.');
      } else if (error.response?.status === 500) {
        throw new Error('Lỗi hệ thống. Vui lòng thử lại sau hoặc liên hệ quản trị viên.');
      }
      
      // Mặc định nếu không xác định được lỗi cụ thể
      throw new Error('Không thể tạo người dùng. Vui lòng kiểm tra lại thông tin và thử lại.');
    }
  }

  const handleUpdateUser = async (userData: Partial<User>, file?: File) => {
    if (!selectedUser?.id || !currentUser?.id) return
    try {
      const getRoleId = (role: string | undefined) => {
        switch(role) {
          case 'ROLE_ADMIN': return 1;
          case 'ROLE_TEACHER': return 2;
          case 'ROLE_USER': return 3;
          default: return 3;
        }
      };
      const { department, major, ...rest } = userData;
      
      // Chỉ gửi các trường cần thiết
      const dataToSend = {
        name: rest.name,
        email: rest.email,
        code: rest.code ? Number(rest.code) : undefined,
        phoneNumber: rest.phoneNumber ? Number(rest.phoneNumber) : undefined,
        gender: rest.gender,
        isEnabled: rest.isEnabled === undefined ? true : rest.isEnabled,
        department: department?.id ? { id: department.id, name: department.name } : undefined,
        major: major?.id ? { id: major.id, name: major.name } : undefined,
        role: { id: getRoleId(typeof rest.role === 'string' ? rest.role : '') },
        imageUrl: rest.imageUrl // Thêm imageUrl vào dataToSend
      };

      // Log data before sending
      console.log('Data to send:', JSON.stringify(dataToSend, null, 2));

      let updatedUser;
      if (file) {
        const formData = new FormData();
        formData.append('user', JSON.stringify(dataToSend));
        formData.append('file', file);
        console.log('FormData content:', {
          user: JSON.stringify(dataToSend),
          hasFile: !!file
        });
        updatedUser = await userService.updateUser(selectedUser.id, formData, currentUser.id, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // Khi không có file, gửi trực tiếp dataToSend
        updatedUser = await userService.updateUser(selectedUser.id, dataToSend, currentUser.id);
      }

      setUsers(prevUsers => prevUsers.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      ))
      toast.success('Cập nhật người dùng thành công', {
        description: `Đã cập nhật thông tin cho người dùng ${userData.name}`
      })
      return true
    } catch (error: any) {
      console.error('Lỗi khi cập nhật người dùng:', error)
      throw new Error(error.response?.data?.message || error.message || 'Không thể cập nhật người dùng')
    }
  }

  const handleDeleteUser = async (userId: number) => {
    try {
      await userService.deleteUser(userId)
      toast.success('Xóa người dùng thành công')
      fetchUsers()
    } catch (err: any) {
      console.error('Error deleting user:', err)
      toast.error(err.response?.data?.message || 'Không thể xóa người dùng')
    }
  }

  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setIsDetailModalOpen(true)
  }

  const formatValue = (value: any) => {
    if (value === null || value === undefined || value === 'N/A' || value === '') return '-'
    
    if (typeof value === 'string') {
      const genderMap: Record<string, string> = {
        'MALE': 'Nam',
        'FEMALE': 'Nữ',
        'OTHER': 'Khác',
        'Nam': 'Nam',
        'Nữ': 'Nữ',
        'Khác': 'Khác'
      }
      if (Object.keys(genderMap).includes(value)) {
        return genderMap[value]
      }
    }
    
    return value.toString()
  }

  const getRoleName = (role: any) => {
    if (!role) return '-'
    const roleMap: Record<string, string> = {
      'ROLE_USER': 'Sinh viên',
      'ROLE_TEACHER': 'Giảng viên',
      'ROLE_ADMIN': 'Quản trị viên',
      'student': 'Sinh viên',
      'teacher': 'Giảng viên',
      'admin': 'Quản trị viên'
    }
    if (typeof role === 'string') {
      return roleMap[role] || role
    }
    return roleMap[role.name] || role.name
  }

  const isAdmin = (user: User) => {
    const role = user.role as string | Role;
    if (typeof role === 'string') {
      return role === 'ROLE_ADMIN' || role === 'admin';
    }
    if (typeof role === 'object' && role?.name) {
      return role.name === 'ROLE_ADMIN' || role.name === 'admin';
    }
    return false;
  }

  const canModifyUser = (user: User) => {
    return !isAdmin(user);
  }

  const filteredUsers = users.filter(user =>
    (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.code?.toString().toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleModalSubmit = async (userData: Partial<User>, imageFile?: File) => {
    try {
      let success;
      if (selectedUser) {
        success = await handleUpdateUser(userData, imageFile)
      } else {
        success = await handleCreateUser(userData, imageFile)
      }
      if (success) {
        setIsModalOpen(false)
        setSelectedUser(null)
      }
    } catch (error) {
      throw error
    }
  }

  if (loading) {
    return <div>Đang tải...</div>
  }

  return (
    <Card className="max-w-[1200px] mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Quản lý người dùng</CardTitle>
          <Button onClick={() => {
            setSelectedUser(null)
            setModalTitle('Thêm người dùng mới')
            setIsModalOpen(true)
          }} className="bg-green-600 hover:bg-green-700">
            <UserPlus className="mr-2 h-4 w-4" />
            Thêm người dùng
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên, email hoặc mã số..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Mã số</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((user) => (
                <TableRow
                  key={user.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={(e) => {
                    // Prevent row click when clicking action buttons
                    if ((e.target as HTMLElement).closest('button')) {
                      return;
                    }
                    handleViewUser(user);
                  }}
                >
                  <TableCell className="font-medium">{user.id}</TableCell>
                  <TableCell>
                    {user.code !== null && user.code !== undefined ? user.code : '-'}
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.imageUrl || ''} />
                      <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {user.name}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={isAdmin(user) ? "destructive" : "default"}>
                      {getRoleName(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={user.isEnabled ? "bg-green-500 hover:bg-green-600 text-white" : ""}
                      variant={user.isEnabled ? "default" : "secondary"}
                    >
                      {user.isEnabled ? 'Hoạt động' : 'Vô hiệu'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {canModifyUser(user) && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUser(user);
                              setModalTitle('Cập nhật người dùng');
                              setIsModalOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUserToDelete(user);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => handlePageChange(page)}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>

      {/* Modals */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTimeout(() => setSelectedUser(null), 300);
        }}
        onSubmit={handleModalSubmit}
        user={selectedUser || undefined}
        title={modalTitle}
      />

      <UserDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedUser(null)
        }}
        user={selectedUser}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Người dùng này sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              handleDeleteUser(userToDelete?.id || 0)
              setIsDeleteDialogOpen(false)
            }}>
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
} 
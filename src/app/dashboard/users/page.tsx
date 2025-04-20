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
import { Pencil, Trash2, UserPlus, Search } from 'lucide-react'
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

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | undefined>()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const data = await userService.getUsers()
      console.log('Users data:', data)
      setUsers(data)
    } catch (error) {
      console.error('Lỗi khi lấy danh sách người dùng:', error)
      toast.error('Không thể tải danh sách người dùng')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (userData: Partial<User>) => {
    try {
      await userService.createUser(userData)
      toast.success('Tạo người dùng thành công')
      fetchUsers()
    } catch (error) {
      console.error('Lỗi khi tạo người dùng:', error)
      toast.error('Không thể tạo người dùng')
    }
  }

  const handleUpdateUser = async (userData: Partial<User>) => {
    if (!selectedUser?.id) return
    try {
      await userService.updateUser(selectedUser.id, userData)
      toast.success('Cập nhật người dùng thành công')
      fetchUsers()
    } catch (error) {
      console.error('Lỗi khi cập nhật người dùng:', error)
      toast.error('Không thể cập nhật người dùng')
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete?.id) return
    try {
      await userService.deleteUser(userToDelete.id)
      toast.success('Xóa người dùng thành công')
      fetchUsers()
    } catch (error) {
      console.error('Lỗi khi xóa người dùng:', error)
      toast.error('Không thể xóa người dùng')
    } finally {
      setIsDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  const formatValue = (value: any) => {
    // Debug log
    console.log('Formatting value:', value, 'Type:', typeof value);
    
    if (value === null || value === undefined || value === 'N/A' || value === '') return '-'
    
    // Xử lý hiển thị giới tính
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
    // Log để debug
    console.log('Checking role for user:', user.name, 'Role:', user.role);
    
    const role = user.role;
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

  if (loading) {
    return <div>Đang tải...</div>
  }

  return (
    <Card className="max-w-[1200px] mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Quản lý người dùng</CardTitle>
          <Button onClick={() => {
            setSelectedUser(undefined)
            setIsModalOpen(true)
          }} className="bg-green-600 hover:bg-green-700">
            <UserPlus className="mr-2 h-4 w-4" />
            Thêm người dùng
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm người dùng..."
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
                <TableHead className="w-[50px]">ID</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mã số</TableHead>
                <TableHead>Lớp</TableHead>
                <TableHead>Giới tính</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{formatValue(user.id)}</TableCell>
                  <TableCell>{formatValue(user.name)}</TableCell>
                  <TableCell>{formatValue(user.email)}</TableCell>
                  <TableCell>{formatValue(user.code)}</TableCell>
                  <TableCell>{formatValue(user.className)}</TableCell>
                  <TableCell>{formatValue(user.gender)}</TableCell>
                  <TableCell>{formatValue(user.phoneNumber)}</TableCell>
                  <TableCell className="font-medium">{getRoleName(user.role)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.isEnabled 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {user.isEnabled ? 'Hoạt động' : 'Vô hiệu'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {!isAdmin(user) && (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedUser(user)
                            setIsModalOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => {
                            setUserToDelete(user)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedUser(undefined)
        }}
        onSubmit={selectedUser ? handleUpdateUser : handleCreateUser}
        user={selectedUser}
        title={selectedUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
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
            <AlertDialogAction onClick={handleDeleteUser} className="bg-red-500 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
} 
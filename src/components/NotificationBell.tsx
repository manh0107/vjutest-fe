import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

// Định nghĩa type Notification nếu chưa có
interface Notification {
  id: number;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data: {
    classId: number;
    className: string;
    userName?: string;
  };
}

// Nhận prop role hoặc lấy từ context nếu muốn phân biệt student/teacher
export default function NotificationBell({ role }: { role?: 'student' | 'teacher' }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (role === 'student') {
      setNotifications([
        {
          id: 1,
          type: 'JOIN_APPROVED',
          message: 'Bạn đã được duyệt vào lớp C-123456 (Toán cao cấp)',
          isRead: false,
          createdAt: new Date().toISOString(),
          data: { classId: 1, className: 'C-123456' }
        },
        {
          id: 2,
          type: 'REMOVED_FROM_CLASS',
          message: 'Bạn đã bị xóa khỏi lớp C-654321 (Vật lý đại cương)',
          isRead: false,
          createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
          data: { classId: 2, className: 'C-654321' }
        },
        {
          id: 3,
          type: 'TEACHER_INVITE_APPROVED',
          message: 'Giáo viên Nguyễn Thị B đã chấp nhận lời mời tham gia lớp C-789012 (Hóa học cơ bản)',
          isRead: true,
          createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
          data: { classId: 3, className: 'C-789012', userName: 'Nguyễn Thị B' }
        }
      ]);
      setUnreadCount(2);
    } else if (role === 'teacher') {
      setNotifications([
        {
          id: 4,
          type: 'JOIN_REQUEST',
          message: 'Học sinh Nguyễn Văn A vừa gửi yêu cầu tham gia lớp C-123456 (Toán cao cấp)',
          isRead: false,
          createdAt: new Date().toISOString(),
          data: { classId: 1, className: 'C-123456', userName: 'Nguyễn Văn A' }
        },
        {
          id: 5,
          type: 'JOIN_APPROVED',
          message: 'Học sinh Nguyễn Văn A đã được duyệt vào lớp C-123456 (Toán cao cấp)',
          isRead: false,
          createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
          data: { classId: 1, className: 'C-123456', userName: 'Nguyễn Văn A' }
        },
        {
          id: 6,
          type: 'LEAVE_CLASS',
          message: 'Học sinh Trần Thị C đã rời khỏi lớp C-123456 (Toán cao cấp)',
          isRead: true,
          createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
          data: { classId: 1, className: 'C-123456', userName: 'Trần Thị C' }
        },
        {
          id: 7,
          type: 'TEACHER_INVITE_APPROVED',
          message: 'Giáo viên Lê Văn D đã chấp nhận lời mời tham gia lớp C-123456 (Toán cao cấp)',
          isRead: false,
          createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
          data: { classId: 1, className: 'C-123456', userName: 'Lê Văn D' }
        },
        {
          id: 8,
          type: 'LEAVE_CLASS',
          message: 'Giáo viên Nguyễn Thị E đã rời khỏi lớp C-123456 (Toán cao cấp)',
          isRead: true,
          createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
          data: { classId: 1, className: 'C-123456', userName: 'Nguyễn Thị E' }
        }
      ]);
      setUnreadCount(3);
    } else {
      // Nếu không truyền role, fake cả hai loại
      setNotifications([
        // Student
        {
          id: 1,
          type: 'JOIN_APPROVED',
          message: 'Bạn đã được duyệt vào lớp C-123456 (Toán cao cấp)',
          isRead: false,
          createdAt: new Date().toISOString(),
          data: { classId: 1, className: 'C-123456' }
        },
        {
          id: 2,
          type: 'REMOVED_FROM_CLASS',
          message: 'Bạn đã bị xóa khỏi lớp C-654321 (Vật lý đại cương)',
          isRead: false,
          createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
          data: { classId: 2, className: 'C-654321' }
        },
        // Teacher
        {
          id: 4,
          type: 'JOIN_REQUEST',
          message: 'Học sinh Nguyễn Văn A vừa gửi yêu cầu tham gia lớp C-123456 (Toán cao cấp)',
          isRead: false,
          createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
          data: { classId: 1, className: 'C-123456', userName: 'Nguyễn Văn A' }
        },
        {
          id: 5,
          type: 'JOIN_APPROVED',
          message: 'Học sinh Nguyễn Văn A đã được duyệt vào lớp C-123456 (Toán cao cấp)',
          isRead: false,
          createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
          data: { classId: 1, className: 'C-123456', userName: 'Nguyễn Văn A' }
        }
      ]);
      setUnreadCount(3);
    }
  }, [role]);

  return (
    <div className="relative">
      <button
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50 border border-[#e5e7eb]">
          <div className="px-4 py-2 flex justify-between items-center border-b border-[#e5e7eb]">
            <h3 className="font-semibold text-gray-700">Thông báo</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-3 text-center text-gray-500">
                Không có thông báo nào
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`w-full text-left px-4 py-3 hover:bg-[#f7f7f7] border-b border-[#e5e7eb] ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: vi
                        })}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-1" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
} 
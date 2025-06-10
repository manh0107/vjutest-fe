import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Image from 'next/image';
import NotificationBell from '@/components/NotificationBell';

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <header id="navbar" className="bg-white border-b border-[#e5e7eb] flex items-center justify-between px-4 md:px-8 py-2 shadow-sm">
      <div className="flex items-center gap-3">
        <Image src="/vju_logo.svg" alt="VJU Logo" width={40} height={40} className="rounded-full" />
        <span className="text-2xl font-bold text-[#b8021e] tracking-tight">VJUTest</span>
      </div>
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm"
            className="w-full pl-10 pr-4 py-2 rounded-full bg-[#f7f7f7] text-gray-700 border border-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-[#b8021e] transition"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <NotificationBell />
        <div className="relative">
          <Avatar className="w-10 h-10 border-2 border-[#1f701f] cursor-pointer" onClick={() => setShowDropdown((v) => !v)}>
            <AvatarImage src={user?.imageUrl || '/avatar-default.png'} alt={user?.name || 'avatar'} />
            <AvatarFallback>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-[#e5e7eb]">
              <div className="px-4 py-2 text-gray-700 font-semibold border-b border-[#e5e7eb]">{user?.name || 'Sinh viên'}</div>
              <button
                className="w-full text-left px-4 py-2 hover:bg-[#f7f7f7] text-gray-700"
                onClick={() => { setShowDropdown(false); router.push('/student/profile'); }}
              >
                Thông tin cá nhân
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-[#f7f7f7] text-gray-700"
                onClick={() => { setShowDropdown(false); router.push('/student/history'); }}
              >
                Lịch sử làm bài
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-[#f7f7f7] text-[#b8021e] border-t border-[#e5e7eb]"
                onClick={() => { setShowDropdown(false); handleLogout(); }}
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 
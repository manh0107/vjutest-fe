"use client"
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import React, { ReactNode } from 'react';
import Navbar from '../student/components/Navbar';
import Footer from '../student/components/Footer';
import { SidebarTeacher } from '@/components/dashboard/SidebarTeacher';
import { Header } from '@/components/dashboard/Header';

export default function TeacherLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const isExamPage = pathname.includes('/teacher/exams/');

  useEffect(() => {
    const publicPaths = ['/login', '/register', '/forgot-password', '/verify'];
    if (!loading) {
      if (!user || user.role !== 'teacher') {
        if (!publicPaths.some((p) => pathname.startsWith(p))) {
          router.push('/login');
        }
      }
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || user.role !== 'teacher') {
    if (['/login', '/register', '/forgot-password', '/verify'].some((p) => pathname.startsWith(p))) {
      return <>{children}</>;
    }
    return null;
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex min-h-screen">
      <SidebarTeacher />
      <div className="flex-1 pl-60 pt-20 bg-gray-50 min-h-screen">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
} 
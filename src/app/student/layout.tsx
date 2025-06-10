"use client"
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import React from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const isExamPage = pathname.includes('/student/exams/');

  useEffect(() => {
    const publicPaths = ['/login', '/register', '/forgot-password', '/verify'];
    if (!loading) {
      if (!user || user.role !== 'student') {
        if (!publicPaths.some((p) => pathname.startsWith(p))) {
          router.push('/login');
        }
      }
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
      </div>
    );
  }

  if (!user || user.role !== 'student') {
    if (['/login', '/register', '/forgot-password', '/verify'].some((p) => pathname.startsWith(p))) {
      return <>{children}</>;
    }
    return null;
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!isExamPage && <Navbar />}
      <main className="max-w-7xl mx-auto py-8 px-4">
        {children}
      </main>
      {!isExamPage && <Footer />}
    </div>
  );
} 
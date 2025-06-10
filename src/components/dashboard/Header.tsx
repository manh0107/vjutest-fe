'use client'

import { useAuth } from '@/contexts/AuthContext'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'

export function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="flex h-16 items-center justify-between p-4 fixed top-0 left-60 w-[calc(100%-15rem)] z-40" style={{ background: '#b71c1c' }}>
      <div>
        <h1 className="text-xl font-semibold text-white">Chào mừng, {user?.name}!</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="border-white text-white hover:bg-white hover:text-[#b71c1c] rounded transition">
          <ThemeToggle />
        </div>
        <Button className="bg-white text-[#b71c1c] font-bold border-none hover:bg-gray-100" onClick={logout}>
          Đăng xuất
        </Button>
      </div>
    </header>
  )
} 
'use client'

import { useAuth } from '@/context/AuthContext'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'

export function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div>
        <h1 className="text-2xl font-bold">Chào mừng, {user?.username}!</h1>
        <p className="text-sm text-muted-foreground">
          Vai trò: {user?.role}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Button variant="outline" onClick={logout}>
          Đăng xuất
        </Button>
      </div>
    </header>
  )
} 
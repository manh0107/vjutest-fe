'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/theme-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <main className="relative flex min-h-screen flex-col">
          {children}
        </main>
        <Toaster 
          position="top-right"
          toastOptions={{
            unstyled: true,
            classNames: {
              toast: "group p-4 pr-12 rounded-lg shadow-lg relative border-l-4 bg-white dark:bg-gray-900",
              title: "font-medium text-base mb-1",
              description: "text-sm",
              actionButton: "bg-primary text-primary-foreground",
              cancelButton: "bg-muted text-muted-foreground",
              success: "[&>div>.sonner-title]:text-emerald-700 [&>div>.sonner-description]:text-emerald-600 [&>div>.sonner-closeButton]:bg-emerald-100 [&>div>.sonner-closeButton]:text-emerald-700 border-emerald-500 dark:[&>div>.sonner-title]:text-emerald-300 dark:[&>div>.sonner-description]:text-emerald-400 dark:[&>div>.sonner-closeButton]:bg-emerald-900/30 dark:[&>div>.sonner-closeButton]:text-emerald-300",
              error: "[&>div>.sonner-title]:text-rose-700 [&>div>.sonner-description]:text-rose-600 [&>div>.sonner-closeButton]:bg-rose-100 [&>div>.sonner-closeButton]:text-rose-700 border-rose-500 dark:[&>div>.sonner-title]:text-rose-300 dark:[&>div>.sonner-description]:text-rose-400 dark:[&>div>.sonner-closeButton]:bg-rose-900/30 dark:[&>div>.sonner-closeButton]:text-rose-300",
              info: "[&>div>.sonner-title]:text-blue-700 [&>div>.sonner-description]:text-blue-600 [&>div>.sonner-closeButton]:bg-blue-100 [&>div>.sonner-closeButton]:text-blue-700 border-blue-500 dark:[&>div>.sonner-title]:text-blue-300 dark:[&>div>.sonner-description]:text-blue-400 dark:[&>div>.sonner-closeButton]:bg-blue-900/30 dark:[&>div>.sonner-closeButton]:text-blue-300",
              warning: "[&>div>.sonner-title]:text-amber-700 [&>div>.sonner-description]:text-amber-600 [&>div>.sonner-closeButton]:bg-amber-100 [&>div>.sonner-closeButton]:text-amber-700 border-amber-500 dark:[&>div>.sonner-title]:text-amber-300 dark:[&>div>.sonner-description]:text-amber-400 dark:[&>div>.sonner-closeButton]:bg-amber-900/30 dark:[&>div>.sonner-closeButton]:text-amber-300",
              closeButton: "absolute right-2 top-2 rounded-md w-6 h-6 inline-flex items-center justify-center hover:opacity-90 transition-all",
            },
          }}
          theme="system"
          duration={4000}
          visibleToasts={5}
          closeButton
          expand
          gap={8}
          offset={50}
          invert={false}
          richColors={false}
        />
      </ThemeProvider>
    </AuthProvider>
  )
} 
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, FileText, GraduationCap, BarChart } from "lucide-react"
import { useAuth } from '@/contexts/AuthContext'
import { Badge } from "@/components/ui/badge"
import { BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell } from 'recharts'
import api from '@/services/axios'
import { PieChart, Pie, Cell as PieCell, Legend as PieLegend } from 'recharts'

interface DashboardStats {
  totalUsers: number
  totalClasses: number
  totalExams: number
  totalSubjects: number
  recentResults: {
    id: number
    exam: {
      id: number
      name: string
    }
    user: {
      id: number
      username: string
    }
    score: number
    isSubmitted: boolean
    isPassed: boolean
    startTime: string
    endTime: string
    submitTime: string
    allowRetake: boolean
  }[]
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/api/dashboard/stats')
        setStats(response.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive">Error</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  // Chuẩn bị dữ liệu cho biểu đồ
  const chartData = [
    { name: 'Người dùng', value: stats?.totalUsers || 0, color: '#b8021e' },
    { name: 'Lớp học', value: stats?.totalClasses || 0, color: '#1f701f' },
    { name: 'Bài kiểm tra', value: stats?.totalExams || 0, color: '#1976d2' },
    { name: 'Môn học', value: stats?.totalSubjects || 0, color: '#f9a825' },
  ];

  // Dữ liệu cho PieChart điểm bài kiểm tra gần nhất
  const latestResult = stats?.recentResults && stats.recentResults.length > 0 ? stats.recentResults[0] : null;
  const pieData = latestResult ? [
    { name: 'Điểm đạt được', value: latestResult.score, color: '#b8021e' },
    { name: 'Điểm còn lại', value: Math.max(0, 10 - latestResult.score), color: '#e0e0e0' }, // Giả sử tổng điểm là 10
  ] : [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-2 md:px-0 pb-10">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {chartData.map((item) => (
          <Card key={item.name} className="rounded-2xl shadow-lg border-t-4" style={{ borderTopColor: item.color }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold" style={{ color: item.color }}>{item.name}</CardTitle>
              <div className="rounded-full p-2 bg-gray-100">
                {item.name === 'Người dùng' && <Users className="h-6 w-6" style={{ color: item.color }} />}
                {item.name === 'Lớp học' && <GraduationCap className="h-6 w-6" style={{ color: item.color }} />}
                {item.name === 'Bài kiểm tra' && <FileText className="h-6 w-6" style={{ color: item.color }} />}
                {item.name === 'Môn học' && <BookOpen className="h-6 w-6" style={{ color: item.color }} />}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-center" style={{ color: item.color }}>{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Biểu đồ tổng quan */}
      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="rounded-2xl shadow-lg flex-1">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#b8021e]">Thống kê tổng quan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} barCategoryGap={30} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontWeight: 600, fontSize: 15 }} />
                  <YAxis allowDecimals={false} label={{ value: 'Số lượng', angle: -90, position: 'insideLeft', fontSize: 14, fontWeight: 600 }} />
                  <Tooltip />
                  <Legend formatter={() => 'Số lượng'} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} name="Số lượng">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        {/* Biểu đồ tròn PieChart */}
        <Card className="rounded-2xl shadow-lg flex-1 flex flex-col items-center justify-center">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#b8021e]">Điểm bài kiểm tra gần nhất</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            {latestResult ? (
              <>
                <PieChart width={220} height={220}>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((entry, idx) => (
                      <PieCell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <PieLegend />
                </PieChart>
                <div className="mt-4 text-center">
                  <div className="font-semibold text-base text-[#b8021e]">{latestResult.exam?.name}</div>
                  <div className="text-gray-500 text-sm">Mã: <span className="font-bold">{latestResult.exam?.id}</span></div>
                </div>
              </>
            ) : (
              <div className="text-gray-400 text-center">Chưa có kết quả bài kiểm tra nào</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Kết quả gần đây */}
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-[#b8021e]">Kết quả bài kiểm tra gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recentResults && stats.recentResults.length > 0 ? stats.recentResults.map((result) => (
              <div
                key={result.id}
                className="flex flex-col md:flex-row md:items-center justify-between rounded-xl border p-4 bg-gradient-to-r from-[#f7f8fa] to-[#e6eaf3] shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center gap-4 mb-2 md:mb-0">
                  <div className="rounded-full bg-[#b8021e]/10 p-2">
                    <FileText className="h-7 w-7 text-[#b8021e]" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg text-[#b8021e]">{result.exam?.name}</div>
                    <div className="text-gray-500 text-sm">Điểm: <span className="font-bold text-[#1976d2]">{result.score}</span></div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={result.isPassed ? "default" : "destructive"} className="text-base px-4 py-1 rounded-full">
                    {result.isPassed ? "Đạt" : "Không đạt"}
                  </Badge>
                  {result.submitTime && (
                    <span className="text-gray-400 text-sm">{new Date(result.submitTime).toLocaleString('vi-VN')}</span>
                  )}
                </div>
              </div>
            )) : (
              <p className="text-center text-muted-foreground">Chưa có kết quả bài kiểm tra nào</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
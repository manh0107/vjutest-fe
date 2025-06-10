"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { toast } from 'sonner'

interface Result {
  id: number
  examId: number
  examName: string
  userId: number
  userName: string
  score: number
  submitTime: string
  startTime?: string
  endTime?: string
  isSubmitted?: boolean
  isPassed?: boolean
  studentName?: string
  studentCode?: string
  studentAvatar?: string
  examCode?: string
  subjectName?: string
  chapterName?: string
}

export default function ResultView() {
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchResults = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/results')
      if (response.ok) {
        const data = await response.json()
        setResults(data)
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách kết quả:', error)
      toast.error('Không thể lấy danh sách kết quả')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResults()
  }, [])

  const filteredResults = results.filter(result =>
    (result.examName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (result.userName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div>Đang tải...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kết quả bài kiểm tra</CardTitle>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Tìm kiếm theo tên bài kiểm tra hoặc tên sinh viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Bài kiểm tra</TableHead>
              <TableHead>Sinh viên</TableHead>
              <TableHead>Điểm số</TableHead>
              <TableHead>Thời gian nộp bài</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResults.map((result) => (
              <TableRow key={result.id}>
                <TableCell>{result.id}</TableCell>
                <TableCell>{result.examName || '-'}</TableCell>
                <TableCell>{result.userName || result.studentName || '-'}</TableCell>
                <TableCell>{result.score ?? '-'}</TableCell>
                <TableCell>
                  {result.submitTime ? format(new Date(result.submitTime), 'dd/MM/yyyy HH:mm', { locale: vi }) : '-'}
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    Xem chi tiết
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
} 
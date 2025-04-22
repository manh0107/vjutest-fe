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
  examTitle: string
  userId: number
  username: string
  score: number
  totalQuestions: number
  submittedAt: string
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
    result.examTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div>Đang tải...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exam Results</CardTitle>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search results..."
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
              <TableHead>Exam</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Total Questions</TableHead>
              <TableHead>Submitted At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResults.map((result) => (
              <TableRow key={result.id}>
                <TableCell>{result.id}</TableCell>
                <TableCell>{result.examTitle}</TableCell>
                <TableCell>{result.username}</TableCell>
                <TableCell>{result.score}</TableCell>
                <TableCell>{result.totalQuestions}</TableCell>
                <TableCell>
                  {format(new Date(result.submittedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    View Details
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
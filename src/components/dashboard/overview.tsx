import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Exam } from "@/services/types"

interface OverviewProps {
  exams: Exam[]
}

export function Overview({ exams }: OverviewProps) {
  // Group exams by month
  const data = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    const monthExams = exams.filter(exam => {
      const examDate = new Date(exam.createdAt)
      return examDate.getMonth() + 1 === month
    })
    return {
      name: `Tháng ${month}`,
      total: monthExams.length
    }
  })

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  )
} 
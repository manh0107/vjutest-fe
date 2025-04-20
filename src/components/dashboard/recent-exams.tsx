import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Exam } from "@/services/types"

interface RecentExamsProps {
  exams: Exam[]
}

export function RecentExams({ exams }: RecentExamsProps) {
  return (
    <div className="space-y-8">
      {exams.map((exam) => (
        <Card key={exam.id}>
          <CardHeader>
            <CardTitle>{exam.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{exam.description}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Thời gian: {new Date(exam.startAt).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 
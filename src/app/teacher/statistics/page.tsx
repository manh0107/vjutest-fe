"use client";

import { useState, useEffect } from "react";
import { FiBarChart2, FiUsers, FiFileText, FiCheckCircle } from "react-icons/fi";
import { useAuth } from "@/contexts/AuthContext";
import { API_URL } from "@/config";

interface Statistics {
  totalClasses: number;
  totalExams: number;
  totalQuestions: number;
  totalStudents: number;
  recentExams: {
    id: number;
    title: string;
    subject: {
      name: string;
    };
    averageScore: number;
    completionRate: number;
  }[];
}

export default function TeacherStatisticsPage() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        // Fetch total classes
        const classesResponse = await fetch(`${API_URL}/classes/teacher/${user?.id}`);
        const classesData = await classesResponse.json();

        // Fetch total exams
        const examsResponse = await fetch(`${API_URL}/exams/teacher/${user?.id}`);
        const examsData = await examsResponse.json();

        // Fetch total questions
        const questionsResponse = await fetch(`${API_URL}/questions/teacher/${user?.id}`);
        const questionsData = await questionsResponse.json();

        // Calculate total students
        const totalStudents = classesData.reduce((acc: number, cls: any) => acc + (cls.studentCount || 0), 0);

        // Get recent exams with statistics
        const recentExams = examsData.slice(0, 5).map((exam: any) => ({
          id: exam.id,
          title: exam.title,
          subject: exam.subject,
          averageScore: Math.random() * 100, // Placeholder, replace with actual data
          completionRate: Math.random() * 100, // Placeholder, replace with actual data
        }));

        setStatistics({
          totalClasses: classesData.length,
          totalExams: examsData.length,
          totalQuestions: questionsData.length,
          totalStudents,
          recentExams,
        });
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchStatistics();
    }
  }, [user?.id]);

  const StatCard = ({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">{value}</p>
        </div>
        <div className="p-3 bg-[#b8021e] bg-opacity-10 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Thống kê</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b8021e]"></div>
        </div>
      ) : statistics ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Tổng số lớp học"
              value={statistics.totalClasses}
              icon={<FiUsers className="w-6 h-6 text-[#b8021e]" />}
            />
            <StatCard
              title="Tổng số bài thi"
              value={statistics.totalExams}
              icon={<FiFileText className="w-6 h-6 text-[#b8021e]" />}
            />
            <StatCard
              title="Tổng số câu hỏi"
              value={statistics.totalQuestions}
              icon={<FiBarChart2 className="w-6 h-6 text-[#b8021e]" />}
            />
            <StatCard
              title="Tổng số học viên"
              value={statistics.totalStudents}
              icon={<FiUsers className="w-6 h-6 text-[#b8021e]" />}
            />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Bài thi gần đây</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tiêu đề
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Môn học
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Điểm trung bình
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tỷ lệ hoàn thành
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {statistics.recentExams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{exam.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{exam.subject.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{exam.averageScore.toFixed(1)}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{exam.completionRate.toFixed(1)}%</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500">Không có dữ liệu thống kê</div>
      )}
    </div>
  );
} 
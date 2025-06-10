"use client";

import { useState, useEffect } from "react";
import { FiPlus, FiSearch, FiFilter, FiEdit2, FiTrash2, FiEye } from "react-icons/fi";
import { useAuth } from "@/contexts/AuthContext";
import { API_URL } from "@/config";

interface Question {
  id: number;
  content: string;
  subject: {
    name: string;
  };
  chapter: {
    name: string;
  };
  type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  createdAt: string;
}

export default function TeacherQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`${API_URL}/questions/teacher/${user?.id}`);
        const data = await response.json();
        setQuestions(data);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchQuestions();
    }
  }, [user?.id]);

  const filteredQuestions = questions.filter((question) =>
    question.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.chapter.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeText = (type: string) => {
    switch (type) {
      case "SINGLE_CHOICE":
        return "Chọn một đáp án";
      case "MULTIPLE_CHOICE":
        return "Chọn nhiều đáp án";
      case "TRUE_FALSE":
        return "Đúng/Sai";
      default:
        return type;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "bg-green-100 text-green-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "HARD":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "Dễ";
      case "MEDIUM":
        return "Trung bình";
      case "HARD":
        return "Khó";
      default:
        return difficulty;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý câu hỏi</h1>
        <button className="flex items-center px-4 py-2 bg-[#b8021e] text-white rounded-lg hover:bg-[#a00018] transition-colors">
          <FiPlus className="mr-2" />
          Tạo câu hỏi mới
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm câu hỏi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b8021e] focus:border-transparent"
            />
          </div>
          <button className="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50">
            <FiFilter className="mr-2" />
            Lọc
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b8021e]"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nội dung
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Môn học
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chương
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại câu hỏi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Độ khó
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuestions.map((question) => (
                  <tr key={question.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 line-clamp-2">{question.content}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{question.subject.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{question.chapter.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{getTypeText(question.type)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getDifficultyColor(question.difficulty)}`}>
                        {getDifficultyText(question.difficulty)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(question.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-[#b8021e] hover:text-[#a00018] mr-4">
                        <FiEye className="inline-block" />
                      </button>
                      <button className="text-[#b8021e] hover:text-[#a00018] mr-4">
                        <FiEdit2 className="inline-block" />
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <FiTrash2 className="inline-block" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 
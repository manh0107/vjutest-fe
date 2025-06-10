'use client';
import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/services/axios';
import { BookOpen, GraduationCap, CheckCircle, XCircle, ListChecks } from 'lucide-react';
import { chapterService } from '@/services/chapterService';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ExamResultPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.examId;
  const [result, setResult] = useState<any>(null);
  const [stat, setStat] = useState<{ correct: number; wrong: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chapters, setChapters] = useState<any[]>([]);

  useEffect(() => {
    async function fetchResult() {
      setLoading(true);
      setError(null);
      try {
        const [res, statRes] = await Promise.all([
          api.get(`/exams/latest-result`, { params: { examId } }),
          api.get(`/exams/latest-result-stat`, { params: { examId } })
        ]);
        setResult(res.data);
        setStat(statRes.data);
      } catch (e: any) {
        setError(e.response?.data?.message || 'Không thể lấy kết quả bài kiểm tra');
      } finally {
        setLoading(false);
      }
    }
    if (examId) fetchResult();
  }, [examId]);

  useEffect(() => {
    async function fetchChapters() {
      try {
        const subjectId = result?.subjectId || result?.exam?.subject?.id;
        if (subjectId) {
          const data = await chapterService.getChapters(subjectId);
          setChapters(data);
        }
      } catch (e) {
        // ignore error for chapters
      }
    }
    if (result) fetchChapters();
  }, [result]);

  if (loading) return <div className="text-gray-400 text-center mt-10">Đang tải kết quả...</div>;
  if (error) return <div className="text-red-600 font-semibold text-center mt-10">{error}</div>;
  if (!result || !stat) return null;

  const correct = stat.correct || 0;
  const wrong = stat.wrong || 0;
  const total = correct + wrong || 1;
  const data = {
    labels: ['Đúng', 'Sai'],
    datasets: [
      {
        data: [correct, wrong],
        backgroundColor: ['#22c55e', '#ef4444'],
        borderWidth: 2,
      },
    ],
  };

  const passScore = result.passScore || result.exam?.passScore || 0;
  const passed = result.score >= passScore;

  // Lấy danh sách chương từ result.exam.chapters nếu có
  const chapterList = result.exam?.chapters || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center py-10">
      <div className="text-4xl font-extrabold text-blue-700 mb-8 flex items-center gap-4">
        <CheckCircle className="w-10 h-10 text-green-500" />
        <span>Kết quả bài kiểm tra</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mb-10">
        {/* Thông tin sinh viên */}
        <div className="bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center border-t-4 border-blue-400">
          <GraduationCap className="w-10 h-10 text-blue-500 mb-2" />
          <img src={result.studentAvatar || result.user?.imageUrl || '/avatar.png'} className="w-24 h-24 rounded-full mb-4 object-cover border-4 border-blue-200" alt="avatar" />
          <div className="font-bold text-xl mb-1 text-black">{result.studentName || result.user?.name}</div>
          <div className="text-black mb-1">Mã SV: {result.studentCode || result.user?.code}</div>
        </div>
        {/* Thông tin bài kiểm tra */}
        <div className="bg-white rounded-3xl shadow-xl p-8 flex flex-col gap-3 border-t-4 border-green-400">
          <BookOpen className="w-10 h-10 text-green-500 mb-2" />
          <div className="font-bold text-lg text-black"><b>Tên bài kiểm tra:</b> {result.examName || result.exam?.name}</div>
          <div className="text-black"><b>Mã bài kiểm tra:</b> {result.examCode || result.exam?.examCode}</div>
          <div className="text-black"><b>Môn học:</b> {result.subjectName || result.exam?.subjectName || result.exam?.subject?.name}</div>
          <div className="text-black"><b>Điểm đạt:</b> {passScore}</div>
        </div>
        {/* Chương học */}
        <div className="bg-white rounded-3xl shadow-xl p-8 flex flex-col gap-3 border-t-4 border-yellow-400">
          <ListChecks className="w-10 h-10 text-yellow-500 mb-2" />
          <div className="font-bold text-lg mb-2 text-black">Chương học của bài kiểm tra</div>
          {chapterList.length > 0 ? (
            <ul className="list-disc pl-5 text-black space-y-1">
              {chapterList.map((ch: any, idx: number) => (
                <li key={ch.id} className="font-medium text-black">Chương {idx + 1}: {ch.name}</li>
              ))}
            </ul>
          ) : (
            <div className="text-black italic">Không có chương học</div>
          )}
        </div>
      </div>
      {/* Kết quả tổng quan */}
      <div className="bg-white rounded-3xl shadow-xl p-10 flex flex-col items-center max-w-2xl w-full mb-10 border-t-4 border-indigo-400">
        <div className="flex flex-col md:flex-row items-center gap-10 w-full">
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-green-600">{correct} / {total}</div>
            <div className="text-black">Câu đúng</div>
            <div className="text-3xl font-bold text-red-500">{wrong} / {total}</div>
            <div className="text-black">Câu sai</div>
          </div>
          <div className="w-36 h-36">
            <Pie data={data} />
          </div>
          <div className="flex flex-col items-center">
            <div className={`text-5xl font-extrabold ${passed ? 'text-blue-600' : 'text-red-600'}`}>{result.score}</div>
            <div className="text-black">Điểm số</div>
            <div className={`mt-2 px-4 py-2 rounded-xl font-bold text-lg ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{passed ? 'ĐỖ' : 'KHÔNG ĐỖ'}</div>
          </div>
        </div>
      </div>
      {/* Nút về trang chủ căn giữa */}
      <div className="flex justify-center">
        <button className="px-8 py-4 rounded-2xl bg-gray-200 text-black font-bold shadow hover:bg-gray-300 transition text-lg" onClick={() => router.push('/student')}>Về trang chủ</button>
      </div>
    </div>
  );
} 
"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { publicApi } from "@/services/axios";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!password || password.length < 6) {
      setError("Mật khẩu phải từ 6 ký tự trở lên");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    if (!token) {
      setError("Thiếu mã xác thực đổi mật khẩu");
      return;
    }
    setLoading(true);
    try {
      await publicApi.post(`/auth/reset-password?token=${encodeURIComponent(token)}&newPassword=${encodeURIComponent(password)}`);
      setSuccess("Đổi mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.");
      setTimeout(() => router.push('/login'), 2000);
    } catch (e: any) {
      setError(e?.response?.data || "Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7f8fa] to-[#e6eaf3] py-8 px-4">
      <div className="w-full max-w-2xl md:max-w-4xl bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
        {/* Ảnh minh họa */}
        <div className="md:w-1/2 h-64 md:h-auto flex-shrink-0 flex items-center justify-center bg-white relative">
          <img src="/bia.png" alt="Đổi mật khẩu" className="max-h-full max-w-full object-contain" style={{ width: '100%', height: '100%' }} />
        </div>
        {/* Form đổi mật khẩu */}
        <div className="md:w-1/2 flex flex-col justify-center p-8">
          <h2 className="text-3xl font-extrabold text-[#b8021e] text-center mb-6">Đặt lại mật khẩu</h2>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block font-medium mb-1 text-[#b8021e]">Mật khẩu mới</label>
              <input
                type="password"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-[#b8021e] focus:ring-2 focus:ring-[#b8021e]/20 outline-none text-gray-900 bg-gray-50"
                placeholder="Nhập mật khẩu mới"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-[#b8021e]">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-[#b8021e] focus:ring-2 focus:ring-[#b8021e]/20 outline-none text-gray-900 bg-gray-50"
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            {error && <div className="text-red-600 text-center font-semibold">{error}</div>}
            {success && <div className="text-green-600 text-center font-semibold">{success}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-full bg-[#b8021e] text-white font-semibold text-lg shadow hover:bg-[#a00018] transition disabled:opacity-60 flex items-center justify-center"
            >
              {loading ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></span> : null}
              {loading ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 
"use client"

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { publicApi } from "@/services/axios";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Email không hợp lệ");
      return;
    }
    if (!code.trim()) {
      setError("Vui lòng nhập mã xác thực");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await publicApi.post("/auth/verify", {
        verifyEmailCode: code
      }, {
        params: { email }
      });
      setSuccess("Xác thực email thành công! Vui lòng đăng nhập.");
      setTimeout(() => router.push("/login"), 2000);
    } catch (e: any) {
      setError(e.response?.data || "Xác thực thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-5">
        <h2 className="text-2xl font-bold text-center text-[#b8021e] mb-2">Xác thực email</h2>
        <p className="text-center text-gray-600 mb-4">
          Vui lòng nhập mã xác thực đã được gửi đến email {email}
        </p>
        {error && <div className="text-red-600 text-center font-semibold">{error}</div>}
        {success && <div className="text-green-600 text-center font-semibold">{success}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Mã xác thực</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="input"
              placeholder="Nhập mã xác thực"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-full bg-[#b8021e] text-white font-semibold text-lg shadow hover:bg-[#a00018] transition flex items-center justify-center disabled:opacity-60"
            disabled={loading}
          >
            {loading ? (
              <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></span>
            ) : null}
            Xác thực
          </button>
        </form>
      </div>
      <style jsx>{`
        .input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
          background: #f9f9f9;
          font-size: 1rem;
          margin-bottom: 0.25rem;
          transition: border 0.2s;
        }
        .input:focus {
          border: 1.5px solid #b8021e;
          outline: none;
          background: #fff;
        }
      `}</style>
    </div>
  );
} 
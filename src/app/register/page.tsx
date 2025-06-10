"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { publicApi } from "@/services/axios";
import { departmentService } from "@/services/departmentService";
import { majorService } from "@/services/majorService";

interface Department {
  id: number;
  name: string;
}
interface Major {
  id: number;
  name: string;
  departmentId: number;
}

export default function RegisterPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [filteredMajors, setFilteredMajors] = useState<Major[]>([]);
  const [form, setForm] = useState({
    name: "",
    code: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    departmentId: "",
    majorId: "",
    roleName: "student",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [depsData, majorsData] = await Promise.all([
          departmentService.getAllDepartments(),
          majorService.getAllMajors()
        ]);
        setDepartments(depsData);
        setMajors(majorsData);
      } catch (error) {
        console.error('Error loading departments and majors:', error);
        setError('Không thể tải danh sách khoa và ngành');
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (form.departmentId) {
      setFilteredMajors(majors.filter(m => String(m.departmentId) === form.departmentId));
      setForm(f => ({ ...f, majorId: "" }));
    } else {
      setFilteredMajors([]);
      setForm(f => ({ ...f, majorId: "" }));
    }
  }, [form.departmentId, majors]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const validate = () => {
    if (!form.name.trim()) return "Vui lòng nhập họ tên";
    if (!form.code.trim()) return "Vui lòng nhập mã số sinh viên/giáo viên";
    if (!form.phoneNumber.trim()) return "Vui lòng nhập số điện thoại";
    if (!form.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return "Email không hợp lệ";
    if (!form.password || form.password.length < 6) return "Mật khẩu phải từ 6 ký tự";
    if (form.password !== form.confirmPassword) return "Mật khẩu xác nhận không khớp";
    if (!form.gender) return "Vui lòng chọn giới tính";
    if (!form.departmentId) return "Vui lòng chọn khoa";
    if (!form.majorId) return "Vui lòng chọn ngành";
    if (!form.roleName) return "Vui lòng chọn vai trò";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted");
    const err = validate();
    if (err) {
      console.log("Validation error:", err);
      return setError(err);
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("Sending registration request with data:", {
        name: form.name,
        code: Number(form.code),
        phoneNumber: Number(form.phoneNumber),
        email: form.email,
        password: form.password,
        gender: form.gender,
        department: departments.find(d => String(d.id) === form.departmentId)?.name,
        major: majors.find(m => String(m.id) === form.majorId)?.name,
        roleName: form.roleName,
      });
      
      await publicApi.post("/auth/register", {
        name: form.name,
        code: Number(form.code),
        phoneNumber: Number(form.phoneNumber),
        email: form.email,
        password: form.password,
        gender: form.gender,
        department: departments.find(d => String(d.id) === form.departmentId)?.name,
        major: majors.find(m => String(m.id) === form.majorId)?.name,
        roleName: form.roleName,
      });
      console.log("Registration successful");
      router.push(`/verify?email=${encodeURIComponent(form.email)}`);
    } catch (e: any) {
      console.error("Registration error:", e);
      setError(e.response?.data || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg space-y-5" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold text-center text-[#b8021e] mb-2">Đăng ký tài khoản</h2>
        {error && <div className="text-red-600 text-center font-semibold">{error}</div>}
        {success && <div className="text-green-600 text-center font-semibold">{success}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Họ tên</label>
            <input name="name" value={form.name} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label className="block font-medium mb-1">Mã số SV/GV</label>
            <input name="code" value={form.code} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label className="block font-medium mb-1">Số điện thoại</label>
            <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label className="block font-medium mb-1">Email</label>
            <input name="email" value={form.email} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label className="block font-medium mb-1">Mật khẩu</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label className="block font-medium mb-1">Xác nhận mật khẩu</label>
            <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label className="block font-medium mb-1">Giới tính</label>
            <select name="gender" value={form.gender} onChange={handleChange} className="input" required>
              <option value="">Chọn</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Khoa</label>
            <select name="departmentId" value={form.departmentId} onChange={handleChange} className="input" required>
              <option value="">Chọn khoa</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Ngành</label>
            <select name="majorId" value={form.majorId} onChange={handleChange} className="input" required disabled={!form.departmentId}>
              <option value="">Chọn ngành</option>
              {filteredMajors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Vai trò</label>
            <select name="roleName" value={form.roleName} onChange={handleChange} className="input" required>
              <option value="student">Sinh viên</option>
              <option value="teacher">Giáo viên</option>
            </select>
          </div>
        </div>
        <button type="submit" className="w-full py-2 rounded-full bg-[#b8021e] text-white font-semibold text-lg shadow hover:bg-[#a00018] transition flex items-center justify-center disabled:opacity-60" disabled={loading}>
          {loading ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></span> : null}
          Đăng ký
        </button>
        <div className="text-center text-sm mt-2">
          Đã có tài khoản? <a href="/login" className="text-[#b8021e] hover:underline">Đăng nhập</a>
        </div>
      </form>
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
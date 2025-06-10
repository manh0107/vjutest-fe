"use client";
import { useState, useRef } from "react";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { publicApi } from '@/services/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, Loader2 } from 'lucide-react';

export default function StudentProfilePage() {
  const { user, loading } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [gender, setGender] = useState(user?.gender || "");
  const [avatar, setAvatar] = useState(user?.imageUrl || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-[#b8021e]" /></div>;
  if (!user) return <div className="text-center py-20 text-lg">Không tìm thấy thông tin người dùng.</div>;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatar(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("phoneNumber", String(phoneNumber));
      formData.append("gender", gender);
      if (avatarFile) formData.append("imageFile", avatarFile);
      await publicApi.put(`/users/update-profile`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Cập nhật thông tin thành công!");
      setAvatarFile(null);
    } catch (e: any) {
      toast.error(e?.response?.data || "Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setSaving(false);
    }
  };

  const handleSendResetPassword = async () => {
    setEmailSending(true);
    try {
      await publicApi.post(`/auth/forgot-password`, { email: user.email });
      toast.success("Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư!");
    } catch (e: any) {
      toast.error(e?.response?.data || "Không thể gửi email đặt lại mật khẩu!");
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-[#b8021e] mb-8 text-center">Thông tin cá nhân</h1>
      <form className="bg-white rounded-2xl shadow-xl p-8 space-y-8" onSubmit={handleSave}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <img
              src={avatar || "/avatar-default.png"}
              alt="Avatar"
              className="w-32 h-32 rounded-full object-cover border-4 border-[#b8021e] shadow-lg"
            />
            <button
              type="button"
              className="absolute bottom-2 right-2 bg-[#b8021e] text-white p-2 rounded-full shadow hover:bg-[#a00018] transition"
              onClick={() => fileInputRef.current?.click()}
              title="Đổi ảnh đại diện"
            >
              <Camera className="w-5 h-5" />
            </button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleAvatarChange}
            />
          </div>
          <div className="text-lg font-semibold text-[#b8021e]">{user.name}</div>
          <div className="text-gray-500">{user.email}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium mb-1 text-[#b8021e]">Họ và tên</label>
            <Input value={name} onChange={e => setName(e.target.value)} required disabled={saving} />
          </div>
          <div>
            <label className="block font-medium mb-1 text-[#b8021e]">Số điện thoại</label>
            <Input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} disabled={saving} />
          </div>
          <div>
            <label className="block font-medium mb-1 text-[#b8021e]">Giới tính</label>
            <select
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-[#b8021e] focus:ring-2 focus:ring-[#b8021e]/20 outline-none text-gray-900 bg-gray-50"
              value={gender}
              onChange={e => setGender(e.target.value)}
              disabled={saving}
            >
              <option value="">Chọn giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1 text-[#b8021e]">Mã sinh viên</label>
            <Input value={user.code || ""} disabled readOnly />
          </div>
          <div>
            <label className="block font-medium mb-1 text-[#b8021e]">Ngành/Khoa</label>
            <Input value={user.major?.name || user.department?.name || "-"} disabled readOnly />
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mt-6">
          <Button type="submit" className="bg-[#b8021e] hover:bg-[#a00018] text-white px-8 py-2 rounded-full font-semibold text-lg shadow" disabled={saving}>
            {saving ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : null}
            Lưu thay đổi
          </Button>
          <Button type="button" variant="outline" className="border-[#b8021e] text-[#b8021e] hover:bg-[#f7f8fa] rounded-full font-semibold text-lg px-8 py-2" onClick={handleSendResetPassword} disabled={emailSending}>
            {emailSending ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : null}
            Đổi mật khẩu
          </Button>
        </div>
      </form>
    </div>
  );
} 
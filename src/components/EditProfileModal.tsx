"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useThemeMode } from "@/context/ThemeModeContext";
import { X, User, Lock, Sparkles, Check, Image as ImageIcon, ShieldCheck } from "lucide-react";

// Danh sách avatar mẫu vui nhộn từ DiceBear
const AVATAR_PRESETS = [
  "https://api.dicebear.com/7.x/bottts/svg?seed=Felix",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Chloe",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Max",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Sam",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Charlie",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Milo",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Oscar",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Coco",
];

export const EditProfileModal: React.FC = () => {
  const { user, isEditProfileOpen, closeEditProfile, updateUserSession, openAuthModal } = useAuth();
  const { mode } = useThemeMode();

  const [fullName, setFullName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Đồng bộ state khi mở modal
  useEffect(() => {
    if (user && isEditProfileOpen) {
      setFullName(user.fullName || user.username || "");
      setSelectedAvatar(user.avatar || AVATAR_PRESETS[0]);
      setCustomAvatarUrl("");
      setNewPin("");
      setConfirmPin("");
      setErrorMessage("");
      setSuccessMessage("");
    }
  }, [user, isEditProfileOpen]);

  if (!isEditProfileOpen || !user) return null;

  const handleSelectPreset = (url: string) => {
    setSelectedAvatar(url);
    setCustomAvatarUrl("");
  };

  const handleCustomUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setCustomAvatarUrl(url);
    if (url.trim()) {
      setSelectedAvatar(url.trim());
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const trimmedName = fullName.trim();
    if (!trimmedName) {
      setErrorMessage("Vui lòng nhập tên hiển thị!");
      return;
    }

    // Nếu đổi PIN
    if (newPin || confirmPin) {
      if (user.isGuest) {
        setErrorMessage("Tài khoản khách không có mật khẩu PIN! Vui lòng đăng ký tài khoản chính thức.");
        return;
      }
      if (!/^\d{6}$/.test(newPin)) {
        setErrorMessage("Mật khẩu PIN mới phải là đúng 6 chữ số!");
        return;
      }
      if (newPin !== confirmPin) {
        setErrorMessage("Mật khẩu xác nhận không khớp!");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (user.isGuest) {
        // Khách: cập nhật cục bộ
        updateUserSession({
          username: trimmedName,
          fullName: trimmedName,
          avatar: selectedAvatar,
        });
        setSuccessMessage("Đã cập nhật hồ sơ khách thành công!");
        setTimeout(() => closeEditProfile(), 800);
        return;
      }

      // Người dùng đã đăng nhập: gọi API lưu lên database
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          username: user.username,
          fullName: trimmedName,
          avatarUrl: selectedAvatar,
          newPin: newPin || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Cập nhật hồ sơ thất bại!");
      } else {
        updateUserSession({
          fullName: data.user.fullName || trimmedName,
          avatar: data.user.avatar || selectedAvatar,
        });
        setSuccessMessage("Đã lưu thông tin hồ sơ thành công!");
        setTimeout(() => closeEditProfile(), 1000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Lỗi mạng khi lưu hồ sơ!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg rounded-3xl p-6 relative overflow-hidden transition-all shadow-2xl ${
          mode === "dark"
            ? "bg-[#10131d] border border-white/10 text-white"
            : "bg-[#FFFDF7] border-2 border-black text-black shadow-[6px_6px_0px_0px_#1C1917]"
        }`}
      >
        {/* Nút đóng */}
        <button
          onClick={closeEditProfile}
          className={`absolute top-4 right-4 p-2 rounded-xl border transition-all ${
            mode === "dark"
              ? "border-white/10 hover:bg-white/10 text-slate-300"
              : "border-2 border-black bg-white hover:bg-slate-100 text-black shadow-[2px_2px_0px_0px_#000]"
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Tiêu đề */}
        <div className="flex items-center gap-2.5 pb-4 border-b border-black/10">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${
              mode === "dark" ? "bg-violet-600/30 text-violet-300" : "bg-[#FDE047] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]"
            }`}
          >
            ✏️
          </div>
          <div>
            <h2 className="text-base font-black uppercase tracking-tight">
              Chỉnh Sửa Hồ Sơ Của Bạn
            </h2>
            <p className="text-[11px] opacity-70">
              Thay đổi hình ảnh đại diện, tên hiển thị và mật khẩu PIN
            </p>
          </div>
        </div>

        {/* Thông báo nếu là Khách */}
        {user.isGuest && (
          <div
            className={`mt-4 p-3 rounded-2xl text-xs font-bold flex items-center justify-between border ${
              mode === "dark"
                ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                : "bg-[#FEF08A] border-2 border-black text-black shadow-[2px_2px_0px_0px_#000]"
            }`}
          >
            <span>⭐ Bạn đang chơi với tư cách Khách.</span>
            <button
              onClick={() => {
                closeEditProfile();
                openAuthModal();
              }}
              className="underline font-black hover:opacity-80"
            >
              Đăng Ký Tài Khoản
            </button>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 pt-4">
          {/* Avatar Preview & Preset Selection */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 opacity-80">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
              Chọn Ảnh Đại Diện (Avatar)
            </label>

            <div className="flex items-center gap-4 p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
              {/* Big preview */}
              <div className="relative shrink-0">
                <div
                  className={`w-16 h-16 rounded-full overflow-hidden border-2 shadow-md ${
                    mode === "dark" ? "border-violet-500 bg-slate-900" : "border-black bg-[#FDE047]"
                  }`}
                >
                  <img
                    src={selectedAvatar || AVATAR_PRESETS[0]}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as any).src = AVATAR_PRESETS[0];
                    }}
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-white border border-black">
                  <Check className="w-2.5 h-2.5" />
                </div>
              </div>

              {/* Grid 8 presets */}
              <div className="flex-1">
                <div className="text-[10px] font-bold opacity-70 mb-1.5">Mẫu có sẵn:</div>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => handleSelectPreset(preset)}
                      className={`w-8 h-8 rounded-full overflow-hidden border transition-all ${
                        selectedAvatar === preset
                          ? "border-2 border-violet-500 scale-110 shadow-md ring-2 ring-violet-400"
                          : "border-black/20 dark:border-white/20 hover:scale-105 opacity-80"
                      }`}
                    >
                      <img src={preset} alt="preset" className="w-full h-full object-cover bg-slate-800" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom URL input */}
            <div className="relative">
              <ImageIcon className="w-3.5 h-3.5 opacity-50 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={customAvatarUrl}
                onChange={handleCustomUrlChange}
                placeholder="Hoặc dán đường dẫn ảnh tùy chỉnh (URL)..."
                className={`w-full rounded-2xl pl-9 pr-3 py-2 text-xs focus:outline-none transition-all ${
                  mode === "dark"
                    ? "bg-black/30 border border-white/10 text-white focus:border-violet-500"
                    : "bg-[#F7F4EB] border-2 border-black text-black focus:ring-1 focus:ring-black"
                }`}
              />
            </div>
          </div>

          {/* Tên hiển thị */}
          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 opacity-80">
              <User className="w-3.5 h-3.5" />
              Tên Hiển Thị (Display Name)
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nhập tên bạn muốn xuất hiện..."
              maxLength={24}
              required
              className={`w-full rounded-2xl px-3.5 py-2.5 text-xs font-bold focus:outline-none transition-all ${
                mode === "dark"
                  ? "bg-black/30 border border-white/10 text-white focus:border-violet-500"
                  : "bg-[#F7F4EB] border-2 border-black text-black focus:ring-2 focus:ring-black"
              }`}
            />
          </div>

          {/* Đổi mã PIN (Chỉ dành cho tài khoản chính thức) */}
          {!user.isGuest && (
            <div className="space-y-2 pt-2 border-t border-black/10">
              <label className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 opacity-80">
                <Lock className="w-3.5 h-3.5" />
                Đổi Mật Khẩu PIN 6 Số (Tùy Chọn)
              </label>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="PIN 6 số mới"
                  maxLength={6}
                  className={`rounded-2xl px-3 py-2 text-xs font-mono text-center tracking-widest font-black focus:outline-none ${
                    mode === "dark"
                      ? "bg-black/30 border border-white/10 text-white focus:border-violet-500"
                      : "bg-[#F7F4EB] border-2 border-black text-black"
                  }`}
                />
                <input
                  type="password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Xác nhận lại PIN"
                  maxLength={6}
                  className={`rounded-2xl px-3 py-2 text-xs font-mono text-center tracking-widest font-black focus:outline-none ${
                    mode === "dark"
                      ? "bg-black/30 border border-white/10 text-white focus:border-violet-500"
                      : "bg-[#F7F4EB] border-2 border-black text-black"
                  }`}
                />
              </div>
            </div>
          )}

          {/* Lỗi / Thành công */}
          {errorMessage && (
            <div className="p-2.5 rounded-xl text-xs font-bold bg-rose-500/10 border border-rose-500/30 text-rose-500">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-2.5 rounded-xl text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-500">
              {successMessage}
            </div>
          )}

          {/* Nút hành động */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={closeEditProfile}
              className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                mode === "dark"
                  ? "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                  : "bg-white hover:bg-slate-100 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]"
              }`}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-2.5 rounded-2xl text-xs font-black uppercase transition-transform active:scale-95 disabled:opacity-50 ${
                mode === "dark"
                  ? "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30"
                  : "bg-[#FDE047] text-black border-2 border-black shadow-[3px_3px_0px_0px_#1C1917]"
              }`}
            >
              {isSubmitting ? "Đang lưu..." : "Lưu Thay Đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useThemeMode } from "@/context/ThemeModeContext";
import { X, User, Lock, Sparkles, AlertCircle, LogIn, UserPlus } from "lucide-react";

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    loginWithPin,
    registerWithPin,
    loginWithGoogle,
    continueAsGuest,
  } = useAuth();
  const { mode } = useThemeMode();

  const [tab, setTab] = useState<"login" | "register">("login");
  const [nickname, setNickname] = useState("");
  const [pin, setPin] = useState("");
  const [guestName, setGuestName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanNick = nickname.trim().toLowerCase();
    if (!cleanNick) {
      setErrorMessage("Vui lòng nhập nickname!");
      return;
    }

    if (!/^\d{6}$/.test(pin)) {
      setErrorMessage("Mật khẩu phải là đúng 6 chữ số (0-9)!");
      return;
    }

    setIsSubmitting(true);
    let result;

    if (tab === "login") {
      result = await loginWithPin(cleanNick, pin);
    } else {
      result = await registerWithPin(cleanNick, pin);
    }

    setIsSubmitting(false);

    if (!result.success && result.error) {
      setErrorMessage(result.error);
    }
  };

  const handleGuest = () => {
    continueAsGuest(guestName.trim() || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className={`w-full max-w-md rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl transition-all ${
          mode === "dark"
            ? "bg-[#131726] border border-white/10 text-white"
            : "bg-[#FFFDF7] border-2 border-black shadow-[6px_6px_0px_0px_#1C1917] text-[#1C1917]"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FDE047] text-black border border-black flex items-center justify-center shadow-[1px_1px_0px_0px_#000]">
              🔔
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-tight">
                Gia Nhập GameShow
              </h2>
              <p className="text-[11px] opacity-70 font-medium">
                Chọn phương thức để bắt đầu tranh tài
              </p>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className={`p-1 rounded-xl transition-all ${
              mode === "dark"
                ? "hover:bg-white/10 text-slate-400"
                : "border-2 border-black bg-white hover:bg-slate-100 shadow-[2px_2px_0px_0px_#000]"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thông báo lỗi nếu có */}
        {errorMessage && (
          <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab chuyển Đăng nhập / Đăng ký */}
        <div className={`p-1 rounded-2xl flex gap-1 ${mode === "dark" ? "bg-black/30" : "bg-[#F7F4EB] border-2 border-black"}`}>
          <button
            type="button"
            onClick={() => {
              setTab("login");
              setErrorMessage("");
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-1.5 ${
              tab === "login"
                ? mode === "dark"
                  ? "bg-violet-600 text-white shadow-md"
                  : "bg-[#FDE047] text-black border border-black shadow-[1px_1px_0px_0px_#000]"
                : "opacity-60 hover:opacity-100"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Đăng Nhập
          </button>

          <button
            type="button"
            onClick={() => {
              setTab("register");
              setErrorMessage("");
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-1.5 ${
              tab === "register"
                ? mode === "dark"
                  ? "bg-violet-600 text-white shadow-md"
                  : "bg-[#FDE047] text-black border border-black shadow-[1px_1px_0px_0px_#000]"
                : "opacity-60 hover:opacity-100"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Đăng Ký Mới
          </button>
        </div>

        {/* FORM: Nickname + PIN 6 chữ số */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-black uppercase mb-1 opacity-80">
              Nickname (Không dấu, không khoảng trắng) *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                type="text"
                required
                value={nickname}
                onChange={(e) => setNickname(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                placeholder="VD: tuan_pro, minh99..."
                className={`w-full rounded-2xl pl-9 pr-3 py-2 text-xs font-bold focus:outline-none transition-all ${
                  mode === "dark"
                    ? "bg-black/30 border border-white/10 text-white focus:border-violet-500"
                    : "bg-white border-2 border-black text-black shadow-[2px_2px_0px_0px_#1C1917]"
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase mb-1 opacity-80">
              Mật khẩu PIN (Đúng 6 chữ số) *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                type="password"
                required
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="Nhập 6 số (VD: 123456)"
                className={`w-full rounded-2xl pl-9 pr-3 py-2 text-xs font-mono font-bold tracking-widest focus:outline-none transition-all ${
                  mode === "dark"
                    ? "bg-black/30 border border-white/10 text-white focus:border-violet-500"
                    : "bg-white border-2 border-black text-black shadow-[2px_2px_0px_0px_#1C1917]"
                }`}
              />
            </div>
            <span className="text-[10px] opacity-60 font-medium block mt-0.5">
              💡 Đơn giản, không cần xác thực email rườm rà.
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2.5 rounded-2xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 active:scale-98 ${
              mode === "dark"
                ? "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30"
                : "bg-[#FDE047] text-black border-2 border-black shadow-[3px_3px_0px_0px_#1C1917]"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            {isSubmitting
              ? "Đang xử lý..."
              : tab === "login"
              ? "Đăng Nhập Ngay"
              : "Tạo Tài Khoản & Lưu Database"}
          </button>
        </form>

        {/* PHẦN 2: Đăng nhập nhanh Google */}
        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-black/10" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-black">
            <span className={`px-2 rounded-md ${mode === "dark" ? "bg-[#131726] text-slate-400" : "bg-[#FFFDF7] text-slate-600"}`}>
              Hoặc đăng nhập nhanh
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={loginWithGoogle}
          className={`w-full py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2.5 ${
            mode === "dark"
              ? "bg-white/5 hover:bg-white/10 text-white border border-white/10"
              : "bg-white hover:bg-slate-50 text-black border-2 border-black shadow-[2px_2px_0px_0px_#1C1917]"
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Đăng nhập với Google</span>
        </button>

        {/* PHẦN 3: Chơi tài khoản Khách (Guest) */}
        <div className={`p-3 rounded-2xl border space-y-2 ${
          mode === "dark"
            ? "bg-black/20 border-white/5"
            : "bg-[#F7F4EB] border-2 border-black shadow-[2px_2px_0px_0px_#1C1917]"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-amber-500 flex items-center gap-1">
              <span>👤</span> Chơi Tài Khoản Khách (Guest)
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-500">
              Offline
            </span>
          </div>

          <p className="text-[10px] opacity-75 font-medium leading-relaxed">
            ⚠️ <strong>Lưu ý:</strong> Dữ liệu chỉ lưu trên máy này (localhost). Không lưu trên database, không xuất hiện trên Bảng Xếp Hạng online.
          </p>

          <div className="flex gap-1.5 pt-0.5">
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Tên khách (VD: Khách 99)..."
              className={`flex-1 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none ${
                mode === "dark"
                  ? "bg-black/40 border border-white/10 text-white"
                  : "bg-white border border-black text-black"
              }`}
            />
            <button
              type="button"
              onClick={handleGuest}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-transform active:scale-95 ${
                mode === "dark"
                  ? "bg-white/10 hover:bg-white/20 text-white"
                  : "bg-white hover:bg-slate-100 text-black border border-black shadow-[1px_1px_0px_0px_#000]"
              }`}
            >
              Vào Chơi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

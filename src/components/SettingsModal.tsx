"use client";

import React from "react";
import { useTheme, ThemeColor } from "@/context/ThemeContext";
import { X, Palette, Volume2, Video, Check } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme, themesList } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#121520] border border-white/10 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <Palette className="w-5 h-5 theme-accent-text" />
            <h2 className="font-extrabold text-base text-slate-100">
              Cài Đặt Hệ Thống & Giao Diện
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Đổi màu chủ đề (Theme Color) */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Màu Sắc Chủ Đề (Accent Color)
          </label>
          <p className="text-xs text-slate-400">
            Chọn tông màu giao diện bạn yêu thích để làm nổi bật các nút bấm, viền card và avatar.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            {themesList.map((t) => {
              const isSelected = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    isSelected
                      ? "border-white/40 bg-white/10 shadow-lg"
                      : "border-white/5 bg-[#171a27] hover:border-white/20"
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full shrink-0 shadow-md flex items-center justify-center"
                    style={{ backgroundColor: t.hex }}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                  </div>
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {t.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Thiết lập Âm thanh & Video */}
        <div className="space-y-3 pt-3 border-t border-white/5">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Tùy Chọn Thiết Bị
          </label>
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#171a27] border border-white/5">
            <div className="flex items-center gap-3 text-xs text-slate-200">
              <Volume2 className="w-4 h-4 text-slate-400" />
              <span>Hiệu ứng âm thanh Game Show (SFX)</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
              Đang Bật
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#171a27] border border-white/5">
            <div className="flex items-center gap-3 text-xs text-slate-200">
              <Video className="w-4 h-4 text-slate-400" />
              <span>Độ phân giải Webcam Avatar tròn</span>
            </div>
            <span className="text-[11px] font-bold text-slate-300 bg-white/5 px-2 py-0.5 rounded-lg border border-white/10">
              Chuẩn (240x240p)
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold theme-active-pill transition-transform active:scale-95"
          >
            Đóng Cài Đặt
          </button>
        </div>
      </div>
    </div>
  );
};

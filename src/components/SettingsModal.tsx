"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { X, Palette, Volume2, Video, Check, Sparkles } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme, themesList } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-[#FFFDF7] border-2 border-black rounded-3xl w-full max-w-md p-6 shadow-[6px_6px_0px_0px_#1C1917] space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-black">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FDE047] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#1C1917]">
              <Palette className="w-4 h-4 text-black" />
            </div>
            <h2 className="font-black text-base uppercase tracking-tight text-[#1C1917]">
              Cài Đặt & Đổi Màu UI
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl border-2 border-black bg-white hover:bg-slate-100 shadow-[2px_2px_0px_0px_#1C1917] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <X className="w-4 h-4 text-black" />
          </button>
        </div>

        {/* Bảng màu sắc Theme Pastel */}
        <div className="space-y-2.5">
          <label className="text-xs font-black uppercase tracking-wider text-[#1C1917] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            Bảng Màu Chủ Đạo (Accent Color)
          </label>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Chọn tông màu pastel mà bạn thích để biến đổi giao diện phòng đấu và các nút bấm.
          </p>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {themesList.map((t) => {
              const isSelected = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`p-2.5 rounded-2xl border-2 border-black text-left flex items-center gap-2.5 transition-all ${
                    isSelected
                      ? "bg-white shadow-[3px_3px_0px_0px_#1C1917] ring-2 ring-black"
                      : "bg-[#F7F4EB] hover:bg-white shadow-[2px_2px_0px_0px_#1C1917]"
                  }`}
                >
                  <div
                    className="w-6 h-6 rounded-full border-2 border-black shrink-0 shadow-[1px_1px_0px_0px_#1C1917] flex items-center justify-center"
                    style={{ backgroundColor: t.hex }}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                  </div>
                  <span className="text-xs font-extrabold text-[#1C1917] truncate">
                    {t.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Thiết lập Thiết Bị */}
        <div className="space-y-2 pt-2 border-t-2 border-black/10">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F7F4EB] border-2 border-black shadow-[2px_2px_0px_0px_#1C1917]">
            <div className="flex items-center gap-2.5 text-xs font-bold text-[#1C1917]">
              <Volume2 className="w-4 h-4" />
              <span>Âm thanh Game Show</span>
            </div>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#86EFAC] border border-black shadow-[1px_1px_0px_0px_#1C1917]">
              Bật
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F7F4EB] border-2 border-black shadow-[2px_2px_0px_0px_#1C1917]">
            <div className="flex items-center gap-2.5 text-xs font-bold text-[#1C1917]">
              <Video className="w-4 h-4" />
              <span>Webcam Tròn Avatar</span>
            </div>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#93C5FD] border border-black shadow-[1px_1px_0px_0px_#1C1917]">
              Sẵn sàng
            </span>
          </div>
        </div>

        {/* Nút đóng */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl text-xs font-black uppercase neo-btn-primary"
          >
            Lưu & Trở Về Sàn Đấu
          </button>
        </div>
      </div>
    </div>
  );
};

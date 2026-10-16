"use client";

import React from "react";
import { useThemeMode } from "@/context/ThemeModeContext";
import { Sun, Moon } from "lucide-react";

export const ThemeModeToggle: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { mode, toggleMode } = useThemeMode();

  return (
    <button
      onClick={toggleMode}
      title={mode === "dark" ? "Chuyển sang Chế độ Sáng (Light Mode)" : "Chuyển sang Chế độ Tối (Dark Mode)"}
      className={`p-2 rounded-2xl transition-all duration-200 flex items-center justify-center ${
        mode === "dark"
          ? "bg-white/10 hover:bg-white/15 text-yellow-400 border border-white/10"
          : "bg-white hover:bg-slate-100 text-slate-800 border-2 border-black shadow-[2px_2px_0px_0px_#1C1917]"
      } ${className}`}
    >
      {mode === "dark" ? (
        <Sun className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      ) : (
        <Moon className="w-4 h-4 fill-slate-800 text-slate-800" />
      )}
    </button>
  );
};

"use client";

import React from "react";
import { 
  Home, 
  Gamepad2, 
  ShoppingBag, 
  Trophy, 
  Settings, 
  Sparkles,
  Palette
} from "lucide-react";

export type NavTab = "home" | "games" | "creator" | "achievements";

interface SidebarNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenSettings: () => void;
  onOpenStudio: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenSettings,
  onOpenStudio,
}) => {
  const navItems = [
    { id: "home" as NavTab, label: "Home", icon: Home },
    { id: "games" as NavTab, label: "Games", icon: Gamepad2 },
    { id: "creator" as NavTab, label: "Purchases", icon: ShoppingBag, onClick: onOpenStudio },
    { id: "achievements" as NavTab, label: "Achievements", icon: Trophy },
  ];

  return (
    <aside className="w-full md:w-56 lg:w-60 flex flex-col justify-between py-6 px-4 bg-[#10131d]/90 border-r border-white/5 rounded-3xl shrink-0">
      <div className="space-y-8">
        {/* Logo Game Show */}
        <div className="flex items-center gap-2.5 px-3">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-slate-100 font-black border border-white/10">
            <Gamepad2 className="w-5 h-5 theme-accent-text" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Game</div>
            <div className="text-sm font-black text-slate-100 tracking-tight flex items-center gap-1">
              Show <span className="theme-accent-text">Together</span>
            </div>
          </div>
        </div>

        {/* Danh sách nút chức năng bên trái */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.onClick) {
                    item.onClick();
                  } else {
                    onSelectTab(item.id);
                  }
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? "theme-active-pill"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Nút Settings (Mở đổi màu & cài đặt) */}
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all duration-200"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </button>
        </nav>
      </div>

      {/* Widget nhỏ phía dưới Sidebar: Quick Theme Button */}
      <div className="p-3.5 rounded-2xl bg-[#171a27] border border-white/5 space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
          <span className="flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 theme-accent-text" />
            Đổi màu UI
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Live</span>
        </div>
        <button
          onClick={onOpenSettings}
          className="w-full py-2 rounded-xl text-[11px] font-bold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors"
        >
          Chọn bảng màu 🎨
        </button>
      </div>
    </aside>
  );
};

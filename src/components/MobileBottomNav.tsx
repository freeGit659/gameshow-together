"use client";

import React from "react";
import { Home, ListOrdered, ShoppingBag, Settings, PlusCircle } from "lucide-react";

export type MobileTab = "home" | "games" | "studio" | "settings";

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  onOpenSettings: () => void;
  onOpenStudio: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenSettings,
  onOpenStudio,
}) => {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md">
      <nav className="bg-white border-2 border-black rounded-3xl p-2 shadow-[4px_4px_0px_0px_#1C1917] flex items-center justify-around">
        {/* Tab 1: Home */}
        <button
          onClick={() => onSelectTab("home")}
          className={`flex items-center justify-center transition-all ${
            activeTab === "home"
              ? "bg-[#F472B6] border-2 border-black px-4 py-2 rounded-2xl shadow-[2px_2px_0px_0px_#1C1917]"
              : "p-2.5 text-slate-700 hover:bg-slate-100 rounded-xl"
          }`}
          title="Trang chủ"
        >
          <Home className="w-5 h-5 text-black stroke-[2.2]" />
        </button>

        {/* Tab 2: Danh sách Game / Đề */}
        <button
          onClick={() => onSelectTab("games")}
          className={`flex items-center justify-center transition-all ${
            activeTab === "games"
              ? "bg-[#FDE047] border-2 border-black px-4 py-2 rounded-2xl shadow-[2px_2px_0px_0px_#1C1917]"
              : "p-2.5 text-slate-700 hover:bg-slate-100 rounded-xl"
          }`}
          title="Danh sách Gameshow"
        >
          <ListOrdered className="w-5 h-5 text-black stroke-[2.2]" />
        </button>

        {/* Tab 3: Creator Studio */}
        <button
          onClick={onOpenStudio}
          className="flex items-center justify-center p-2.5 text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
          title="Creator Studio (Tạo đề)"
        >
          <ShoppingBag className="w-5 h-5 text-black stroke-[2.2]" />
        </button>

        {/* Tab 4: Cài đặt / Đổi màu */}
        <button
          onClick={onOpenSettings}
          className="flex items-center justify-center p-2.5 text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
          title="Cài đặt & Đổi màu"
        >
          <Settings className="w-5 h-5 text-black stroke-[2.2]" />
        </button>
      </nav>
    </div>
  );
};

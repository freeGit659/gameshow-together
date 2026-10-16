"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarNav, NavTab } from "@/components/SidebarNav";
import { RightSidebar } from "@/components/RightSidebar";
import { CreatorStudioModal } from "@/components/CreatorStudioModal";
import { CreatorPack } from "@/types/game";
import { generateRoomCode } from "@/lib/utils";
import { useThemeMode } from "@/context/ThemeModeContext";
import { useAuth } from "@/context/AuthContext";
import { ThemeModeToggle } from "@/components/ThemeModeToggle";
import { 
  Search, 
  Sparkles, 
  Play, 
  Flame, 
  Users, 
  ArrowRight, 
  PlusCircle, 
  Gamepad2, 
  Star 
} from "lucide-react";

interface DesktopHomeViewProps {
  packs: CreatorPack[];
  onSavePack: (pack: CreatorPack) => void;
}

export const DesktopHomeView: React.FC<DesktopHomeViewProps> = ({
  packs,
  onSavePack,
}) => {
  const router = useRouter();
  const { mode } = useThemeMode();
  const { user, ensureAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<"all" | "trending" | "free" | "popular">("all");

  const handleCreateRoom = (packId = "general-knowledge-official") => {
    ensureAuthenticated(() => {
      const code = generateRoomCode();
      const name = user?.username || "Thí sinh";
      router.push(`/room/${code}?isHost=true&packId=${packId}&name=${encodeURIComponent(name)}`);
    });
  };

  const handleJoinByCode = (codeToJoin?: string) => {
    ensureAuthenticated(() => {
      const code = (codeToJoin || roomCodeInput).trim().toUpperCase();
      if (!code) return;
      const name = user?.username || "Thí sinh";
      router.push(`/room/${code}?name=${encodeURIComponent(name)}`);
    });
  };

  const trendingShows = [
    {
      id: "rung-chuong-vang",
      title: "Đấu Trường Chuông Vàng",
      genre: "Real-time Survival Quiz 15s",
      players: "1.2K đang chơi",
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80",
      playable: true,
      tag: "HOT",
      rating: "4.9",
    },
    {
      id: "ai-la-trieu-phu",
      title: "Đấu Trường Triệu Phú",
      genre: "15 Câu Hỏi Leo Thang",
      players: "840 đang chơi",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80",
      playable: true,
      tag: "CLASSIC",
      rating: "4.8",
    },
    {
      id: "chiec-non-ky-dieu",
      title: "Vòng Xoay Ô Chữ",
      genre: "Đoán Chữ May Mắn",
      players: "620 đang chơi",
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80",
      playable: false,
      tag: "SẮP RA MẮT",
      rating: "4.7",
    },
  ];

  const filteredPacks = packs.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchSearch) return false;
    if (filterCategory === "free") return p.price === 0;
    if (filterCategory === "popular") return p.playsCount > 500;
    return true;
  });

  return (
    <div className="w-full min-h-screen p-4 lg:p-6 flex flex-col justify-center">
      <div className="w-full max-w-[1700px] mx-auto flex flex-row gap-6 items-stretch">
        
        {/* 1. CỘT TRÁI: Sidebar Chức năng */}
        <SidebarNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenSettings={() => {}}
          onOpenStudio={() => ensureAuthenticated(() => setIsStudioOpen(true))}
        />

        {/* 2. CỘT GIỮA: Nội dung chính Dashboard Gaming Desktop */}
        <main className="flex-1 flex flex-col gap-6 overflow-y-auto">
          {/* Thanh Search Bar trên cùng + Nút Toggle Sáng/Tối */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm game show, chủ đề, câu hỏi, nhà sáng tạo..."
                className={`w-full rounded-2xl pl-11 pr-4 py-3 text-xs focus:outline-none transition-all shadow-sm ${
                  mode === "dark"
                    ? "bg-[#10131d]/90 border border-white/5 text-slate-200 placeholder-slate-500 focus:border-white/20"
                    : "bg-white border-2 border-black text-black placeholder-slate-400 focus:ring-2 focus:ring-black shadow-[3px_3px_0px_0px_#1C1917]"
                }`}
              />
            </div>

            <ThemeModeToggle />

            <button
              onClick={() => handleCreateRoom()}
              className={`px-4 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shrink-0 transition-transform active:scale-95 ${
                mode === "dark"
                  ? "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30"
                  : "bg-[#FDE047] text-black border-2 border-black shadow-[3px_3px_0px_0px_#1C1917]"
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tạo Phòng Nhanh</span>
            </button>
          </div>

          {/* Featured Hero Banner lớn phong cách IT TAKES TWO */}
          <div
            className={`relative rounded-3xl overflow-hidden p-6 sm:p-8 flex items-center justify-between gap-6 shadow-2xl group ${
              mode === "dark"
                ? "border border-white/10 bg-gradient-to-r from-slate-950 via-[#181c2e] to-slate-950"
                : "border-2 border-black bg-gradient-to-r from-[#FFFDF7] via-[#FEF08A]/40 to-[#FFFDF7] shadow-[5px_5px_0px_0px_#1C1917]"
            }`}
          >
            <div className="relative z-10 space-y-4 max-w-md">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-500 border border-rose-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                Featured Game Show
              </div>

              <div>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                  ĐẤU TRƯỜNG <span className="text-violet-500">CHUÔNG VÀNG</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                  Tranh tài 15 câu hỏi sinh tồn theo thời gian thực cùng bạn bè. Bật webcam tròn để cùng chia sẻ trọn vẹn từng khoảnh khắc cảm xúc!
                </p>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <div className="text-lg font-black text-emerald-500">
                  Miễn Phí
                </div>
                <button
                  onClick={() => handleCreateRoom("general-knowledge-official")}
                  className={`px-6 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-transform active:scale-95 ${
                    mode === "dark"
                      ? "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30"
                      : "bg-[#FDE047] text-black border-2 border-black shadow-[3px_3px_0px_0px_#1C1917]"
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Vào Đấu Trường Ngay
                </button>
              </div>
            </div>

            <div className="relative z-10 w-44 h-44 flex items-center justify-center shrink-0">
              <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-300 border-2 border-black flex items-center justify-center text-7xl shadow-2xl group-hover:scale-105 transition-transform duration-300 animate-pulse">
                🔔
              </div>
            </div>
          </div>

          {/* Trending Games 🔥 */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold flex items-center gap-2">
                <span>Trending games</span>
                <Flame className="w-4 h-4 text-orange-500" />
              </h3>

              <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                {[
                  { id: "all", label: "Tất cả" },
                  { id: "trending", label: "🔥 Nổi bật" },
                  { id: "free", label: "Miễn phí" },
                  { id: "popular", label: "Nhiều người chơi" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterCategory(tab.id as any)}
                    className={`px-3 py-1 rounded-xl transition-all ${
                      filterCategory === tab.id
                        ? mode === "dark" ? "bg-violet-600 text-white font-bold" : "bg-[#FDE047] text-black border border-black font-black"
                        : "text-slate-400 hover:bg-white/5"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {trendingShows.map((game) => (
                <div
                  key={game.id}
                  onClick={() => game.playable && handleCreateRoom()}
                  className={`rounded-2xl overflow-hidden p-3 flex flex-col justify-between cursor-pointer group transition-all duration-200 ${
                    mode === "dark"
                      ? "bg-[#131726] border border-white/5 hover:border-white/20 hover:-translate-y-1"
                      : "bg-white border-2 border-black shadow-[3px_3px_0px_0px_#1C1917] hover:-translate-y-1"
                  }`}
                >
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-900 mb-3">
                    <img src={game.image} alt={game.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-[9px] font-black uppercase px-2 py-0.5 rounded-md text-white">
                      {game.tag}
                    </div>
                    <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-black/60 backdrop-blur-md text-[10px] font-bold px-1.5 py-0.5 rounded-md text-yellow-400">
                      <Star className="w-3 h-3 fill-yellow-400" />
                      {game.rating}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold truncate group-hover:text-violet-400 transition-colors">
                      {game.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{game.genre}</p>
                    <div className="text-[10px] font-semibold text-violet-400 mt-2 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {game.players}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Join & Recent Plays */}
          <div className="grid grid-cols-12 gap-5">
            <div
              className={`col-span-5 rounded-3xl p-5 flex flex-col justify-between space-y-4 ${
                mode === "dark" ? "bg-[#131726] border border-white/5" : "bg-white border-2 border-black shadow-[4px_4px_0px_0px_#1C1917]"
              }`}
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Trực Tiếp & Kết Nối</span>
                <h4 className="text-sm font-black mt-1 flex items-center gap-1.5">
                  <Gamepad2 className="w-4 h-4 text-violet-500" />
                  Gia Nhập Phòng Bằng Mã
                </h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Nhập mã 6 chữ cái để ngồi vào bàn chơi cùng bạn bè ngay.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                    placeholder="MÃ PHÒNG (VD: BELL99)"
                    className={`flex-1 rounded-2xl px-3 py-2.5 text-xs uppercase font-mono tracking-widest text-center font-bold focus:outline-none ${
                      mode === "dark" ? "bg-black/40 border border-white/10 text-white" : "bg-[#F7F4EB] border-2 border-black text-black"
                    }`}
                  />
                  <button
                    onClick={() => handleJoinByCode()}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold active:scale-95 transition-transform ${
                      mode === "dark" ? "bg-violet-600 text-white" : "bg-[#FDE047] text-black border-2 border-black shadow-[2px_2px_0px_0px_#1C1917]"
                    }`}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => ensureAuthenticated(() => setIsStudioOpen(true))}
                  className={`w-full py-2.5 rounded-2xl text-xs font-bold transition-colors flex items-center justify-center gap-2 ${
                    mode === "dark" ? "bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10" : "bg-[#F7F4EB] hover:bg-slate-100 text-black border-2 border-black shadow-[2px_2px_0px_0px_#1C1917]"
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Mở Creator Studio (Tạo đề)
                </button>
              </div>
            </div>

            <div
              className={`col-span-7 rounded-3xl p-5 space-y-3.5 ${
                mode === "dark" ? "bg-[#131726] border border-white/5" : "bg-white border-2 border-black shadow-[4px_4px_0px_0px_#1C1917]"
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase">Recent Game Packs</h4>
                <span className="text-[10px] text-slate-400 font-mono">{filteredPacks.length} gói đề</span>
              </div>

              <div className="space-y-2.5">
                {filteredPacks.slice(0, 3).map((pack) => {
                  const isFree = pack.price === 0;
                  return (
                    <div
                      key={pack.id}
                      className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                        mode === "dark" ? "bg-black/20 border border-white/5 hover:border-white/15" : "bg-[#F7F4EB] border-2 border-black shadow-[2px_2px_0px_0px_#1C1917]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-lg shrink-0">
                          {pack.isOfficial ? "🔔" : "💡"}
                        </div>
                        <div>
                          <div className="text-xs font-bold">{pack.title}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>Bởi: {pack.author}</span>
                            <span>•</span>
                            <span className="font-bold text-yellow-500">{isFree ? "Miễn phí" : `${pack.price.toLocaleString()}đ`}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCreateRoom(pack.id)}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          mode === "dark" ? "bg-violet-600/80 hover:bg-violet-600 text-white" : "bg-[#FDE047] text-black border border-black font-black"
                        }`}
                      >
                        Play
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>

        {/* 3. CỘT PHẢI: Profile & Leaderboard */}
        <RightSidebar
          onQuickJoinRoom={(code) => handleJoinByCode(code)}
        />
      </div>

      <CreatorStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        onSavePack={onSavePack}
      />
    </div>
  );
};

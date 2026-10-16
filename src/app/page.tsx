"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SidebarNav, NavTab } from "@/components/SidebarNav";
import { RightSidebar } from "@/components/RightSidebar";
import { SettingsModal } from "@/components/SettingsModal";
import { CreatorStudioModal } from "@/components/CreatorStudioModal";
import { DEFAULT_PACKS } from "@/lib/questions";
import { CreatorPack } from "@/types/game";
import { generateRoomCode } from "@/lib/utils";
import { 
  Search, 
  Sparkles, 
  Play, 
  Flame, 
  Users, 
  ArrowRight, 
  PlusCircle, 
  Gamepad2, 
  ShieldCheck, 
  Coins, 
  Star,
  Check
} from "lucide-react";

export default function GamingDashboard() {
  const router = useRouter();

  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  // User Profile
  const [playerName, setPlayerName] = useState("Aaron_J");
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<"all" | "trending" | "free" | "popular" | "creator">("all");

  // Game Packs
  const [packs, setPacks] = useState<CreatorPack[]>(DEFAULT_PACKS);

  // Load user data & saved custom packs
  useEffect(() => {
    const savedName = localStorage.getItem("gst_player_name");
    if (savedName) {
      setPlayerName(savedName);
    } else {
      const defaultName = `Thí Sinh ${Math.floor(100 + Math.random() * 900)}`;
      setPlayerName(defaultName);
      localStorage.setItem("gst_player_name", defaultName);
    }

    const savedPacks = localStorage.getItem("gst_creator_packs");
    if (savedPacks) {
      try {
        const parsed = JSON.parse(savedPacks);
        setPacks([...DEFAULT_PACKS, ...parsed]);
      } catch (e) {
        console.error("Error reading saved packs", e);
      }
    }
  }, []);

  const handleUpdateName = (name: string) => {
    setPlayerName(name);
    localStorage.setItem("gst_player_name", name);
  };

  const handleCreateRoom = (packId = "general-knowledge-official") => {
    const code = generateRoomCode();
    router.push(`/room/${code}?isHost=true&packId=${packId}&name=${encodeURIComponent(playerName)}`);
  };

  const handleJoinByCode = (codeToJoin?: string) => {
    const code = (codeToJoin || roomCodeInput).trim().toUpperCase();
    if (!code) return;
    router.push(`/room/${code}?name=${encodeURIComponent(playerName)}`);
  };

  const handleSavePack = (newPack: CreatorPack) => {
    const updated = [newPack, ...packs];
    setPacks(updated);
    const customOnly = updated.filter((p) => !p.isOfficial);
    localStorage.setItem("gst_creator_packs", JSON.stringify(customOnly));
  };

  // Danh mục Gameshow thịnh hành (Trending Game Shows)
  const trendingShows = [
    {
      id: "rung-chuong-vang",
      title: "Đấu Trường Chuông Vàng",
      genre: "Real-time Survival Quiz",
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

  // Lọc danh sách gói theo search và category
  const filteredPacks = packs.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchSearch) return false;

    if (filterCategory === "free") return p.price === 0;
    if (filterCategory === "creator") return !p.isOfficial;
    if (filterCategory === "popular") return p.playsCount > 500;
    return true;
  });

  return (
    <div className="flex-1 w-full min-h-screen p-2 sm:p-4 lg:p-6 flex flex-col justify-center">
      <div className="w-full max-w-[1700px] mx-auto flex flex-col md:flex-row gap-4 lg:gap-6 items-stretch">
        
        {/* 1. CỘT TRÁI: Sidebar Chức năng (Game, Purchases, Settings,...) */}
        <SidebarNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenStudio={() => setIsStudioOpen(true)}
        />

        {/* 2. CỘT GIỮA: Nội dung chính Dashboard Gaming */}
        <main className="flex-1 flex flex-col gap-6 overflow-y-auto">
          {/* Thanh Search Bar trên cùng (giống ảnh mẫu) */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm game show, chủ đề, câu hỏi, nhà sáng tạo..."
                className="w-full bg-[#10131d]/90 border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-white/20 transition-all shadow-sm"
              />
            </div>

            <button
              onClick={() => handleCreateRoom()}
              className="px-4 py-3 rounded-2xl text-xs font-bold theme-active-pill flex items-center gap-2 shrink-0 active:scale-95 transition-transform"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Tạo Phòng Nhanh</span>
            </button>
          </div>

          {/* Featured Hero Banner lớn (Phong cách IT TAKES TWO như ảnh mẫu) */}
          <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-r from-slate-950 via-[#181c2e] to-slate-950 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl group">
            {/* Background art glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-600/20 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 space-y-4 max-w-md">
              {/* Badge NEW hình ngôi sao nổi bật */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[11px] font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Featured Game Show
              </div>

              <div>
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                  ĐẤU TRƯỜNG <span className="theme-accent-text">CHUÔNG VÀNG</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  Tranh tài 15 câu hỏi sinh tồn theo thời gian thực cùng bạn bè. Bật webcam tròn để cùng chia sẻ trọn vẹn từng khoảnh khắc cảm xúc!
                </p>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <div className="text-lg font-black text-emerald-400">
                  Miễn Phí
                </div>
                <button
                  onClick={() => handleCreateRoom("general-knowledge-official")}
                  className="px-6 py-2.5 rounded-2xl text-xs font-bold theme-active-pill flex items-center gap-2 active:scale-95 transition-transform"
                >
                  <Play className="w-3.5 h-3.5 fill-white text-white" />
                  Vào Đấu Trường Ngay
                </button>
              </div>
            </div>

            {/* Mascot Visual / 3D Illustration */}
            <div className="relative z-10 w-44 h-44 sm:w-56 sm:h-56 flex items-center justify-center shrink-0">
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-300 flex items-center justify-center text-7xl shadow-2xl shadow-yellow-500/20 group-hover:scale-105 transition-transform duration-300 animate-pulse">
                🔔
              </div>
            </div>
          </div>

          {/* Phân mục: Trending Games 🔥 (Theo ảnh mẫu) */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
                <span>Trending games</span>
                <Flame className="w-4 h-4 text-orange-500" />
              </h3>

              {/* Filter Tabs bo tròn (Nổi bật, Miễn phí, Nhiều người chơi nhất,...) */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-semibold text-slate-400 bg-[#10131d]/60 p-1 rounded-2xl border border-white/5">
                {[
                  { id: "all", label: "Tất cả" },
                  { id: "trending", label: "🔥 Nổi bật" },
                  { id: "free", label: "Miễn phí" },
                  { id: "popular", label: "Nhiều người chơi" },
                  { id: "creator", label: "Creator Workshop" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterCategory(tab.id as any)}
                    className={`px-3 py-1 rounded-xl transition-all ${
                      filterCategory === tab.id
                        ? "theme-active-pill font-bold"
                        : "hover:text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Danh sách 3 game nổi bật nằm ngang giống hệt ảnh mẫu (Halo, Humankind, Biomutant) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {trendingShows.map((game) => (
                <div
                  key={game.id}
                  onClick={() => game.playable && handleCreateRoom()}
                  className={`rounded-2xl overflow-hidden gaming-card gaming-card-hover p-3 flex flex-col justify-between cursor-pointer group relative ${
                    !game.playable ? "opacity-75" : ""
                  }`}
                >
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-900 mb-3">
                    <img
                      src={game.image}
                      alt={game.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md text-white">
                      {game.tag}
                    </div>
                    <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-black/60 backdrop-blur-md text-[10px] font-bold px-1.5 py-0.5 rounded-md text-yellow-400">
                      <Star className="w-3 h-3 fill-yellow-400" />
                      {game.rating}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-100 group-hover:text-violet-400 transition-colors truncate">
                      {game.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {game.genre}
                    </p>
                    <div className="text-[10px] theme-accent-text font-semibold mt-2 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {game.players}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hàng Dưới: Chia 2 cột (Accessories / Quick Join bên trái + Recent Plays bên phải như ảnh mẫu) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Box Trái (Accessories / Quick Join): Nhập mã phòng hoặc Tạo bộ đề */}
            <div className="lg:col-span-5 rounded-3xl gaming-card p-5 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Trực Tiếp & Kết Nối
                </span>
                <h4 className="text-sm font-black text-slate-100 mt-1 flex items-center gap-1.5">
                  <Gamepad2 className="w-4 h-4 theme-accent-text" />
                  Gia Nhập Phòng Bằng Mã
                </h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Nhập mã 6 chữ cái để ngồi vào bàn chơi cùng bạn bè ngay lập tức.
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
                    className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-3 py-2.5 text-xs uppercase font-mono tracking-widest text-slate-100 focus:outline-none focus:border-white/30 text-center font-bold"
                  />
                  <button
                    onClick={() => handleJoinByCode()}
                    className="px-4 py-2.5 rounded-2xl text-xs font-bold theme-active-pill active:scale-95 transition-transform"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => setIsStudioOpen(true)}
                  className="w-full py-2.5 rounded-2xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-3.5 h-3.5 theme-accent-text" />
                  Mở Creator Studio (Tạo đề)
                </button>
              </div>
            </div>

            {/* Box Phải (Recent plays - Theo ảnh mẫu: list Horizon, Call of Duty kèm nút Play) */}
            <div className="lg:col-span-7 rounded-3xl gaming-card p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-100 uppercase tracking-wider">
                  Bộ Đề Nổi Bật (Recent Game Packs)
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">
                  {filteredPacks.length} gói đề
                </span>
              </div>

              <div className="space-y-2.5">
                {filteredPacks.slice(0, 3).map((pack) => {
                  const isFree = pack.price === 0;
                  return (
                    <div
                      key={pack.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-[#141724]/70 border border-white/5 hover:border-white/15 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform">
                          {pack.isOfficial ? "🔔" : "💡"}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-100 group-hover:text-violet-400 transition-colors">
                            {pack.title}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>Bởi: {pack.author}</span>
                            <span>•</span>
                            <span className="font-semibold text-yellow-400">
                              {isFree ? "Miễn phí" : `${pack.price.toLocaleString()}đ`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCreateRoom(pack.id)}
                        className="px-4 py-1.5 rounded-xl text-xs font-bold border border-white/10 hover:border-white/30 text-slate-200 hover:text-white transition-all group-hover:theme-active-pill"
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

        {/* 3. CỘT PHẢI: Profile, Bạn Bè Online, Bảng Xếp Hạng Người Chơi */}
        <RightSidebar
          playerName={playerName}
          onUpdatePlayerName={handleUpdateName}
          onQuickJoinRoom={(code) => handleJoinByCode(code)}
        />
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <CreatorStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        onSavePack={handleSavePack}
      />
    </div>
  );
}

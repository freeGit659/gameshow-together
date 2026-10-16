"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MobileBottomNav, MobileTab } from "@/components/MobileBottomNav";
import { SettingsModal } from "@/components/SettingsModal";
import { CreatorStudioModal } from "@/components/CreatorStudioModal";
import { DEFAULT_PACKS } from "@/lib/questions";
import { CreatorPack } from "@/types/game";
import { generateRoomCode } from "@/lib/utils";
import { 
  Sparkles, 
  ArrowRight, 
  RefreshCw, 
  Video, 
  VideoOff, 
  Plus, 
  Lock, 
  Flame, 
  Users, 
  HelpCircle,
  Play
} from "lucide-react";

export default function MobileGameShowApp() {
  const router = useRouter();

  // Navigation states
  const [activeTab, setActiveTab] = useState<MobileTab>("home");
  const [showWelcomeView, setShowWelcomeView] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  // User Profile
  const [playerName, setPlayerName] = useState("Pablo");
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Packs
  const [packs, setPacks] = useState<CreatorPack[]>(DEFAULT_PACKS);

  // Camera preview in profile
  const [isCamActive, setIsCamActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const savedName = localStorage.getItem("gst_player_name");
    if (savedName) {
      setPlayerName(savedName);
    } else {
      setPlayerName("Pablo");
      localStorage.setItem("gst_player_name", "Pablo");
    }

    const savedPacks = localStorage.getItem("gst_creator_packs");
    if (savedPacks) {
      try {
        setPacks([...DEFAULT_PACKS, ...JSON.parse(savedPacks)]);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleCreateRoom = (packId = "general-knowledge-official") => {
    const code = generateRoomCode();
    router.push(`/room/${code}?isHost=true&packId=${packId}&name=${encodeURIComponent(playerName)}`);
  };

  const handleJoinByCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = roomCodeInput.trim().toUpperCase();
    if (!code) return;
    router.push(`/room/${code}?name=${encodeURIComponent(playerName)}`);
  };

  const handleToggleCam = async () => {
    if (isCamActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setIsCamActive(false);
      if (videoRef.current) videoRef.current.srcObject = null;
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 180, height: 180 },
          audio: false,
        });
        streamRef.current = stream;
        setIsCamActive(true);
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        alert("Vui lòng cho phép quyền truy cập camera trên trình duyệt!");
      }
    }
  };

  const handleSavePack = (newPack: CreatorPack) => {
    const updated = [newPack, ...packs];
    setPacks(updated);
    const customOnly = updated.filter((p) => !p.isOfficial);
    localStorage.setItem("gst_creator_packs", JSON.stringify(customOnly));
  };

  return (
    <div className="min-h-screen bg-[#F7F4EB] text-[#1C1917] flex justify-center pb-24 selection:bg-yellow-300">
      {/* Mobile App Container (Tối ưu hoàn hảo cho màn hình điện thoại & căn giữa trang nhã trên PC) */}
      <div className="w-full max-w-md sm:max-w-lg min-h-screen flex flex-col px-4 py-5 space-y-5">
        
        {/* Status Bar Mockup nhỏ gọn (9:41 AM) như ảnh mẫu */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-800 px-1 pt-1">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono">5G</span>
            <div className="w-5 h-2.5 rounded-sm border border-black p-0.5 flex items-center">
              <div className="h-full w-full bg-black rounded-xs" />
            </div>
          </div>
        </div>

        {/* =========================================================================
            MÀN HÌNH 1: WELCOME SCREEN (Như ảnh bên trái của người dùng)
           ========================================================================= */}
        {showWelcomeView ? (
          <div className="flex-1 flex flex-col justify-between py-6 space-y-6 animate-in fade-in duration-200">
            {/* Top Brand Tag */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-700">
                <span>19</span>
                <span className="text-sm font-black tracking-normal px-2 py-0.5 rounded-lg border border-black bg-white shadow-[1px_1px_0px_0px_#000]">
                  GAMESHOW
                </span>
                <span>26</span>
              </div>
            </div>

            {/* Retro Graphic Title */}
            <div className="space-y-4 pt-4 relative">
              <div className="relative">
                <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight leading-[1.15] text-[#1C1917]">
                  CREATE <br />
                  A CUSTOM <br />
                  GAMESHOW <br />
                  WITH <span className="bg-[#FDA4AF] px-1.5 py-0.5 rounded-lg border-2 border-black inline-block shadow-[2px_2px_0px_0px_#000]">PABLO</span>
                </h1>

                {/* Huy hiệu tem vàng răng cưa giống ảnh mẫu */}
                <div className="absolute -top-3 right-2 w-14 h-14 rounded-full bg-[#FDE047] border-2 border-black flex items-center justify-center text-xl shadow-[2px_2px_0px_0px_#000] rotate-12">
                  🔔
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed max-w-sm">
                Chào mừng bạn đến với sàn đấu gameshow tương tác thời gian thực! Thử thách kiến thức 15 câu kịch tính cùng bạn bè qua webcam tròn trực tiếp.
              </p>
            </div>

            {/* Các nút bấm Neo-brutalism to bản như ảnh mẫu */}
            <div className="space-y-3 pt-6">
              <button
                onClick={() => handleCreateRoom()}
                className="w-full py-3.5 rounded-2xl text-xs sm:text-sm font-black uppercase neo-btn-primary"
              >
                Tạo phòng nhanh (Làm Host)
              </button>

              <button
                onClick={() => setShowWelcomeView(false)}
                className="w-full py-3.5 rounded-2xl text-xs sm:text-sm font-bold uppercase neo-btn-secondary"
              >
                Vào Sảnh Đấu Trực Tuyến
              </button>

              <div className="text-center pt-1">
                <button
                  onClick={() => setShowWelcomeView(false)}
                  className="text-xs font-bold text-slate-600 underline hover:text-black transition-colors"
                >
                  Enter as guest
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================================
              MÀN HÌNH 2: MAIN HOME DASHBOARD (Như ảnh bên phải của người dùng)
             ========================================================================= */
          <div className="flex-1 flex flex-col space-y-5 animate-in fade-in duration-200">
            
            {/* Header: Hi, Pablo / Welcome back + Circular Avatar */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-[#1C1917]">
                  Hi, {playerName}
                </h2>
                <p className="text-xs text-slate-500 font-bold">
                  Welcome back!
                </p>
              </div>

              {/* Avatar tròn viền đen như ảnh mẫu */}
              <div
                onClick={handleToggleCam}
                className="relative cursor-pointer group"
                title="Bấm để bật/tắt camera"
              >
                <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-black bg-[#FDE047] shadow-[2px_2px_0px_0px_#000]">
                  {isCamActive ? (
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                  ) : (
                    <img
                      src={`https://api.dicebear.com/7.x/bottts/svg?seed=${playerName}`}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full border border-black ${isCamActive ? "bg-emerald-400" : "bg-white"}`}>
                  {isCamActive ? <Video className="w-2.5 h-2.5 text-black" /> : <VideoOff className="w-2.5 h-2.5 text-black" />}
                </div>
              </div>
            </div>

            {/* Thanh Input: Nhập mã phòng hoặc Tìm kiếm (Giống "Place my regular order" trong ảnh) */}
            <form onSubmit={handleJoinByCode} className="relative">
              <div className="bg-white border-2 border-black rounded-2xl p-2.5 pl-4 pr-12 shadow-[3px_3px_0px_0px_#1C1917] flex items-center justify-between">
                <input
                  type="text"
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                  placeholder="Nhập mã phòng (VD: BELL99)..."
                  className="w-full bg-transparent text-xs font-bold uppercase tracking-wider text-black placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* Icon xoay / Nút Enter */}
              <button
                type="submit"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-[#FDE047] border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-transform"
                title="Vào phòng"
              >
                <RefreshCw className="w-3.5 h-3.5 text-black" />
              </button>
            </form>

            {/* Phần 1: Mystery Game Shows (2 Card Pastel Vuông Bo Tròn Như Ảnh Mẫu) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase text-[#1C1917] tracking-wider">
                  Featured Shows
                </h3>
                <span className="text-[10px] font-bold text-slate-500">Live 24/7</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Thẻ 1: Xanh Da Trời Pastel (Pablo's Paradise / Chuông Vàng) */}
                <div className="bg-[#93C5FD] border-2 border-black rounded-3xl p-3.5 shadow-[4px_4px_0px_0px_#1C1917] flex flex-col justify-between aspect-square group">
                  <div className="flex justify-center pt-2">
                    {/* Tem tròn bánh răng */}
                    <div className="w-11 h-11 rounded-full bg-white border-2 border-black flex items-center justify-center text-lg shadow-[2px_2px_0px_0px_#000] group-hover:scale-105 transition-transform">
                      🔔
                    </div>
                  </div>

                  <div className="text-center my-1">
                    <span className="text-[10px] font-extrabold text-slate-800 uppercase block">
                      ĐẤU TRƯỜNG
                    </span>
                    <strong className="text-xs font-black text-black">
                      Chuông Vàng •
                    </strong>
                  </div>

                  <button
                    onClick={() => handleCreateRoom("general-knowledge-official")}
                    className="w-full py-2 rounded-2xl text-[11px] font-black uppercase bg-[#FDE047] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    Unlock / Chơi
                  </button>
                </div>

                {/* Thẻ 2: Xanh Bạc Hà Pastel (Columbian Crunch / Triệu Phú) */}
                <div className="bg-[#86EFAC] border-2 border-black rounded-3xl p-3.5 shadow-[4px_4px_0px_0px_#1C1917] flex flex-col justify-between aspect-square group">
                  <div className="flex justify-center pt-2">
                    <div className="w-11 h-11 rounded-full bg-white border-2 border-black flex items-center justify-center text-lg shadow-[2px_2px_0px_0px_#000] group-hover:scale-105 transition-transform">
                      💡
                    </div>
                  </div>

                  <div className="text-center my-1">
                    <span className="text-[10px] font-extrabold text-slate-800 uppercase block">
                      ĐẤU TRƯỜNG
                    </span>
                    <strong className="text-xs font-black text-black">
                      Coder Vibe •
                    </strong>
                  </div>

                  <button
                    onClick={() => handleCreateRoom("it-dev-vibecoding")}
                    className="w-full py-2 rounded-2xl text-[11px] font-black uppercase bg-[#FDE047] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    Unlock / Chơi
                  </button>
                </div>
              </div>
            </div>

            {/* Phần 2: Danh sách Bộ Đề (Sandwiches -> Game Show Packs như ảnh mẫu) */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase text-[#1C1917] tracking-wider">
                  Game Shows & Bộ Đề
                </h3>
                <button
                  onClick={() => setIsStudioOpen(true)}
                  className="text-xs font-bold text-slate-600 hover:text-black flex items-center gap-0.5"
                >
                  Tạo mới →
                </button>
              </div>

              {/* 2 Card Sản Phẩm Đặt Cạnh Nhau (American Dream & Pablo's Snack) */}
              <div className="grid grid-cols-2 gap-3">
                {packs.map((pack, idx) => {
                  const isFree = pack.price === 0;
                  return (
                    <div
                      key={pack.id}
                      className="bg-white border-2 border-black rounded-3xl p-3 shadow-[3px_3px_0px_0px_#1C1917] flex flex-col justify-between space-y-2.5"
                    >
                      {/* Ảnh minh họa với Tag "TOP" như ảnh mẫu */}
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-black bg-[#F7F4EB] flex items-center justify-center">
                        <span className="text-3xl">
                          {idx === 0 ? "🏆" : "💻"}
                        </span>
                        {pack.isOfficial && (
                          <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-[#FDE047] border border-black flex items-center justify-center text-[9px] font-black shadow-[1px_1px_0px_0px_#000]">
                            TOP
                          </div>
                        )}
                      </div>

                      {/* Thông tin */}
                      <div>
                        <h4 className="text-xs font-black text-black truncate">
                          {pack.title}
                        </h4>
                        <div className="text-xs font-extrabold text-slate-600 mt-0.5">
                          {isFree ? "Miễn Phí" : `${pack.price.toLocaleString()}đ`}
                        </div>
                      </div>

                      {/* Nút Add to cart -> Chơi Ngay màu vàng bơ */}
                      <button
                        onClick={() => handleCreateRoom(pack.id)}
                        className="w-full py-2 rounded-2xl text-[11px] font-black uppercase bg-[#FDE047] hover:bg-[#FACC15] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                      >
                        Chơi ngay
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Nút chuyển sang Welcome Screen để xem thiết kế Welcome nếu muốn */}
            <div className="pt-2 text-center">
              <button
                onClick={() => setShowWelcomeView(true)}
                className="text-[11px] font-bold text-slate-500 underline"
              >
                Xem lại màn hình Welcome Pablo 19-20
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            THANH BOTTOM NAVIGATION (Theo đúng ảnh mẫu bên phải)
           ========================================================================= */}
        <MobileBottomNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenStudio={() => setIsStudioOpen(true)}
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

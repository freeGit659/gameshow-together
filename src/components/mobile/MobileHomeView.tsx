"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { MobileBottomNav, MobileTab } from "@/components/MobileBottomNav";
import { CreatorStudioModal } from "@/components/CreatorStudioModal";
import { CreatorPack } from "@/types/game";
import { generateRoomCode } from "@/lib/utils";
import { useThemeMode } from "@/context/ThemeModeContext";
import { useAuth } from "@/context/AuthContext";
import { ThemeModeToggle } from "@/components/ThemeModeToggle";
import { RefreshCw, Video, VideoOff, LogIn, LogOut, ShieldCheck } from "lucide-react";

interface MobileHomeViewProps {
  packs: CreatorPack[];
  onSavePack: (pack: CreatorPack) => void;
}

export const MobileHomeView: React.FC<MobileHomeViewProps> = ({
  packs,
  onSavePack,
}) => {
  const router = useRouter();
  const { mode } = useThemeMode();
  const { user, openAuthModal, logout, ensureAuthenticated, continueAsGuest } = useAuth();

  const [activeTab, setActiveTab] = useState<MobileTab>("home");
  const [showWelcomeView, setShowWelcomeView] = useState(!user); // Nếu chưa có user thì hiện welcome
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState("");

  const [isCamActive, setIsCamActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleCreateRoom = (packId = "general-knowledge-official") => {
    ensureAuthenticated(() => {
      const code = generateRoomCode();
      const name = user?.username || "Thí sinh";
      router.push(`/room/${code}?isHost=true&packId=${packId}&name=${encodeURIComponent(name)}`);
    });
  };

  const handleJoinByCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    ensureAuthenticated(() => {
      const code = roomCodeInput.trim().toUpperCase();
      if (!code) return;
      const name = user?.username || "Thí sinh";
      router.push(`/room/${code}?name=${encodeURIComponent(name)}`);
    });
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

  const currentDisplayName = user ? user.username : "Pablo";

  return (
    <div className="w-full max-w-md min-h-screen flex flex-col px-4 py-4 space-y-4 pb-24 mx-auto">
      {/* Top Mobile Status Header */}
      <div className="flex items-center justify-between text-xs font-bold px-1">
        <span className="font-mono">9:41</span>
        <div className="flex items-center gap-2">
          <ThemeModeToggle className="scale-85" />
          <div className="w-5 h-2.5 rounded-sm border border-current p-0.5 flex items-center">
            <div className="h-full w-full bg-current rounded-xs" />
          </div>
        </div>
      </div>

      {showWelcomeView && !user ? (
        /* Màn hình Welcome Pablo 19-20 */
        <div className="flex-1 flex flex-col justify-between py-6 space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
              <span>19</span>
              <span className={`text-sm font-black px-2 py-0.5 rounded-lg border ${
                mode === "dark" ? "bg-white/10 border-white/20 text-white" : "border-black bg-white text-black shadow-[1px_1px_0px_0px_#000]"
              }`}>
                GAMESHOW
              </span>
              <span>26</span>
            </div>
          </div>

          <div className="space-y-4 pt-4 relative">
            <div className="relative">
              <h1 className="text-3xl font-black uppercase tracking-tight leading-[1.15]">
                CREATE <br />
                A CUSTOM <br />
                GAMESHOW <br />
                WITH <span className="bg-[#FDA4AF] text-black px-1.5 py-0.5 rounded-lg border-2 border-black inline-block shadow-[2px_2px_0px_0px_#000]">PABLO</span>
              </h1>
              <div className="absolute -top-3 right-2 w-14 h-14 rounded-full bg-[#FDE047] text-black border-2 border-black flex items-center justify-center text-xl shadow-[2px_2px_0px_0px_#000] rotate-12">
                🔔
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm">
              Đấu trường gameshow trực tuyến tương tác với webcam tròn cùng bạn bè theo thời gian thực!
            </p>
          </div>

          <div className="space-y-3 pt-6">
            <button
              onClick={() => openAuthModal()}
              className="w-full py-3.5 rounded-2xl text-xs font-black uppercase bg-[#FDE047] text-black border-2 border-black shadow-[3px_3px_0px_0px_#1C1917]"
            >
              Đăng Nhập / Tạo Tài Khoản
            </button>
            <button
              onClick={() => {
                continueAsGuest();
                setShowWelcomeView(false);
              }}
              className="w-full py-3.5 rounded-2xl text-xs font-bold uppercase bg-white text-black border-2 border-black shadow-[3px_3px_0px_0px_#1C1917]"
            >
              Chơi Nhanh Với Tư Cách Khách
            </button>
          </div>
        </div>
      ) : (
        /* Màn hình Home Pablo App */
        <div className="flex-1 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-black truncate max-w-[150px]">Hi, {currentDisplayName}</h2>
                {user?.isGuest && (
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-500">
                    Khách
                  </span>
                )}
                {user && !user.isGuest && (
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                )}
              </div>
              <p className="text-xs text-slate-500 font-bold">
                {user ? (user.isGuest ? "Chế độ Khách (Offline)" : `${user.score}đ • ${user.bells} chuông`) : "Welcome back!"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!user ? (
                <button
                  onClick={openAuthModal}
                  className="px-3 py-1 rounded-xl text-xs font-black uppercase bg-[#FDE047] text-black border border-black shadow-[1px_1px_0px_0px_#000]"
                >
                  Login
                </button>
              ) : (
                <div onClick={handleToggleCam} className="relative cursor-pointer" title="Bật/Tắt Webcam">
                  <div className={`w-11 h-11 rounded-full overflow-hidden border-2 shadow-[2px_2px_0px_0px_#000] ${
                    mode === "dark" ? "border-violet-500 bg-slate-900" : "border-black bg-[#FDE047]"
                  }`}>
                    {isCamActive ? (
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                    ) : (
                      <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full border border-black ${isCamActive ? "bg-emerald-400" : "bg-white"}`}>
                    {isCamActive ? <Video className="w-2.5 h-2.5 text-black" /> : <VideoOff className="w-2.5 h-2.5 text-black" />}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ô Nhập Mã Phòng */}
          <form onSubmit={handleJoinByCode} className="relative">
            <div className={`rounded-2xl p-2.5 pl-4 pr-12 flex items-center justify-between ${
              mode === "dark" ? "bg-[#131726] border border-white/10" : "bg-white border-2 border-black shadow-[3px_3px_0px_0px_#1C1917]"
            }`}>
              <input
                type="text"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                placeholder="Nhập mã phòng (VD: BELL99)..."
                className="w-full bg-transparent text-xs font-bold uppercase tracking-wider focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center ${
                mode === "dark" ? "bg-violet-600 text-white" : "bg-[#FDE047] text-black border-2 border-black shadow-[1px_1px_0px_0px_#000]"
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Featured Shows (2 Thẻ Pastel Vuông) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider">Featured Shows</h3>
              <span className="text-[10px] text-slate-500 font-bold">Live 24/7</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#93C5FD] text-black border-2 border-black rounded-3xl p-3 shadow-[3px_3px_0px_0px_#1C1917] flex flex-col justify-between aspect-square">
                <div className="flex justify-center pt-1">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-black flex items-center justify-center text-lg shadow-[1px_1px_0px_0px_#000]">
                    🔔
                  </div>
                </div>
                <div className="text-center my-0.5">
                  <span className="text-[9px] font-black uppercase block text-slate-800">ĐẤU TRƯỜNG</span>
                  <strong className="text-xs font-black">Chuông Vàng •</strong>
                </div>
                <button
                  onClick={() => handleCreateRoom("general-knowledge-official")}
                  className="w-full py-1.5 rounded-2xl text-[10px] font-black uppercase bg-[#FDE047] text-black border-2 border-black shadow-[1px_1px_0px_0px_#000]"
                >
                  Unlock / Chơi
                </button>
              </div>

              <div className="bg-[#86EFAC] text-black border-2 border-black rounded-3xl p-3 shadow-[3px_3px_0px_0px_#1C1917] flex flex-col justify-between aspect-square">
                <div className="flex justify-center pt-1">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-black flex items-center justify-center text-lg shadow-[1px_1px_0px_0px_#000]">
                    💡
                  </div>
                </div>
                <div className="text-center my-0.5">
                  <span className="text-[9px] font-black uppercase block text-slate-800">ĐẤU TRƯỜNG</span>
                  <strong className="text-xs font-black">Coder Vibe •</strong>
                </div>
                <button
                  onClick={() => handleCreateRoom("it-dev-vibecoding")}
                  className="w-full py-1.5 rounded-2xl text-[10px] font-black uppercase bg-[#FDE047] text-black border-2 border-black shadow-[1px_1px_0px_0px_#000]"
                >
                  Unlock / Chơi
                </button>
              </div>
            </div>
          </div>

          {/* Game Shows & Bộ Đề (2 Cột) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider">Game Shows & Bộ Đề</h3>
              <button onClick={() => ensureAuthenticated(() => setIsStudioOpen(true))} className="text-xs font-bold text-slate-500">
                Tạo mới →
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {packs.map((pack, idx) => (
                <div
                  key={pack.id}
                  className={`rounded-3xl p-3 flex flex-col justify-between space-y-2 ${
                    mode === "dark" ? "bg-[#131726] border border-white/10" : "bg-white border-2 border-black shadow-[3px_3px_0px_0px_#1C1917]"
                  }`}
                >
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-black bg-slate-100 flex items-center justify-center text-2xl text-black">
                    {idx === 0 ? "🏆" : "💻"}
                    {pack.isOfficial && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#FDE047] text-black border border-black flex items-center justify-center text-[8px] font-black">
                        TOP
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-black truncate">{pack.title}</h4>
                    <div className="text-[11px] font-extrabold text-slate-500 mt-0.5">
                      {pack.price === 0 ? "Miễn Phí" : `${pack.price.toLocaleString()}đ`}
                    </div>
                  </div>

                  <button
                    onClick={() => handleCreateRoom(pack.id)}
                    className="w-full py-1.5 rounded-2xl text-[10px] font-black uppercase bg-[#FDE047] text-black border-2 border-black shadow-[1px_1px_0px_0px_#000]"
                  >
                    Chơi ngay
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Nút Đăng xuất / Xem lại Welcome */}
          <div className="pt-1 flex items-center justify-between text-[10px] font-bold text-slate-500 px-1">
            <button onClick={() => setShowWelcomeView(true)} className="underline">
              Màn hình Welcome 19-20
            </button>
            {user && (
              <button onClick={logout} className="hover:text-rose-500 flex items-center gap-1">
                <LogOut className="w-3 h-3" />
                Đăng xuất
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSettings={() => {}}
        onOpenStudio={() => ensureAuthenticated(() => setIsStudioOpen(true))}
      />

      <CreatorStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        onSavePack={onSavePack}
      />
    </div>
  );
};

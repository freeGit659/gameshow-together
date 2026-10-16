"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useThemeMode } from "@/context/ThemeModeContext";
import { 
  Bell, 
  Video, 
  VideoOff, 
  Play, 
  Trophy, 
  Users, 
  Radio, 
  LogIn, 
  LogOut, 
  Sparkles, 
  ShieldCheck 
} from "lucide-react";

interface RightSidebarProps {
  onQuickJoinRoom: (code: string) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ onQuickJoinRoom }) => {
  const { user, openAuthModal, logout, ensureAuthenticated } = useAuth();
  const { mode } = useThemeMode();

  const [isCamActive, setIsCamActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Leaderboard online lấy từ database
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/auth/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.leaderboard) setLeaderboard(data.leaderboard);
      })
      .catch((e) => console.warn(e));
  }, []);

  const friends = [
    { id: "1", name: "Mr.Salon", status: "Đang chơi Chuông Vàng", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Salon", isPlaying: true, roomCode: "BELL88" },
    { id: "2", name: "Warmonder_kek", status: "Đang thi đấu Triệu Phú", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Warmonder", isPlaying: true, roomCode: "MIL99" },
    { id: "3", name: "Dolly_doll", status: "Sảnh chờ (Rảnh rỗi)", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Dolly", isPlaying: false },
  ];

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
          video: { width: 160, height: 160 },
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

  return (
    <aside className={`w-72 2xl:w-80 flex flex-col gap-5 py-5 px-4 rounded-3xl shrink-0 transition-all ${
      mode === "dark"
        ? "bg-[#10131d]/90 border border-white/5"
        : "bg-white border-2 border-black shadow-[4px_4px_0px_0px_#1C1917]"
    }`}>
      {/* 1. Header Profile & Trạng thái Auth */}
      <div className="flex items-center justify-between px-1">
        <button className={`p-2 rounded-2xl transition-colors ${
          mode === "dark" ? "bg-white/5 text-slate-300" : "bg-[#F7F4EB] text-black border border-black shadow-[1px_1px_0px_0px_#000]"
        }`}>
          <Bell className="w-4 h-4" />
        </button>

        {user ? (
          <div className="flex items-center gap-2.5">
            <div className="relative cursor-pointer" onClick={handleToggleCam} title="Bật/Tắt Webcam">
              <div className={`w-10 h-10 rounded-full overflow-hidden border-2 shadow-md ${
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

            <div className="text-left">
              <div className="flex items-center gap-1">
                <span className="text-xs font-black truncate max-w-[90px]">
                  {user.username}
                </span>
                {user.isGuest ? (
                  <span className="text-[9px] font-black uppercase px-1 rounded bg-amber-500/20 text-amber-500">
                    Khách
                  </span>
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                )}
              </div>
              <div className="text-[10px] opacity-70 flex items-center gap-1.5 font-bold">
                <span>{user.score}đ</span>
                <span>•</span>
                <button onClick={logout} className="hover:text-rose-500 flex items-center gap-0.5" title="Đăng xuất">
                  <LogOut className="w-2.5 h-2.5" />
                  <span>Thoát</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={openAuthModal}
            className={`px-3 py-1.5 rounded-2xl text-xs font-black uppercase flex items-center gap-1.5 transition-transform active:scale-95 ${
              mode === "dark"
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                : "bg-[#FDE047] text-black border-2 border-black shadow-[2px_2px_0px_0px_#1C1917]"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Đăng Nhập</span>
          </button>
        )}
      </div>

      {/* Thông báo nếu là Khách: Mời nâng cấp tài khoản để lưu điểm */}
      {user?.isGuest && (
        <div
          onClick={openAuthModal}
          className={`p-2 rounded-2xl cursor-pointer text-[11px] font-bold flex items-center justify-between border ${
            mode === "dark" ? "bg-amber-500/10 border-amber-500/30 text-amber-300" : "bg-[#FEF08A] border-black text-black shadow-[2px_2px_0px_0px_#000]"
          }`}
        >
          <span>⭐ Đăng nhập để lưu BXH</span>
          <span className="underline">Đăng nhập</span>
        </div>
      )}

      {/* 2. Stream / Live Game Show Card */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold px-1">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            Live Show Stream
          </span>
          <span className="text-[10px] opacity-60 font-mono">1.4K xem</span>
        </div>

        <div className={`relative rounded-2xl overflow-hidden border p-3 aspect-video flex flex-col justify-between group cursor-pointer ${
          mode === "dark" ? "border-white/10 bg-slate-950" : "border-2 border-black bg-[#93C5FD] shadow-[3px_3px_0px_0px_#1C1917]"
        }`}>
          <div className="flex items-center justify-between">
            <span className="bg-rose-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
              Rung Chuông Vàng
            </span>
            <span className="text-[10px] font-bold opacity-80">
              #BELL99
            </span>
          </div>

          <div className="self-center">
            <button
              onClick={() => ensureAuthenticated(() => onQuickJoinRoom("BELL99"))}
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform ${
                mode === "dark" ? "bg-violet-600 text-white" : "bg-[#FDE047] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]"
              }`}
            >
              <Play className="w-4 h-4 fill-current translate-x-0.5" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] font-bold">
            <span>Chung kết</span>
            <span className="text-yellow-500 font-extrabold">12 thí sinh</span>
          </div>
        </div>
      </div>

      {/* 3. Friends Online */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold px-1">
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 opacity-70" />
            Bạn bè online
          </span>
          <span className="text-[10px] opacity-60 font-mono">3 online</span>
        </div>

        <div className="space-y-1.5">
          {friends.map((f) => (
            <div
              key={f.id}
              className={`flex items-center justify-between p-2 rounded-2xl transition-colors cursor-pointer ${
                mode === "dark" ? "hover:bg-white/5" : "hover:bg-slate-50 border border-black/10"
              }`}
              onClick={() => f.roomCode && ensureAuthenticated(() => onQuickJoinRoom(f.roomCode!))}
            >
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <img src={f.avatar} alt={f.name} className="w-8 h-8 rounded-full bg-slate-800" />
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-black" />
                </div>
                <div>
                  <div className="text-xs font-bold truncate max-w-[100px]">{f.name}</div>
                  <div className="text-[10px] opacity-60 truncate max-w-[100px]">{f.status}</div>
                </div>
              </div>

              {f.isPlaying && f.roomCode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    ensureAuthenticated(() => onQuickJoinRoom(f.roomCode!));
                  }}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-xl ${
                    mode === "dark" ? "bg-white/5 hover:bg-white/10" : "bg-[#FDE047] text-black border border-black"
                  }`}
                >
                  Join
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Bảng Xếp Hạng Online (Chỉ hiện tài khoản đã đăng ký trên Database) */}
      <div className="space-y-2 pt-1 border-t border-black/10">
        <div className="flex items-center justify-between text-xs font-bold px-1">
          <span className="flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-yellow-500" />
            Bảng Xếp Hạng Online
          </span>
          <span className="text-[10px] font-bold text-yellow-500">Mùa 1</span>
        </div>

        <div className="space-y-1.5">
          {leaderboard.slice(0, 3).map((item) => (
            <div
              key={item.rank}
              className={`flex items-center justify-between p-2 rounded-2xl ${
                mode === "dark" ? "bg-black/20 border border-white/5" : "bg-[#F7F4EB] border-2 border-black shadow-[2px_2px_0px_0px_#1C1917]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                    item.rank === 1 ? "bg-yellow-400 text-black" : item.rank === 2 ? "bg-slate-300 text-black" : "bg-amber-600 text-white"
                  }`}
                >
                  {item.rank}
                </span>
                <img src={item.avatar} alt={item.name} className="w-6 h-6 rounded-full bg-slate-800" />
                <div>
                  <div className="text-xs font-bold truncate max-w-[80px]">{item.name}</div>
                  <div className="text-[9px] text-yellow-500 font-bold">🔔 {item.bells} Chuông</div>
                </div>
              </div>

              <span className="text-xs font-bold font-mono opacity-80">{item.score}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

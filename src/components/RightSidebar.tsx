"use client";

import React, { useState, useRef } from "react";
import { 
  Bell, 
  ChevronDown, 
  Video, 
  VideoOff, 
  Play, 
  Trophy, 
  Users, 
  Radio, 
  Flame, 
  Check, 
  Sparkles 
} from "lucide-react";

interface RightSidebarProps {
  playerName: string;
  onUpdatePlayerName: (name: string) => void;
  onQuickJoinRoom: (code: string) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  playerName,
  onUpdatePlayerName,
  onQuickJoinRoom,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(playerName);
  const [isCamActive, setIsCamActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Danh sách bạn bè online (Mockup sinh động theo ảnh mẫu)
  const friends = [
    { id: "1", name: "Mr.Salon", status: "Đang chơi Chuông Vàng", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Salon", isPlaying: true, roomCode: "BELL88" },
    { id: "2", name: "Warmonder_kek", status: "Đang thi đấu Triệu Phú", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Warmonder", isPlaying: true, roomCode: "MIL99" },
    { id: "3", name: "Dolly_doll", status: "Sảnh chờ (Rảnh rỗi)", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Dolly", isPlaying: false },
    { id: "4", name: "Celine_Dion", status: "Đang sáng tạo đề mới", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Celine", isPlaying: false },
  ];

  // Bảng xếp hạng người chơi (Leaderboard)
  const leaderboard = [
    { rank: 1, name: "Quán Quân Minh", score: "14,800 pts", bells: 9, avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=MinhTop" },
    { rank: 2, name: "Bảo Ngọc Pro", score: "11,500 pts", bells: 6, avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=BaoNgoc" },
    { rank: 3, name: "Huy Coder", score: "9,200 pts", bells: 4, avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=HuyCoder" },
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

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onUpdatePlayerName(nameInput.trim());
      setIsEditingName(false);
    }
  };

  return (
    <aside className="w-full xl:w-72 2xl:w-80 flex flex-col gap-6 py-6 px-4 bg-[#10131d]/90 border-l border-white/5 rounded-3xl shrink-0">
      {/* 1. Header Profile (Theo ảnh mẫu) */}
      <div className="flex items-center justify-between px-2">
        {/* Nút chuông thông báo */}
        <button className="relative p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full theme-active-pill" />
        </button>

        {/* Profile Card */}
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer" onClick={handleToggleCam} title="Bấm để bật/tắt Webcam tròn">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 theme-border-accent bg-slate-900 shadow-md">
              {isCamActive ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
              ) : (
                <img
                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=${playerName}`}
                  alt="Profile Avatar"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full ${isCamActive ? "bg-emerald-500" : "bg-slate-700"}`}>
              {isCamActive ? <Video className="w-2.5 h-2.5 text-slate-950" /> : <VideoOff className="w-2.5 h-2.5 text-slate-300" />}
            </div>
          </div>

          <div className="text-left">
            {isEditingName ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  className="w-24 bg-slate-950 border border-white/20 rounded px-1.5 py-0.5 text-xs text-slate-100"
                  autoFocus
                />
                <button onClick={handleSaveName} className="text-emerald-400 p-0.5">
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                className="flex items-center gap-1 cursor-pointer group"
                onClick={() => {
                  setNameInput(playerName);
                  setIsEditingName(true);
                }}
                title="Bấm để đổi tên"
              >
                <span className="text-xs font-bold text-slate-100 group-hover:text-violet-400 transition-colors truncate max-w-[100px]">
                  {playerName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            )}
            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Online
            </span>
          </div>
        </div>
      </div>

      {/* 2. Stream / Live Game Show Card (Theo ảnh mẫu) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-200 px-2">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            Live Show Stream
          </span>
          <span className="text-[10px] text-slate-500 font-mono">1.4K xem</span>
        </div>

        <div className="relative rounded-2xl overflow-hidden border border-white/10 group cursor-pointer aspect-video bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 flex flex-col justify-between p-3 shadow-lg">
          {/* Background image & gradient overlay */}
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500/30 via-slate-950 to-slate-950" />
          
          <div className="relative z-10 flex items-center justify-between">
            <span className="bg-rose-600/90 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              Rung Chuông Vàng
            </span>
            <span className="text-[10px] text-slate-300 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
              Phòng #BELL99
            </span>
          </div>

          {/* Nút Play tròn to chính giữa giống hệt ảnh mẫu */}
          <div className="relative z-10 self-center">
            <button
              onClick={() => onQuickJoinRoom("BELL99")}
              className="w-11 h-11 rounded-full theme-active-pill flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform"
              title="Vào xem trực tiếp phòng này"
            >
              <Play className="w-5 h-5 fill-white text-white translate-x-0.5" />
            </button>
          </div>

          <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-300">
            <span className="font-semibold text-white drop-shadow">Chung kết kịch tính</span>
            <span className="text-yellow-400 font-bold">12 thí sinh</span>
          </div>
        </div>
      </div>

      {/* 3. Friends Online (Theo ảnh mẫu) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-200 px-2">
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 theme-accent-text" />
            Friends online
          </span>
          <span className="text-[10px] text-slate-500 font-mono">4 online</span>
        </div>

        <div className="space-y-2">
          {friends.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between p-2 rounded-2xl hover:bg-white/5 transition-colors group cursor-pointer"
              onClick={() => f.roomCode && onQuickJoinRoom(f.roomCode)}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={f.avatar}
                    alt={f.name}
                    className="w-9 h-9 rounded-full bg-slate-800 border border-white/10"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#10131d]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-violet-400 transition-colors">
                    {f.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[110px]">
                    {f.status}
                  </div>
                </div>
              </div>

              {f.isPlaying && f.roomCode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickJoinRoom(f.roomCode!);
                  }}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10"
                >
                  Join
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Bảng Xếp Hạng Người Chơi (Leaderboard - Theo ảnh mẫu mục Groups/Ranking) */}
      <div className="space-y-3 pt-2 border-t border-white/5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-200 px-2">
          <span className="flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            Bảng Xếp Hạng
          </span>
          <span className="text-[10px] text-yellow-400/80 font-bold">Mùa 1</span>
        </div>

        <div className="space-y-2">
          {leaderboard.map((item) => (
            <div
              key={item.rank}
              className="flex items-center justify-between p-2.5 rounded-2xl bg-[#141724] border border-white/5"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                    item.rank === 1
                      ? "bg-yellow-500 text-slate-950"
                      : item.rank === 2
                      ? "bg-slate-300 text-slate-950"
                      : "bg-amber-700 text-slate-100"
                  }`}
                >
                  {item.rank}
                </span>
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-7 h-7 rounded-full bg-slate-800"
                />
                <div>
                  <div className="text-xs font-bold text-slate-200 truncate max-w-[90px]">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-yellow-400 font-semibold">
                    🔔 {item.bells} Chuông
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-slate-300 font-mono">
                  {item.score}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useThemeMode } from "@/context/ThemeModeContext";
import { io } from "socket.io-client";
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
  ShieldCheck,
  Edit3,
  PlusCircle
} from "lucide-react";

interface ActiveRoomItem {
  code: string;
  name?: string;
  hostId?: string;
  hostName?: string;
  playersCount?: number;
  stage?: string;
}

interface RightSidebarProps {
  onQuickJoinRoom: (code: string) => void;
  onCreateRoom?: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ onQuickJoinRoom, onCreateRoom }) => {
  const { user, openAuthModal, logout, ensureAuthenticated, openEditProfile } = useAuth();
  const { mode } = useThemeMode();

  const [isCamActive, setIsCamActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Leaderboard online lấy từ database
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  // Danh sách phòng thực tế đang mở (Realtime từ Socket & Database)
  const [activeRooms, setActiveRooms] = useState<ActiveRoomItem[]>([]);

  // Tải BXH từ Supabase
  useEffect(() => {
    fetch("/api/auth/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.leaderboard) setLeaderboard(data.leaderboard);
      })
      .catch((e) => console.warn(e));
  }, []);

  // Lắng nghe danh sách phòng Realtime từ Socket Server
  useEffect(() => {
    // 1. Tải trước từ API
    fetch("/api/rooms")
      .then((res) => res.json())
      .then((data) => {
        if (data.rooms && Array.isArray(data.rooms)) {
          setActiveRooms(data.rooms);
        }
      })
      .catch((e) => console.warn(e));

    // 2. Kết nối socket để nhận broadcast phòng realtime
    const socket = io({
      transports: ["websocket", "polling"],
    });

    socket.on("active_rooms_update", (roomsList: ActiveRoomItem[]) => {
      if (Array.isArray(roomsList)) {
        setActiveRooms(roomsList);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

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
        <button
          onClick={openEditProfile}
          className={`p-2 rounded-2xl transition-colors ${
            mode === "dark" ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-[#F7F4EB] text-black border border-black shadow-[1px_1px_0px_0px_#000] hover:bg-[#FDE047]"
          }`}
          title="Chỉnh sửa hồ sơ"
        >
          <Edit3 className="w-4 h-4" />
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
                <span className="text-xs font-black truncate max-w-[90px]" title={user.fullName || user.username}>
                  {user.fullName || user.username}
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
                <span>{user.score}đ • 🔔{user.bells}</span>
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

      {/* 2. SÀN ĐẤU ĐANG MỞ (Realtime Active Rooms - Không Fake Data) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold px-1">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            Phòng Đang Đấu
          </span>
          <span className="text-[10px] opacity-70 font-mono">
            {activeRooms.length} phòng live
          </span>
        </div>

        {activeRooms.length > 0 ? (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
            {activeRooms.map((room) => (
              <div
                key={room.code}
                onClick={() => ensureAuthenticated(() => onQuickJoinRoom(room.code))}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                  mode === "dark"
                    ? "bg-slate-900/60 border-white/10 hover:border-violet-500 hover:bg-white/5"
                    : "bg-[#F7F4EB] border-2 border-black shadow-[2px_2px_0px_0px_#1C1917] hover:bg-[#FEF08A]"
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black font-mono px-1.5 py-0.2 rounded bg-violet-600/20 text-violet-400 border border-violet-500/30">
                      #{room.code}
                    </span>
                    <span className="text-xs font-bold truncate max-w-[100px]">
                      {room.name || `Phòng ${room.code}`}
                    </span>
                  </div>
                  <div className="text-[10px] opacity-60 flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-0.5">
                      <Users className="w-2.5 h-2.5" />
                      {room.playersCount || 1} người
                    </span>
                    <span>•</span>
                    <span className="text-emerald-500 font-bold capitalize">
                      {room.stage === "lobby" ? "Sảnh chờ" : "Đang thi đấu"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    ensureAuthenticated(() => onQuickJoinRoom(room.code));
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase transition-transform active:scale-95 ${
                    mode === "dark"
                      ? "bg-violet-600 text-white"
                      : "bg-[#FDE047] text-black border border-black shadow-[1px_1px_0px_0px_#000]"
                  }`}
                >
                  Vào
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div
            className={`p-3.5 rounded-2xl text-center space-y-2 border ${
              mode === "dark" ? "bg-slate-950/40 border-white/5 text-slate-400" : "bg-[#F7F4EB] border-2 border-black text-black shadow-[2px_2px_0px_0px_#000]"
            }`}
          >
            <p className="text-[11px] leading-relaxed">
              Hiện chưa có phòng nào đang mở. Hãy tạo phòng và chia sẻ mã để so tài cùng bạn bè!
            </p>
            {onCreateRoom && (
              <button
                onClick={onCreateRoom}
                className={`w-full py-1.5 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-1.5 transition-transform active:scale-95 ${
                  mode === "dark" ? "bg-violet-600 text-white" : "bg-[#FDE047] text-black border border-black shadow-[1px_1px_0px_0px_#000]"
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Tạo Phòng Mới</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. BẢNG XẾP HẠNG ONLINE (Từ Database Supabase) */}
      <div className="space-y-2 pt-2 border-t border-black/10 dark:border-white/10">
        <div className="flex items-center justify-between text-xs font-bold px-1">
          <span className="flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-yellow-500" />
            Bảng Xếp Hạng Online
          </span>
          <span className="text-[10px] font-bold text-yellow-500">Mùa 1</span>
        </div>

        <div className="space-y-1.5">
          {leaderboard.length > 0 ? (
            leaderboard.slice(0, 5).map((item) => (
              <div
                key={item.rank}
                className={`flex items-center justify-between p-2 rounded-2xl ${
                  mode === "dark" ? "bg-black/20 border border-white/5" : "bg-[#F7F4EB] border-2 border-black shadow-[2px_2px_0px_0px_#1C1917]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                      item.rank === 1 ? "bg-yellow-400 text-black" : item.rank === 2 ? "bg-slate-300 text-black" : item.rank === 3 ? "bg-amber-600 text-white" : "bg-slate-700 text-white"
                    }`}
                  >
                    {item.rank}
                  </span>
                  <img src={item.avatar} alt={item.name} className="w-6 h-6 rounded-full bg-slate-800" />
                  <div>
                    <div className="text-xs font-bold truncate max-w-[85px]">{item.name}</div>
                    <div className="text-[9px] text-yellow-500 font-bold">🔔 {item.bells} Chuông</div>
                  </div>
                </div>

                <span className="text-xs font-bold font-mono opacity-80">{item.score}đ</span>
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-[10px] opacity-60">
              Chưa có dữ liệu bảng xếp hạng. Hãy là người đầu tiên rung chuông vàng!
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

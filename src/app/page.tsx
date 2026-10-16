"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_PACKS } from "@/lib/questions";
import { CreatorPack } from "@/types/game";
import { CreatorStudioModal } from "@/components/CreatorStudioModal";
import { generateRoomCode } from "@/lib/utils";
import { 
  Users, 
  Sparkles, 
  Video, 
  VideoOff, 
  PlusCircle, 
  Play, 
  ArrowRight, 
  Coins, 
  ShieldCheck, 
  Gamepad2 
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  const [playerName, setPlayerName] = useState("");
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [packs, setPacks] = useState<CreatorPack[]>(DEFAULT_PACKS);
  const [selectedPackId, setSelectedPackId] = useState(DEFAULT_PACKS[0].id);
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  // Preview Webcam
  const [isCamEnabled, setIsCamEnabled] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Đọc tên người chơi từ localStorage nếu có
    const savedName = localStorage.getItem("gst_player_name");
    if (savedName) {
      setPlayerName(savedName);
    } else {
      setPlayerName(`Thí Sinh ${Math.floor(100 + Math.random() * 900)}`);
    }

    // Đọc custom packs từ localStorage nếu có
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

  const toggleWebcamPreview = async () => {
    if (isCamEnabled) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setIsCamEnabled(false);
      if (videoRef.current) videoRef.current.srcObject = null;
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 320, facingMode: "user" },
          audio: false,
        });
        streamRef.current = stream;
        setIsCamEnabled(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn("Camera access denied or unavailable", err);
        alert("Không thể truy cập camera. Vui lòng cho phép quyền truy cập camera trên trình duyệt!");
      }
    }
  };

  const handleCreateRoom = (packIdToUse?: string) => {
    const name = playerName.trim() || "Host Thí Sinh";
    localStorage.setItem("gst_player_name", name);
    const code = generateRoomCode();
    const pack = packIdToUse || selectedPackId;
    router.push(`/room/${code}?isHost=true&packId=${pack}&name=${encodeURIComponent(name)}`);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const code = roomCodeInput.trim().toUpperCase();
    if (!code) return;
    const name = playerName.trim() || `Thí Sinh ${Math.floor(100 + Math.random() * 900)}`;
    localStorage.setItem("gst_player_name", name);
    router.push(`/room/${code}?name=${encodeURIComponent(name)}`);
  };

  const handleSavePack = (newPack: CreatorPack) => {
    const updated = [newPack, ...packs];
    setPacks(updated);
    setSelectedPackId(newPack.id);

    // Lưu vào LocalStorage
    const customOnly = updated.filter((p) => !p.isOfficial);
    localStorage.setItem("gst_creator_packs", JSON.stringify(customOnly));
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 flex flex-col gap-10">
      {/* Hero Banner */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Prototype GameShow Online Thời Gian Thực
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
          SÀN ĐẤU <span className="gold-gradient-text">RUNG CHUÔNG VÀNG</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
          Tranh tài kiến thức cùng bạn bè qua Video Webcam tròn tương tác trực tiếp. Sáng tạo kịch bản gameshow và đưa lên sàn đấu!
        </p>
      </div>

      {/* Profile & Room Entry Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cột trái: Thiết lập cá nhân & Webcam tròn preview */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl flex flex-col items-center space-y-5">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider self-start flex items-center gap-2">
            <Users className="w-4 h-4 text-yellow-400" />
            Hồ Sơ & Webcam Của Bạn
          </h2>

          {/* Avatar / Webcam tròn */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-500/60 bg-slate-950 shadow-2xl relative flex items-center justify-center glow-gold">
              {isCamEnabled ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <img
                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=${playerName || "guest"}`}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Nút bật/tắt camera test */}
            <button
              onClick={toggleWebcamPreview}
              className={`absolute bottom-0 right-0 p-2 rounded-full border shadow-lg transition-transform active:scale-95 ${
                isCamEnabled
                  ? "bg-emerald-500 text-slate-950 border-emerald-400"
                  : "bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700"
              }`}
              title={isCamEnabled ? "Tắt Webcam" : "Bật thử nghiệm Webcam"}
            >
              {isCamEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </button>
          </div>

          <div className="w-full space-y-1.5 text-center">
            <span className="text-xs text-slate-400">Tên hiển thị trên sàn đấu</span>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Nhập biệt danh của bạn..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-center font-bold text-yellow-400 focus:outline-none focus:border-yellow-500 transition-colors"
            />
          </div>

          <div className="text-[11px] text-slate-500 text-center leading-relaxed">
            💡 Webcam tròn sẽ xuất hiện xung quanh bàn thi đấu để bạn bè thấy biểu cảm của nhau trong từng giây hồi hộp!
          </div>
        </div>

        {/* Cột phải: Vào phòng & Tạo phòng */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Box 1: Tạo phòng làm Host */}
              <div className="space-y-3 p-4 rounded-xl bg-slate-950/50 border border-yellow-500/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm mb-1">
                    <Gamepad2 className="w-4 h-4" />
                    <span>Làm Host Trận Đấu</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Khởi tạo phòng riêng, toàn quyền chọn bộ câu hỏi, điều khiển nhịp game và kích hoạt vòng cứu trợ.
                  </p>
                </div>

                <button
                  onClick={() => handleCreateRoom()}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-black bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  Tạo Phòng Nhanh
                </button>
              </div>

              {/* Box 2: Tham gia bằng Mã */}
              <div className="space-y-3 p-4 rounded-xl bg-slate-950/50 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sky-400 font-bold text-sm mb-1">
                    <Users className="w-4 h-4" />
                    <span>Gia Nhập Sàn Đấu</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Bạn được bạn bè gửi mã phòng? Nhập mã 6 chữ cái để ngồi vào ghế thí sinh ngay.
                  </p>
                </div>

                <form onSubmit={handleJoinRoom} className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                    placeholder="MÃ PHÒNG (VD: ABCXYZ)"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs uppercase font-mono tracking-widest text-slate-100 focus:outline-none focus:border-yellow-500"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors flex items-center justify-center"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Creator Marketplace & Workshop Section */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              Creator Workshop & Bộ Đề Cộng Đồng
            </h2>
            <p className="text-xs text-slate-400">
              Các bộ gameshow do cộng đồng sáng tạo. Tác giả có thể chia sẻ miễn phí hoặc đặt phí bản quyền.
            </p>
          </div>

          <button
            onClick={() => setIsStudioOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-yellow-500/15 hover:bg-yellow-500/25 text-yellow-400 border border-yellow-500/40 flex items-center gap-2 transition-colors shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            Sáng Tạo Bộ Đề Của Riêng Bạn
          </button>
        </div>

        {/* Danh sách các Packs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {packs.map((p) => {
            const isSelected = selectedPackId === p.id;
            const isFree = p.price === 0;

            return (
              <div
                key={p.id}
                className={`bg-slate-900/60 border rounded-2xl p-5 flex flex-col justify-between backdrop-blur-sm transition-all duration-200 relative group ${
                  isSelected
                    ? "border-yellow-500/80 shadow-lg shadow-yellow-500/10"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <div>
                  {/* Tags & Price */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {p.isOfficial && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                          <ShieldCheck className="w-3 h-3" />
                          Official
                        </span>
                      )}
                      {p.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold">
                      {isFree ? (
                        <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                          Miễn phí
                        </span>
                      ) : (
                        <span className="text-yellow-400 flex items-center gap-1 bg-yellow-500/10 px-2 py-0.5 rounded-md border border-yellow-500/30">
                          <Coins className="w-3 h-3" />
                          {p.price.toLocaleString()}đ
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Author */}
                  <h3 className="font-bold text-base text-slate-100 group-hover:text-yellow-400 transition-colors mb-1">
                    {p.title}
                  </h3>
                  <div className="text-xs text-slate-400 mb-3">
                    Bởi: <span className="text-slate-300 font-medium">{p.author}</span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {p.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-mono">
                    {p.questions.length} câu thử thách
                  </span>

                  <button
                    onClick={() => handleCreateRoom(p.id)}
                    className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-slate-950 shadow-md transition-transform active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                    Chơi bộ này
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Creator Studio Modal */}
      <CreatorStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        onSavePack={handleSavePack}
      />
    </div>
  );
}

"use client";

import React, { useEffect, useRef } from "react";
import { Player } from "@/types/game";
import { Mic, MicOff, Video, VideoOff, Crown, Award, CheckCircle2 } from "lucide-react";

interface WebcamAvatarProps {
  player: Player;
  isSelf: boolean;
  localStream?: MediaStream | null;
  remoteStream?: MediaStream | null;
  onToggleMic?: () => void;
  onToggleCam?: () => void;
  showAnswer?: boolean;
}

export const WebcamAvatar: React.FC<WebcamAvatarProps> = ({
  player,
  isSelf,
  localStream,
  remoteStream,
  onToggleMic,
  onToggleCam,
  showAnswer = false,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Gắn stream vào video element nếu có
  useEffect(() => {
    const stream = isSelf ? localStream : remoteStream;
    if (videoRef.current) {
      if (stream && !player.isVideoOff) {
        videoRef.current.srcObject = stream;
      } else {
        videoRef.current.srcObject = null;
      }
    }
  }, [isSelf, localStream, remoteStream, player.isVideoOff]);

  const isEliminated = player.status === "eliminated";
  const hasStream = (isSelf ? !!localStream : !!remoteStream) && !player.isVideoOff;

  return (
    <div className="flex flex-col items-center gap-1.5 transition-all duration-300">
      {/* Vòng tròn Avatar / Webcam */}
      <div className="relative group">
        <div
          className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 transition-all duration-300 shadow-lg ${
            isEliminated
              ? "border-rose-600/70 opacity-50 grayscale"
              : player.isHost
              ? "border-amber-400 ring-2 ring-amber-400/40 glow-gold"
              : "border-sky-400/80 ring-2 ring-sky-500/20"
          }`}
        >
          {/* Video Stream thật nếu người chơi mở webcam */}
          {hasStream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={isSelf} // Không để tự nghe tiếng của chính mình gây hú
              className={`w-full h-full object-cover ${isSelf ? "scale-x-[-1]" : ""}`}
            />
          ) : (
            /* Fallback ảnh đại diện nghệ thuật */
            <img
              src={player.avatar}
              alt={player.name}
              className="w-full h-full object-cover bg-slate-800"
            />
          )}

          {/* Hiệu ứng gạch chéo / loại nếu đã bị loại */}
          {isEliminated && (
            <div className="absolute inset-0 bg-red-950/70 flex flex-col items-center justify-center text-rose-300 text-[10px] font-bold uppercase tracking-wider backdrop-blur-[1px]">
              <span>Rời sàn</span>
              <span className="text-xs">❌</span>
            </div>
          )}

          {/* Hiển thị huy hiệu ĐÃ NỘP BÀI (khi đang trong thời gian câu hỏi) */}
          {player.currentAnswer && !showAnswer && !isEliminated && (
            <div className="absolute bottom-1 right-1 bg-emerald-500 text-white rounded-full p-1 shadow-md animate-bounce">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}

          {/* Hiển thị ĐÁP ÁN ĐÃ CHỌN (khi kết thúc thời gian câu hỏi) */}
          {showAnswer && player.currentAnswer && (
            <div
              className={`absolute inset-0 flex items-center justify-center font-black text-2xl sm:text-3xl backdrop-blur-sm ${
                isEliminated ? "bg-rose-900/80 text-rose-200" : "bg-emerald-900/80 text-emerald-200"
              }`}
            >
              {player.currentAnswer}
            </div>
          )}
        </div>

        {/* Vương miện Host */}
        {player.isHost && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 shadow-md uppercase tracking-wider">
            <Crown className="w-3 h-3 fill-slate-950" />
            Host
          </div>
        )}

        {/* Nút điều khiển nhanh Mic/Cam cho chính mình */}
        {isSelf && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 rounded-full px-1.5 py-0.5 shadow-md">
            <button
              onClick={onToggleMic}
              title={player.isMuted ? "Bật Mic" : "Tắt Mic"}
              className={`p-1 rounded-full text-[10px] transition-colors ${
                player.isMuted ? "text-rose-400 hover:text-rose-300" : "text-emerald-400 hover:text-emerald-300"
              }`}
            >
              {player.isMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
            </button>
            <button
              onClick={onToggleCam}
              title={player.isVideoOff ? "Bật Camera" : "Tắt Camera"}
              className={`p-1 rounded-full text-[10px] transition-colors ${
                player.isVideoOff ? "text-rose-400 hover:text-rose-300" : "text-sky-400 hover:text-sky-300"
              }`}
            >
              {player.isVideoOff ? <VideoOff className="w-3 h-3" /> : <Video className="w-3 h-3" />}
            </button>
          </div>
        )}
      </div>

      {/* Tên & Điểm người chơi */}
      <div className="text-center max-w-[100px]">
        <div className="text-xs font-semibold text-slate-200 truncate flex items-center justify-center gap-1">
          {player.name}
          {isSelf && <span className="text-[10px] text-yellow-400 font-normal">(Tôi)</span>}
        </div>
        <div className="flex items-center justify-center gap-1 text-[11px] text-yellow-400 font-bold">
          <Award className="w-3 h-3" />
          <span>{player.score}đ</span>
        </div>
      </div>
    </div>
  );
};

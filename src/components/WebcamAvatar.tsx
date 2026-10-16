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
    <div className="flex flex-col items-center gap-1 transition-all duration-200">
      <div className="relative group">
        <div
          className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-black transition-all shadow-[3px_3px_0px_0px_#1C1917] ${
            isEliminated
              ? "opacity-50 grayscale bg-red-100"
              : player.isHost
              ? "bg-[#FDE047] ring-2 ring-black"
              : "bg-[#93C5FD]"
          }`}
        >
          {hasStream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={isSelf}
              className={`w-full h-full object-cover ${isSelf ? "scale-x-[-1]" : ""}`}
            />
          ) : (
            <img
              src={player.avatar}
              alt={player.name}
              className="w-full h-full object-cover"
            />
          )}

          {isEliminated && (
            <div className="absolute inset-0 bg-red-500/80 flex flex-col items-center justify-center text-white text-[10px] font-black uppercase tracking-wider">
              <span>Bị loại</span>
              <span className="text-xs">✕</span>
            </div>
          )}

          {player.currentAnswer && !showAnswer && !isEliminated && (
            <div className="absolute bottom-1 right-1 bg-[#86EFAC] text-black border border-black rounded-full p-0.5 shadow-[1px_1px_0px_0px_#000]">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          )}

          {showAnswer && player.currentAnswer && (
            <div
              className={`absolute inset-0 flex items-center justify-center font-black text-xl sm:text-2xl border-2 border-black ${
                isEliminated ? "bg-[#FDA4AF] text-black" : "bg-[#86EFAC] text-black"
              }`}
            >
              {player.currentAnswer}
            </div>
          )}
        </div>

        {player.isHost && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#FDE047] text-black border border-black px-1.5 py-0.2 rounded-full text-[9px] font-black flex items-center gap-0.5 shadow-[1px_1px_0px_0px_#000] uppercase tracking-wider">
            <Crown className="w-2.5 h-2.5 fill-black" />
            Host
          </div>
        )}

        {isSelf && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white border border-black rounded-full px-1.5 py-0.5 shadow-[1px_1px_0px_0px_#000]">
            <button
              onClick={onToggleMic}
              className={`p-0.5 rounded-full ${player.isMuted ? "text-rose-500" : "text-emerald-600"}`}
            >
              {player.isMuted ? <MicOff className="w-2.5 h-2.5" /> : <Mic className="w-2.5 h-2.5" />}
            </button>
            <button
              onClick={onToggleCam}
              className={`p-0.5 rounded-full ${player.isVideoOff ? "text-rose-500" : "text-sky-600"}`}
            >
              {player.isVideoOff ? <VideoOff className="w-2.5 h-2.5" /> : <Video className="w-2.5 h-2.5" />}
            </button>
          </div>
        )}
      </div>

      <div className="text-center max-w-[85px]">
        <div className="text-[11px] font-black text-[#1C1917] truncate">
          {player.name}
        </div>
        <div className="text-[10px] text-black font-extrabold bg-[#FEF08A] border border-black px-1.5 py-0.2 rounded-full inline-block shadow-[1px_1px_0px_0px_#000]">
          {player.score}đ
        </div>
      </div>
    </div>
  );
};

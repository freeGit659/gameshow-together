"use client";

import React from "react";
import { GameStage, CreatorPack } from "@/types/game";
import { Play, SkipForward, HeartHandshake, RotateCcw, BookOpen } from "lucide-react";

interface HostControlsProps {
  stage: GameStage;
  onStartGame: () => void;
  onNextQuestion: () => void;
  onTriggerRevival: () => void;
  onRestartGame: () => void;
  packs: CreatorPack[];
  selectedPackId: string;
  onSelectPack: (packId: string) => void;
  eliminatedCount: number;
}

export const HostControls: React.FC<HostControlsProps> = ({
  stage,
  onStartGame,
  onNextQuestion,
  onTriggerRevival,
  onRestartGame,
  packs,
  selectedPackId,
  onSelectPack,
  eliminatedCount,
}) => {
  return (
    <div className="bg-slate-900/80 border border-yellow-500/30 rounded-2xl p-4 backdrop-blur-md shadow-xl flex flex-wrap items-center justify-between gap-3">
      {/* Chọn gói câu hỏi (khi còn ở Lobby) */}
      {stage === "lobby" ? (
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <BookOpen className="w-4 h-4 text-yellow-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-300 shrink-0">Bộ đề:</span>
          <select
            value={selectedPackId}
            onChange={(e) => onSelectPack(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-yellow-500"
          >
            {packs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.questions.length} câu) - {p.price === 0 ? "Miễn phí" : `${p.price.toLocaleString()}đ`}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="text-xs text-slate-400 font-medium">
          Trạng thái phòng: <span className="text-yellow-400 uppercase font-bold">{stage}</span>
        </div>
      )}

      {/* Các nút hành động của Host */}
      <div className="flex items-center gap-2 flex-wrap">
        {stage === "lobby" && (
          <button
            onClick={onStartGame}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 hover:from-yellow-400 hover:to-amber-400 shadow-lg shadow-yellow-500/20 transition-transform active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            Bắt đầu thi đấu
          </button>
        )}

        {stage === "revealing" && (
          <button
            onClick={onNextQuestion}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-yellow-500 hover:bg-yellow-400 text-slate-950 shadow-md transition-transform active:scale-95"
          >
            <SkipForward className="w-3.5 h-3.5" />
            Câu kế tiếp
          </button>
        )}

        {/* Nút Cứu trợ (Hiển thị khi có người bị loại) */}
        {stage !== "lobby" && (
          <button
            onClick={onTriggerRevival}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 shadow-sm transition-all active:scale-95"
            title="Hồi sinh tất cả thí sinh đã bị loại quay lại sàn thi đấu"
          >
            <HeartHandshake className="w-3.5 h-3.5 text-pink-400" />
            Cứu trợ hồi sinh ({eliminatedCount})
          </button>
        )}

        {stage === "ended" && (
          <button
            onClick={onRestartGame}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Trận đấu mới
          </button>
        )}
      </div>
    </div>
  );
};

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
    <div className="bg-white border-2 border-black rounded-3xl p-3.5 shadow-[4px_4px_0px_0px_#1C1917] flex flex-wrap items-center justify-between gap-3">
      {stage === "lobby" ? (
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <BookOpen className="w-4 h-4 text-black shrink-0" />
          <span className="text-xs font-black uppercase text-black shrink-0">Bộ đề:</span>
          <select
            value={selectedPackId}
            onChange={(e) => onSelectPack(e.target.value)}
            className="flex-1 bg-[#F7F4EB] border-2 border-black rounded-xl px-2.5 py-1.5 text-xs font-bold text-black focus:outline-none"
          >
            {packs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.questions.length} câu)
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="text-xs text-black font-black uppercase">
          Trạng thái: <span className="bg-[#FDE047] border border-black px-2 py-0.5 rounded-full">{stage}</span>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {stage === "lobby" && (
          <button
            onClick={onStartGame}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black bg-[#FDE047] text-black border-2 border-black shadow-[3px_3px_0px_0px_#1C1917] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#1C1917]"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            Bắt đầu thi đấu
          </button>
        )}

        {stage === "revealing" && (
          <button
            onClick={onNextQuestion}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black bg-[#FDE047] text-black border-2 border-black shadow-[3px_3px_0px_0px_#1C1917] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#1C1917]"
          >
            <SkipForward className="w-3.5 h-3.5" />
            Câu kế tiếp
          </button>
        )}

        {stage !== "lobby" && (
          <button
            onClick={onTriggerRevival}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-black bg-[#F472B6] text-black border-2 border-black shadow-[3px_3px_0px_0px_#1C1917] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#1C1917]"
            title="Hồi sinh thí sinh đã bị loại"
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            Cứu trợ ({eliminatedCount})
          </button>
        )}

        {stage === "ended" && (
          <button
            onClick={onRestartGame}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black bg-white text-black border-2 border-black shadow-[3px_3px_0px_0px_#1C1917] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#1C1917]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Trận mới
          </button>
        )}
      </div>
    </div>
  );
};

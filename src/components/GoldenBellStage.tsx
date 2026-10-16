"use client";

import React, { useEffect } from "react";
import { Question, GameStage, Player } from "@/types/game";
import { soundManager } from "@/lib/sound";
import confetti from "canvas-confetti";
import { Clock, Trophy, Sparkles, CheckCircle2, XCircle } from "lucide-react";

interface GoldenBellStageProps {
  stage: GameStage;
  currentQuestion: Question | null;
  questionIndex: number;
  totalQuestions: number;
  timeRemaining: number;
  selectedAnswer: string | null;
  onSelectAnswer: (ans: string) => void;
  isAlive: boolean;
  correctAnswer?: string | null;
  explanation?: string | null;
  bellRinger?: Player | null;
  aliveCount: number;
  totalPlayers: number;
  onNextQuestion?: () => void;
  isHost?: boolean;
}

export const GoldenBellStage: React.FC<GoldenBellStageProps> = ({
  stage,
  currentQuestion,
  questionIndex,
  totalQuestions,
  timeRemaining,
  selectedAnswer,
  onSelectAnswer,
  isAlive,
  correctAnswer,
  explanation,
  bellRinger,
  aliveCount,
  totalPlayers,
  onNextQuestion,
  isHost,
}) => {
  useEffect(() => {
    if (stage === "question") {
      if (timeRemaining <= 3 && timeRemaining > 0) {
        soundManager.playWarningTick();
      } else if (timeRemaining > 0) {
        soundManager.playTick();
      } else if (timeRemaining === 0) {
        soundManager.playTimeUp();
      }
    }
  }, [stage, timeRemaining]);

  useEffect(() => {
    if (stage === "ended" && bellRinger) {
      soundManager.playGoldenBell();
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#FDE047", "#F472B6", "#86EFAC", "#93C5FD"],
      });
    }
  }, [stage, bellRinger]);

  // Màn hình Lobby
  if (stage === "lobby") {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center bg-white border-2 border-black rounded-3xl shadow-[5px_5px_0px_0px_#1C1917] min-h-[300px]">
        <div className="w-20 h-20 rounded-full bg-[#FDE047] border-2 border-black flex items-center justify-center text-4xl mb-3 shadow-[3px_3px_0px_0px_#1C1917] animate-bounce">
          🔔
        </div>
        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#1C1917] mb-1">
          Đấu Trường Chuông Vàng
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-sm mb-4 leading-relaxed">
          Đã sẵn sàng trên sàn đấu! Host có thể bấm <strong className="text-black">"Bắt đầu thi đấu"</strong> để mở câu hỏi đầu tiên.
        </p>
        <div className="flex items-center gap-3 text-xs font-bold text-black bg-[#F7F4EB] px-3.5 py-1.5 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#1C1917]">
          <span>Thí sinh: <strong>{totalPlayers}</strong></span>
          <span>•</span>
          <span>Tổng số: <strong>{totalQuestions} câu</strong></span>
        </div>
      </div>
    );
  }

  // Màn hình đếm ngược 3..2..1
  if (stage === "starting") {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center bg-white border-2 border-black rounded-3xl shadow-[5px_5px_0px_0px_#1C1917] min-h-[300px]">
        <div className="text-6xl sm:text-7xl font-black text-black animate-ping">
          🔔
        </div>
        <h3 className="text-base font-black uppercase text-[#1C1917] mt-4 tracking-wider">
          Chuẩn bị vào sàn đấu!
        </h3>
      </div>
    );
  }

  // Màn hình Rung Chuông Vàng Thành Công!
  if (stage === "ended") {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center bg-[#FEF08A] border-2 border-black rounded-3xl shadow-[6px_6px_0px_0px_#1C1917] min-h-[320px]">
        <div className="text-6xl mb-2 animate-bounce">🔔</div>
        <div className="inline-flex items-center gap-1.5 text-black font-black text-xs uppercase px-3 py-1 rounded-full bg-white border-2 border-black shadow-[2px_2px_0px_0px_#1C1917] mb-3">
          <Sparkles className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
          Rung Chuông Vàng Thành Công!
        </div>
        <h2 className="text-2xl font-black text-black mb-1">
          {bellRinger ? bellRinger.name : "Quán Quân Xuất Sắc!"}
        </h2>
        <p className="text-xs text-slate-700 font-bold max-w-sm mb-4">
          Chúc mừng thí sinh đã vượt qua toàn bộ 15 thử thách và chạm tay vào chiếc chuông vàng danh giá!
        </p>
        <div className="px-4 py-2 bg-white border-2 border-black rounded-2xl text-xs font-black text-black flex items-center gap-2 shadow-[3px_3px_0px_0px_#1C1917]">
          <Trophy className="w-4 h-4 text-yellow-500" />
          Điểm số: {bellRinger?.score || 0}đ
        </div>
      </div>
    );
  }

  const isRevealing = stage === "revealing";

  return (
    <div className="flex flex-col bg-white border-2 border-black rounded-3xl shadow-[5px_5px_0px_0px_#1C1917] overflow-hidden">
      {/* Header câu hỏi & Đồng hồ đếm ngược */}
      <div className="px-4 py-2.5 border-b-2 border-black bg-[#F7F4EB] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#FDE047] border border-black shadow-[1px_1px_0px_0px_#000]">
            CÂU {questionIndex + 1}/{totalQuestions}
          </span>
          <span className="text-[11px] font-bold text-slate-600">
            Sống sót: <strong className="text-black">{aliveCount}</strong>/{totalPlayers}
          </span>
        </div>

        {/* Đồng hồ đếm ngược viền đen pastel */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border-2 border-black transition-all ${
            timeRemaining <= 3
              ? "bg-[#FDA4AF] text-black animate-pulse shadow-[2px_2px_0px_0px_#000]"
              : "bg-[#FDE047] text-black shadow-[2px_2px_0px_0px_#000]"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span className="font-mono text-sm">{timeRemaining}s</span>
        </div>
      </div>

      {/* Nội dung câu hỏi */}
      <div className="p-4 sm:p-6 text-center border-b-2 border-black bg-[#FFFDF7]">
        <h3 className="text-sm sm:text-lg font-black text-[#1C1917] leading-relaxed max-w-xl mx-auto">
          {currentQuestion?.text}
        </h3>
      </div>

      {/* 4 Đáp án A, B, C, D */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-[#F7F4EB]">
        {(currentQuestion?.options || []).map((optionText, idx) => {
          const letter = String.fromCharCode(65 + idx);
          const isSelected = selectedAnswer === letter;
          const isCorrect = correctAnswer === letter;

          let btnClass = "bg-white text-black hover:bg-yellow-50";

          if (isSelected) {
            btnClass = "bg-[#FDE047] text-black ring-2 ring-black font-extrabold";
          }

          if (isRevealing) {
            if (isCorrect) {
              btnClass = "bg-[#86EFAC] text-black font-black ring-2 ring-black";
            } else if (isSelected && !isCorrect) {
              btnClass = "bg-[#FDA4AF] text-black line-through opacity-70";
            } else {
              btnClass = "bg-slate-100 text-slate-400 opacity-60";
            }
          }

          return (
            <button
              key={idx}
              disabled={isRevealing || !isAlive}
              onClick={() => {
                soundManager.playTick();
                onSelectAnswer(letter);
              }}
              className={`p-3 rounded-2xl border-2 border-black text-left transition-all duration-150 flex items-center gap-3 shadow-[3px_3px_0px_0px_#1C1917] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#1C1917] ${btnClass} ${
                !isAlive ? "cursor-not-allowed opacity-50" : ""
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl border-2 border-black flex items-center justify-center font-black text-xs shrink-0 ${
                  isRevealing && isCorrect
                    ? "bg-white"
                    : isSelected
                    ? "bg-white"
                    : "bg-[#F7F4EB]"
                }`}
              >
                {isRevealing && isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : letter}
              </div>
              <span className="text-xs sm:text-sm font-bold flex-1">
                {optionText}
              </span>
            </button>
          );
        })}
      </div>

      {/* Lời giải thích khi công bố */}
      {isRevealing && (
        <div className="p-4 bg-white border-t-2 border-black space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-black uppercase text-black">Đáp án đúng:</span>
            <span className="px-2 py-0.5 rounded-full bg-[#86EFAC] text-black border border-black font-black">
              {correctAnswer}
            </span>
          </div>

          {explanation && (
            <div className="text-xs text-slate-700 bg-[#F7F4EB] p-2.5 rounded-xl border-2 border-black font-medium leading-relaxed">
              <strong className="block text-black font-black mb-0.5">Giải thích:</strong>
              {explanation}
            </div>
          )}

          {isHost && onNextQuestion && (
            <div className="pt-1 flex justify-end">
              <button
                onClick={onNextQuestion}
                className="px-4 py-2 rounded-2xl text-xs font-black neo-btn-primary"
              >
                Sang câu tiếp theo →
              </button>
            </div>
          )}
        </div>
      )}

      {!isAlive && !isRevealing && (
        <div className="px-3 py-2 bg-[#FDA4AF] border-t-2 border-black text-center text-xs text-black font-bold flex items-center justify-center gap-1.5">
          <XCircle className="w-3.5 h-3.5" />
          <span>Bạn đang ở hàng ghế khán giả theo dõi. Đợi Host cứu trợ nhé!</span>
        </div>
      )}
    </div>
  );
};

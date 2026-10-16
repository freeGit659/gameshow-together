"use client";

import React, { useEffect } from "react";
import { Question, GameStage, Player } from "@/types/game";
import { soundManager } from "@/lib/sound";
import confetti from "canvas-confetti";
import { Clock, HelpCircle, Trophy, Sparkles, CheckCircle2, XCircle } from "lucide-react";

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
  // Phát âm thanh khi đếm ngược
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

  // Pháo hoa & chuông reo khi chiến thắng Rung Chuông Vàng
  useEffect(() => {
    if (stage === "ended" && bellRinger) {
      soundManager.playGoldenBell();
      const duration = 4 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#FACC15", "#EAB308", "#ffffff"],
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#FACC15", "#EAB308", "#ffffff"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [stage, bellRinger]);

  // Màn hình chờ bắt đầu (Lobby)
  if (stage === "lobby") {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-md h-full min-h-[350px]">
        <div className="w-24 h-24 rounded-full bg-yellow-500/10 border-2 border-yellow-500/40 flex items-center justify-center text-4xl mb-4 animate-bounce">
          🔔
        </div>
        <h2 className="text-xl sm:text-2xl font-black gold-gradient-text mb-2">
          ĐẤU TRƯỜNG CHUÔNG VÀNG
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
          Phòng đấu đang mở. Host có thể bấm <span className="text-yellow-400 font-bold">"Bắt đầu trận đấu"</span> ở thanh điều khiển khi mọi người đã chuẩn bị sẵn sàng.
        </p>
        <div className="flex items-center gap-4 text-xs text-slate-400 bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-800">
          <div>
            Số thí sinh trong phòng: <span className="text-yellow-400 font-bold">{totalPlayers}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-600" />
          <div>
            Tổng số câu thử thách: <span className="text-yellow-400 font-bold">{totalQuestions} câu</span>
          </div>
        </div>
      </div>
    );
  }

  // Màn hình đếm ngược bắt đầu 3..2..1
  if (stage === "starting") {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-md h-full min-h-[350px]">
        <div className="text-6xl sm:text-8xl font-black gold-gradient-text animate-ping">
          🔔
        </div>
        <h3 className="text-xl font-bold text-slate-200 mt-6 tracking-widest uppercase">
          Chuẩn bị bước vào sàn đấu!
        </h3>
      </div>
    );
  }

  // Màn hình kết thúc: RUNG CHUÔNG VÀNG THÀNH CÔNG!
  if (stage === "ended") {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-yellow-950/30 to-slate-900/70 border-2 border-yellow-500/50 rounded-2xl backdrop-blur-md h-full min-h-[380px] glow-gold">
        <div className="text-7xl mb-3 animate-bell-ring">
          🔔
        </div>
        <div className="flex items-center gap-2 text-yellow-400 font-extrabold text-xs uppercase tracking-widest bg-yellow-500/20 px-3 py-1 rounded-full mb-3">
          <Sparkles className="w-4 h-4" />
          Rung Chuông Vàng Thành Công!
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-100 mb-2">
          {bellRinger ? bellRinger.name : "Đã tìm ra quán quân!"}
        </h2>
        <p className="text-xs sm:text-sm text-yellow-200/80 max-w-md mb-6">
          Thí sinh xuất sắc vượt qua toàn bộ câu hỏi cam go và chạm tay vào chiếc chuông vàng danh giá!
        </p>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-yellow-500 text-slate-950 font-black rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-yellow-500/30">
            <Trophy className="w-4 h-4" />
            Điểm số: {bellRinger?.score || 0}đ
          </div>
        </div>
      </div>
    );
  }

  // Màn hình câu hỏi (Đang trả lời hoặc Đang công bố kết quả)
  const isRevealing = stage === "revealing";

  return (
    <div className="flex flex-col bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl">
      {/* Thanh tiến trình & Đồng hồ đếm ngược */}
      <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
            CÂU {questionIndex + 1} / {totalQuestions}
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline-block">
            Sống sót: <strong className="text-emerald-400">{aliveCount}</strong> / {totalPlayers}
          </span>
        </div>

        {/* Đồng hồ đếm ngược */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black transition-all ${
              timeRemaining <= 3
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/50 animate-pulse"
                : "bg-slate-800 text-yellow-400 border border-slate-700"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="font-mono text-sm">{timeRemaining}s</span>
          </div>
        </div>
      </div>

      {/* Nội dung câu hỏi */}
      <div className="p-6 text-center border-b border-slate-800/80 bg-gradient-to-b from-slate-900/40 to-slate-950/40">
        <h3 className="text-base sm:text-xl font-bold text-slate-100 leading-relaxed max-w-2xl mx-auto">
          {currentQuestion?.text}
        </h3>
      </div>

      {/* 4 Phương án trả lời A, B, C, D */}
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(currentQuestion?.options || []).map((optionText, idx) => {
          const letter = String.fromCharCode(65 + idx);
          const isSelected = selectedAnswer === letter;
          const isCorrect = correctAnswer === letter;

          let btnClass = "bg-slate-950/80 border-slate-800 text-slate-300 hover:border-yellow-500/50 hover:bg-slate-900";

          if (isSelected) {
            btnClass = "bg-yellow-500/20 border-yellow-400 text-yellow-300 ring-2 ring-yellow-400/40";
          }

          if (isRevealing) {
            if (isCorrect) {
              btnClass = "bg-emerald-600/40 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400 font-bold shadow-lg shadow-emerald-500/20";
            } else if (isSelected && !isCorrect) {
              btnClass = "bg-rose-950/60 border-rose-600 text-rose-300 line-through opacity-70";
            } else {
              btnClass = "bg-slate-950/50 border-slate-800/50 text-slate-500";
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
              className={`p-3.5 rounded-xl border text-left transition-all duration-200 flex items-center gap-3.5 ${btnClass} ${
                !isAlive ? "cursor-not-allowed opacity-60" : "active:scale-[0.99]"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 transition-colors ${
                  isRevealing && isCorrect
                    ? "bg-emerald-500 text-slate-950"
                    : isSelected
                    ? "bg-yellow-500 text-slate-950"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {isRevealing && isCorrect ? <CheckCircle2 className="w-4 h-4" /> : letter}
              </div>
              <span className="text-xs sm:text-sm font-medium flex-1">
                {optionText}
              </span>
            </button>
          );
        })}
      </div>

      {/* Thông báo trạng thái người chơi & Giải thích khi công bố kết quả */}
      {isRevealing && (
        <div className="px-5 py-4 bg-slate-950/90 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-yellow-400">Đáp án chuẩn:</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-black border border-emerald-500/40">
              {correctAnswer}
            </span>
          </div>

          {explanation && (
            <div className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800 leading-relaxed">
              <strong className="text-slate-400 block mb-1">Kiến thức bổ trợ:</strong>
              {explanation}
            </div>
          )}

          {/* Nút sang câu tiếp theo cho Host */}
          {isHost && onNextQuestion && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={onNextQuestion}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-yellow-500 hover:bg-yellow-400 text-slate-950 shadow-lg shadow-yellow-500/20 transition-transform active:scale-95"
              >
                Sang câu tiếp theo →
              </button>
            </div>
          )}
        </div>
      )}

      {!isAlive && !isRevealing && (
        <div className="px-4 py-2 bg-rose-950/40 border-t border-rose-900/40 text-center text-xs text-rose-300 flex items-center justify-center gap-2">
          <XCircle className="w-3.5 h-3.5" />
          <span>Bạn đã bị loại khỏi sàn đấu và đang theo dõi với tư cách khán giả. Đợi Host cứu trợ nhé!</span>
        </div>
      )}
    </div>
  );
};

"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { GameRoom, Player, Question, CreatorPack } from "@/types/game";
import { DEFAULT_PACKS } from "@/lib/questions";
import { soundManager } from "@/lib/sound";
import { WebcamAvatar } from "@/components/WebcamAvatar";
import { GoldenBellStage } from "@/components/GoldenBellStage";
import { HostControls } from "@/components/HostControls";
import { ChatBox } from "@/components/ChatBox";
import { 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  LogOut, 
  Users, 
  Sparkles,
  ArrowLeft
} from "lucide-react";

export default function RoomPage() {
  const routeParams = useParams();
  const roomCode = ((routeParams?.code as string) || "ROOM").toUpperCase();

  const searchParams = useSearchParams();
  const router = useRouter();

  const isHostParam = searchParams.get("isHost") === "true";
  const packIdParam = searchParams.get("packId") || DEFAULT_PACKS[0].id;
  const playerNameParam = searchParams.get("name") || `Thí sinh ${Math.floor(100 + Math.random() * 900)}`;

  // Socket & Room States
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string>("");
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isMutedSound, setIsMutedSound] = useState(false);
  const [packs, setPacks] = useState<CreatorPack[]>(DEFAULT_PACKS);

  // Local & Remote Media Streams for Circular Webcam
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const peerConnections = useRef<Record<string, RTCPeerConnection>>({});

  useEffect(() => {
    let stream: MediaStream | null = null;
    navigator.mediaDevices
      ?.getUserMedia({
        video: { width: 240, height: 240, frameRate: 15 },
        audio: true,
      })
      .then((s) => {
        stream = s;
        setLocalStream(s);
      })
      .catch((err) => {
        console.warn("Could not get webcam/mic stream", err);
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      Object.values(peerConnections.current).forEach((pc) => pc.close());
    };
  }, []);

  useEffect(() => {
    const newSocket = io({
      transports: ["websocket", "polling"],
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      setMyPlayerId(newSocket.id || "");

      const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${playerNameParam}`;

      if (isHostParam) {
        newSocket.emit("create_room", {
          roomCode,
          playerName: playerNameParam,
          avatar,
          packId: packIdParam,
        });
      } else {
        newSocket.emit("join_room", {
          roomCode,
          playerName: playerNameParam,
          avatar,
        });
      }
    });

    newSocket.on("room_joined", ({ room, myPlayerId }: { room: GameRoom; myPlayerId: string }) => {
      setRoom(room);
      setMyPlayerId(myPlayerId);
    });

    newSocket.on("room_updated", (updatedRoom: GameRoom) => {
      setRoom(updatedRoom);
    });

    newSocket.on("question_started", () => {
      setSelectedAnswer(null);
      setCorrectAnswer(null);
      setExplanation(null);
    });

    newSocket.on("timer_tick", ({ timeRemaining }: { timeRemaining: number }) => {
      setRoom((prev) => (prev ? { ...prev, timeRemaining } : null));
    });

    newSocket.on("answers_revealed", ({ correctAnswer, explanation, results }: any) => {
      setCorrectAnswer(correctAnswer);
      setExplanation(explanation);

      if (newSocket.id) {
        const myResult = results.find((r: any) => r.playerId === newSocket.id);
        if (myResult) {
          if (myResult.isCorrect) {
            soundManager.playCorrect();
          } else {
            soundManager.playWrong();
          }
        }
      }
    });

    newSocket.on("revival_success", () => {
      soundManager.playRevival();
    });

    newSocket.on("bell_rung", () => {
      soundManager.playGoldenBell();
    });

    newSocket.on("error_message", (msg: string) => {
      alert(msg);
      router.push("/");
    });

    newSocket.emit("get_packs");
    newSocket.on("packs_list", (list: CreatorPack[]) => {
      if (list && list.length > 0) {
        setPacks(list);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomCode, isHostParam, packIdParam, playerNameParam, router]);

  useEffect(() => {
    if (socket && localStream) {
      const isVideoOff = !localStream.getVideoTracks().some((t) => t.enabled);
      const isMuted = !localStream.getAudioTracks().some((t) => t.enabled);
      socket.emit("update_media_state", {
        hasWebcam: true,
        isVideoOff,
        isMuted,
      });
    }
  }, [socket, localStream]);

  const handleToggleMic = () => {
    if (!localStream) return;
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      const isMuted = !audioTrack.enabled;
      socket?.emit("update_media_state", { isMuted });
    }
  };

  const handleToggleCam = () => {
    if (!localStream) return;
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      const isVideoOff = !videoTrack.enabled;
      socket?.emit("update_media_state", { isVideoOff });
    }
  };

  const handleSelectAnswer = (ans: string) => {
    setSelectedAnswer(ans);
    socket?.emit("submit_answer", { answer: ans });
  };

  const handleStartGame = () => socket?.emit("start_game");
  const handleNextQuestion = () => socket?.emit("next_question");
  const handleTriggerRevival = () => socket?.emit("trigger_revival");
  const handleRestartGame = () => socket?.emit("start_game");
  const handleSelectPack = (packId: string) => socket?.emit("select_pack", { packId });
  const handleSendMessage = (msg: string) => socket?.emit("send_chat", { message: msg });

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/room/${roomCode}`);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const toggleSound = () => {
    const isMuted = soundManager.toggleMute();
    setIsMutedSound(isMuted);
  };

  if (!room) {
    return (
      <div className="min-h-screen bg-[#F7F4EB] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full border-4 border-black border-t-[#FDE047] animate-spin shadow-[3px_3px_0px_0px_#1C1917]" />
        <h2 className="text-base font-black uppercase text-[#1C1917]">
          Đang vào sàn đấu {roomCode}...
        </h2>
      </div>
    );
  }

  const myPlayer = room.players[myPlayerId] || null;
  const isHost = myPlayer?.isHost || false;
  const isAlive = myPlayer?.status === "alive";
  const playersList = Object.values(room.players);
  const aliveCount = playersList.filter((p) => p.status === "alive").length;
  const eliminatedCount = playersList.filter((p) => p.status === "eliminated").length;
  const currentQuestion = room.questions[room.currentQuestionIndex] || null;
  const bellRinger = room.bellRingerId ? room.players[room.bellRingerId] : null;

  return (
    <div className="min-h-screen bg-[#F7F4EB] text-[#1C1917] p-3 sm:p-5 flex flex-col items-center">
      <div className="w-full max-w-4xl flex flex-col gap-4">
        
        {/* Top Header Bar Neo-Brutalism */}
        <div className="bg-white border-2 border-black rounded-3xl px-4 py-2.5 shadow-[4px_4px_0px_0px_#1C1917] flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/")}
              className="p-1.5 rounded-xl border-2 border-black bg-[#F7F4EB] hover:bg-[#FDE047] shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              title="Về trang chủ"
            >
              <ArrowLeft className="w-4 h-4 text-black" />
            </button>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase text-slate-700">MÃ:</span>
              <span className="font-mono text-sm font-black text-black bg-[#FDE047] border-2 border-black px-2.5 py-0.5 rounded-xl shadow-[2px_2px_0px_0px_#000]">
                {room.code}
              </span>
            </div>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 text-xs font-black bg-white hover:bg-slate-50 text-black border-2 border-black px-2.5 py-1 rounded-xl shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              title="Sao chép link mời"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isCopied ? "Đã chép!" : "Mời bạn"}</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1 font-black bg-[#86EFAC] border border-black px-2 py-0.5 rounded-full shadow-[1px_1px_0px_0px_#000]">
              <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
              <span>Trụ: {aliveCount}</span>
            </div>
            <div className="font-black bg-[#FDA4AF] border border-black px-2 py-0.5 rounded-full shadow-[1px_1px_0px_0px_#000]">
              Loại: {eliminatedCount}
            </div>

            <button
              onClick={toggleSound}
              className="p-1.5 rounded-xl border-2 border-black bg-white hover:bg-slate-100 shadow-[2px_2px_0px_0px_#000]"
              title={isMutedSound ? "Bật âm thanh" : "Tắt âm thanh"}
            >
              {isMutedSound ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 text-black" />}
            </button>
          </div>
        </div>

        {/* Danh Sách Thí Sinh: Webcam Avatar Tròn */}
        <div className="bg-white border-2 border-black rounded-3xl p-3.5 shadow-[4px_4px_0px_0px_#1C1917] overflow-x-auto">
          <div className="flex items-center justify-start sm:justify-center gap-4 sm:gap-6 min-w-max px-2">
            {playersList.map((player) => (
              <WebcamAvatar
                key={player.id}
                player={player}
                isSelf={player.id === myPlayerId}
                localStream={localStream}
                remoteStream={remoteStreams[player.id]}
                onToggleMic={handleToggleMic}
                onToggleCam={handleToggleCam}
                showAnswer={room.stage === "revealing"}
              />
            ))}
          </div>
        </div>

        {/* Khu vực Thi đấu & Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
            <GoldenBellStage
              stage={room.stage}
              currentQuestion={currentQuestion}
              questionIndex={room.currentQuestionIndex}
              totalQuestions={room.questions.length}
              timeRemaining={room.timeRemaining}
              selectedAnswer={selectedAnswer}
              onSelectAnswer={handleSelectAnswer}
              isAlive={isAlive}
              correctAnswer={correctAnswer}
              explanation={explanation}
              bellRinger={bellRinger}
              aliveCount={aliveCount}
              totalPlayers={playersList.length}
              onNextQuestion={handleNextQuestion}
              isHost={isHost}
            />

            {isHost && (
              <HostControls
                stage={room.stage}
                onStartGame={handleStartGame}
                onNextQuestion={handleNextQuestion}
                onTriggerRevival={handleTriggerRevival}
                onRestartGame={handleRestartGame}
                packs={packs}
                selectedPackId={room.selectedPackId}
                onSelectPack={handleSelectPack}
                eliminatedCount={eliminatedCount}
              />
            )}
          </div>

          <div className="lg:col-span-4 min-h-[300px]">
            <ChatBox
              messages={room.chatMessages}
              onSendMessage={handleSendMessage}
              myPlayerId={myPlayerId}
            />
          </div>
        </div>

      </div>
    </div>
  );
}

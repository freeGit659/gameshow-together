"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { GameRoom, Player, Question, CreatorPack } from "@/types/game";
import { DEFAULT_PACKS } from "@/lib/questions";
import { soundManager } from "@/lib/sound";
import { WebcamAvatar } from "@/components/WebcamAvatar";
import { GoldenBellStage } from "@/components/GoldenBellStage";
import { HostControls } from "@/components/HostControls";
import { ChatBox } from "@/components/ChatBox";
import { ThemeModeToggle } from "@/components/ThemeModeToggle";
import { useThemeMode } from "@/context/ThemeModeContext";
import { useAuth } from "@/context/AuthContext";
import { 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  ArrowLeft,
  LogIn,
  Share2
} from "lucide-react";

export default function RoomPage() {
  const routeParams = useParams();
  const roomCode = ((routeParams?.code as string) || "ROOM").toUpperCase().trim();

  const searchParams = useSearchParams();
  const router = useRouter();
  const { mode } = useThemeMode();
  const { user, isLoading: isAuthLoading, openAuthModal, updateUserSession } = useAuth();

  const isHostParam = searchParams.get("isHost") === "true";
  const packIdParam = searchParams.get("packId") || DEFAULT_PACKS[0].id;

  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string>("");
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isCopiedLink, setIsCopiedLink] = useState(false);
  const [isCopiedCode, setIsCopiedCode] = useState(false);
  const [isMutedSound, setIsMutedSound] = useState(false);
  const [packs, setPacks] = useState<CreatorPack[]>(DEFAULT_PACKS);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const peerConnections = useRef<Record<string, RTCPeerConnection>>({});

  // Yêu cầu chọn tài khoản nếu chưa có
  useEffect(() => {
    if (!isAuthLoading && !user) {
      openAuthModal();
    }
  }, [isAuthLoading, user, openAuthModal]);

  // Khởi tạo Media Stream (Webcam & Mic)
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
      peerConnections.current = {};
    };
  }, []);

  // WebRTC Helper: Tạo Peer Connection cho 1 player
  const getOrCreatePeerConnection = useCallback((peerId: string, currentSocket: Socket): RTCPeerConnection => {
    if (peerConnections.current[peerId]) {
      return peerConnections.current[peerId];
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    if (localStream) {
      localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        currentSocket.emit("webrtc_ice_candidate", { to: peerId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStreams((prev) => ({ ...prev, [peerId]: event.streams[0] }));
      }
    };

    peerConnections.current[peerId] = pc;
    return pc;
  }, [localStream]);

  // Kết nối socket sau khi đã xác định danh tính user/guest
  useEffect(() => {
    if (!user) return;

    const newSocket = io({
      transports: ["websocket", "polling"],
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      setMyPlayerId(newSocket.id || "");

      const playerName = user.fullName || user.username;
      const avatar = user.avatar;

      if (isHostParam) {
        newSocket.emit("create_room", {
          roomCode,
          playerName,
          avatar,
          packId: packIdParam,
        });
      } else {
        newSocket.emit("join_room", {
          roomCode,
          playerName,
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

      // Nếu có người chơi mới và mình là Host -> khởi tạo WebRTC offer
      if (updatedRoom.hostId === newSocket.id && localStream) {
        Object.keys(updatedRoom.players).forEach(async (playerId) => {
          if (playerId !== newSocket.id && !peerConnections.current[playerId]) {
            try {
              const pc = getOrCreatePeerConnection(playerId, newSocket);
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              newSocket.emit("webrtc_offer", { to: playerId, offer });
            } catch (e) {
              console.warn("Error creating WebRTC offer:", e);
            }
          }
        });
      }
    });

    // WebRTC Signaling Events
    newSocket.on("webrtc_offer", async ({ from, offer }: { from: string; offer: any }) => {
      try {
        const pc = getOrCreatePeerConnection(from, newSocket);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        newSocket.emit("webrtc_answer", { to: from, answer });
      } catch (e) {
        console.warn("Error answering WebRTC offer:", e);
      }
    });

    newSocket.on("webrtc_answer", async ({ from, answer }: { from: string; answer: any }) => {
      try {
        const pc = peerConnections.current[from];
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
      } catch (e) {
        console.warn("Error setting remote answer:", e);
      }
    });

    newSocket.on("webrtc_ice_candidate", async ({ from, candidate }: { from: string; candidate: any }) => {
      try {
        const pc = peerConnections.current[from];
        if (pc && candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (e) {
        console.warn("Error adding ICE candidate:", e);
      }
    });

    newSocket.on("player_left", ({ playerId }: { playerId: string }) => {
      if (peerConnections.current[playerId]) {
        peerConnections.current[playerId].close();
        delete peerConnections.current[playerId];
      }
      setRemoteStreams((prev) => {
        const copy = { ...prev };
        delete copy[playerId];
        return copy;
      });
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
            // Cập nhật điểm cho user
            updateUserSession({ score: user.score + 100 });
            if (!user.isGuest) {
              fetch("/api/auth/update-score", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  userId: user.id.startsWith("usr_") ? null : user.id,
                  username: user.username,
                  scoreDelta: 100,
                }),
              }).catch(() => {});
            }
          } else {
            soundManager.playWrong();
          }
        }
      }
    });

    newSocket.on("revival_success", () => soundManager.playRevival());

    newSocket.on("bell_rung", ({ winner }: any) => {
      soundManager.playGoldenBell();
      if (winner && winner.name === (user.fullName || user.username)) {
        updateUserSession({ score: user.score + 500, bells: user.bells + 1 });
        if (!user.isGuest) {
          fetch("/api/auth/update-score", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user.id.startsWith("usr_") ? null : user.id,
              username: user.username,
              scoreDelta: 500,
              wonBell: true,
            }),
          }).catch(() => {});
        }
      }
    });

    newSocket.on("error_message", (msg: string) => {
      alert(msg);
      router.push("/");
    });

    newSocket.emit("get_packs");
    newSocket.on("packs_list", (list: CreatorPack[]) => {
      if (list && list.length > 0) setPacks(list);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomCode, isHostParam, packIdParam, user, router, localStream, getOrCreatePeerConnection, updateUserSession]);

  useEffect(() => {
    if (socket && localStream) {
      const isVideoOff = !localStream.getVideoTracks().some((t) => t.enabled);
      const isMuted = !localStream.getAudioTracks().some((t) => t.enabled);
      socket.emit("update_media_state", { hasWebcam: true, isVideoOff, isMuted });
    }
  }, [socket, localStream]);

  const handleToggleMic = () => {
    if (!localStream) return;
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      socket?.emit("update_media_state", { isMuted: !audioTrack.enabled });
    }
  };

  const handleToggleCam = () => {
    if (!localStream) return;
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      socket?.emit("update_media_state", { isVideoOff: !videoTrack.enabled });
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
      setIsCopiedLink(true);
      setTimeout(() => setIsCopiedLink(false), 2000);
    }
  };

  const handleCopyCode = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(roomCode);
      setIsCopiedCode(true);
      setTimeout(() => setIsCopiedCode(false), 2000);
    }
  };

  const toggleSound = () => {
    const isMuted = soundManager.toggleMute();
    setIsMutedSound(isMuted);
  };

  // Nếu chưa có tài khoản hoặc đang load auth
  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-14 h-14 rounded-full border-4 border-current border-t-transparent animate-spin opacity-50" />
        <h2 className="text-base font-black uppercase">Vui lòng đăng nhập hoặc chọn Chơi Khách</h2>
        <button
          onClick={openAuthModal}
          className="px-5 py-2.5 rounded-2xl text-xs font-black uppercase bg-[#FDE047] text-black border-2 border-black shadow-[3px_3px_0px_0px_#1C1917] flex items-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          <span>Mở Bảng Đăng Nhập / Tạo Tài Khoản</span>
        </button>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-14 h-14 rounded-full border-4 border-current border-t-transparent animate-spin opacity-50" />
        <h2 className="text-base font-black uppercase">Đang vào sàn đấu {roomCode}...</h2>
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
    <div className="min-h-screen p-3 sm:p-5 flex flex-col items-center">
      <div className="w-full max-w-5xl flex flex-col gap-4">
        
        {/* Top Header Bar */}
        <div className={`rounded-3xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 ${
          mode === "dark"
            ? "bg-[#131726] border border-white/10"
            : "bg-white border-2 border-black shadow-[4px_4px_0px_0px_#1C1917]"
        }`}>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/")}
              className={`p-1.5 rounded-xl border transition-all ${
                mode === "dark" ? "border-white/10 hover:bg-white/10" : "border-2 border-black bg-[#F7F4EB] hover:bg-[#FDE047] shadow-[2px_2px_0px_0px_#000]"
              }`}
              title="Về trang chủ"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Mã Phòng & Nút chép Mã */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase opacity-70">MÃ:</span>
              <button
                onClick={handleCopyCode}
                className={`font-mono text-sm font-black px-2.5 py-0.5 rounded-xl flex items-center gap-1 transition-all ${
                  mode === "dark" ? "bg-violet-600/30 text-violet-300 border border-violet-500/40 hover:bg-violet-600/50" : "bg-[#FDE047] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-yellow-300"
                }`}
                title="Bấm để sao chép mã phòng"
              >
                <span>{room.code}</span>
                {isCopiedCode ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 opacity-60" />}
              </button>
            </div>

            {/* Nút chép Link Mời */}
            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-xl transition-all ${
                mode === "dark" ? "bg-white/5 hover:bg-white/10 border border-white/10" : "bg-white hover:bg-slate-50 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]"
              }`}
              title="Sao chép link mời bạn bè"
            >
              {isCopiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isCopiedLink ? "Đã chép link!" : "Mời bạn bè"}</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5 text-xs">
            <div className={`flex items-center gap-1 font-black px-2 py-0.5 rounded-full ${
              mode === "dark" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-[#86EFAC] text-black border border-black shadow-[1px_1px_0px_0px_#000]"
            }`}>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              <span>Trụ: {aliveCount}</span>
            </div>

            <div className={`font-black px-2 py-0.5 rounded-full ${
              mode === "dark" ? "bg-rose-500/20 text-rose-400 border border-rose-500/40" : "bg-[#FDA4AF] text-black border border-black shadow-[1px_1px_0px_0px_#000]"
            }`}>
              Loại: {eliminatedCount}
            </div>

            <ThemeModeToggle className="scale-90" />

            <button
              onClick={toggleSound}
              className={`p-1.5 rounded-xl border transition-all ${
                mode === "dark" ? "border-white/10 hover:bg-white/10" : "border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000]"
              }`}
              title={isMutedSound ? "Bật âm thanh" : "Tắt âm thanh"}
            >
              {isMutedSound ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Thông báo nếu là Khách */}
        {user.isGuest && (
          <div className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center justify-between border ${
            mode === "dark" ? "bg-amber-500/10 border-amber-500/30 text-amber-300" : "bg-[#FEF08A] border-2 border-black shadow-[2px_2px_0px_0px_#000]"
          }`}>
            <span>⚠️ Bạn đang chơi với tư cách Khách. Điểm số trận này chỉ lưu trên máy bạn và không đẩy lên BXH chung.</span>
            <button onClick={openAuthModal} className="underline font-black ml-2 shrink-0">
              Đăng nhập ngay
            </button>
          </div>
        )}

        {/* Danh Sách Thí Sinh: Webcam Avatar Tròn */}
        <div className={`rounded-3xl p-3.5 overflow-x-auto ${
          mode === "dark" ? "bg-[#131726] border border-white/10" : "bg-white border-2 border-black shadow-[4px_4px_0px_0px_#1C1917]"
        }`}>
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

import { createServer } from "http";
import next from "next";
import { Server, Socket } from "socket.io";
import { DEFAULT_PACKS } from "./src/lib/questions";
import { GameRoom, Player, Question, CreatorPack } from "./src/types/game";
import { getPacksFromSupabase, isSupabaseConfigured, supabase } from "./src/lib/supabase";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const rooms: Record<string, GameRoom> = {};
const roomTimers: Record<string, NodeJS.Timeout> = {};
const creatorPacks: Record<string, CreatorPack> = {};

DEFAULT_PACKS.forEach((p) => {
  creatorPacks[p.id] = p;
});

// Nạp packs từ Supabase khi khởi động
if (isSupabaseConfigured) {
  getPacksFromSupabase().then((dbPacks) => {
    if (dbPacks && dbPacks.length > 0) {
      dbPacks.forEach((p: CreatorPack) => {
        creatorPacks[p.id] = p;
      });
      console.log(`[Supabase] Loaded ${dbPacks.length} packs from database.`);
    }
  });
}

function getActiveRoomsSummary() {
  return Object.values(rooms).map((r) => ({
    code: r.code,
    name: r.name,
    hostId: r.hostId,
    playersCount: Object.keys(r.players).length,
    stage: r.stage,
    selectedPackId: r.selectedPackId,
  }));
}

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    if (req.url === "/api/health") {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ status: "ok", uptime: process.uptime(), roomsCount: Object.keys(rooms).length }));
      return;
    }

    if (req.url === "/api/rooms") {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ rooms: getActiveRoomsSummary() }));
      return;
    }

    try {
      await handle(req, res);
    } catch (err) {
      console.error("Error handling request:", err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket: Socket) => {
    let currentRoomCode: string | null = null;

    // Gửi danh sách phòng đang mở ngay khi kết nối
    socket.emit("active_rooms_update", getActiveRoomsSummary());

    // 1. Tạo phòng
    socket.on("create_room", async ({ roomCode, playerName, avatar, packId = "general-knowledge-official" }: { roomCode: string; playerName: string; avatar: string; packId?: string }) => {
      const code = roomCode.toUpperCase().trim();
      const pack = creatorPacks[packId] || DEFAULT_PACKS[0];

      const hostPlayer: Player = {
        id: socket.id,
        name: playerName || "Host",
        avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${socket.id}`,
        isHost: true,
        status: "alive",
        currentAnswer: null,
        score: 0,
        isReady: true,
        hasWebcam: false,
        isMuted: false,
        isVideoOff: false,
      };

      rooms[code] = {
        code,
        name: `Phòng của ${hostPlayer.name}`,
        hostId: socket.id,
        players: { [socket.id]: hostPlayer },
        stage: "lobby",
        currentQuestionIndex: 0,
        questions: pack.questions,
        timeRemaining: 15,
        selectedPackId: pack.id,
        chatMessages: [
          {
            id: `msg-${Date.now()}`,
            senderId: "system",
            senderName: "Hệ thống",
            message: `Chào mừng bạn đến với Đấu trường Rung Chuông Vàng! Mã phòng: ${code}`,
            timestamp: Date.now(),
            isSystem: true,
          },
        ],
        bellRingerId: null,
      };

      currentRoomCode = code;
      socket.join(code);
      socket.emit("room_joined", { room: rooms[code], myPlayerId: socket.id });

      // Lưu phòng vào Supabase nếu có cấu hình
      if (isSupabaseConfigured && supabase) {
        supabase
          .from("rooms")
          .upsert({
            code,
            host_id: hostPlayer.name,
            status: "lobby",
          })
          .then(
            () => {},
            (e: any) => console.warn("Supabase upsert room error:", e)
          );
      }

      // Broadcast danh sách phòng đang mở cho toàn bộ người chơi ở trang chủ
      io.emit("active_rooms_update", getActiveRoomsSummary());
      console.log(`[Room ${code}] Created by ${hostPlayer.name} (${socket.id})`);
    });

    // 2. Tham gia phòng bằng mã (Realtime)
    socket.on("join_room", ({ roomCode, playerName, avatar }: { roomCode: string; playerName: string; avatar: string }) => {
      const code = (roomCode || "").toUpperCase().trim();
      let room = rooms[code];

      // Nếu phòng chưa có trên server (hoặc người vào đầu tiên bằng mã trực tiếp)
      if (!room) {
        // Tự động khởi tạo phòng với người này làm Host nếu phòng chưa có ai
        const defaultPack = DEFAULT_PACKS[0];
        const newHost: Player = {
          id: socket.id,
          name: playerName || "Host",
          avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${socket.id}`,
          isHost: true,
          status: "alive",
          currentAnswer: null,
          score: 0,
          isReady: true,
          hasWebcam: false,
          isMuted: false,
          isVideoOff: false,
        };

        rooms[code] = {
          code,
          name: `Phòng của ${newHost.name}`,
          hostId: socket.id,
          players: { [socket.id]: newHost },
          stage: "lobby",
          currentQuestionIndex: 0,
          questions: defaultPack.questions,
          timeRemaining: 15,
          selectedPackId: defaultPack.id,
          chatMessages: [
            {
              id: `msg-${Date.now()}`,
              senderId: "system",
              senderName: "Hệ thống",
              message: `Chào mừng bạn đến với Đấu trường Rung Chuông Vàng! Mã phòng: ${code}`,
              timestamp: Date.now(),
              isSystem: true,
            },
          ],
          bellRingerId: null,
        };

        room = rooms[code];
        currentRoomCode = code;
        socket.join(code);
        socket.emit("room_joined", { room, myPlayerId: socket.id });
        io.emit("active_rooms_update", getActiveRoomsSummary());
        console.log(`[Room ${code}] Auto-created by first joiner ${newHost.name}`);
        return;
      }

      // Phòng đã tồn tại -> Tham gia bình thường
      const newPlayer: Player = {
        id: socket.id,
        name: playerName || `Thí sinh ${Object.keys(room.players).length + 1}`,
        avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${socket.id}`,
        isHost: false,
        status: room.stage === "lobby" ? "alive" : "spectator",
        currentAnswer: null,
        score: 0,
        isReady: true,
        hasWebcam: false,
        isMuted: false,
        isVideoOff: false,
      };

      room.players[socket.id] = newPlayer;
      currentRoomCode = code;
      socket.join(code);

      room.chatMessages.push({
        id: `msg-${Date.now()}`,
        senderId: "system",
        senderName: "Hệ thống",
        message: `${newPlayer.name} đã gia nhập đấu trường!`,
        timestamp: Date.now(),
        isSystem: true,
      });

      io.to(code).emit("room_updated", room);
      socket.emit("room_joined", { room, myPlayerId: socket.id });
      io.emit("active_rooms_update", getActiveRoomsSummary());
      console.log(`[Room ${code}] Player ${newPlayer.name} joined. Total: ${Object.keys(room.players).length}`);
    });

    // 3. Cập nhật thiết bị Media
    socket.on("update_media_state", ({ hasWebcam, isVideoOff, isMuted }: { hasWebcam?: boolean; isVideoOff?: boolean; isMuted?: boolean }) => {
      if (!currentRoomCode || !rooms[currentRoomCode]) return;
      const player = rooms[currentRoomCode].players[socket.id];
      if (!player) return;

      if (hasWebcam !== undefined) player.hasWebcam = hasWebcam;
      if (isVideoOff !== undefined) player.isVideoOff = isVideoOff;
      if (isMuted !== undefined) player.isMuted = isMuted;

      io.to(currentRoomCode).emit("room_updated", rooms[currentRoomCode]);
    });

    // 4. Chọn gói câu hỏi (Chỉ Host)
    socket.on("select_pack", ({ packId }: { packId: string }) => {
      if (!currentRoomCode || !rooms[currentRoomCode]) return;
      const room = rooms[currentRoomCode];
      if (room.hostId !== socket.id || room.stage !== "lobby") return;

      const pack = creatorPacks[packId];
      if (pack) {
        room.selectedPackId = pack.id;
        room.questions = pack.questions;
        room.chatMessages.push({
          id: `msg-${Date.now()}`,
          senderId: "system",
          senderName: "Hệ thống",
          message: `Host đã chọn gói đề: "${pack.title}" (${pack.questions.length} câu)`,
          timestamp: Date.now(),
          isSystem: true,
        });
        io.to(currentRoomCode).emit("room_updated", room);
      }
    });

    // 5. Host Bắt đầu Game
    socket.on("start_game", () => {
      if (!currentRoomCode || !rooms[currentRoomCode]) return;
      const room = rooms[currentRoomCode];
      if (room.hostId !== socket.id) return;

      Object.values(room.players).forEach((p) => {
        p.status = "alive";
        p.currentAnswer = null;
        p.score = 0;
      });

      room.stage = "starting";
      room.currentQuestionIndex = 0;
      room.timeRemaining = 3;
      room.bellRingerId = null;

      io.to(currentRoomCode).emit("game_starting", { countdown: 3 });
      io.to(currentRoomCode).emit("room_updated", room);

      let startingCount = 3;
      const startInterval = setInterval(() => {
        startingCount--;
        if (startingCount > 0) {
          io.to(currentRoomCode!).emit("game_starting", { countdown: startingCount });
        } else {
          clearInterval(startInterval);
          startQuestion(room.code, 0);
        }
      }, 1000);
    });

    function startQuestion(roomCode: string, questionIndex: number) {
      const room = rooms[roomCode];
      if (!room) return;

      if (roomTimers[roomCode]) {
        clearInterval(roomTimers[roomCode]);
      }

      const q = room.questions[questionIndex];
      if (!q) {
        finishGame(roomCode);
        return;
      }

      room.stage = "question";
      room.currentQuestionIndex = questionIndex;
      room.timeRemaining = q.timeLimit || 15;

      Object.values(room.players).forEach((p) => {
        p.currentAnswer = null;
      });

      io.to(roomCode).emit("question_started", {
        questionIndex,
        question: q,
        timeLimit: room.timeRemaining,
      });
      io.to(roomCode).emit("room_updated", room);

      roomTimers[roomCode] = setInterval(() => {
        const curRoom = rooms[roomCode];
        if (!curRoom || curRoom.stage !== "question") {
          clearInterval(roomTimers[roomCode]);
          return;
        }

        curRoom.timeRemaining -= 1;
        io.to(roomCode).emit("timer_tick", { timeRemaining: curRoom.timeRemaining });

        if (curRoom.timeRemaining <= 0) {
          clearInterval(roomTimers[roomCode]);
          revealAnswers(roomCode);
        }
      }, 1000);
    }

    // 6. Nộp đáp án
    socket.on("submit_answer", ({ answer }: { answer: string }) => {
      if (!currentRoomCode || !rooms[currentRoomCode]) return;
      const room = rooms[currentRoomCode];
      if (room.stage !== "question") return;

      const player = room.players[socket.id];
      if (!player || player.status !== "alive") return;

      player.currentAnswer = answer;
      io.to(currentRoomCode).emit("player_submitted", { playerId: socket.id });
    });

    // 7. Hết giờ: Công bố kết quả
    function revealAnswers(roomCode: string) {
      const room = rooms[roomCode];
      if (!room) return;

      room.stage = "revealing";
      const q = room.questions[room.currentQuestionIndex];
      const correctAns = q.correctAnswer.toUpperCase().trim();

      const results: { playerId: string; isCorrect: boolean; answer: string | null }[] = [];
      let aliveCount = 0;

      Object.values(room.players).forEach((p) => {
        if (p.status === "alive") {
          const isCorrect = p.currentAnswer?.toUpperCase().trim() === correctAns;
          if (isCorrect) {
            p.score += 100;
            aliveCount++;
          } else {
            p.status = "eliminated";
          }
          results.push({
            playerId: p.id,
            isCorrect,
            answer: p.currentAnswer,
          });
        }
      });

      io.to(roomCode).emit("answers_revealed", {
        correctAnswer: correctAns,
        explanation: q.explanation,
        results,
        aliveRemaining: aliveCount,
      });
      io.to(roomCode).emit("room_updated", room);

      const currentAlive = Object.values(room.players).filter((p) => p.status === "alive");
      const isLastQuestion = room.currentQuestionIndex >= room.questions.length - 1;

      if (isLastQuestion && currentAlive.length > 0) {
        setTimeout(() => {
          room.stage = "ended";
          room.bellRingerId = currentAlive[0].id;
          io.to(roomCode).emit("bell_rung", {
            winner: currentAlive[0],
            allWinners: currentAlive,
          });
          io.to(roomCode).emit("room_updated", room);
        }, 4000);
      }
    }

    // 8. Sang câu tiếp theo
    socket.on("next_question", () => {
      if (!currentRoomCode || !rooms[currentRoomCode]) return;
      const room = rooms[currentRoomCode];
      if (room.hostId !== socket.id || room.stage !== "revealing") return;

      const nextIdx = room.currentQuestionIndex + 1;
      startQuestion(currentRoomCode, nextIdx);
    });

    // 9. Cứu trợ hồi sinh
    socket.on("trigger_revival", () => {
      if (!currentRoomCode || !rooms[currentRoomCode]) return;
      const room = rooms[currentRoomCode];
      if (room.hostId !== socket.id) return;

      let revivedCount = 0;
      Object.values(room.players).forEach((p) => {
        if (p.status === "eliminated") {
          p.status = "alive";
          revivedCount++;
        }
      });

      room.chatMessages.push({
        id: `msg-${Date.now()}`,
        senderId: "system",
        senderName: "CỨU TRỢ",
        message: `Phép màu xuất hiện! ${revivedCount} thí sinh đã được hồi sinh quay trở lại sàn đấu!`,
        timestamp: Date.now(),
        isSystem: true,
      });

      io.to(currentRoomCode).emit("revival_success", { revivedCount });
      io.to(currentRoomCode).emit("room_updated", room);
    });

    // 10. Chat
    socket.on("send_chat", ({ message }: { message: string }) => {
      if (!currentRoomCode || !rooms[currentRoomCode]) return;
      const room = rooms[currentRoomCode];
      const player = room.players[socket.id];
      if (!player || !message.trim()) return;

      const chatMsg = {
        id: `msg-${Date.now()}-${Math.random()}`,
        senderId: socket.id,
        senderName: player.name,
        message: message.trim(),
        timestamp: Date.now(),
      };

      room.chatMessages.push(chatMsg);
      if (room.chatMessages.length > 50) room.chatMessages.shift();
      io.to(currentRoomCode).emit("new_chat", chatMsg);
    });

    // 11. WebRTC Signaling P2P
    socket.on("webrtc_offer", ({ to, offer }: { to: string; offer: any }) => {
      io.to(to).emit("webrtc_offer", { from: socket.id, offer });
    });
    socket.on("webrtc_answer", ({ to, answer }: { to: string; answer: any }) => {
      io.to(to).emit("webrtc_answer", { from: socket.id, answer });
    });
    socket.on("webrtc_ice_candidate", ({ to, candidate }: { to: string; candidate: any }) => {
      io.to(to).emit("webrtc_ice_candidate", { from: socket.id, candidate });
    });

    // 12. Tạo Pack
    socket.on("create_pack", (newPack: CreatorPack) => {
      if (newPack && newPack.id) {
        creatorPacks[newPack.id] = newPack;
        socket.emit("pack_created", newPack);
        console.log(`[Creator] New Pack: ${newPack.title}`);
      }
    });

    // 13. Lấy Packs
    socket.on("get_packs", () => {
      socket.emit("packs_list", Object.values(creatorPacks));
    });

    // 14. Ngắt kết nối
    socket.on("disconnect", () => {
      if (!currentRoomCode || !rooms[currentRoomCode]) return;
      const room = rooms[currentRoomCode];
      const leavingPlayer = room.players[socket.id];

      if (leavingPlayer) {
        delete room.players[socket.id];

        if (Object.keys(room.players).length === 0) {
          if (roomTimers[currentRoomCode]) clearInterval(roomTimers[currentRoomCode]);
          delete rooms[currentRoomCode];

          // Xóa khỏi Supabase
          if (isSupabaseConfigured && supabase) {
            supabase
              .from("rooms")
              .delete()
              .eq("code", currentRoomCode)
              .then(
                () => {},
                (e: any) => console.warn("Supabase delete room error:", e)
              );
          }

          io.emit("active_rooms_update", getActiveRoomsSummary());
          console.log(`[Room ${currentRoomCode}] Empty and closed.`);
        } else {
          if (room.hostId === socket.id) {
            const remainingIds = Object.keys(room.players);
            room.hostId = remainingIds[0];
            room.players[room.hostId].isHost = true;
          }

          room.chatMessages.push({
            id: `msg-${Date.now()}`,
            senderId: "system",
            senderName: "Hệ thống",
            message: `${leavingPlayer.name} đã rời sàn đấu.`,
            timestamp: Date.now(),
            isSystem: true,
          });

          io.to(currentRoomCode).emit("room_updated", room);
          io.to(currentRoomCode).emit("player_left", { playerId: socket.id });
          io.emit("active_rooms_update", getActiveRoomsSummary());
        }
      }
    });
  });

  function finishGame(roomCode: string) {
    const room = rooms[roomCode];
    if (!room) return;
    room.stage = "ended";
    const winners = Object.values(room.players).filter((p) => p.status === "alive");
    if (winners.length > 0) room.bellRingerId = winners[0].id;
    io.to(roomCode).emit("game_ended", { winners });
    io.to(roomCode).emit("room_updated", room);
  }

  httpServer.listen(port, hostname, () => {
    console.log(`> GameShow Together running on http://${hostname}:${port}`);
  });
});

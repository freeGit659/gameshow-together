export type PlayerStatus = 'alive' | 'eliminated' | 'spectator' | 'revived';

export interface Player {
  id: string; // socket.id
  name: string;
  avatar: string;
  isHost: boolean;
  status: PlayerStatus;
  currentAnswer: string | null;
  score: number;
  isReady: boolean;
  hasWebcam: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
}

export interface Question {
  id: number;
  text: string;
  options?: string[]; // [A, B, C, D] nếu là trắc nghiệm
  correctAnswer: string; // 'A' | 'B' | 'C' | 'D' hoặc từ khóa chính xác
  timeLimit: number; // số giây (mặc định 15s)
  explanation: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'extreme';
}

export type GameStage = 
  | 'lobby'           // Đang chờ trong phòng
  | 'starting'        // Đếm ngược 3..2..1 vào game
  | 'question'        // Đang hiển thị câu hỏi và đếm ngược 15s
  | 'revealing'       // Hết giờ, hiện đáp án đúng và danh sách ai đúng ai sai
  | 'elimination'     // Loại người sai ra khỏi sàn thi đấu
  | 'revival'         // Vòng cứu trợ (Host hoặc mini-game cứu người chơi bị loại)
  | 'ended';          // Người cuối cùng rung chuông vàng hoặc hết câu hỏi

export interface GameRoom {
  code: string;
  name: string;
  hostId: string;
  players: Record<string, Player>;
  stage: GameStage;
  currentQuestionIndex: number;
  questions: Question[];
  timeRemaining: number;
  selectedPackId: string;
  chatMessages: ChatMessage[];
  bellRingerId?: string | null; // Ai rung được chuông vàng
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface CreatorPack {
  id: string;
  title: string;
  author: string;
  description: string;
  price: number; // 0 = Free, > 0 = VND
  tags: string[];
  questions: Question[];
  playsCount: number;
  isOfficial?: boolean;
}

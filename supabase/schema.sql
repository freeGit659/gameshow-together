-- =========================================================================
-- DATABASE SCHEMA CHO GAMESHOW TOGETHER (POSTGRESQL / SUPABASE)
-- Hướng dẫn: Copy toàn bộ nội dung file này và paste vào "SQL Editor" trên Supabase
-- =========================================================================

-- Bật extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. BẢNG PROFILES (NGƯỜI CHƠI & CREATOR)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'player' CHECK (role IN ('player', 'creator', 'admin')),
  coins_balance NUMERIC DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  bells_won INTEGER DEFAULT 0, -- Số lần rung chuông vàng thành công
  password_pin TEXT, -- Hash SHA-256 của mật khẩu 6 chữ số
  auth_type TEXT DEFAULT 'simple' CHECK (auth_type IN ('simple', 'google', 'guest')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. BẢNG GÓI BỘ ĐỀ CREATOR (CREATOR PACKS)
CREATE TABLE IF NOT EXISTS public.creator_packs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC DEFAULT 0 CHECK (price >= 0), -- 0 = Miễn phí, > 0 = VNĐ
  tags TEXT[] DEFAULT ARRAY['Chung'],
  plays_count INTEGER DEFAULT 0,
  is_official BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. BẢNG CÂU HỎI (QUESTIONS)
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pack_id UUID NOT NULL REFERENCES public.creator_packs(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL, -- Mảng 4 đáp án: ["A...", "B...", "C...", "D..."]
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  time_limit INTEGER DEFAULT 15, -- Thời gian đếm ngược (giây)
  explanation TEXT,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard', 'extreme')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. BẢNG PHÒNG ĐẤU (ACTIVE ROOMS)
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(6) NOT NULL UNIQUE,
  host_id TEXT NOT NULL, -- Socket ID hoặc User ID
  pack_id UUID REFERENCES public.creator_packs(id),
  status TEXT DEFAULT 'lobby' CHECK (status IN ('lobby', 'playing', 'ended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. BẢNG LỊCH SỬ TRẬN ĐẤU (GAME SESSIONS)
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_code VARCHAR(6) NOT NULL,
  pack_id UUID REFERENCES public.creator_packs(id),
  winner_name TEXT,
  total_players INTEGER DEFAULT 0,
  questions_played INTEGER DEFAULT 0,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. BẢNG GIAO DỊCH / MUA BỘ ĐỀ (PACK PURCHASES)
CREATE TABLE IF NOT EXISTS public.pack_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  pack_id UUID REFERENCES public.creator_packs(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- Mọi người đều có thể đọc profiles, packs và questions công khai
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update profiles" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Public read packs" ON public.creator_packs FOR SELECT USING (status = 'published');
CREATE POLICY "Public read questions" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Public read rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Public insert rooms" ON public.rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update rooms" ON public.rooms FOR UPDATE USING (true);
CREATE POLICY "Public delete rooms" ON public.rooms FOR DELETE USING (true);

-- =========================================================================
-- DỮ LIỆU MẪU BAN ĐẦU (SEED DATA)
-- =========================================================================

-- Tạo Creator Official
INSERT INTO public.profiles (id, username, full_name, avatar_url, role, total_score, bells_won)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'btc_official',
  'Ban Tổ Chức Gameshow',
  'https://api.dicebear.com/7.x/bottts/svg?seed=BTC',
  'admin',
  50000,
  25
) ON CONFLICT (username) DO NOTHING;

-- Tạo Bộ đề Official Rung Chuông Vàng
INSERT INTO public.creator_packs (id, creator_id, author_name, title, description, price, tags, is_official, plays_count)
VALUES (
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Ban Tổ Chức (Official)',
  'Đấu Trường Chuông Vàng - Khởi Nguyên',
  'Bộ 15 câu hỏi chính thức thử thách toàn diện kiến thức khoa học, tự nhiên và văn hóa.',
  0,
  ARRAY['Chính thức', 'Kiến thức chung', 'Hot'],
  true,
  2450
) ON CONFLICT DO NOTHING;

-- Thêm một số câu hỏi mẫu cho gói khởi nguyên
INSERT INTO public.questions (pack_id, order_index, question_text, options, correct_answer, time_limit, explanation, difficulty)
VALUES
(
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  1,
  'Màu nào sau đây KHÔNG có trong dải màu cơ bản của cầu vồng?',
  '["Đỏ", "Hồng", "Lam", "Chàm"]'::jsonb,
  'B',
  15,
  '7 sắc cầu vồng gồm: Đỏ, Cam, Vàng, Lục, Lam, Chàm, Tím. Hồng không thuộc quang phổ này.',
  'easy'
),
(
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  2,
  'Hành tinh nào có kích thước lớn nhất trong Hệ Mặt Trời?',
  '["Sao Hỏa", "Sao Thổ", "Sao Mộc", "Sao Kim"]'::jsonb,
  'C',
  15,
  'Sao Mộc (Jupiter) là hành tinh có thể tích và khối lượng lớn nhất Hệ Mặt Trời.',
  'easy'
),
(
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  3,
  'Đỉnh núi Fansipan được mệnh danh là nóc nhà của khu vực nào?',
  '["Đông Nam Á", "Đông Dương", "Châu Á", "Việt Nam và Lào"]'::jsonb,
  'B',
  15,
  'Fansipan cao 3.143m, được mệnh danh là Nóc nhà Đông Dương.',
  'easy'
) ON CONFLICT DO NOTHING;
